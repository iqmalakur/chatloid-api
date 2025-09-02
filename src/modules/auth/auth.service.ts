import { Injectable } from '@nestjs/common';
import { BaseService } from '../shared/base.service';
import { AuthRepository } from './auth.repository';
import { google } from 'googleapis';
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
} from 'src/configs/google.config';
import { BASE_URL } from 'src/configs/app.config';

@Injectable()
export class AuthService extends BaseService {
  private readonly oauth2Client = new google.auth.OAuth2(
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

  public constructor(private readonly authRepository: AuthRepository) {
    super();
  }

  public getAuthorizationUrl(): string {
    return this.authorizationUrl;
  }
}
