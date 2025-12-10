import tryEnv from "../util/tryEnv";

const url = tryEnv("REDIS_URL", "testredis");
const redisClientConfig = { url };

export default redisClientConfig;
