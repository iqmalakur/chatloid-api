import { Injectable } from '@nestjs/common';
import { AuthSocket } from './event.type';

@Injectable()
export class EventCache {
  private readonly users = new Map<string, AuthSocket>();

  public addUser(userId: string, socket: AuthSocket) {
    this.users.set(userId, socket);
  }

  public removeUser(userId: string) {
    this.users.delete(userId);
  }

  public getUserSocket(userId: string): AuthSocket | undefined {
    return this.users.get(userId);
  }

  public getUserStatus(userId: string): string {
    return this.users.get(userId) ? 'Online' : 'Offline';
  }
}
