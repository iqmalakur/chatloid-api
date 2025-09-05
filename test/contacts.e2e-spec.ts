import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from 'src/app.module';
import { PrismaClient } from 'generated/prisma/client';
import { makeJwt } from './helper/makeJwt';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

describe('ContactsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaClient;

  let userOne: any;
  let userTwo: any;

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

    userOne = await prisma.user.create({
      data: {
        username: 'userone',
        googleId: 'gid_userone',
        email: 'userone@example.com',
        name: 'User One',
        picture: 'https://example.com/u1.png',
      },
    });

    userTwo = await prisma.user.create({
      data: {
        username: 'usertwo',
        googleId: 'gid_usertwo',
        email: 'usertwo@example.com',
        name: 'User Two',
        picture: 'https://example.com/u2.png',
      },
    });
  });

  afterAll(async () => {
    await prisma.contact.deleteMany({
      where: {
        OR: [
          { userOneId: userOne.id, userTwoId: userTwo.id },
          { userOneId: userTwo.id, userTwoId: userOne.id },
        ],
      },
    });
    await prisma.user.deleteMany({
      where: { id: { in: [userOne.id, userTwo.id] } },
    });

    await app.close();
    await prisma.$disconnect();
  });

  describe('GET /contacts', () => {
    let user: any;

    beforeAll(async () => {
      user = await prisma.user.create({
        data: {
          username: 'user',
          googleId: 'gid_user',
          email: 'user@example.com',
          name: 'User',
          picture: 'https://example.com/u.png',
        },
      });

      await prisma.contact.createMany({
        data: [
          {
            userOneId: user.id,
            userTwoId: userOne.id,
            isAccepted: true,
          },
          {
            userOneId: userTwo.id,
            userTwoId: user.id,
            isAccepted: true,
          },
        ],
      });
    });

    afterAll(async () => {
      await prisma.contact.deleteMany({
        where: {
          OR: [{ userOneId: user.id }, { userTwoId: user.id }],
        },
      });
      await prisma.user.delete({ where: { id: user.id } });
    });

    it('should return all contacts', async () => {
      const response = await request(app.getHttpServer())
        .get('/contacts')
        .set('Authorization', `Bearer ${makeJwt(user.id)}`)
        .expect(200);

      expect(response.body.total).toBe(2);
      expect(response.body.contacts).toBeInstanceOf(Array);
      expect(response.body.contacts[0].name).toBe('User One');
      expect(response.body.contacts[1].name).toBe('User Two');
    });

    it('should return filtered contacts', async () => {
      const response = await request(app.getHttpServer())
        .get('/contacts')
        .query({ search: 'Two' })
        .set('Authorization', `Bearer ${makeJwt(user.id)}`)
        .expect(200);

      expect(response.body.total).toBe(1);
      expect(response.body.contacts[0].name).toBe('User Two');
    });
  });

  describe('POST /contacts', () => {
    it('should create a contact request if not exists', async () => {
      await prisma.contact.deleteMany({
        where: {
          AND: [{ userOneId: userOne.id, userTwoId: userTwo.id }],
        },
      });

      return request(app.getHttpServer())
        .post('/contacts')
        .set('Authorization', `Bearer ${makeJwt(userOne.id)}`)
        .send({ username: userTwo.username })
        .expect(HttpStatus.CREATED)
        .expect((res) => {
          expect(res.body).toEqual({
            id: userOne.id,
            username: userTwo.username,
            accepted: false,
          });
        });
    });

    it('should accept a contact request if userTwo accepts', async () => {
      await prisma.contact.deleteMany({
        where: {
          AND: [{ userOneId: userOne.id, userTwoId: userTwo.id }],
        },
      });

      await prisma.contact.create({
        data: {
          userOneId: userOne.id,
          userTwoId: userTwo.id,
          isAccepted: false,
        },
      });

      return request(app.getHttpServer())
        .post('/contacts')
        .set('Authorization', `Bearer ${makeJwt(userTwo.id)}`)
        .send({ username: userOne.username })
        .expect(HttpStatus.CREATED)
        .expect((res) => {
          expect(res.body).toEqual({
            id: userTwo.id,
            username: userOne.username,
            accepted: true,
          });
        });
    });

    it('should return 404 if target user not found', async () => {
      return request(app.getHttpServer())
        .post('/contacts')
        .set('Authorization', `Bearer ${makeJwt(userOne.id)}`)
        .send({ username: 'notfounduser' })
        .expect(HttpStatus.NOT_FOUND)
        .expect((res) => {
          expect(res.body.message).toBe('User not found');
        });
    });

    it('should return 400 if trying to add yourself', async () => {
      return request(app.getHttpServer())
        .post('/contacts')
        .set('Authorization', `Bearer ${makeJwt(userOne.id)}`)
        .send({ username: userOne.username })
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) => {
          expect(res.body.message).toContain(
            'Cannot add yourself as a contact',
          );
        });
    });

    it('should return 409 if already sent and still pending', async () => {
      await prisma.contact.deleteMany({
        where: {
          AND: [{ userOneId: userOne.id, userTwoId: userTwo.id }],
        },
      });

      await prisma.contact.create({
        data: {
          userOneId: userOne.id,
          userTwoId: userTwo.id,
          isAccepted: false,
        },
      });

      return request(app.getHttpServer())
        .post('/contacts')
        .set('Authorization', `Bearer ${makeJwt(userOne.id)}`)
        .send({ username: userTwo.username })
        .expect(HttpStatus.CONFLICT)
        .expect((res) => {
          expect(res.body.message).toBe('Contact request already sent');
        });
    });

    it('should return 409 if already added', async () => {
      await prisma.contact.deleteMany({
        where: {
          AND: [{ userOneId: userOne.id, userTwoId: userTwo.id }],
        },
      });

      await prisma.contact.create({
        data: {
          userOneId: userOne.id,
          userTwoId: userTwo.id,
          isAccepted: true,
        },
      });

      return request(app.getHttpServer())
        .post('/contacts')
        .set('Authorization', `Bearer ${makeJwt(userOne.id)}`)
        .send({ username: userTwo.username })
        .expect(HttpStatus.CONFLICT)
        .expect((res) => {
          expect(res.body.message).toBe('Contact already added');
        });
    });
  });
});
