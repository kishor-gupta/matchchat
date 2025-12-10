import tryEnv from "../util/tryEnv";

// Use a sensible default Redis URL if env not provided
const url = tryEnv("REDIS_URL", "redis://localhost:6379");
const redisClientConfig = { url };

export default redisClientConfig;
