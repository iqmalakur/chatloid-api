import { PrismaClient } from '../generated/prisma/client';

const prisma = new PrismaClient();

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
        isGroup: false,
        members: {
          create: [{ userId: user1.id }, { userId: user2.id }],
        },
      },
    });

    // --- Create Group Chat ---
    const groupRoom = await tx.chatRoom.create({
      data: {
        name: 'Friends Group',
        isGroup: true,
        picture: 'https://picsum.photos/300/300?random=4',
        members: {
          create: [
            { userId: user1.id },
            { userId: user2.id },
            { userId: user3.id },
          ],
        },
      },
    });

    // --- Create Messages ---
    await tx.message.createMany({
      data: [
        {
          chatRoomId: privateRoom.id,
          senderId: user1.id,
          content: 'Hey Jane, how are you?',
        },
        {
          chatRoomId: privateRoom.id,
          senderId: user2.id,
          content: 'I’m good John, thanks!',
        },
        {
          chatRoomId: groupRoom.id,
          senderId: user3.id,
          content: 'Hi everyone!',
        },
      ],
    });
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
  });
