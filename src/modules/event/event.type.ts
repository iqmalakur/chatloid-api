import { ObjectId } from 'mongodb';
import { DefaultEventsMap, Socket } from 'socket.io';

export type SocketUser = {
  userId: string;
};

export type AuthSocket = Socket<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  SocketUser
>;

export type ChatRoomUserSelection = {
  id: string;
  user1Id: string;
  user2Id: string;
};

export type MessageEntity = {
  _id: ObjectId;
  senderId: string;
  content: string;
  sentAt: Date;
  editedAt: Date | null;
  deletedAt: Date | null;
  chatRoom: {
    id: string;
    user1Id: string;
    user2Id: string;
  };
};
