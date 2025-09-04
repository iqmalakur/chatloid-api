import { Controller, Get, Query } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { BaseController } from '../shared/base.controller';
import { ContactsService } from './contacts.service';
import { CurrentUserId } from 'src/decorators/current-user-id.decorator';
import { ContactsResDto, GetContactsParamDto } from './contacts.dto';
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
}
