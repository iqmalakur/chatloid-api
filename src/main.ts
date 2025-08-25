import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { LoggerUtil } from './utils/logger.util';
import { PORT } from './configs/app.config';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const logger = new LoggerUtil('Main');

  const app = await NestFactory.create(AppModule, new FastifyAdapter());
  app.enableCors();
  logger.info('Loaded app modules');

  const swaggerConfig: Omit<OpenAPIObject, 'paths'> = new DocumentBuilder()
    .setTitle('ChatLoid API')
    .setDescription('API documentation for ChatLoid Application')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'jwt',
    )
    .addTag('Auth')
    .addTag('Users')
    .addTag('Contacts')
    .addTag('Contact Requests')
    .addTag('Chats')
    .build();

  const swaggerDocument: OpenAPIObject = SwaggerModule.createDocument(
    app,
    swaggerConfig,
  );
  SwaggerModule.setup('api', app, swaggerDocument);
  logger.info('Generated Swagger API Documentation');
  logger.info('Access /api to see the API Documentation');
  logger.info('Access /api-json to see the Open API json file');
  logger.info('Access /api-yaml to see the Open API yaml file');

  await app.listen(PORT, '0.0.0.0');
  logger.info(`Application started on port ${PORT}`);
}

bootstrap();
