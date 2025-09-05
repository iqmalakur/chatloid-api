import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
} from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { BaseController } from '../shared/base.controller';
import { ContactRequestsService } from './contact-requests.service';
import { CurrentUserId } from 'src/decorators/current-user-id.decorator';
import {
  ContactRequestsBodyDto,
  ContactRequestsParamDto,
  ContactRequestsResDto,
  UpdateContactRequestsResDto,
} from './contact-requests.dto';

@Controller('contact-requests')
@ApiTags('Contact Requests')
@ApiSecurity('jwt')
export class ContactRequestsController extends BaseController {
  public constructor(private readonly service: ContactRequestsService) {
    super();
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  public async getContactRequests(
    @CurrentUserId() userId: string,
  ): Promise<ContactRequestsResDto[]> {
    return this.service.handleContactRequests(userId);
  }

  @Patch(':targetId')
  @HttpCode(HttpStatus.OK)
  public async updateContactRequests(
    @CurrentUserId() userId: string,
    @Param() param: ContactRequestsParamDto,
    @Body() body: ContactRequestsBodyDto,
  ): Promise<UpdateContactRequestsResDto> {
    const { targetId } = param;
    const { accepted } = body;
    return this.service.handleUpdateContactRequests(userId, targetId, accepted);
  }
}
