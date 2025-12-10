import { Server, Socket } from "socket.io";
import { WaitingManager } from "../../redis/waiting-manager";
import { RoomManager } from "../../redis/room-manager";

export type RandomChatEvents = {
  join: () => void;
  leave: () => void;
  message: (payload: { text: string }) => void;
};

class RandomChatLobby {
  private socketById: Map<string, Socket> = new Map();
  private waitingManager = new WaitingManager();
  private roomManager = new RoomManager();

  get onlineCount() {
    return this.socketById.size;
  }

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
    await this.roomManager.setRoomForSocket(a.id, roomId);
    await this.roomManager.setRoomForSocket(b.id, roomId);

    a.join(roomId);
    b.join(roomId);

    a.emit("paired", { peerId: b.id, roomId });
    b.emit("paired", { peerId: a.id, roomId });
    return true;
  }

  async leaveRoom(socket: Socket, requeue = true) {
    const roomId = await this.roomManager.getRoomForSocket(socket.id);
    if (!roomId) return;
    socket.leave(roomId);
    await this.roomManager.removeSocketFromRoom(socket.id);
    const peerId = await this.roomManager.getPeerIdInRoom(socket.id);
    if (peerId) {
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
    return undefined;
  }

  async getRecord() {
    const data = await this.waitingManager.getWaitingList();
    const rooms = await this.roomManager.getRoomsSnapshot();
    return [
      {
        waiting: data,
        rooms: JSON.stringify(rooms),
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
        count: lobby.onlineCount,
      });
      socket.emit("onlineClient", { count: lobby.onlineCount });
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
        count: Math.max(0, lobby.onlineCount - 1),
      });
      lobby.remove(socket);
    });
  });

  return nsp;
}
