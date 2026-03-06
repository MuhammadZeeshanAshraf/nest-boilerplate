import * as multer from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";
import { Injectable } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import { configDotenv } from "dotenv";
import { imageOnly } from "./sample-multer-file-filter.decorator";
configDotenv();
@Injectable()
export class S3UploadService {
  constructor() {}
  /**
   * make sure this file can access env variables
   * @description Returns multer options for S3 upload
   * @returns multer.Options
   */
  static getMulterOptions(): multer.Options {
    return {
      storage: multerS3({
        s3: new S3Client({
          region: process.env.AWS_REGION,
          endpoint: process.env.AWS_URL,
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          },
        }),
        bucket: process.env.AWS_S3_BUCKET_NAME,
        // TODO: Add your metadata here
        metadata: (req, file, cb) => {
          cb(null, {
            fieldName: file.fieldname,
            originalName: file.originalname,
            uploadedBy: (req as any).user?.id || "anonymous",
          });
        },
        key: (req, file, cb) => {
          // TODO: Add your custom key here
          cb(null, `${uuidv4()}-${file.originalname}`);
        },
        contentType: multerS3.AUTO_CONTENT_TYPE,
      }),
      limits: {
        // TODO: Add your limits here
        fileSize: 5000,
        files: 1,
      },
      fileFilter: (_, file, cb) => {
        // TODO: Add your filter here
        imageOnly(file, cb);
      },
    };
  }
}
