import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  ApiBadRequest,
  ApiServerError,
  ApiUnauthorized,
} from './response.api.decorator';
import { ContactsResDto } from 'src/modules/contacts/contacts.dto';

export const ApiGetContacts = (): MethodDecorator => {
  return applyDecorators(
    ApiOperation({
      summary: 'Get user contacts',
      description: 'Get a list of user contacts from JWT',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Success get user contacts',
      type: ContactsResDto,
      isArray: true,
    }),
    ApiBadRequest('Token is not provided', 'Token is not provided'),
    ApiUnauthorized('Token is not valid', 'Token is not valid'),
    ApiServerError(),
  );
};
