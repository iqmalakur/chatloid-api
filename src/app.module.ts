import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { EventModule } from './modules/event/event.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TokenMiddleware } from './middlewares/token.middleware';
import { UsersController } from './modules/users/users.controller';
import { ContactsModule } from './modules/contacts/contacts.module';
import { ContactsController } from './modules/contacts/contacts.controller';
import { ContactRequestsModule } from './modules/contact-requests/contact-requests.module';
import { ContactRequestsController } from './modules/contact-requests/contact-requests.controller';
import { ChatsModule } from './modules/chats/chats.module';
import { ChatsController } from './modules/chats/chats.controller';

@Module({
  imports: [
    AuthModule,
    ContactsModule,
    ContactRequestsModule,
    ChatsModule,
    EventModule,
    UsersModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TokenMiddleware)
      .forRoutes(
        UsersController,
        ContactsController,
        ContactRequestsController,
        ChatsController,
      );
  }
}
