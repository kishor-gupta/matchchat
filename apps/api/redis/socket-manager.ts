import redisClient from "./connection";

export class SocketManager {
  async addUserSocket(userId: string, socketId: string) {
    (await redisClient).HSET("user_sockets", userId, socketId).catch((err) => {
      console.error("Error adding user socket:", err);
    });
  }

  async removeUserSocket(userId: string) {
    (await redisClient).HDEL("user_sockets", userId);
  }

  async getUserSocket(userId: string): Promise<string | null> {
    return (await redisClient).HGET("user_sockets", userId);
  }
}
