import { FileValidator } from '@nestjs/common';

interface CustomFileTypeValidatorOptions {
  allowedTypes: string[];
}

export class CustomFileTypeValidator extends FileValidator<CustomFileTypeValidatorOptions> {
  buildErrorMessage(file: Express.Multer.File): string {
    return `Invalid file type: ${file.mimetype}. Allowed types: ${this.validationOptions.allowedTypes.join(', ')}`;
  }

  isValid(file: Express.Multer.File): boolean | Promise<boolean> {
    return (
      this.validationOptions.allowedTypes.includes(
        file.originalname.split('.').pop(),
      ) || this.validationOptions.allowedTypes.includes(file.mimetype)
    );
  }
}
