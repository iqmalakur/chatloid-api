import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../shared/base.repository';
import {
  ContactRequestSelection,
  UpdateContactRequestSelection,
} from './contact-requests.type';

@Injectable()
export class ContactRequestsRepository extends BaseRepository {
  public findContactRequests(
    userId: string,
  ): Promise<ContactRequestSelection[]> {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    return this.prisma.contact.findMany({
      where: {
        userTwoId: userId,
        createdAt: {
          gte: threeDaysAgo,
        },
      },
      select: {
        userOne: {
          select: { id: true, name: true, username: true },
        },
        isAccepted: true,
        createdAt: true,
      },
    });
  }

  public async isContactRequestExists(
    userOneId: string,
    userTwoId: string,
  ): Promise<boolean> {
    const result = await this.prisma.contact.count({
      where: { userOneId, userTwoId, isAccepted: false },
    });
    return result > 0;
  }

  public updateOrDeleteContactRequests(
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
