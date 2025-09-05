import { Injectable } from '@nestjs/common';
import { BaseService } from '../shared/base.service';
import { ContactRequestsRepository } from './contact-requests.repository';
import { ContactRequestsResDto } from './contact-requests.dto';

@Injectable()
export class ContactRequestsService extends BaseService {
  public constructor(private readonly repository: ContactRequestsRepository) {
    super();
  }

  public async handleContactRequests(
    userId: string,
  ): Promise<ContactRequestsResDto[]> {
    const contactRequests = await this.repository.findContactRequests(userId);
    return contactRequests.map((request) => request.userOne);
  }
}
