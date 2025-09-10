import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../shared/base.repository';
import { NewMessageSelection } from './event.type';

@Injectable()
export class EventRepository extends BaseRepository {
  public async createMessage(
    chatRoomId: string,
    senderId: string,
    content: string,
  ): Promise<NewMessageSelection | null> {
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

  public async isMessageBelongsToUser(
    messageId: string,
    userId: string,
  ): Promise<boolean> {
    const result = await this.prisma.message.count({
      where: { id: messageId, senderId: userId },
    });
    return result > 0;
  }

  public async updateMessage(
    id: string,
    content: string,
  ): Promise<NewMessageSelection | null> {
    return this.prisma.message.update({
      where: { id },
      data: { content },
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

  public async deleteMessage(id: string): Promise<NewMessageSelection | null> {
    return this.prisma.message.delete({
      where: { id },
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
