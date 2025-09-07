import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
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

  public async handleCheckExistingChatRoom(
    userId: string,
    contactId: string,
  ): Promise<ChatRoomResDto | null> {
    const existingChatRoom = await this.repository.findExistingChatRoom(
      userId,
      contactId,
    );

    if (!existingChatRoom) return null;

    const userContact =
      userId === existingChatRoom.user1.id
        ? existingChatRoom.user2
        : existingChatRoom.user1;

    const lastMessage = existingChatRoom.messages[0]
      ? {
          content: existingChatRoom.messages[0].content,
          createdAt: existingChatRoom.messages[0].sentAt,
        }
      : null;

    return {
      id: existingChatRoom.id,
      picture: userContact.picture,
      displayName: userContact.name,
      lastMessage,
    };
  }

  public async handleCreateChatRooms(
    userId: string,
    contactId: string,
  ): Promise<ChatRoomResDto> {
    if (!(await this.repository.isUserExists(contactId))) {
      throw new NotFoundException('Contact user not found');
    }

    const chatRoom = await this.repository.createChatRoom(userId, contactId);

    if (!chatRoom) {
      throw new InternalServerErrorException();
    }

    const userContact =
      userId === chatRoom.user1.id ? chatRoom.user2 : chatRoom.user1;

    const lastMessage = chatRoom.messages[0]
      ? {
          content: chatRoom.messages[0].content,
          createdAt: chatRoom.messages[0].sentAt,
        }
      : null;

    return {
      id: chatRoom.id,
      picture: userContact.picture,
      displayName: userContact.name,
      lastMessage,
    };
  }
}
