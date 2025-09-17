import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../shared/base.repository';
import { ChatRoomSelection, DetailChatRoomSelection } from './chats.type';

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

  public async findExistingChatRoom(
    userId: string,
    contactId: string,
  ): Promise<ChatRoomSelection | null> {
    return this.prisma.chatRoom.findFirst({
      where: {
        OR: [
          { user1Id: userId, user2Id: contactId },
          { user1Id: contactId, user2Id: userId },
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

  public async isUserExists(userId: string): Promise<boolean> {
    const result = await this.prisma.user.count({ where: { id: userId } });
    return result > 0;
  }

  public async createChatRoom(
    user1Id: string,
    user2Id: string,
  ): Promise<ChatRoomSelection | null> {
    return this.prisma.chatRoom.create({
      data: { user1Id, user2Id },
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

  public async findChatRoomById(
    userId: string,
    chatRoomId: string,
  ): Promise<DetailChatRoomSelection | null> {
    return this.prisma.chatRoom.findFirst({
      where: { id: chatRoomId, OR: [{ user1Id: userId }, { user2Id: userId }] },
      select: {
        id: true,
        user1: {
          select: {
            id: true,
            name: true,
            picture: true,
          },
        },
        user2: {
          select: {
            id: true,
            name: true,
            picture: true,
          },
        },
        messages: {
          select: {
            id: true,
            senderId: true,
            content: true,
            sentAt: true,
            editedAt: true,
          },
          take: 25,
          orderBy: { sentAt: 'asc' },
        },
      },
    });
  }
}
