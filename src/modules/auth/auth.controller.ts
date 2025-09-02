import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Post,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BaseController } from '../shared/base.controller';
import { AuthService } from './auth.service';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { CLIENT_AUTHORIZED_URL } from 'src/configs/app.config';
import {
  GoogleAuthCallbackParamDto,
  GoogleAuthResBody,
  GoogleVerificationBodyDto,
} from './auth.dto';

@Controller('auth')
@ApiTags('Auth')
export class AuthController extends BaseController {
  public constructor(private readonly service: AuthService) {
    super();
  }

  @Get('/google')
  @HttpCode(HttpStatus.FOUND)
  public async googleLogin(reply: FastifyReply) {
    return reply.redirect(this.service.getAuthorizationUrl());
  }

  @Get('/google/callback')
  @HttpCode(HttpStatus.FOUND)
  public async googleAuthCallback(
    request: FastifyRequest<{ Querystring: GoogleAuthCallbackParamDto }>,
    reply: FastifyReply,
  ) {
    const { code, error } = request.query;

    if (error) {
      return reply.redirect(
        `${CLIENT_AUTHORIZED_URL}?error=${encodeURIComponent(error)}`,
      );
    }

    if (!code) {
      return reply.redirect(`${CLIENT_AUTHORIZED_URL}?error=missing_code`);
    }

    try {
      const token = await this.service.handleGoogleAuthCallback(code);
      return reply.redirect(`${CLIENT_AUTHORIZED_URL}?token=${token}`);
    } catch (e) {
      let errorCode = 'server_error';

      if (e instanceof UnauthorizedException) {
        errorCode = 'unauthorized';
      } else if (e instanceof UnprocessableEntityException) {
        errorCode = 'invalid_google_data';
      } else if (e instanceof InternalServerErrorException) {
        errorCode = 'internal_error';
      }

      return reply.redirect(
        `${CLIENT_AUTHORIZED_URL}?error=${encodeURIComponent(errorCode)}`,
      );
    }
  }

  @Post('/google/verify')
  @HttpCode(HttpStatus.OK)
  public async verifyGoogleId(
    request: FastifyRequest<{ Body: GoogleVerificationBodyDto }>,
  ): Promise<GoogleAuthResBody> {
    const { idToken } = request.body;
    const token = await this.service.handleVerifyGoogleId(idToken);
    return { token };
  }
}
