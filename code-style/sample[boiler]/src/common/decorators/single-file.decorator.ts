import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import {
  ReferenceObject,
  SchemaObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export function SwaggerFile(
  field: string,
  properties?: Record<string, SchemaObject | ReferenceObject>,
  multi: boolean = false,
  nullable = false,
  required: string[] = [],
) {
  return applyDecorators(
    ApiConsumes('multipart/form-data'),
    UseInterceptors(multi ? FilesInterceptor(field) : FileInterceptor(field)),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          [field]: multi
            ? {
                type: 'array',
                items: {
                  type: 'string',
                  format: 'binary',
                  nullable,
                },
              }
            : {
                type: 'string',
                format: 'binary',
                nullable,
              },
          ...properties,
        },
        required: required.length ? required : undefined,
      },
    }),
  );
}
