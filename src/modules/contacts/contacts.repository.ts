import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../shared/base.repository';
import { ContactSelection } from './contacts.type';

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
}
