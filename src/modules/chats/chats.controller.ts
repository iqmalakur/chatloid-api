import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { BaseController } from '../shared/base.controller';
import { ChatsService } from './chats.service';
import { CurrentUserId } from 'src/decorators/current-user-id.decorator';
import { ChatRoomResDto, ChatRoomsQueryDto } from './chats.dto';

@Controller('chats')
@ApiTags('Chats')
@ApiSecurity('jwt')
export class ChatsController extends BaseController {
  public constructor(private readonly service: ChatsService) {
    super();
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  public async getChatRooms(
    @CurrentUserId() userId: string,
    @Query() query: ChatRoomsQueryDto,
  ): Promise<ChatRoomResDto[]> {
    const { search } = query;
    return this.service.handleGetChatRooms(userId, search);
  }
}
