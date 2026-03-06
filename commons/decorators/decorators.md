# Decorators Module

Custom decorators designed to simplify common tasks in NestJS controllers and DTOs, such as authentication bypass, complex validation, and Swagger documentation for file uploads.

## File Breakdown

### [public.ts]

- **`@Public()`**: A simple metadata decorator that sets `isPublic: true`. Use this on controller methods to skip global authentication guards.

### [dependent-values.decorator.ts]

- **`@IsDependentOn(property: string | string[])`**: A class-validator decorator. It ensures that the decorated property is only considered valid if the specified "dependent" properties are also present and truthy in the object.

### [fileTypeValidator.ts]

- **`CustomFileTypeValidator`**: Extends NestJS's `FileValidator`. It validates uploaded files based on an array of allowed mimetypes or extensions.

### [single-file.decorator.ts]

- **`@SwaggerFile()`**: A powerful utility decorator for file uploads. It:
  - Sets `ApiConsumes('multipart/form-data')`.
  - Automatically adds the correctly configured `FileInterceptor` or `FilesInterceptor`.
  - Updates the Swagger `ApiBody` so the file input field appears as a binary selector in the UI.

### [multi-file.decorator.ts]

- **`@MultiFile()`**: Similar to `@SwaggerFile`, but designed for complex forms that include multiple distinct fields and files simultaneously.

## Usage Guide

### Marking a Route Public

```typescript
@Public()
@Get('health')
checkHealth() { ... }
```

### Validating File Uploads in Controllers

```typescript
@Post('avatar')
@SwaggerFile('file')
@UseInterceptors(FileInterceptor('file')) // Note: SwaggerFile already applies Interceptor
uploadAvatar(@UploadedFile() file: Express.Multer.File) { ... }
```

### Conditional Validation in DTOs

```typescript
class UpdateDto {
  @IsDependentOn("oldPassword")
  newPassword?: string;

  oldPassword?: string;
}
```
