import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Post,
  Query,
  Response,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BaseController } from '../shared/base.controller';
import { AuthService } from './auth.service';
import type { FastifyReply } from 'fastify';
import { CLIENT_AUTHORIZED_URL } from 'src/configs/app.config';
import {
  GoogleAuthCallbackParamDto,
  GoogleAuthResBody,
  GoogleVerificationBodyDto,
} from './auth.dto';
import {
  ApiGoogleLogin,
  ApiGoogleLoginCallback,
  ApiGoogleVerify,
} from 'src/decorators/auth.api.decorator';

@Controller('auth')
@ApiTags('Auth')
export class AuthController extends BaseController {
  public constructor(private readonly service: AuthService) {
    super();
  }

  @Get('/google')
  @HttpCode(HttpStatus.FOUND)
  @ApiGoogleLogin()
  public async googleLogin(@Response() reply: FastifyReply) {
    const url = this.service.getAuthorizationUrl();
    this.logger.http(`redirect to ${url}`);
    return reply.redirect(url);
  }

  @Get('/google/callback')
  @HttpCode(HttpStatus.FOUND)
  @ApiGoogleLoginCallback()
  public async googleAuthCallback(
    @Query() query: GoogleAuthCallbackParamDto,
    @Response() reply: FastifyReply,
  ) {
    const { code, error } = query;

    if (error) {
      return reply.redirect(this.getRedirectUrl('error', error));
    }

    if (!code) {
      return reply.redirect(this.getRedirectUrl('error', 'missing_code'));
    }

    try {
      const token = await this.service.handleGoogleAuthCallback(code);
      return reply.redirect(this.getRedirectUrl('token', token));
    } catch (e) {
      this.logger.error(e);

      let errorCode = 'server_error';

      if (e instanceof UnauthorizedException) {
        errorCode = 'unauthorized';
      } else if (e instanceof UnprocessableEntityException) {
        errorCode = 'invalid_google_data';
      } else if (e instanceof InternalServerErrorException) {
        errorCode = 'internal_error';
      }

      return reply.redirect(this.getRedirectUrl('error', errorCode));
    }
  }

  @Post('/google/verify')
  @HttpCode(HttpStatus.OK)
  @ApiGoogleVerify()
  public async verifyGoogleId(
    @Body() body: GoogleVerificationBodyDto,
  ): Promise<GoogleAuthResBody> {
    const { idToken } = body;
    const token = await this.service.handleVerifyGoogleId(idToken);
    return { token };
  }

  private getRedirectUrl(field: 'token' | 'error', value: string): string {
    const url = `${CLIENT_AUTHORIZED_URL}?${field}=${encodeURIComponent(value)}`;
    this.logger.http(`redirect to ${url}`);
    return url;
  }
}
