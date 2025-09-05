import { Injectable } from '@nestjs/common';
import { BaseService } from '../shared/base.service';
import { ChatsRepository } from './chats.repository';

@Injectable()
export class ChatsService extends BaseService {
  public constructor(private readonly repository: ChatsRepository) {
    super();
  }
}
