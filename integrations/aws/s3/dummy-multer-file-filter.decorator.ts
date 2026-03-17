import { BadRequestException } from "@nestjs/common";
import * as multer from "multer";

export function imageOnly(
  file: Express.Multer.File,
  callback: multer.FileFilterCallback,
) {
  // Check file type
  if (!file.mimetype.startsWith("image/")) {
    callback(new BadRequestException("Only image files are allowed!"));
  }

  // Check file size based on file type
  const maxSize = 5000;

  if (file.size > maxSize) {
    return callback(new BadRequestException("File size is too large!"));
  }

  callback(null, true);
}
