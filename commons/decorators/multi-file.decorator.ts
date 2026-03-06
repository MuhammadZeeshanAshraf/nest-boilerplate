import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';

export function MultiFile(fields: Record<string, any>, files: any) {
  const properties = {
    ...Object.keys(fields).reduce((acc, key) => {
      acc[key] = { type: 'string', ...fields[key] };
      return acc;
    }, {}),
    ...files,
  };

  return applyDecorators(
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties,
      },
    }),
  );
}
