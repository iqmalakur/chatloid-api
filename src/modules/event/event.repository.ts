import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../shared/base.repository';
import { NewMessageSelection } from './event.type';

@Injectable()
export class EventRepository extends BaseRepository {
  public async createMessage(
    chatRoomId: string,
    senderId: string,
    content: string,
  ): Promise<NewMessageSelection> {
    return this.prisma.message.create({
      data: {
        chatRoomId,
        senderId,
        content,
      },
      select: {
        id: true,
        senderId: true,
        content: true,
        sentAt: true,
        editedAt: true,
        deletedAt: true,
        chatRoom: {
          select: {
            id: true,
            user1Id: true,
            user2Id: true,
          },
        },
      },
    });
  }
}
