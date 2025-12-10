import redisClient from "./connection";

export class WaitingManager {
  async addUserToWaitingList(userId: string) {
    (await redisClient).LPUSH("waiting_list", userId).catch((err) => {
      console.error("Error adding user to waiting list:", err);
    });
  }

  async removeUserFromWaitingList(userId: string) {
    (await redisClient).LREM("waiting_list", 0, userId);
  }

  async getWaitingList(): Promise<string[]> {
    return (await redisClient).LRANGE("waiting_list", 0, -1);
  }
}
