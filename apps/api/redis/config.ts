import tryEnv from "../util/tryEnv";

const redisClientConfig = {
  url: tryEnv("REDIS_URL", "redis://localhost:6379"),
};

export default redisClientConfig;
