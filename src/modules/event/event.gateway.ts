import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { verify } from 'jsonwebtoken';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Server } from 'socket.io';
import { SECRET_KEY } from 'src/configs/app.config';
import { LoggerUtil } from 'src/utils/logger.util';
import { AuthSocket } from './event.type';
import { EventService } from './event.service';
import { EventCache } from './event.cache';

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
  }

  @SubscribeMessage('events')
  findAll(@MessageBody() data: any): Observable<WsResponse<number>> {
    this.logger.debug('data dari client: ', data);
    return from([1, 2, 3]).pipe(
      map((item) => ({ event: 'events', data: item })),
    );
  }

  @SubscribeMessage('identity')
  async identity(@MessageBody() data: number): Promise<number> {
    return data;
  }

  private verifyToken(token: string): string | null {
    try {
      return verify(token, SECRET_KEY).sub as string;
    } catch (err) {
      return null;
    }
  }
}
