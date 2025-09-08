import { Module } from '@nestjs/common';
import { EventGateway } from './event.gateway';
import { EventService } from './event.service';
import { EventRepository } from './event.repository';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [SharedModule],
  providers: [EventGateway, EventService, EventRepository],
})
export class EventModule {}
