import { ObjectId } from 'mongodb';

export type ChatRoomUserSelection = {
  id: string;
  name: string;
  picture: string;
};

export type LastMessageSelection = {
  content: string;
  sentAt: Date;
};

export type ChatRoomSelection = {
  id: string;
  user1: ChatRoomUserSelection;
  user2: ChatRoomUserSelection;
  message: LastMessageSelection | null;
};

export type MessageSelection = {
  _id: ObjectId;
  senderId: string;
  content: string;
  sentAt: Date;
  editedAt: Date | null;
};

export type DetailChatRoomSelection = {
  id: string;
  user1: ChatRoomUserSelection;
  user2: ChatRoomUserSelection;
  messages: MessageSelection[];
};
