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

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger: LoggerUtil;

  @WebSocketServer()
  private readonly server: Server;

  public constructor(private readonly service: EventService) {
    this.logger = new LoggerUtil(this.constructor.name);
  }

  public async handleConnection(client: AuthSocket) {
    const token: string = client.handshake.auth?.token;
    if (!token) {
      return client.disconnect(true);
    }

    try {
      const jwt = token.split(' ')[1];
      const userId = verify(jwt, SECRET_KEY).sub as string;
      client.data.userId = userId;
      this.logger.debug('Authorized. Client ID : ', userId);
    } catch (err) {
      this.logger.debug('Unauthorized. Invalid Token');
      return client.disconnect(true);
    }
  }

  public async handleDisconnect(client: AuthSocket) {
    // throw new Error('Method not implemented.');
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
}
