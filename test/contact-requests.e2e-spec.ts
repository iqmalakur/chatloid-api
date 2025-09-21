import { INestApplication, HttpStatus, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from 'src/app.module';
import { PrismaClient } from 'generated/prisma/client';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { makeJwt } from './helper/makeJwt';

describe('ContactRequestsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let accessToken: string;
  let user: any;
  let target: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
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

    user = await prisma.user.create({
      data: {
        username: 'alice',
        email: 'alice@example.com',
        name: 'Alice Wonderland',
        googleId: 'google-id-alice',
        picture: 'http://example.com/alice.png',
      },
    });

    target = await prisma.user.create({
      data: {
        username: 'bob',
        email: 'bob@example.com',
        name: 'Bob Builder',
        googleId: 'google-id-bob',
        picture: 'http://example.com/bob.png',
      },
    });

    accessToken = makeJwt(user.id);
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { id: { in: [user.id, target.id] } },
    });

    await app.close();
  });

  afterEach(async () => {
    await prisma.contact.deleteMany({
      where: { userOneId: target.id, userTwoId: user.id },
    });
  });

  describe('GET /contact-requests', () => {
    it('should return list of contact requests', async () => {
      const contact = await prisma.contact.create({
        data: {
          userOneId: target.id,
          userTwoId: user.id,
          isAccepted: false,
        },
      });

      const res = await request(app.getHttpServer())
        .get('/contact-requests')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(HttpStatus.OK);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0].id).toBe(target.id);
      expect(res.body[0].username).toBe(target.username);
      expect(res.body[0].name).toBe(target.name);
      expect(new Date(res.body[0].createdAt).getTime()).toBe(
        contact.createdAt.getTime(),
      );
    });
  });

  describe('PATCH /contact-requests/:targetId', () => {
    it('should update contact request (accept)', async () => {
      await prisma.contact.create({
        data: {
          userOneId: target.id,
          userTwoId: user.id,
          isAccepted: false,
        },
      });

      const res = await request(app.getHttpServer())
        .patch(`/contact-requests/${target.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ accepted: true })
        .expect(HttpStatus.OK);

      expect(res.body.id).toBe(target.id);
      expect(res.body.username).toBe(target.username);
      expect(res.body.accepted).toBe(true);
    });

    it('should return 404 if contact request already accepted', async () => {
      await prisma.contact.create({
        data: {
          userOneId: target.id,
          userTwoId: user.id,
          isAccepted: true,
        },
      });

      await request(app.getHttpServer())
        .patch(`/contact-requests/${target.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ accepted: true })
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should return 404 if contact request not found', async () => {
      return request(app.getHttpServer())
        .patch(`/contact-requests/550e8400-e29b-41d4-a716-446655440000`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ accepted: true })
        .expect(HttpStatus.NOT_FOUND);
    });
  });
});
