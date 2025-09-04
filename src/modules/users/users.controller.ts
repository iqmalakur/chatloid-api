import { Controller, Get } from '@nestjs/common';
import { BaseController } from '../shared/base.controller';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CurrentUserId } from 'src/decorators/current-user-id.decorator';
import { UserInfoResDto } from './users.dto';

@Controller('users')
@ApiTags('Users')
export class UsersController extends BaseController {
  public constructor(private readonly service: UsersService) {
    super();
  }

  @Get('me')
  public async UserInfo(
    @CurrentUserId() userId: string,
  ): Promise<UserInfoResDto> {
    return this.service.handleUserInfo(userId);
  }
}
