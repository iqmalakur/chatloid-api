import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { LoggerUtil } from './utils/logger.util';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new FastifyAdapter());
  await app.listen(process.env.PORT ?? 3000);
  LoggerUtil.getGlobalInstance().info('Server run on port 3000');
}

bootstrap();
