import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { BaseService } from '../shared/base.service';
import { AuthRepository } from './auth.repository';
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
} from 'src/configs/google.config';
import {
  BASE_URL,
  DEFAULT_PICTURE_URL,
  SECRET_KEY,
} from 'src/configs/app.config';
import { zeroPadding } from 'src/utils/common.util';
import { sign } from 'jsonwebtoken';
import { GoogleUser, UserSelection } from './auth.type';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class AuthService extends BaseService {
  private readonly oauth2Client = new OAuth2Client(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    `${BASE_URL}/auth/google/callback`,
  );

  private readonly authorizedScopes = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ];

  private readonly authorizationUrl = this.oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: this.authorizedScopes,
    include_granted_scopes: true,
  });

  public constructor(private readonly repository: AuthRepository) {
    super();
  }

  public getAuthorizationUrl(): string {
    return this.authorizationUrl;
  }

  public async handleGoogleAuthCallback(code: string): Promise<string> {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);

    const accessToken = tokens.access_token;
    if (!accessToken) {
      throw new InternalServerErrorException();
    }

    const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      throw new InternalServerErrorException();
    }

    const data: GoogleUser = await res.json();
    const user = await this.findOrCreateGoogleUser(data);

    return this.generateJwt(user);
  }

  public async handleVerifyGoogleId(idToken: string): Promise<string> {
    const ticket = await this.oauth2Client.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new UnauthorizedException('Token tidak valid.');
    }

    const user = await this.findOrCreateGoogleUser({
      ...payload,
      id: payload.sub,
    });

    return this.generateJwt(user);
  }

  private async findOrCreateGoogleUser(
    data: GoogleUser,
  ): Promise<UserSelection> {
    if (!data.id || !data.email || !data.name) {
      throw new UnprocessableEntityException(
        'Akun Google tidak menyediakan semua data yang diperlukan.',
      );
    }

    let user = await this.repository.findUserByGoogleId(data.id);

    if (!user) {
      const newUser = await this.repository.saveUser({
        googleId: data.id,
        email: data.email,
        name: data.name,
        picture: data.picture ?? DEFAULT_PICTURE_URL,
        username: await this.getUsername(data.name),
      });

      if (!newUser) throw new InternalServerErrorException();
      return newUser;
    }

    return user;
  }

  private generateJwt(user: UserSelection): string {
    return sign({ sub: user.id }, SECRET_KEY, { expiresIn: '1w' });
  }

  private async getUsername(name: string): Promise<string> {
    const rawUsername = name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'user';
    let username = rawUsername;
    let counter = 1;

    while (await this.repository.isUsernameTaken(username)) {
      username = `${rawUsername}${zeroPadding(counter++)}`;
    }

    return username;
  }
}
