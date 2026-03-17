import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import expressBasicAuth from 'express-basic-auth';
import {
  JWT,
  PROJECT_NAME,
  SWAGGER_PATH,
  X_API_KEY,
} from '../common/constants';

export async function getSwaggerConfiguration(app: NestExpressApplication) {
  const swaggerUsername = process.env.SWAGGER_USERNAME;
  const swaggerPassword = process.env.SWAGGER_PASSWORD;

  app.use(
    SWAGGER_PATH,
    expressBasicAuth({
      users: {
        [swaggerUsername]: swaggerPassword,
      },
      challenge: true,
      unauthorizedResponse: `Unauthorized access to Swagger. Contact admin for credentials.`,
    }),
  );
  const config = new DocumentBuilder()
    .setTitle(`${PROJECT_NAME}`)
    .setDescription(`The ${PROJECT_NAME} API description`)
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: JWT }, JWT)
    .addApiKey({ type: 'apiKey', name: X_API_KEY, in: 'header' }, X_API_KEY)
    .addTag(`${PROJECT_NAME}`)
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(SWAGGER_PATH, app, document);
}
