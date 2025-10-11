import { Injectable, NotFoundException } from '@nestjs/common';
import { BaseRepository } from '../shared/base.repository';
import { MessageEntity } from './event.type';
import { Collection, ObjectId } from 'mongodb';
import { MongoService } from '../shared/mongo.service';
import { PrismaService } from '../shared/prisma.service';

@Injectable()
export class EventRepository extends BaseRepository {
  private readonly collection: Collection<MessageEntity>;

  public constructor(prisma: PrismaService, mongo: MongoService) {
    super(prisma);
    this.collection = mongo.getDatabase().collection('messages');
  }

  public async createMessage(
    chatRoomId: string,
    senderId: string,
    content: string,
  ): Promise<MessageEntity | null> {
    const chatRoom = await this.prisma.chatRoom.findUnique({
      where: { id: chatRoomId },
      select: {
        id: true,
        user1Id: true,
        user2Id: true,
      },
    });

    if (!chatRoom) return null;

    const message = {
      _id: new ObjectId(),
      senderId,
      content,
      sentAt: new Date(),
      editedAt: null,
      deletedAt: null,
      chatRoom: {
        id: chatRoom.id,
        user1Id: chatRoom.user1Id,
        user2Id: chatRoom.user2Id,
      },
    };

    const { acknowledged } = await this.collection.insertOne(message);

    return acknowledged ? message : null;
  }

  public async isMessageBelongsToUser(
    messageId: ObjectId,
    userId: string,
  ): Promise<boolean> {
    const result = await this.collection.findOne({
      _id: messageId,
      senderId: userId,
    });
    return result !== null;
  }

  public async updateMessage(
    id: ObjectId,
    content: string,
  ): Promise<MessageEntity | null> {
    const message = await this.collection.findOne({ _id: id });
    if (!message) return null;

    const editedAt = new Date();
    const { acknowledged } = await this.collection.updateOne(
      { _id: id },
      { $set: { content, editedAt } },
    );

    message.content = content;
    message.editedAt = editedAt;

    return acknowledged ? message : null;
  }

  public async deleteMessage(id: ObjectId): Promise<MessageEntity | null> {
    const message = await this.collection.findOne({ _id: id });
    if (!message) return null;

    const { acknowledged } = await this.collection.deleteOne({ _id: id });
    return acknowledged ? message : null;
  }
}
