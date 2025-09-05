import { Controller } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { BaseController } from '../shared/base.controller';
import { ChatsService } from './chats.service';

@Controller('chats')
@ApiTags('Chats')
@ApiSecurity('jwt')
export class ChatsController extends BaseController {
  public constructor(private readonly service: ChatsService) {
    super();
  }
}
