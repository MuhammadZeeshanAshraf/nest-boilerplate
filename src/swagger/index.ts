import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { PROJECT_NAME } from '../common/constants';

export async function getSwaggerConfiguration(app: NestExpressApplication) {
  const config = new DocumentBuilder()
    .setTitle(PROJECT_NAME)
    .setDescription(`The ${PROJECT_NAME} API description`)
    .setVersion('1.0')
    .addTag(PROJECT_NAME)
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
}
