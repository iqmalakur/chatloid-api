import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { ChatsController } from './chats.controller';
import { ChatsService } from './chats.service';
import { ChatsRepository } from './chats.repository';

@Module({
  imports: [SharedModule],
  controllers: [ChatsController],
  providers: [ChatsService, ChatsRepository],
})
export class ChatsModule {}
