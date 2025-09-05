import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { BaseController } from '../shared/base.controller';
import { ContactsService } from './contacts.service';
import { CurrentUserId } from 'src/decorators/current-user-id.decorator';
import {
  AddContactsReqDto,
  AddContactsResDto,
  ContactsResDto,
  GetContactsParamDto,
} from './contacts.dto';
import { ApiGetContacts } from 'src/decorators/contacts.api.decorator';

@Controller('contacts')
@ApiTags('Contacts')
@ApiSecurity('jwt')
export class ContactsController extends BaseController {
  public constructor(private readonly service: ContactsService) {
    super();
  }

  @Get()
  @ApiGetContacts()
  public async GetContacts(
    @CurrentUserId() userId: string,
    @Query() query: GetContactsParamDto,
  ): Promise<ContactsResDto[]> {
    const { search } = query;
    return this.service.handleGetContacts(userId, search);
  }

  @Post()
  public async AddContacts(
    @CurrentUserId() userId: string,
    @Body() body: AddContactsReqDto,
  ): Promise<AddContactsResDto> {
    const { username } = body;
    return this.service.handleAddContacts(userId, username);
  }
}
