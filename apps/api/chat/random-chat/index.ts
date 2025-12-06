import { Server, Socket } from "socket.io";

export type RandomChatEvents = {
  join: () => void;
  leave: () => void;
  message: (payload: { text: string }) => void;
};

class RandomChatLobby {
  private waiting: Socket[] = [];
  private pairs: Map<string, string> = new Map();

  add(socket: Socket) {
    if (this.waiting.length > 0) {
      const peer = this.waiting.shift()!;
      this.pairs.set(socket.id, peer.id);
      this.pairs.set(peer.id, socket.id);
      socket.emit("paired", { peerId: peer.id });
      peer.emit("paired", { peerId: socket.id });
    } else {
      this.waiting.push(socket);
      socket.emit("waiting");
    }
  }

  remove(socket: Socket) {
    this.waiting = this.waiting.filter((s) => s.id !== socket.id);
    const peerId = this.pairs.get(socket.id);
    if (peerId) {
      this.pairs.delete(socket.id);
      this.pairs.delete(peerId);
    }
  }

  getPeer(socket: Socket): Socket | undefined {
    const peerId = this.pairs.get(socket.id);
    if (!peerId) return undefined;
    return socket.nsp.sockets.get(peerId);
  }

  getRecord() {
    return [{ pair: this.pairs, waiting: this.waiting }];
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
      lobby.remove(socket);
      socket.disconnect(true);
    });

    socket.on("message", (payload: { text: string }) => {
      const peer = lobby.getPeer(socket);
      if (peer) {
        peer.emit("message", { from: socket.id, text: payload.text });
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
