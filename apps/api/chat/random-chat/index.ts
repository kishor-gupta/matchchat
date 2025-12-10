import { Server, Socket } from "socket.io";
import { WaitingManager } from "../../redis/waiting-manager";

export type RandomChatEvents = {
  join: () => void;
  leave: () => void;
  message: (payload: { text: string }) => void;
};

class RandomChatLobby {
  private socketById: Map<string, Socket> = new Map();
  private roomBySocket: Map<string, string> = new Map();
  private waitingManager = new WaitingManager();

  async add(socket: Socket) {
    this.socketById.set(socket.id, socket);
    await this.waitingManager.addUserToWaitingList(socket.id);
    socket.emit("waiting");
    await this.tryPair();
  }

  async tryPair() {
    const list = await this.waitingManager.getWaitingList();
    if (list.length < 2) return false;
    const ids = Array.from(list.slice(0, 2));
    const aId = ids[0];
    const bId = ids[1];
    const a = this.socketById.get(aId);
    const b = this.socketById.get(bId);
    if (!a || !b) return false;

    await this.waitingManager.removeUserFromWaitingList(aId);
    await this.waitingManager.removeUserFromWaitingList(bId);

    const roomId = `room:${a.id}:${b.id}`;
    this.roomBySocket.set(a.id, roomId);
    this.roomBySocket.set(b.id, roomId);

    a.join(roomId);
    b.join(roomId);

    a.emit("paired", { peerId: b.id, roomId });
    b.emit("paired", { peerId: a.id, roomId });
    return true;
  }

  async leaveRoom(socket: Socket, requeue = true) {
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
      if (requeue && peer) await this.add(peer);
    }
    if (requeue) await this.add(socket);
  }

  async remove(socket: Socket) {
    await this.waitingManager.removeUserFromWaitingList(socket.id);
    this.socketById.delete(socket.id);
    await this.leaveRoom(socket, false);
  }

  getPeer(socket: Socket): Socket | undefined {
    const roomId = this.roomBySocket.get(socket.id);
    if (!roomId) return undefined;
    const peerId = Array.from(this.socketById.keys()).find(
      (sid) => sid !== socket.id && this.roomBySocket.get(sid) === roomId
    );
    return peerId ? this.socketById.get(peerId) : undefined;
  }

  async getRecord() {
    const data = await this.waitingManager.getWaitingList();
    return [
      {
        waiting: data,
        rooms: JSON.stringify(Array.from(this.roomBySocket.entries())),
      },
    ];
  }
}

const lobby = new RandomChatLobby();

export function registerRandomChatNamespace(io: Server) {
  const nsp = io.of("/random-chat");

  nsp.on("connection", (socket: Socket) => {
    socket.on("join", async () => {
      await lobby.add(socket);
      await lobby.getRecord();
      socket.broadcast.emit("onlineClient", {
        count: lobby["socketById"].size,
      });
      socket.emit("onlineClient", { count: lobby["socketById"].size });
    });

    socket.on("leave", async () => {
      await lobby.leaveRoom(socket);
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
      // console.log(`Socket disconnected: ${socket.id}`);
      socket.broadcast.emit("onlineClient", {
        count: lobby["socketById"].size - 1,
      });
      lobby.remove(socket);
    });
  });

  return nsp;
}
