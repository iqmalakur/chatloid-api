import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../shared/base.repository';
import {
  ContactRequestSelection,
  UpdateContactRequestSelection,
} from './contact-requests.type';

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

  public async isContactRequestExists(
    userOneId: string,
    userTwoId: string,
  ): Promise<boolean> {
    const result = await this.prisma.contact.count({
      where: { userOneId, userTwoId },
    });
    return result > 0;
  }

  public async updateOrDeleteContactRequests(
    userOneId: string,
    userTwoId: string,
    isAccepted: boolean,
  ): Promise<UpdateContactRequestSelection | null> {
    if (isAccepted) {
      return this.prisma.contact.update({
        where: { userOneId_userTwoId: { userOneId, userTwoId } },
        data: { isAccepted: true },
        select: {
          userOne: { select: { id: true, username: true } },
          isAccepted: true,
        },
      });
    }

    return this.prisma.contact.delete({
      where: { userOneId_userTwoId: { userOneId, userTwoId } },
      select: {
        userOne: { select: { id: true, username: true } },
        isAccepted: true,
      },
    });
  }
}
