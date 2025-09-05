import { Controller } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { BaseController } from '../shared/base.controller';
import { ContactRequestsService } from './contact-requests.service';

@Controller('contact-requests')
@ApiTags('Contact Requests')
@ApiSecurity('jwt')
export class ContactRequestsController extends BaseController {
  public constructor(private readonly service: ContactRequestsService) {
    super();
  }
}
