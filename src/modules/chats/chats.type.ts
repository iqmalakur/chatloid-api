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
  messages: LastMessageSelection[];
};

export type MessageSelection = {
  id: string;
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
