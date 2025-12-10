/// <reference types="node" />
import dotenv from "dotenv";
dotenv.config();

const tryEnv = (key: string, defaultValue: string) => {
  const envValue = process.env[key];
  if (!envValue) {
    console.warn(
      `Environment variable ${key} is not set. Using default value: ${defaultValue}`
    );
  }
  return envValue || defaultValue;
};

export default tryEnv;
