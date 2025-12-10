import redisClient from "./connection";

export class RoomManager {
  // Map socketId -> roomId
  async setRoomForSocket(socketId: string, roomId: string) {
    await (await redisClient).HSET("socket_room", socketId, roomId);
    await (await redisClient).SADD(this.membersKey(roomId), socketId);
  }

  async getRoomForSocket(socketId: string): Promise<string | null> {
    return (await redisClient).HGET("socket_room", socketId);
  }

  async removeSocketFromRoom(socketId: string) {
    const roomId = await this.getRoomForSocket(socketId);
    if (roomId) {
      await (await redisClient).SREM(this.membersKey(roomId), socketId);
    }
    await (await redisClient).HDEL("socket_room", socketId);
  }

  async getPeerIdInRoom(socketId: string): Promise<string | null> {
    const roomId = await this.getRoomForSocket(socketId);
    if (!roomId) return null;
    const members = await (await redisClient).SMEMBERS(this.membersKey(roomId));
    const peerId = members.find((id) => id !== socketId) || null;
    return peerId;
  }

  async getRoomsSnapshot() {
    // Return pairs [socketId, roomId]
    const entries = await (await redisClient).HGETALL("socket_room");
    return entries;
  }

  private membersKey(roomId: string) {
    return `room_members:${roomId}`;
  }
}
