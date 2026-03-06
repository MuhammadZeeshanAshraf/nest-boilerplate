import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Readable } from "stream";
import { v4 as uuidv4 } from "uuid";
import { FileMetadata, FileStreamResult, S3UploadResult, UploadFile } from "../interfaces/s3.interface";



@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);

  private s3Client: S3Client;

  private bucketName: string;

  private readonly DEFAULT_EXPIRY_HOURS = 24;

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get("AWS_REGION"),
      credentials: {
        accessKeyId: this.configService.get("AWS_ACCESS_KEY_ID"),
        secretAccessKey: this.configService.get("AWS_SECRET_ACCESS_KEY"),
      },
    });

    this.bucketName = this.configService.get("AWS_S3_BUCKET_NAME");
  }

  async upload(data: UploadFile): Promise<S3UploadResult> {
    try {
      const { buffer, fileName, mimeType, folder, key } = data;
      const sanitizedFilename = this.sanitizeFilename(fileName);
      const fileKey =
        key || `${folder ? `${folder}/` : ""}${uuidv4()}_${sanitizedFilename}`;

      const uploadCommand = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
        Body: buffer,
        ContentType: mimeType,
        // ServerSideEncryption: 'AES256', // Optional, depends on bucket policy
      });

      await this.s3Client.send(uploadCommand);

      const publicUrl = `https://${this.bucketName}.s3.${this.configService.get("AWS_REGION")}.amazonaws.com/${fileKey}`;
      const accessUrl = await this.getAccessUrl(fileKey);

      this.logger.log(`Successfully uploaded file to S3: ${fileKey}`);

      return {
        key: fileKey,
        url: accessUrl,
        publicUrl,
      };
    } catch (error) {
      this.logger.error(
        `Failed to upload file to S3: ${error.message}`,
        error.stack,
      );
      throw new Error(`S3 upload failed: ${error.message}`);
    }
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const signedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn,
      });

      return signedUrl;
    } catch (error) {
      this.logger.error(`Failed to generate signed URL: ${error.message}`);
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }
  }

  async stream(key: string): Promise<FileStreamResult> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const response = await this.s3Client.send(command);

      if (!response.Body) {
        throw new Error("No file content received from S3");
      }

      const fileName = key.split("/").pop() || "download";

      const result: FileStreamResult = {
        stream: response.Body as Readable,
        contentType: response.ContentType || "application/octet-stream",
        contentLength: response.ContentLength || 0,
        lastModified: response.LastModified || new Date(),
        fileName,
      };

      this.logger.log(`Streaming file from S3: ${key}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to stream file from S3: ${error.message}`);
      throw new Error(`Failed to stream file: ${error.message}`);
    }
  }

  async getMetadata(key: string): Promise<FileMetadata> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const response = await this.s3Client.send(command);
      const fileName = key.split("/").pop() || "download";

      return {
        contentType: response.ContentType || "application/octet-stream",
        contentLength: response.ContentLength || 0,
        lastModified: response.LastModified || new Date(),
        fileName,
        exists: true,
      };
    } catch (error) {
      if (error.name === "NotFound") {
        return {
          contentType: "",
          contentLength: 0,
          lastModified: new Date(),
          fileName: "",
          exists: false,
        };
      }
      this.logger.error(`Failed to get file metadata: ${error.message}`);
      throw new Error(`Failed to get file metadata: ${error.message}`);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(deleteCommand);

      this.logger.log(`Successfully deleted PDF from S3: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete PDF from S3: ${error.message}`);
      throw new Error(`Failed to delete PDF: ${error.message}`);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      return false;
    }
  }

  async getPresignedUploadUrl(
    key: string,
    contentType: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ContentType: contentType,
      });

      const signedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn,
      });

      return signedUrl;
    } catch (error) {
      this.logger.error(
        `Failed to generate presigned upload URL: ${error.message}`,
      );
      throw new Error(`Failed to generate upload URL: ${error.message}`);
    }
  }
  private sanitizeFilename(filename: string): string {
    return filename.replace(/[^a-zA-Z0-9.\-_]/g, "_").toLowerCase();
  }
}
