import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference'
import { ConfigService } from '@nestjs/config';
import { HttpExeptionFilter } from 'libs/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.useGlobalPipes(new ValidationPipe())

  const config = new DocumentBuilder()
    .setTitle('Nest JS')
    .setDescription('api documentations')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  app.use(
    '/api/documentation',
    apiReference({
      cdn: 'https://cdn.jsdelivr.net/npm/@scalar/api-reference@1.25.11/dist/browser/standalone.min.js',
      spec: {
        content: document,
      },
    }),
  )
  const configService = new ConfigService()
  const port = configService.get('PORT') || 3000;
  app.useGlobalFilters(new HttpExeptionFilter());
  await app.listen(port);
}
bootstrap();
