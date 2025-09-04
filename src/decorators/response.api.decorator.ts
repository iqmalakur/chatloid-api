import { applyDecorators, HttpStatus, Type } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import {
  ClientErrorDto,
  ErrorDto,
  ServerErrorDto,
} from 'src/modules/shared/response.dto';

const createApiResponseDecorator = (
  status: number,
  error: string,
  description: string,
  message: string | string[],
  errorDto: Type = ErrorDto,
): MethodDecorator => {
  const example = {
    message,
    error,
    statusCode: status,
  };

  return applyDecorators(
    ApiResponse({
      status,
      description,
      type: errorDto,
      example,
    }),
  );
};

export const ApiBadRequest = (
  message: string,
  description: string = 'Bad request',
): MethodDecorator =>
  createApiResponseDecorator(
    HttpStatus.BAD_REQUEST,
    'Bad Request',
    description,
    [message],
    ClientErrorDto,
  );

export const ApiUnauthorized = (
  message: string,
  description: string = 'Unauthorized',
): MethodDecorator =>
  createApiResponseDecorator(
    HttpStatus.UNAUTHORIZED,
    'Unauthorized',
    description,
    message,
  );

export const ApiNotFound = (
  message: string,
  description: string = 'Not found',
): MethodDecorator =>
  createApiResponseDecorator(
    HttpStatus.NOT_FOUND,
    'Not Found',
    description,
    message,
  );

export const ApiConflict = (
  message: string,
  description: string = 'Conflict',
): MethodDecorator =>
  createApiResponseDecorator(
    HttpStatus.CONFLICT,
    'Conflict',
    description,
    message,
  );

export const ApiUnprocessableEntity = (
  message: string,
  description: string = 'UnprocessableEntity',
): MethodDecorator =>
  createApiResponseDecorator(
    HttpStatus.UNPROCESSABLE_ENTITY,
    'UnprocessableEntity',
    description,
    message,
  );

export const ApiServerError = (): MethodDecorator =>
  ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'An unexpected error occurred',
    type: ServerErrorDto,
  });
