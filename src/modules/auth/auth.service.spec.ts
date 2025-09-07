import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import {
  UnauthorizedException,
  UnprocessableEntityException,
  InternalServerErrorException,
} from '@nestjs/common';
import { sign } from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

jest.mock('src/configs/google.config', () => ({
  GOOGLE_CLIENT_ID: 'mock-client-id',
  GOOGLE_CLIENT_SECRET: 'mock-client-secret',
}));

jest.mock('src/configs/app.config', () => ({
  BASE_URL: 'http://localhost:3000',
  DEFAULT_PICTURE_URL: 'http://default.com/pic.png',
  SECRET_KEY: 'mock-secret',
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock-jwt'),
}));

jest.mock('google-auth-library');

describe('AuthService unit test', () => {
  const mockGetToken = jest.fn();
  const mockSetCredentials = jest.fn();
  const mockVerifyIdToken = jest.fn();

  let service: AuthService;
  let repository: jest.Mocked<AuthRepository>;

  beforeEach(() => {
    jest.clearAllMocks();

    (OAuth2Client as any) = jest.fn().mockImplementation(() => ({
      getToken: mockGetToken,
      setCredentials: mockSetCredentials,
      verifyIdToken: mockVerifyIdToken,
      generateAuthUrl: jest
        .fn()
        .mockReturnValue('https://google.com/auth/example'),
    }));

    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({ id: '123', email: 'a@mail.com', name: 'Alice' }),
      } as Response),
    );

    repository = {
      findUserByGoogleId: jest.fn(),
      saveUser: jest.fn(),
      isUsernameTaken: jest.fn(),
    } as any;

    service = new AuthService(repository);
  });

  describe('getAuthorizationUrl', () => {
    it('should return an URL', () => {
      const url = service.getAuthorizationUrl();
      expect(url).toBe('https://google.com/auth/example');
    });
  });

  describe('handleGoogleAuthCallback', () => {
    it('should return jwt token for valid code', async () => {
      mockGetToken.mockResolvedValue({ tokens: { access_token: 'token' } });

      repository.findUserByGoogleId.mockResolvedValue({
        id: '1',
      });

      const jwt = await service.handleGoogleAuthCallback('code');

      expect(jwt).toBe('mock-jwt');
      expect(sign).toHaveBeenCalledWith({ sub: '1' }, 'mock-secret', {
        expiresIn: '1w',
      });
    });
  });

  describe('handleVerifyGoogleId', () => {
    it('should throw UnauthorizedException if payload missing', async () => {
      mockVerifyIdToken.mockResolvedValue({ getPayload: () => null });
      await expect(service.handleVerifyGoogleId('token')).rejects.toThrow(
        new UnauthorizedException('Token tidak valid.'),
      );
    });

    it('should return jwt if payload valid', async () => {
      mockVerifyIdToken.mockResolvedValue({
        getPayload: () => ({ sub: '123', email: 'a@b.com', name: 'abc' }),
      });

      repository.findUserByGoogleId.mockResolvedValue({
        id: '1',
      });

      const jwt = await service.handleVerifyGoogleId('token');

      expect(jwt).toBe('mock-jwt');
      expect(sign).toHaveBeenCalledWith({ sub: '1' }, 'mock-secret', {
        expiresIn: '1w',
      });
    });
  });

  describe('findOrCreateGoogleUser', () => {
    it('should throw UnprocessableEntityException if data missing', async () => {
      await expect(
        (service as any).findOrCreateGoogleUser({ email: 'x', name: 'y' }),
      ).rejects.toThrow(
        new UnprocessableEntityException(
          'Akun Google tidak menyediakan semua data yang diperlukan.',
        ),
      );

      await expect(
        (service as any).findOrCreateGoogleUser({ id: 'x', name: 'y' }),
      ).rejects.toThrow(
        new UnprocessableEntityException(
          'Akun Google tidak menyediakan semua data yang diperlukan.',
        ),
      );

      await expect(
        (service as any).findOrCreateGoogleUser({ email: 'x', id: 'y' }),
      ).rejects.toThrow(
        new UnprocessableEntityException(
          'Akun Google tidak menyediakan semua data yang diperlukan.',
        ),
      );
    });

    it('should return existing user', async () => {
      repository.findUserByGoogleId.mockResolvedValue({
        id: '1',
      });

      const user = await (service as any).findOrCreateGoogleUser({
        id: '123',
        email: 'a@b.com',
        name: 'abc',
      });

      expect(repository.findUserByGoogleId).toHaveBeenCalled();
      expect(user.id).toBe('1');
    });

    it('should create new user if not found', async () => {
      repository.findUserByGoogleId.mockResolvedValue(null);
      repository.isUsernameTaken.mockResolvedValue(false);
      repository.saveUser.mockResolvedValue({
        id: '1',
      });

      const user = await (service as any).findOrCreateGoogleUser({
        id: '123',
        email: 'a@b.com',
        name: 'abc',
      });

      expect(repository.saveUser).toHaveBeenCalled();
      expect(user.id).toBe('1');
    });

    it('should throw InternalServerErrorException if saveUser fails', async () => {
      repository.findUserByGoogleId.mockResolvedValue(null);
      repository.isUsernameTaken.mockResolvedValue(false);
      repository.saveUser.mockResolvedValue(null);

      await expect(
        (service as any).findOrCreateGoogleUser({
          id: '123',
          email: 'a@b.com',
          name: 'abc',
        }),
      ).rejects.toThrow(new InternalServerErrorException());
    });
  });

  describe('getUsername', () => {
    it('should return correct username format', async () => {
      repository.isUsernameTaken.mockResolvedValue(false);

      const username = await (service as any).getUsername('Test User');
      expect(username).toBe('testuser');
    });

    it('should append number if username taken', async () => {
      repository.isUsernameTaken
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);

      const username = await (service as any).getUsername('Test User');
      expect(username).toBe('testuser01');
    });

    it('should fallback to "user" if invalid name', async () => {
      repository.isUsernameTaken.mockResolvedValue(false);

      const username = await (service as any).getUsername('!!!');
      expect(username).toBe('user');
    });

    it('should fallback to "user" if invalid name and append number if username taken', async () => {
      repository.isUsernameTaken
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);

      const username = await (service as any).getUsername('!!!');
      expect(username).toBe('user01');
    });
  });
});
