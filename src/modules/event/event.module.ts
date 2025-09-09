import { Module } from '@nestjs/common';
import { EventGateway } from './event.gateway';
import { EventService } from './event.service';
import { EventRepository } from './event.repository';
import { SharedModule } from '../shared/shared.module';
import { EventCache } from './event.cache';

@Module({
  imports: [SharedModule],
  providers: [EventGateway, EventService, EventRepository, EventCache],
})
export class EventModule {}
