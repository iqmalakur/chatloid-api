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
