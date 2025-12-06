import { Server, Socket } from "socket.io";

export type RandomChatEvents = {
  join: () => void;
  leave: () => void;
  message: (payload: { text: string }) => void;
};

class RandomChatLobby {
  private waiting: Set<string> = new Set();
  private socketById: Map<string, Socket> = new Map();
  private roomBySocket: Map<string, string> = new Map();

  add(socket: Socket) {
    this.socketById.set(socket.id, socket);
    this.waiting.add(socket.id);
    socket.emit("waiting");
    this.tryPair();
  }

  tryPair() {
    if (this.waiting.size < 2) return false;
    const ids = Array.from(this.waiting);
    const aId = ids[0];
    const bId = ids[1];
    const a = this.socketById.get(aId);
    const b = this.socketById.get(bId);
    if (!a || !b) return false;

    this.waiting.delete(aId);
    this.waiting.delete(bId);

    const roomId = `room:${a.id}:${b.id}`;
    this.roomBySocket.set(a.id, roomId);
    this.roomBySocket.set(b.id, roomId);

    a.join(roomId);
    b.join(roomId);

    a.emit("paired", { peerId: b.id, roomId });
    b.emit("paired", { peerId: a.id, roomId });
    return true;
  }

  leaveRoom(socket: Socket, requeue = true) {
    const roomId = this.roomBySocket.get(socket.id);
    if (!roomId) return;
    socket.leave(roomId);
    this.roomBySocket.delete(socket.id);
    const peerId = Array.from(this.roomBySocket.keys()).find(
      (sid) => sid !== socket.id && this.roomBySocket.get(sid) === roomId
    );
    if (peerId) {
      this.roomBySocket.delete(peerId);
      const peer = this.socketById.get(peerId);
      peer?.leave(roomId);
      peer?.emit("peer:left");
      if (requeue && peer) this.add(peer);
    }
    if (requeue) this.add(socket);
  }

  remove(socket: Socket) {
    this.waiting.delete(socket.id);
    this.socketById.delete(socket.id);
    this.leaveRoom(socket, false);
  }

  getPeer(socket: Socket): Socket | undefined {
    const roomId = this.roomBySocket.get(socket.id);
    if (!roomId) return undefined;
    const peerId = Array.from(this.socketById.keys()).find(
      (sid) => sid !== socket.id && this.roomBySocket.get(sid) === roomId
    );
    return peerId ? this.socketById.get(peerId) : undefined;
  }

  getRecord() {
    return [
      {
        waiting: JSON.stringify(Array.from(this.waiting)),
        rooms: JSON.stringify(Array.from(this.roomBySocket.entries())),
      },
    ];
  }
}

const lobby = new RandomChatLobby();

export function registerRandomChatNamespace(io: Server) {
  const nsp = io.of("/random-chat");

  nsp.on("connection", (socket: Socket) => {
    socket.on("join", () => {
      lobby.add(socket);
      console.log(lobby.getRecord());
    });

    socket.on("leave", () => {
      lobby.leaveRoom(socket);
    });

    socket.on("message", (payload: { text: string }) => {
      const roomId =
        socket.rooms.size > 1
          ? Array.from(socket.rooms).find((r) => r.startsWith("room:"))
          : undefined;
      if (roomId) {
        socket
          .to(roomId)
          .emit("message", { from: socket.id, text: payload.text });
      } else {
        socket.emit("error", { message: "No peer connected" });
      }
    });

    socket.on("disconnect", () => {
      lobby.remove(socket);
    });
  });

  return nsp;
}
