import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { BaseService } from '../shared/base.service';
import { ContactRequestsRepository } from './contact-requests.repository';
import {
  ContactRequestsResDto,
  UpdateContactRequestsResDto,
} from './contact-requests.dto';

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

  public async handleUpdateContactRequests(
    userId: string,
    targetId: string,
    accepted: boolean,
  ): Promise<UpdateContactRequestsResDto> {
    const userOneId = targetId;
    const userTwoId = userId;

    if (!(await this.repository.isContactRequestExists(userOneId, userTwoId))) {
      throw new NotFoundException('Contact request not found');
    }

    const contactRequests = await this.repository.updateOrDeleteContactRequests(
      userOneId,
      userTwoId,
      accepted,
    );

    if (!contactRequests) {
      throw new InternalServerErrorException();
    }

    return {
      id: contactRequests.userOne.id,
      username: contactRequests.userOne.username,
      accepted: contactRequests.isAccepted,
    };
  }
}
