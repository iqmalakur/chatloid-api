import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  ApiBadRequest,
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
