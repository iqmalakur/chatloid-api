import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../shared/base.repository';
import { ContactRequestSelection } from './contact-requests.type';

@Injectable()
export class ContactRequestsRepository extends BaseRepository {
  public async findContactRequests(
    userId: string,
  ): Promise<ContactRequestSelection[]> {
    return this.prisma.contact.findMany({
      where: { userTwoId: userId, isAccepted: false },
      select: {
        userOne: {
          select: { id: true, name: true, username: true, createdAt: true },
        },
      },
    });
  }
}
