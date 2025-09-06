import { Injectable } from '@nestjs/common';
import { BaseService } from '../shared/base.service';
import { ChatsRepository } from './chats.repository';
import { ChatRoomResDto } from './chats.dto';

@Injectable()
export class ChatsService extends BaseService {
  public constructor(private readonly repository: ChatsRepository) {
    super();
  }

  public async handleGetChatRooms(
    userId: string,
    keyword?: string,
  ): Promise<ChatRoomResDto[]> {
    const chatRooms = await this.repository.findChatRooms(
      userId,
      keyword || '',
    );

    return chatRooms.map((room) => {
      const userContact = userId === room.user1.id ? room.user2 : room.user1;

      const lastMessage = room.messages[0]
        ? {
            content: room.messages[0].content,
            createdAt: room.messages[0].sentAt,
          }
        : null;

      return {
        id: room.id,
        picture: userContact.picture,
        displayName: userContact.name,
        lastMessage,
      };
    });
  }
}
