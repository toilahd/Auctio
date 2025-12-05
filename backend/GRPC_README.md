# gRPC File Upload Service

A simple mock file upload service using gRPC with streaming support.

## Files

- `fileupload.proto` - Protocol Buffer definition
- `fileUploadService.js` - gRPC server implementation
- `fileUploadClient.js` - Example client for testing

## Installation

```bash
npm install
```

This will install the required dependencies:
- `@grpc/grpc-js` - gRPC runtime for Node.js
- `@grpc/proto-loader` - Load .proto files at runtime

## Usage

### Start the Server

```bash
npm run grpc-server
```

The server will start on `localhost:50051` by default. You can change the port with the `GRPC_PORT` environment variable:

```bash
GRPC_PORT=50052 npm run grpc-server
```

### Test with the Client

Upload a file:

```bash
npm run grpc-client package.json
```

Or directly with node:

```bash
node fileUploadClient.js /path/to/your/file.txt
```

## Service Methods

### UploadFile (Stream)

Uploads a file in chunks using client-side streaming.

**Request (stream):**
- `filename` - Name of the file
- `content` - Chunk data (bytes)
- `chunk_number` - Sequential chunk number
- `is_last_chunk` - Flag indicating the last chunk

**Response:**
- `success` - Upload status
- `file_id` - Unique identifier for the uploaded file
- `message` - Status message
- `total_bytes` - Total bytes received

### GetFileInfo

Retrieves metadata about an uploaded file.

**Request:**
- `file_id` - The file identifier

**Response:**
- `file_id` - File identifier
- `filename` - Original filename
- `size` - File size in bytes
- `upload_date` - ISO timestamp of upload

## Mock Features

This is a mock implementation that:
- Stores file metadata in memory (not persisted)
- Does not save actual file contents to disk
- Generates random file IDs
- Handles streaming uploads in chunks

For production use, you would want to:
- Persist files to disk or cloud storage
- Add authentication/authorization
- Implement file size limits
- Add error handling and validation
- Use a database for file metadata
