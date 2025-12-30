import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getLogger } from "../config/logger.js";
import crypto from "crypto";
import mime from "mime";

const logger = getLogger("UploadController");

// Initialize S3 client
const s3Client = new S3Client({
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
  region: process.env.REGION || "us-east-1",
  endpoint: process.env.JURISDICTION_SPECIFIC_ENDPOINTS,
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || "auctio-bucket";

class UploadController {
  /**
   * Upload product images
   * POST /api/upload/images
   */
  async uploadImages(req, res) {
    /*
      #swagger.summary = 'Upload product images'
      #swagger.description = 'Upload one or more product images to S3 storage'
      #swagger.security = [{ "bearerAuth": [] }, { "cookieAuth": [] }]
      #swagger.tags = ['Upload']
      #swagger.consumes = ['multipart/form-data']
      #swagger.parameters['images'] = {
        in: 'formData',
        type: 'file',
        required: true,
        description: 'Product images (max 10 files, 5MB each)'
      }
      #swagger.responses[200] = {
        description: 'Images uploaded successfully',
        schema: {
          success: true,
          data: {
            urls: ['https://s3.amazonaws.com/bucket/image1.jpg']
          }
        }
      }
      #swagger.responses[400] = {
        description: 'Invalid input',
        schema: { success: false, message: 'No files uploaded' }
      }
      #swagger.responses[401] = {
        description: 'Unauthorized',
        schema: { success: false, message: 'Unauthorized' }
      }
    */
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      // Check if files exist
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No files uploaded",
        });
      }

      // Validate file count (max 10 images)
      if (req.files.length > 10) {
        return res.status(400).json({
          success: false,
          message: "Maximum 10 images allowed",
        });
      }

      const uploadPromises = req.files.map(async (file) => {
        try {
          // Validate file size (5MB max)
          if (file.size > 5 * 1024 * 1024) {
            throw new Error(`File ${file.originalname} exceeds 5MB limit`);
          }

          // Validate file type
          const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
          if (!allowedTypes.includes(file.mimetype)) {
            throw new Error(
              `File ${file.originalname} has invalid type. Only JPG, PNG, WEBP allowed`
            );
          }

          // Generate unique filename
          const fileExtension = mime.getExtension(file.mimetype);
          const uniqueFilename = `products/${Date.now()}-${crypto.randomBytes(8).toString("hex")}.${fileExtension}`;

          // Upload to S3
          const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: uniqueFilename,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: "public-read", // Make images publicly accessible
          });

          await s3Client.send(command);

          // Construct public URL
          // For R2, use PUBLIC_BUCKET_URL or construct from endpoint
          const imageUrl = process.env.PUBLIC_BUCKET_URL
            ? `${process.env.PUBLIC_BUCKET_URL}/${uniqueFilename}`
            : `https://${BUCKET_NAME}.s3.${process.env.REGION || "us-east-1"}.amazonaws.com/${uniqueFilename}`;

          logger.info(`Image uploaded successfully: ${uniqueFilename}`);

          return imageUrl;
        } catch (uploadError) {
          logger.error(`Error uploading file ${file.originalname}:`, uploadError);
          throw uploadError;
        }
      });

      // Wait for all uploads to complete
      const imageUrls = await Promise.all(uploadPromises);

      return res.status(200).json({
        success: true,
        data: {
          urls: imageUrls,
        },
        message: `${imageUrls.length} image(s) uploaded successfully`,
      });
    } catch (error) {
      logger.error("Error in uploadImages:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to upload images",
      });
    }
  }
}

export default new UploadController();
