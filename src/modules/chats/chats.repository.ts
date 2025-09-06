import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../shared/base.repository';
import { ChatRoomSelection } from './chats.type';

@Injectable()
export class ChatsRepository extends BaseRepository {
  public async findChatRooms(
    userId: string,
    keyword: string,
  ): Promise<ChatRoomSelection[]> {
    return this.prisma.chatRoom.findMany({
      where: {
        AND: [
          { OR: [{ user1Id: userId }, { user2Id: userId }] },
          {
            OR: [
              { user1: { name: { contains: keyword, mode: 'insensitive' } } },
              { user2: { name: { contains: keyword, mode: 'insensitive' } } },
            ],
          },
        ],
      },
      select: {
        id: true,
        user1: { select: { id: true, name: true, picture: true } },
        user2: { select: { id: true, name: true, picture: true } },
        messages: {
          select: { content: true, sentAt: true },
          take: 1,
          orderBy: { sentAt: 'desc' },
        },
      },
    });
  }
}
