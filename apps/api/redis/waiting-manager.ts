import redisClient from "./connection";

export class WaitingManager {
  async addUserToWaitingList(userId: string) {
    (await redisClient).SADD("waiting_list", userId).catch((err) => {
      console.error("Error adding user to waiting list:", err);
    });
  }

  async removeUserFromWaitingList(userId: string) {
    (await redisClient).SREM("waiting_list", userId);
  }

  async getWaitingList(): Promise<string[]> {
    return (await redisClient).SMEMBERS("waiting_list");
  }

  async popRandomUser(currentSocketId: string): Promise<string | null> {
    const size = await (await redisClient).SCARD("waiting_list");
    if (size <= 1) {
      return null;
    }

    let randomUser: any;
    do {
      randomUser = await (await redisClient).SRANDMEMBER("waiting_list");
    } while (randomUser === currentSocketId);
      await (await redisClient).SREM("waiting_list", randomUser);
    return randomUser;
  }
}
