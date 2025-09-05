import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  ApiBadRequest,
  ApiNotFound,
  ApiServerError,
  ApiUnauthorized,
} from './response.api.decorator';
import {
  ContactRequestsResDto,
  UpdateContactRequestsResDto,
} from 'src/modules/contact-requests/contact-requests.dto';

export const ApiGetContactRequests = (): MethodDecorator => {
  return applyDecorators(
    ApiOperation({
      summary: 'Get user contact requests',
      description: 'Get a list of user contact requests',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Success get user contact requests',
      type: ContactRequestsResDto,
      isArray: true,
    }),
    ApiBadRequest('Token is not provided', 'Token is not provided'),
    ApiUnauthorized('Token is not valid', 'Token is not valid'),
    ApiServerError(),
  );
};

export const ApiUpdateContactRequests = (): MethodDecorator => {
  return applyDecorators(
    ApiOperation({
      summary: 'Update user contact request',
      description: 'Update user contact request for specific user requester',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Success update contact request',
      type: UpdateContactRequestsResDto,
    }),
    ApiBadRequest('Token is not provided', 'Token is not provided'),
    ApiUnauthorized('Token is not valid', 'Token is not valid'),
    ApiNotFound('Contact request not found', 'Contact request not found'),
    ApiServerError(),
  );
};
