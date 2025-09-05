import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from 'src/app.module';
import { PrismaClient } from 'generated/prisma/client';
import * as jwt from 'jsonwebtoken';
import { SECRET_KEY } from 'src/configs/app.config';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { makeJwt } from './helper/makeJwt';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let accessToken: string;
  let existingUserId: string;

  const userIds: string[] = [];

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    prisma = new PrismaClient();

    const user = await prisma.user.create({
      data: {
        email: 'johndoe@gmail.com',
        username: 'johndoe',
        googleId: 'google-123',
        name: 'John Doe',
        picture:
          'https://lh3.googleusercontent.com/a-/AOh14GhRkq9dXyZb12345=s96-c',
      },
    });

    existingUserId = user.id;
    userIds.push(user.id);

    accessToken = makeJwt(existingUserId);
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        OR: userIds.map((userId) => ({ id: userId })),
      },
    });
    await prisma.$disconnect();
    await app.close();
  });

  describe('GET /users/me', () => {
    it('should return 200 with user info', async () => {
      const res = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body).toEqual({
        email: 'johndoe@gmail.com',
        username: 'johndoe',
        name: 'John Doe',
        picture:
          'https://lh3.googleusercontent.com/a-/AOh14GhRkq9dXyZb12345=s96-c',
      });
    });

    it('should return 404 if user not found', async () => {
      const fakeToken = makeJwt('550e8400-e29b-41d4-a716-446655440000');

      await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${fakeToken}`)
        .expect(404);
    });
  });

  describe('PATCH /users/me', () => {
    it('should update and return 200', async () => {
      const res = await request(app.getHttpServer())
        .patch('/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'John Updated' })
        .expect(200);

      expect(res.body).toEqual({
        email: 'johndoe@gmail.com',
        username: 'johndoe',
        name: 'John Updated',
        picture:
          'https://lh3.googleusercontent.com/a-/AOh14GhRkq9dXyZb12345=s96-c',
      });

      await prisma.user.update({
        where: { id: existingUserId },
        data: { name: 'John Doe' },
      });
    });

    it('should return 404 if user not found', async () => {
      const fakeToken = makeJwt('550e8400-e29b-41d4-a716-446655440000');

      await request(app.getHttpServer())
        .patch('/users/me')
        .set('Authorization', `Bearer ${fakeToken}`)
        .send({ name: 'Nobody' })
        .expect(404);
    });

    it('should return 409 if username already exists', async () => {
      const jane = await prisma.user.create({
        data: {
          email: 'janedoe@gmail.com',
          username: 'janedoe',
          googleId: 'google-456',
          name: 'Jane Doe',
          picture:
            'https://lh3.googleusercontent.com/a-/AOh14GhRkq9dXyZb54321=s96-c',
        },
      });

      userIds.push(jane.id);

      await request(app.getHttpServer())
        .patch('/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ username: 'janedoe' })
        .expect(409);
    });
  });
});
