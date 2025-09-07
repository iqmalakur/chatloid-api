import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Response,
} from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { BaseController } from '../shared/base.controller';
import { ChatsService } from './chats.service';
import { CurrentUserId } from 'src/decorators/current-user-id.decorator';
import {
  ChatRoomResDto,
  ChatRoomsQueryDto,
  CreateChatRoomReqDto,
} from './chats.dto';
import {
  ApiGetChatRooms,
  ApiPostChatRoom,
} from 'src/decorators/chats.api.decorator';
import type { FastifyReply } from 'fastify';

@Controller('chats')
@ApiTags('Chats')
@ApiSecurity('jwt')
export class ChatsController extends BaseController {
  public constructor(private readonly service: ChatsService) {
    super();
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiGetChatRooms()
  public async getChatRooms(
    @CurrentUserId() userId: string,
    @Query() query: ChatRoomsQueryDto,
  ): Promise<ChatRoomResDto[]> {
    const { search } = query;
    return this.service.handleGetChatRooms(userId, search);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiPostChatRoom()
  public async createChatRoom(
    @CurrentUserId() userId: string,
    @Body() body: CreateChatRoomReqDto,
    @Response() reply: FastifyReply,
  ): Promise<ChatRoomResDto> {
    const { contactId } = body;

    const existingChatRoom = await this.service.handleCheckExistingChatRoom(
      userId,
      contactId,
    );

    if (existingChatRoom) {
      return reply.status(HttpStatus.OK).send(existingChatRoom);
    }

    return reply
      .status(HttpStatus.CREATED)
      .send(await this.service.handleCreateChatRooms(userId, contactId));
  }
}
