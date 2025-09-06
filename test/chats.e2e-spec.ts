import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaClient } from 'generated/prisma/client';
import { makeJwt } from './helper/makeJwt';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

describe('ChatsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaClient;

  let ucup: any;
  let otong: any;
  let chatRoom: any;

  beforeAll(async () => {
    prisma = new PrismaClient();
    await prisma.$connect();

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
  });

  beforeAll(async () => {
    ucup = await prisma.user.create({
      data: {
        username: 'ucup',
        email: 'ucup@example.com',
        name: 'Ucup',
        googleId: 'google-ucup',
        picture: 'http://example.com/ucup.png',
      },
    });

    otong = await prisma.user.create({
      data: {
        username: 'otong',
        email: 'otong@example.com',
        name: 'Otong',
        googleId: 'google-otong',
        picture: 'http://example.com/otong.png',
      },
    });

    chatRoom = await prisma.chatRoom.create({
      data: {
        user1Id: ucup.id,
        user2Id: otong.id,
      },
    });

    await prisma.message.create({
      data: {
        chatRoomId: chatRoom.id,
        senderId: ucup.id,
        content: 'Hello Otong!',
      },
    });
  });

  afterAll(async () => {
    await prisma.message.deleteMany({ where: { chatRoomId: chatRoom.id } });
    await prisma.chatRoom.deleteMany({ where: { id: chatRoom.id } });
    await prisma.user.deleteMany({
      where: { id: { in: [ucup.id, otong.id] } },
    });

    await app.close();
    await prisma.$disconnect();
  });

  it('/chats (GET) - should return chat rooms for ucup', async () => {
    const res = await request(app.getHttpServer())
      .get('/chats')
      .set('Authorization', `Bearer ${makeJwt(ucup.id)}`)
      .expect(200);

    expect(res.body).toHaveLength(1);

    const room = res.body[0];

    expect(room.id).toBe(chatRoom.id);
    expect(room.picture).toBe(otong.picture);
    expect(room.displayName).toBe(otong.name);
    expect(room.lastMessage.content).toBe('Hello Otong!');
    expect(new Date(room.lastMessage.createdAt)).toBeInstanceOf(Date);
  });

  it('/chats (GET) - should return empty if not match keyword', async () => {
    const res = await request(app.getHttpServer())
      .get('/chats')
      .set('Authorization', `Bearer ${makeJwt(ucup.id)}`)
      .query({ search: 'Charlie' })
      .expect(200);

    expect(res.body).toEqual([]);
  });
});
