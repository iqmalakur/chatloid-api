import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { EventModule } from './modules/event/event.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TokenMiddleware } from './middlewares/token.middleware';

@Module({
  imports: [AuthModule, EventModule, UsersModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TokenMiddleware)
      .exclude({ path: 'auth/(.*)', method: RequestMethod.ALL })
      .forRoutes('*');
  }
}
