import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { LoggerUtil } from './utils/logger.util';
import { PORT } from './configs/app.config';

async function bootstrap() {
  const logger = new LoggerUtil('Main');

  const app = await NestFactory.create(AppModule, new FastifyAdapter());
  app.enableCors();
  logger.info('Loaded app modules');

  await app.listen(PORT, '0.0.0.0');
  logger.info(`Application started on port ${PORT}`);
}

bootstrap();
