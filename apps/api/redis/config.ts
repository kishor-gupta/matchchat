import tryEnv from "../util/tryEnv";

const url = tryEnv("REDIS_URL", "redis://localhost:6379");
const redisClientConfig = { url };

export default redisClientConfig;
