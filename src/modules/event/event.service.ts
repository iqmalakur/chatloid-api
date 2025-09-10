import { Injectable } from '@nestjs/common';
import { BaseService } from '../shared/base.service';
import { EventRepository } from './event.repository';
import { NewMessageDto } from './event.dto';

@Injectable()
export class EventService extends BaseService {
  public constructor(private readonly repository: EventRepository) {
    super();
  }

  public async handleSendMessage(
    chatRoomId: string,
    senderId: string,
    content: string,
  ): Promise<NewMessageDto> {
    const message = await this.repository.createMessage(
      chatRoomId,
      senderId,
      content,
    );

    if (!message) {
      throw new Error('Failed to send message');
    }

    const receiverId =
      senderId === message.chatRoom.user1Id
        ? message.chatRoom.user2Id
        : message.chatRoom.user1Id;

    return {
      id: message.id,
      chatRoomId: message.chatRoom.id,
      senderId: message.senderId,
      receiverId,
      content: message.content,
      timestamp: message.sentAt,
      isEdited: message.editedAt != null,
      isDeleted: message.deletedAt != null,
    };
  }

  public async handleEditMessage(
    messageId: string,
    senderId: string,
    content: string,
  ): Promise<NewMessageDto> {
    if (!(await this.repository.isMessageBelongsToUser(messageId, senderId))) {
      throw new Error('Cannot edit message');
    }

    const message = await this.repository.updateMessage(messageId, content);

    if (!message) {
      throw new Error('Failed to edit message');
    }

    const receiverId =
      message.senderId === message.chatRoom.user1Id
        ? message.chatRoom.user2Id
        : message.chatRoom.user1Id;

    return {
      id: message.id,
      chatRoomId: message.chatRoom.id,
      senderId: message.senderId,
      receiverId,
      content: message.content,
      timestamp: message.sentAt,
      isEdited: message.editedAt != null,
      isDeleted: message.deletedAt != null,
    };
  }

  public async handleDeleteMessage(
    messageId: string,
    senderId: string,
  ): Promise<NewMessageDto> {
    if (!(await this.repository.isMessageBelongsToUser(messageId, senderId))) {
      throw new Error('Cannot delete message');
    }

    const message = await this.repository.deleteMessage(messageId);

    if (!message) {
      throw new Error('Failed to delete message');
    }

    const receiverId =
      message.senderId === message.chatRoom.user1Id
        ? message.chatRoom.user2Id
        : message.chatRoom.user1Id;

    return {
      id: message.id,
      chatRoomId: message.chatRoom.id,
      senderId: message.senderId,
      receiverId,
      content: message.content,
      timestamp: message.sentAt,
      isEdited: message.editedAt != null,
      isDeleted: message.deletedAt != null,
    };
  }
}
