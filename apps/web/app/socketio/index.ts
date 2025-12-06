import { log } from "node:console";
import { io, Socket } from "socket.io-client";

export interface ExtendedSocket extends Socket {
  userId?: string;
}

export interface Message {
  senderId: string;
  content: string;
  timestamp: number;
}

export interface ChatRoom {
  roomId: string;
  participants: string[];
  messages: Message[];
}

export interface TypingIndicator {
  userId: string;
  isTyping: boolean;
}

export interface UserStatus {
  userId: string;
  online: boolean;
}

export interface MatchChatEvents {
  "message:new": (message: Message) => void;
  "typing:update": (indicator: TypingIndicator) => void;
  "user:status": (status: UserStatus) => void;
  "chatroom:joined": (room: ChatRoom) => void;
  "chatroom:left": (roomId: string) => void;
}

export interface MatchChatPayloads {
  "message:new": { content: string; roomId: string };
  "typing:update": { isTyping: boolean; roomId: string };
  "chatroom:join": { roomId: string };
  "chatroom:leave": { roomId: string };
}

const path = "http://localhost:8080";
const NAMESPACE_RANDOM_CHAT = "/random-chat";

export { NAMESPACE_RANDOM_CHAT };

const initializeConnection = () => {
  const socket: ExtendedSocket = io(path + NAMESPACE_RANDOM_CHAT, {
    autoConnect: false,
    // transports: ["websocket"],
  }) as ExtendedSocket;
  socket.connect();
  return socket;
};

export { initializeConnection };
