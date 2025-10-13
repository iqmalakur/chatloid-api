import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../shared/base.repository';
import { ChatRoomSelection, DetailChatRoomSelection } from './chats.type';
import { PrismaService } from '../shared/prisma.service';
import { MongoService } from '../shared/mongo.service';
import { Collection } from 'mongodb';
import { MessageEntity } from '../event/event.type';

@Injectable()
export class ChatsRepository extends BaseRepository {
  private readonly collection: Collection<MessageEntity>;

  public constructor(prisma: PrismaService, mongo: MongoService) {
    super(prisma);
    this.collection = mongo.getDatabase().collection('messages');
  }

  public async findChatRooms(
    userId: string,
    keyword: string,
  ): Promise<ChatRoomSelection[]> {
    const chatRooms = await this.prisma.chatRoom.findMany({
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
      },
    });

    const chatRoomIds = chatRooms.map((chatRoom) => chatRoom.id);

    const messages = await this.collection
      .aggregate([
        {
          $match: {
            'chatRoom.id': { $in: chatRoomIds },
          },
        },
        { $sort: { sentAt: -1 } },
        {
          $group: {
            _id: '$chatRoom.id',
            content: { $first: '$content' },
            sentAt: { $first: '$sentAt' },
          },
        },
      ])
      .toArray();

    const messagesMap = new Map<string, { content: string; sentAt: Date }>(
      messages.map((message) => [message._id, message as any]),
    );

    return chatRooms.map((chatRoom) => ({
      ...chatRoom,
      message: messagesMap.get(chatRoom.id) ?? null,
    }));
  }

  public async findExistingChatRoom(
    userId: string,
    contactId: string,
  ): Promise<ChatRoomSelection | null> {
    const chatRoom = await this.prisma.chatRoom.findFirst({
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
      },
    });

    if (!chatRoom) return null;

    const message = await this.collection.findOne(
      { 'chatRoom.id': chatRoom.id },
      { sort: { sentAt: -1 } },
    );

    return {
      ...chatRoom,
      message,
    };
  }

  public async isUserExists(userId: string): Promise<boolean> {
    const result = await this.prisma.user.count({ where: { id: userId } });
    return result > 0;
  }

  public async createChatRoom(
    user1Id: string,
    user2Id: string,
  ): Promise<ChatRoomSelection | null> {
    const chatRoom = await this.prisma.chatRoom.create({
      data: { user1Id, user2Id },
      select: {
        id: true,
        user1: { select: { id: true, name: true, picture: true } },
        user2: { select: { id: true, name: true, picture: true } },
      },
    });

    if (!chatRoom) return null;

    const message = await this.collection.findOne(
      { 'chatRoom.id': chatRoom.id },
      { sort: { sentAt: -1 } },
    );

    return {
      ...chatRoom,
      message,
    };
  }

  public async findChatRoomById(
    userId: string,
    chatRoomId: string,
  ): Promise<DetailChatRoomSelection | null> {
    const chatRoom = await this.prisma.chatRoom.findFirst({
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
      },
    });

    if (!chatRoom) return null;

    const messages = await this.collection
      .find({ 'chatRoom.id': chatRoom.id }, { sort: { sentAt: -1 }, limit: 25 })
      .toArray();

    return {
      ...chatRoom,
      messages,
    };
  }
}
