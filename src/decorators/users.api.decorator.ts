import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserInfoResDto } from 'src/modules/users/users.dto';
import {
  ApiBadRequest,
  ApiConflict,
  ApiNotFound,
  ApiServerError,
  ApiUnauthorized,
} from './response.api.decorator';

export const ApiUserInfo = (): MethodDecorator => {
  return applyDecorators(
    ApiOperation({
      summary: 'Get authenticated user info',
      description: 'Get authenticated user info from JWT',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Success get user info',
      type: UserInfoResDto,
    }),
    ApiBadRequest('Token is not provided', 'Token is not provided'),
    ApiUnauthorized('Token is not valid', 'Token is not valid'),
    ApiNotFound('User is not found', 'User is not found'),
    ApiServerError(),
  );
};

export const ApiUserUpdate = (): MethodDecorator => {
  return applyDecorators(
    ApiOperation({
      summary: 'Update user info',
      description: 'Update authenticated user info',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Success update user info',
      type: UserInfoResDto,
    }),
    ApiBadRequest('Token is not provided', 'Token is not provided'),
    ApiUnauthorized('Token is not valid', 'Token is not valid'),
    ApiNotFound('User is not found', 'User is not found'),
    ApiConflict('Username is not available', 'Username is not available'),
    ApiServerError(),
  );
};
