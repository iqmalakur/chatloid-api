import { Injectable } from '@nestjs/common';
import { BaseService } from '../shared/base.service';
import { EventRepository } from './event.repository';

@Injectable()
export class EventService extends BaseService {
  public constructor(private readonly repository: EventRepository) {
    super();
  }
}
