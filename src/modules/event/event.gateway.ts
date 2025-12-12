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
import {
  DeleteMessageDto,
  EditMessageDto,
  NewMessageDto,
  SendMessageDto,
  UserStatusDto,
} from './event.dto';
import { ObjectId } from 'mongodb';

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

  public handleConnection(client: AuthSocket) {
    const token: string = client.handshake.auth?.token;
    if (!token) {
      client.emit('error', 'Token is not provided');
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
      client.emit('error', 'Invalid token');
      return client.disconnect(true);
    }
  }

  public handleDisconnect(client: AuthSocket) {
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
    return this.handleResponse(client, () =>
      this.service.handleSendMessage(
        message.chatRoomId,
        client.data.userId,
        message.content,
      ),
    );
  }

  @SubscribeMessage('edit_message')
  public async editMessage(
    @MessageBody() message: EditMessageDto,
    @ConnectedSocket() client: AuthSocket,
  ) {
    if (!ObjectId.isValid(message.id)) {
      client.emit('error', 'id is not valid');
      return;
    }

    const messageId = new ObjectId(message.id);
    return this.handleResponse(client, () =>
      this.service.handleEditMessage(
        messageId,
        client.data.userId,
        message.content,
      ),
    );
  }

  @SubscribeMessage('delete_message')
  public async deleteMessage(
    @MessageBody() message: DeleteMessageDto,
    @ConnectedSocket() client: AuthSocket,
  ) {
    if (!ObjectId.isValid(message.id)) {
      client.emit('error', 'id is not valid');
      return;
    }

    const messageId = new ObjectId(message.id);
    return this.handleResponse(client, () =>
      this.service.handleDeleteMessage(messageId, client.data.userId),
    );
  }

  @SubscribeMessage('get_user_status')
  public getUserStatus(
    @MessageBody() userStatus: UserStatusDto,
    @ConnectedSocket() client: AuthSocket,
  ) {
    const status = this.cache.getUserStatus(userStatus.id);
    return client.emit('user_status', {
      userId: userStatus.id,
      status,
    });
  }

  private async handleResponse(
    client: AuthSocket,
    callService: () => Promise<NewMessageDto>,
  ) {
    try {
      const newMessage = await callService();

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
      this.logger.error(err);
      return null;
    }
  }
}
