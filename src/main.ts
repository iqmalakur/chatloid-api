import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { LoggerUtil } from './utils/logger.util';
import { PORT } from './configs/app.config';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { STATUS_CODES } from 'http';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const logger = new LoggerUtil('Main');

  const app = await NestFactory.create(AppModule, new FastifyAdapter());
  app.enableCors();
  logger.info('Loaded app modules');

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

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

  const requestLogger = new LoggerUtil('Request');
  const responseLogger = new LoggerUtil('Response');

  const shouldLog = (url: string): boolean => {
    return !(
      url.startsWith('/api') ||
      url.startsWith('/favicon') ||
      url.startsWith('/auth/google/callback')
    );
  };

  const fastify = app.getHttpAdapter().getInstance();

  fastify.addHook('onRequest', (req: any, reply: any, done: () => void) => {
    if (shouldLog(req.originalUrl)) {
      req.startTime = Date.now();
      requestLogger.http(`${req.method} ${req.originalUrl}`);
    }
    done();
  });

  fastify.addHook(
    'onSend',
    (req: any, reply: any, payload: any, done: () => void) => {
      if (shouldLog(req.originalUrl)) {
        const duration = Date.now() - (req.startTime || Date.now());

        if (reply.statusCode < 300 || reply.statusCode > 399) {
          responseLogger.debug('response body:', payload);
        }

        responseLogger.http(
          `${req.method} ${req.originalUrl} - ${reply.statusCode} ${STATUS_CODES[reply.statusCode]} - ${duration}ms`,
        );
      }
      done();
    },
  );

  await app.listen(PORT, '0.0.0.0');
  logger.info(`Application started on port ${PORT}`);
}

bootstrap();
