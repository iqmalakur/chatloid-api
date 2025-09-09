import { Injectable } from '@nestjs/common';
import { AuthSocket } from './event.type';

@Injectable()
export class EventCache {
  private readonly users: Map<string, AuthSocket>;

  public addUser(userId: string, socket: AuthSocket) {
    this.users.set(userId, socket);
  }

  public removeUser(userId: string) {
    this.users.delete(userId);
  }

  public getUserSocket(userId: string): AuthSocket | undefined {
    return this.users.get(userId);
  }
}
