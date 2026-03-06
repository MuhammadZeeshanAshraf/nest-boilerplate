import { Controller, Post, UseInterceptors } from "@nestjs/common";
import { ApiBody, ApiConsumes } from "@nestjs/swagger";

import { S3FileInterceptor } from "../../common/interceptors/multer-s3.interceptor";
import { S3UploadService } from "../aws/aws-s3/aws-s3-multer-engine.service";

@Controller()
export class Controller {
  constructor() {}

  @Post("")
  @UseInterceptors(
    S3FileInterceptor("file", S3UploadService.getMulterOptions()),
  )
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
        },
      },
      required: ["file"],
    },
  })
  async upload(@UploadedFile() uploadedFile: Express.Multer.File) {
    // Upload file to S3 first using stream-based approach
    // Todo add your s3 or cloudfront url along with key
    const fileUrl = `${uploadedFile["key"]}`;

    const uploadDtoWithUrl = {
      fileUrl,
      originalname: uploadedFile.originalname,
      size: uploadedFile.size,
      mimeType: uploadedFile.mimetype,
    };

    return {
      uploadDtoWithUrl,
    };
  }
}
