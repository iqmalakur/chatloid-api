import { Controller } from '@nestjs/common';
import { BaseController } from '../shared/base.controller';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';

@Controller('users')
@ApiTags('Users')
export class UsersController extends BaseController {
  public constructor(private readonly service: UsersService) {
    super();
  }
}
