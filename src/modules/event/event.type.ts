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
