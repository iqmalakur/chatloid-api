import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  ApiBadRequest,
  ApiNotFound,
  ApiServerError,
  ApiUnauthorized,
} from './response.api.decorator';
import { ChatRoomResDto } from 'src/modules/chats/chats.dto';

export const ApiGetChatRooms = (): MethodDecorator => {
  return applyDecorators(
    ApiOperation({
      summary: 'Get user chat rooms',
      description: 'Get a list of user chat rooms',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Success get user chat rooms',
      type: ChatRoomResDto,
      isArray: true,
    }),
    ApiBadRequest('Token is not provided', 'Token is not provided'),
    ApiUnauthorized('Token is not valid', 'Token is not valid'),
    ApiServerError(),
  );
};

export const ApiPostChatRoom = (): MethodDecorator => {
  return applyDecorators(
    ApiOperation({
      summary: 'Create user chat room',
      description: 'Create new user chat room',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Success get existing chat room',
      type: ChatRoomResDto,
    }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Success create new chat room',
      type: ChatRoomResDto,
    }),
    ApiBadRequest('Token is not provided', 'Token is not provided'),
    ApiNotFound('Contact user not found', 'Contact user not found'),
    ApiUnauthorized('Token is not valid', 'Token is not valid'),
    ApiServerError(),
  );
};
