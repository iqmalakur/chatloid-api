import { Injectable } from '@nestjs/common';
import { BaseService } from '../shared/base.service';
import { ContactRequestsRepository } from './contact-requests.repository';

@Injectable()
export class ContactRequestsService extends BaseService {
  public constructor(private readonly repository: ContactRequestsRepository) {
    super();
  }
}
