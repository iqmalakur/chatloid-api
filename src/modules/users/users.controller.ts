import { Controller, Get } from '@nestjs/common';
import { BaseController } from '../shared/base.controller';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CurrentUserId } from 'src/decorators/current-user-id.decorator';
import { UserInfoResDto } from './users.dto';
import { ApiUserInfo } from 'src/decorators/users.api.decorator';

@Controller('users')
@ApiTags('Users')
@ApiSecurity('jwt')
export class UsersController extends BaseController {
  public constructor(private readonly service: UsersService) {
    super();
  }

  @Get('me')
  @ApiUserInfo()
  public async UserInfo(
    @CurrentUserId() userId: string,
  ): Promise<UserInfoResDto> {
    return this.service.handleUserInfo(userId);
  }
}
