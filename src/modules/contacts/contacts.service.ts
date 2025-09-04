import { Injectable } from '@nestjs/common';
import { BaseService } from '../shared/base.service';
import { ContactsRepository } from './contacts.repository';

@Injectable()
export class ContactsService extends BaseService {
  public constructor(private readonly repository: ContactsRepository) {
    super();
  }
}
