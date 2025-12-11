import { createClient } from "redis";
import redisClientConfig from "./config";

const redisClient = createClient(redisClientConfig)
  .on("error", (err) => {
    console.error("Redis Client Error", err);
  })
  .connect();

export default redisClient;
