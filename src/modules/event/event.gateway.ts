import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { verify } from 'jsonwebtoken';
import { Server } from 'socket.io';
import { SECRET_KEY } from 'src/configs/app.config';
import { LoggerUtil } from 'src/utils/logger.util';
import type { AuthSocket } from './event.type';
import { EventService } from './event.service';
import { EventCache } from './event.cache';
import { EditMessageDto, SendMessageDto } from './event.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger: LoggerUtil;

  @WebSocketServer()
  private readonly server: Server;

  public constructor(
    private readonly cache: EventCache,
    private readonly service: EventService,
  ) {
    this.logger = new LoggerUtil(this.constructor.name);
  }

  public async handleConnection(client: AuthSocket) {
    const token: string = client.handshake.auth?.token;
    if (!token) {
      return client.disconnect(true);
    }

    const userId = this.verifyToken(token);
    if (userId) {
      client.data.userId = userId;
      this.cache.addUser(userId, client);

      this.server.emit('user_status', {
        userId,
        status: 'Online',
      });

      this.logger.debug(`${userId} connected`);
    } else {
      return client.disconnect(true);
    }
  }

  public async handleDisconnect(client: AuthSocket) {
    const userId = client.data.userId;
    this.cache.removeUser(userId);

    this.server.emit('user_status', {
      userId,
      status: 'Offline',
    });

    this.logger.debug(`${userId} disconnected`);
  }

  @SubscribeMessage('send_message')
  public async sendMessage(
    @MessageBody() message: SendMessageDto,
    @ConnectedSocket() client: AuthSocket,
  ) {
    const senderId = client.data.userId;

    try {
      const newMessage = await this.service.handleSendMessage(
        message.chatRoomId,
        senderId,
        message.content,
      );

      client.emit('new_message', newMessage);

      const receiverSocket = this.cache.getUserSocket(newMessage.receiverId);
      if (receiverSocket) {
        receiverSocket.emit('new_message', newMessage);
      }
    } catch (e) {
      const error = e as Error;
      client.emit('error', error.message);
    }
  }

  @SubscribeMessage('edit_message')
  public async editMessage(
    @MessageBody() message: EditMessageDto,
    @ConnectedSocket() client: AuthSocket,
  ) {
    const senderId = client.data.userId;

    try {
      const newMessage = await this.service.handleEditMessage(
        message.id,
        senderId,
        message.content,
      );

      client.emit('new_message', newMessage);

      const receiverSocket = this.cache.getUserSocket(newMessage.receiverId);
      if (receiverSocket) {
        receiverSocket.emit('new_message', newMessage);
      }
    } catch (e) {
      const error = e as Error;
      client.emit('error', error.message);
    }
  }

  private verifyToken(token: string): string | null {
    try {
      return verify(token, SECRET_KEY).sub as string;
    } catch (err) {
      return null;
    }
  }
}
