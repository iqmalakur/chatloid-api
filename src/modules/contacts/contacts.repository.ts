import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../shared/base.repository';
import { AddContactSelection, ContactSelection } from './contacts.type';
import { UserSelection } from '../auth/auth.type';

@Injectable()
export class ContactsRepository extends BaseRepository {
  public async findUserContacts(
    userId: string,
    keyword: string,
  ): Promise<ContactSelection[]> {
    return this.prisma.contact.findMany({
      where: {
        OR: [
          {
            userOneId: userId,
            userTwo: { name: { contains: keyword, mode: 'insensitive' } },
          },
          {
            userTwoId: userId,
            userOne: { name: { contains: keyword, mode: 'insensitive' } },
          },
        ],
        isAccepted: true,
      },
      select: {
        userOne: { select: { id: true, name: true, picture: true } },
        userTwo: { select: { id: true, name: true, picture: true } },
      },
    });
  }

  public async findUserByUsername(
    username: string,
  ): Promise<UserSelection | null> {
    return this.prisma.user.findFirst({
      where: { username },
      select: { id: true },
    });
  }

  public async findCurrentContactRequest(
    userOneId: string,
    userTwoId: string,
  ): Promise<AddContactSelection | null> {
    const contact = await this.prisma.contact.findFirst({
      where: {
        OR: [
          { userOneId, userTwoId },
          { userOneId: userTwoId, userTwoId: userOneId },
        ],
      },
      select: { userOneId: true, userTwoId: true, isAccepted: true },
    });

    return contact;
  }

  public async acceptContact(
    userOneId: string,
    userTwoId: string,
  ): Promise<AddContactSelection | null> {
    return this.prisma.contact.update({
      where: { userOneId_userTwoId: { userOneId, userTwoId } },
      data: { isAccepted: true },
    });
  }

  public async addContact(
    userOneId: string,
    userTwoId: string,
  ): Promise<AddContactSelection | null> {
    return this.prisma.contact.create({
      data: {
        userOneId,
        userTwoId,
      },
      select: { userOneId: true, userTwoId: true, isAccepted: true },
    });
  }
}
