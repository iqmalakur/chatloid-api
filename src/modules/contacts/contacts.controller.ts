import { Controller } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { BaseController } from '../shared/base.controller';
import { ContactsService } from './contacts.service';

@Controller('contacts')
@ApiTags('Contacts')
@ApiSecurity('jwt')
export class ContactsController extends BaseController {
  public constructor(private readonly service: ContactsService) {
    super();
  }
}
