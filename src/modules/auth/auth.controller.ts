import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BaseController } from '../shared/base.controller';
import { AuthService } from './auth.service';
import type { FastifyReply } from 'fastify';

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
}
