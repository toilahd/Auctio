import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import mime from "mime";

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

// Create client
const client = new fileuploadProto.FileUploadService(
  "localhost:50051",
  grpc.credentials.createInsecure()
);

/**
 * Upload a file in chunks
 */
function uploadFile(filePath, chunkSize = 1024 * 64) {
  // 64KB chunks
  return new Promise((resolve, reject) => {
    const call = client.UploadFile((err, response) => {
      if (err) {
        console.error("Upload failed:", err);
        reject(err);
        return;
      }
      console.log("Upload response:", response);
      resolve(response);
    });

    const filename = path.basename(filePath);
    const fileBuffer = fs.readFileSync(filePath);
    const totalChunks = Math.max(1, Math.ceil(fileBuffer.length / chunkSize));

    console.log(
      `Uploading ${filename} (${
        fileBuffer.length
      } bytes) in ${totalChunks} chunk${totalChunks > 1 ? "s" : ""}...`
    );

    // Handle empty files or files smaller than chunk size
    console.log("Content type:", mime.getType(filename));
    if (fileBuffer.length === 0 || totalChunks === 1) {
      call.write({
        filename: filename,
        content: fileBuffer,
        chunk_number: 1,
        is_last_chunk: true,
        content_type: mime.getType(filename),
      });
      console.log(`Sent chunk 1/1`);
    } else {
      for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, fileBuffer.length);
        const chunk = fileBuffer.slice(start, end);

        call.write({
          filename: filename,
          content: chunk,
          chunk_number: i + 1,
          is_last_chunk: i === totalChunks - 1,
          content_type: mime.getType(filename),
        });

        console.log(`Sent chunk ${i + 1}/${totalChunks}`);
      }
    }

    call.end();
  });
}

/**
 * Get file information
 */
function getFileInfo(fileId) {
  return new Promise((resolve, reject) => {
    client.GetFileInfo({ file_id: fileId }, (err, response) => {
      if (err) {
        console.error("GetFileInfo failed:", err);
        reject(err);
        return;
      }
      console.log("File info:", response);
      resolve(response);
    });
  });
}

// Example usage if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const testFilePath = process.argv[2];

  if (!testFilePath) {
    console.log("Usage: node fileUploadClient.js <file-path>");
    console.log("Example: node fileUploadClient.js ./package.json");
    process.exit(1);
  }

  if (!fs.existsSync(testFilePath)) {
    console.error(`File not found: ${testFilePath}`);
    process.exit(1);
  }

  // Upload file
  uploadFile(testFilePath)
    .then((response) => {
      console.log("\n✓ Upload successful!");
      console.log(`File ID: ${response.file_id}`);
      console.log(`Total bytes: ${response.total_bytes}`);

      // Get file info
      return getFileInfo(response.file_id);
    })
    .then((info) => {
      console.log("\n✓ File info retrieved!");
      console.log(`Filename: ${info.filename}`);
      console.log(`Size: ${info.size} bytes`);
      console.log(`Upload date: ${info.upload_date}`);
    })
    .catch((err) => {
      console.error("Error:", err);
      process.exit(1);
    });
}

export { uploadFile, getFileInfo };
