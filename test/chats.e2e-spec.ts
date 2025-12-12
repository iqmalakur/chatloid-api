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
import { Collection, MongoClient, ObjectId } from 'mongodb';
import { MessageEntity } from 'src/modules/event/event.type';
import { MONGODB_URL } from 'src/configs/mongo.config';

describe('ChatsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let collection: Collection<MessageEntity>;

  let ucup: any;
  let otong: any;

  beforeAll(async () => {
    prisma = new PrismaClient();
    await prisma.$connect();

    const mongoClient = new MongoClient(MONGODB_URL ?? '');

    await mongoClient.connect();
    const database = mongoClient.db('chatloid_messages');
    collection = database.collection('messages');

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
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { id: { in: [ucup.id, otong.id] } },
    });

    await app.close();
    await prisma.$disconnect();
  });

  describe('/chats (GET)', () => {
    let chatRoom: any;

    beforeAll(async () => {
      chatRoom = await prisma.chatRoom.create({
        data: {
          user1Id: ucup.id,
          user2Id: otong.id,
        },
      });

      await collection.insertOne({
        _id: new ObjectId(),
        senderId: ucup.id,
        content: 'Hello Otong!',
        sentAt: new Date(),
        editedAt: null,
        deletedAt: null,
        chatRoom: {
          id: chatRoom.id,
          user1Id: chatRoom.user1Id,
          user2Id: chatRoom.user2Id,
        },
      });
    });

    afterAll(async () => {
      await collection.deleteMany({ chatRoom: { id: chatRoom.id } });
      await prisma.chatRoom.deleteMany({ where: { id: chatRoom.id } });
    });

    it('should return chat rooms for ucup', async () => {
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

    it('should return empty if not match keyword', async () => {
      const res = await request(app.getHttpServer())
        .get('/chats')
        .set('Authorization', `Bearer ${makeJwt(ucup.id)}`)
        .query({ search: 'Charlie' })
        .expect(200);

      expect(res.body).toEqual([]);
    });
  });

  describe('/chats (POST)', () => {
    it('should create a new chat room (201)', async () => {
      const res = await request(app.getHttpServer())
        .post('/chats')
        .set('Authorization', `Bearer ${makeJwt(ucup.id)}`)
        .send({ contactId: otong.id })
        .expect(201);

      await prisma.chatRoom.deleteMany({
        where: { id: res.body.id },
      });

      expect(res.body).toHaveProperty('id');
      expect(res.body.displayName).toBe(otong.name);
      expect(res.body.picture).toBe(otong.picture);
      expect(res.body.lastMessage).toBeNull();
    });

    it('should return existing chat room (200)', async () => {
      const chatRoom = await prisma.chatRoom.create({
        data: {
          user1Id: ucup.id,
          user2Id: otong.id,
        },
      });

      await collection.insertOne({
        _id: new ObjectId(),
        senderId: ucup.id,
        content: 'Hello Otong!',
        sentAt: new Date(),
        editedAt: null,
        deletedAt: null,
        chatRoom: {
          id: chatRoom.id,
          user1Id: chatRoom.user1Id,
          user2Id: chatRoom.user2Id,
        },
      });

      const res = await request(app.getHttpServer())
        .post('/chats')
        .set('Authorization', `Bearer ${makeJwt(ucup.id)}`)
        .send({ contactId: otong.id })
        .expect(200);

      await collection.deleteMany({ chatRoom: { id: chatRoom.id } } as any);
      await prisma.chatRoom.deleteMany({ where: { id: chatRoom.id } });

      expect(res.body.id).toBe(chatRoom.id);
      expect(res.body.displayName).toBe(otong.name);
      expect(res.body.picture).toBe(otong.picture);
      expect(res.body.lastMessage.content).toBe('Hello Otong!');
    });

    it('should throw NotFoundException if contact does not exist', async () => {
      await request(app.getHttpServer())
        .post('/chats')
        .set('Authorization', `Bearer ${makeJwt(ucup.id)}`)
        .send({ contactId: '550e8400-e29b-41d4-a716-446655440000' })
        .expect(404);
    });
  });
});
