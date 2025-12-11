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
    const socketId = socket?.id;
    this.socketById.set(socketId, socket);
    await this.waitingManager.addUserToWaitingList(socketId);
    socket.emit("waiting");
    await this.tryPair(socketId);
  }

  async tryPair(currentSocketId: string) {
    const getrandomUser =
      await this.waitingManager.popRandomUser(currentSocketId);

    if (!getrandomUser) return false;
    const peerSocket = this.socketById.get(getrandomUser);
    if (!peerSocket) return false;
    const currentSocket = this.socketById.get(currentSocketId);
    if (!currentSocket) return false;

    await this.waitingManager.removeUserFromWaitingList(currentSocketId);
    await this.waitingManager.removeUserFromWaitingList(peerSocket.id);

    const roomId = `room:${currentSocket.id}:${peerSocket.id}`;
    await this.roomManager.setRoomForSocket(currentSocket.id, roomId);
    await this.roomManager.setRoomForSocket(peerSocket.id, roomId);

    currentSocket.join(roomId);
    peerSocket.join(roomId);

    currentSocket.emit("paired", { peerId: peerSocket.id, roomId });
    peerSocket.emit("paired", { peerId: currentSocket.id, roomId });
    return true;
  }

  async leaveRoom(socket: Socket, requeue = true) {
    const roomId = await this.roomManager.getRoomForSocket(socket.id);
    if (!roomId) return;
    const getBothSockets = roomId.split(":").slice(1);
    if (getBothSockets.length !== 2) return;

    await this.roomManager.removeSocketFromRoom(getBothSockets[0]);
    await this.roomManager.removeSocketFromRoom(getBothSockets[1]);

    await this.add(this.socketById.get(getBothSockets[0]) as Socket);
    await this.add(this.socketById.get(getBothSockets[1]) as Socket);

    return true;
  }

  async remove(socket: Socket) {
    const socketId = socket?.id;
    await this.waitingManager.removeUserFromWaitingList(socketId);
    this.socketById.delete(socketId);
    await this.leaveRoom(socket, false);
  }

  getPeer(socket: Socket): Socket | undefined {
    return undefined;
  }
}

const lobby = new RandomChatLobby();

export function registerRandomChatNamespace(io: Server) {
  const nsp = io.of("/random-chat");

  nsp.on("connection", (socket: Socket) => {
    socket.on("join", async () => {
      await lobby.add(socket);

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
