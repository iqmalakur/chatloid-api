import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  ApiBadRequest,
  ApiConflict,
  ApiNotFound,
  ApiServerError,
  ApiUnauthorized,
} from './response.api.decorator';
import {
  AddContactsResDto,
  ContactsResDto,
} from 'src/modules/contacts/contacts.dto';

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

export const ApiAddContacts = (): MethodDecorator => {
  return applyDecorators(
    ApiOperation({
      summary: 'Add user contact',
      description: 'Add new contact for user by username',
    }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Success sent contact request',
      type: AddContactsResDto,
    }),
    ApiBadRequest('Cannot add yourself as a contact', 'Self add contact'),
    ApiUnauthorized('Token is not valid', 'Token is not valid'),
    ApiNotFound('User not found', 'Target user not found'),
    ApiConflict(
      'Contact request already sent',
      'Contact request already sent or contact already added',
    ),
    ApiServerError(),
  );
};
