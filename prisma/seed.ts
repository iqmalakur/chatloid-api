import { MongoClient } from 'mongodb';
import { PrismaClient } from '../generated/prisma/client';

const prisma = new PrismaClient();
const client = new MongoClient(process.env.MONGODB_URL ?? '');
const db = client.db('chatloid_messages');
const collection = db.collection('messages');

async function main() {
  console.log('Seeding database...');

  await prisma.$transaction(async (tx) => {
    // --- Create Users ---
    const user1 = await tx.user.create({
      data: {
        username: 'john_doe',
        googleId: 'google-123',
        email: 'john@example.com',
        name: 'John Doe',
        picture: 'https://picsum.photos/200/200?random=1',
      },
    });

    const user2 = await tx.user.create({
      data: {
        username: 'jane_smith',
        googleId: 'google-456',
        email: 'jane@example.com',
        name: 'Jane Smith',
        picture: 'https://picsum.photos/200/200?random=2',
      },
    });

    const user3 = await tx.user.create({
      data: {
        username: 'alex_lee',
        googleId: 'google-789',
        email: 'alex@example.com',
        name: 'Alex Lee',
        picture: 'https://picsum.photos/200/200?random=3',
      },
    });

    // --- Create Contacts ---
    await tx.contact.create({
      data: {
        userOneId: user1.id,
        userTwoId: user2.id,
        isAccepted: true,
      },
    });

    await tx.contact.create({
      data: {
        userOneId: user1.id,
        userTwoId: user3.id,
        isAccepted: false,
      },
    });

    // --- Create Chat Room (Private between user1 and user2) ---
    const privateRoom = await tx.chatRoom.create({
      data: {
        user1Id: user1.id,
        user2Id: user2.id,
      },
    });

    const now = new Date();
    // --- Create Messages ---

    await collection.insertMany([
      {
        senderId: user1.id,
        content: 'Hey Jane, how are you?',
        sentAt: now,
        editedAt: null,
        deletedAt: null,
        chatRoom: {
          id: privateRoom.id,
          user1Id: privateRoom.user1Id,
          user2Id: privateRoom.user2Id,
        },
      },
      {
        senderId: user2.id,
        content: 'I’m good John, thanks!',
        editedAt: null,
        deletedAt: null,
        sentAt: new Date(now.getTime() + 60000),
        chatRoom: {
          id: privateRoom.id,
          user1Id: privateRoom.user1Id,
          user2Id: privateRoom.user2Id,
        },
      },
      {
        senderId: user1.id,
        content: 'Good day!',
        editedAt: null,
        deletedAt: null,
        sentAt: new Date(now.getTime() + 120000),
        chatRoom: {
          id: privateRoom.id,
          user1Id: privateRoom.user1Id,
          user2Id: privateRoom.user2Id,
        },
      },
    ]);
  });

  console.log('Database seeding successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await client.close();
  });
