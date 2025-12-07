import { io, Socket } from "socket.io-client";

export interface ExtendedSocket extends Socket {
  userId?: string;
}

// const path = "http://localhost:8080";
const path = "https://api-production-4691.up.railway.app";
const NAMESPACE_RANDOM_CHAT = "/random-chat";

export { NAMESPACE_RANDOM_CHAT };

let socket: ExtendedSocket | null = null;

export function initializeConnection() {
  if (!socket) {
    socket = io(path + NAMESPACE_RANDOM_CHAT, {
      transports: ["websocket"],
      autoConnect: true,
    }) as ExtendedSocket;

    socket.on("connect", () => {
      console.log("🔥 Socket Connected:", socket!.id);
    });

    console.log("🛠 Socket instance created (id pending...)");
  } else {
    console.log("♻ Reusing existing socket (cached). id:", socket.id);
  }

  return socket;
}
