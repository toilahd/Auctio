import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import {
  S3Client,
  ListObjectsV2Command,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

console.log(
  "S3 config:",
  process.env.ACCESS_KEY,
  process.env.SECRET_ACCESS_KEY,
  process.env.REGION
);

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
  region: "us-east-1",
  endpoint: process.env.JURISDICTION_SPECIFIC_ENDPOINTS,
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load proto file
const PROTO_PATH = path.join(__dirname, "fileupload.proto");
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const fileuploadProto =
  grpc.loadPackageDefinition(packageDefinition).fileupload;

// Mock in-memory storage for uploaded files
const fileStorage = new Map();

/**
 * Handle file upload (streaming)
 */
function uploadFile(call, callback) {
  let filename = "";
  let fileBuffer = Buffer.alloc(0);
  let totalChunks = 0;
  let callbackCalled = false;

  call.on("data", (chunk) => {
    if (!filename) {
      filename = chunk.filename;
    }

    // Append chunk content to buffer
    fileBuffer = Buffer.concat([fileBuffer, chunk.content]);
    totalChunks++;

    console.log(`Received chunk ${chunk.chunk_number} for file: ${filename}`);

    if (chunk.is_last_chunk) {
      // Generate a unique file ID
      const fileId = crypto.randomBytes(16).toString("hex");

      // Store file metadata (in a real app, you'd save the file to disk/cloud)
      fileStorage.set(fileId, {
        file_id: fileId,
        filename: filename,
        size: fileBuffer.length,
        upload_date: new Date().toISOString(),
        // In mock mode, we're not actually saving the buffer to disk
        // but you could do: fs.writeFileSync(path.join(__dirname, 'uploads', filename), fileBuffer)
      });

      console.log(
        `File upload complete: ${filename} (${fileBuffer.length} bytes, ${totalChunks} chunks)`
      );

      const command = new ListObjectsV2Command({
        Bucket: "auctio-bucket",
      });
      console.log("Content type:", chunk.content_type);
      const uploadCommand = new PutObjectCommand({
        Bucket: "auctio-bucket",
        Key: filename,
        Body: fileBuffer,
        ContentType: chunk.content_type,
      });
      s3.send(uploadCommand).then(() => {
        s3.send(command).then((response) => {
          console.log("Current S3 Bucket Contents:", response.Contents);
        });
      });

      callbackCalled = true;
      callback(null, {
        success: true,
        file_id: fileId,
        message: `File uploaded successfully: ${filename}`,
        total_bytes: fileBuffer.length,
      });
    }
  });

  call.on("end", () => {
    // Stream ended without is_last_chunk flag
    if (!callbackCalled) {
      callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: "Upload incomplete: no final chunk received",
      });
    }
  });

  call.on("error", (err) => {
    console.error("Upload error:", err);
    callback({
      code: grpc.status.INTERNAL,
      message: `Upload failed: ${err.message}`,
    });
  });
}

/**
 * Get file information
 */
function getFileInfo(call, callback) {
  const fileId = call.request.file_id;

  if (!fileStorage.has(fileId)) {
    callback({
      code: grpc.status.NOT_FOUND,
      message: `File not found: ${fileId}`,
    });
    return;
  }

  const fileInfo = fileStorage.get(fileId);
  callback(null, fileInfo);
}

/**
 * Start the gRPC server
 */
function startServer(port = "50051") {
  const server = new grpc.Server();

  server.addService(fileuploadProto.FileUploadService.service, {
    UploadFile: uploadFile,
    GetFileInfo: getFileInfo,
  });

  const address = `0.0.0.0:${port}`;
  server.bindAsync(
    address,
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.error("Failed to start server:", err);
        return;
      }
      console.log(`gRPC File Upload Service running at ${address}`);
    }
  );
}

// Start server if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const port = process.env.GRPC_PORT || "50051";
  startServer(port);
}

export { startServer, fileStorage };
