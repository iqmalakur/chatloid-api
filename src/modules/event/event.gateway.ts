import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Server } from 'socket.io';
import { LoggerUtil } from 'src/utils/logger.util';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventGateway {
  private readonly logger: LoggerUtil;

  @WebSocketServer()
  server: Server;

  public constructor() {
    this.logger = new LoggerUtil(this.constructor.name);
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
