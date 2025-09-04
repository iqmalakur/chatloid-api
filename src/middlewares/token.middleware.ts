import {
  BadRequestException,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { verify } from 'jsonwebtoken';
import { SECRET_KEY } from 'src/configs/app.config';

@Injectable()
export class TokenMiddleware implements NestMiddleware {
  use(
    req: FastifyRequest['raw'],
    reply: FastifyReply,
    next: (error?: any) => void,
  ) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new BadRequestException(['Token harus diisi']);
    }

    const tokenFormat = /bearer .+/i;
    if (!tokenFormat.test(authHeader)) {
      throw new BadRequestException(['Format token tidak valid']);
    }

    const token = authHeader.split(' ')[1];
    const userId = this.validateToken(token);

    if (!userId) {
      throw new UnauthorizedException('Token tidak valid!');
    }

    (req as any).userId = userId;

    return next();
  }

  private validateToken(token: string): string | null {
    try {
      return verify(token, SECRET_KEY).sub as string;
    } catch (err) {
      return null;
    }
  }
}
