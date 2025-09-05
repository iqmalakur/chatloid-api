import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { BaseService } from '../shared/base.service';
import { ContactsRepository } from './contacts.repository';
import { AddContactsResDto, ContactsResDto } from './contacts.dto';

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

  public async handleAddContacts(
    userId: string,
    username: string,
  ): Promise<AddContactsResDto> {
    const user = await this.repository.findUserByUsername(username);
    if (!user) throw new NotFoundException('User not found');

    if (userId === user.id) {
      throw new BadRequestException(['Cannot add yourself as a contact']);
    }

    const contactRequest = await this.repository.findCurrentContactRequest(
      userId,
      user.id,
    );

    if (userId === contactRequest?.userOneId && !contactRequest.isAccepted) {
      throw new ConflictException('Contact request already sent');
    } else if (
      userId === contactRequest?.userTwoId &&
      !contactRequest.isAccepted
    ) {
      const updateContact = await this.repository.acceptContact(
        user.id,
        userId,
      );

      if (!updateContact) throw new InternalServerErrorException();
      return {
        id: userId,
        username,
        accepted: updateContact.isAccepted,
      };
    } else if (
      userId === contactRequest?.userOneId ||
      userId === contactRequest?.userTwoId
    ) {
      throw new ConflictException('Contact already added');
    }

    const contact = await this.repository.addContact(userId, user.id);
    if (!contact) throw new InternalServerErrorException();

    return {
      id: userId,
      username,
      accepted: contact.isAccepted,
    };
  }
}
