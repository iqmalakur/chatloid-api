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
  GoogleAuthCallbackQueryDto,
  GoogleAuthQueryDto,
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
  public googleLogin(
    @Query() query: GoogleAuthQueryDto,
    @Response() reply: FastifyReply,
  ) {
    const { redirect_to } = query;
    const url = this.service.getAuthorizationUrl(redirect_to);
    return reply.redirect(url);
  }

  @Get('/google/callback')
  @HttpCode(HttpStatus.FOUND)
  @ApiGoogleLoginCallback()
  public async googleAuthCallback(
    @Query() query: GoogleAuthCallbackQueryDto,
    @Response() reply: FastifyReply,
  ) {
    const { code, error, state } = query;

    if (error) {
      return reply.redirect(this.getErrorRedirectUrl(error));
    }

    if (!code) {
      return reply.redirect(this.getErrorRedirectUrl('missing_code'));
    }

    try {
      const url = await this.service.handleGoogleAuthCallback(code, state);
      return reply.redirect(url);
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

      return reply.redirect(this.getErrorRedirectUrl(errorCode));
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

  private getErrorRedirectUrl(value: string): string {
    const url = `${CLIENT_AUTHORIZED_URL}?error=${encodeURIComponent(value)}`;
    this.logger.http(`redirect to ${url}`);
    return url;
  }
}
