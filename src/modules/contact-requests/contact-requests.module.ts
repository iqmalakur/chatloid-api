import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { ContactRequestsController } from './contact-requests.controller';
import { ContactRequestsService } from './contact-requests.service';
import { ContactRequestsRepository } from './contact-requests.repository';

@Module({
  imports: [SharedModule],
  controllers: [ContactRequestsController],
  providers: [ContactRequestsService, ContactRequestsRepository],
})
export class ContactRequestsModule {}
