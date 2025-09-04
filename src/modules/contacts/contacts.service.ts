import { Injectable } from '@nestjs/common';
import { BaseService } from '../shared/base.service';
import { ContactsRepository } from './contacts.repository';
import { ContactsResDto } from './contacts.dto';

@Injectable()
export class ContactsService extends BaseService {
  public constructor(private readonly repository: ContactsRepository) {
    super();
  }

  public async handleGetContacts(
    userId: string,
    keyword?: string,
  ): Promise<ContactsResDto[]> {
    const contacts = await this.repository.findUserContacts(
      userId,
      keyword ?? '',
    );

    return contacts.map((contact) =>
      contact.userOne.id === userId ? contact.userTwo : contact.userOne,
    );
  }
}
