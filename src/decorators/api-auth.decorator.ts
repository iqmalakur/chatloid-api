import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  ApiServerError,
  ApiUnauthorized,
  ApiUnprocessableEntity,
} from './api-response.decorator';
import { GoogleVerificationBodyDto } from 'src/modules/auth/auth.dto';

export const ApiGoogleLogin = (): MethodDecorator => {
  return applyDecorators(
    ApiOperation({
      summary: 'Perform google login',
      description: 'Perform user login with google',
    }),
    ApiResponse({
      status: 302,
      description: 'Redirect to google login page',
    }),
    ApiServerError(),
  );
};

export const ApiGoogleLoginCallback = (): MethodDecorator => {
  return applyDecorators(
    ApiOperation({
      summary: 'Verify user login from google [ACCESSED BY GOOGLE ONLY]',
      description:
        'Verify result of google user login [ACCESSED BY GOOGLE ONLY]',
    }),
    ApiResponse({
      status: 302,
      description: `
        Redirect back to web client<br><br>
        Errors :<br>
        \`access_denied\`=user is not agree to google login<br>
        \`missing_code\`=code is not provided<br>
        \`unauthorized\`=code is not valid<br>
        \`invalid_google_data\`=required data is incomplete<br>
        \`internal_error\` or \`server_error\`=unexpected error
      `,
    }),
    ApiServerError(),
  );
};

export const ApiGoogleVerify = (): MethodDecorator => {
  return applyDecorators(
    ApiOperation({
      summary: 'Verify google id token',
      description:
        'Verify mobile client google id token to get application JWT',
    }),
    ApiResponse({
      status: 200,
      description: 'Id token is valid',
      type: GoogleVerificationBodyDto,
    }),
    ApiUnauthorized(
      'Token is not valid',
      'Provided google id token is not valid',
    ),
    ApiUnprocessableEntity(
      'Required data is incomplete',
      'The id token is valid, but the required data is incomplete (google id, name, and email)',
    ),
    ApiServerError(),
  );
};
