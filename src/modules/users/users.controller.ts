import { Body, Controller, Get, Patch } from '@nestjs/common';
import { BaseController } from '../shared/base.controller';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CurrentUserId } from 'src/decorators/current-user-id.decorator';
import { UserInfoResDto, UserUpdateReqDto } from './users.dto';
import { ApiUserInfo, ApiUserUpdate } from 'src/decorators/users.api.decorator';

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

  @Patch('me')
  @ApiUserUpdate()
  public async UserUpdate(
    @CurrentUserId() userId: string,
    @Body() body: UserUpdateReqDto,
  ): Promise<UserInfoResDto> {
    return this.service.handleUserUpdate(userId, body);
  }
}
