import * as fs from 'fs';
import * as dotenv from 'dotenv';
import * as path from 'path';

export const setEnv = (envPath: string, key: string, value: string) => {
  const envFilePath = path.resolve(__dirname + '../../../../', envPath); // Sesuaikan path jika perlu
  const envConfig = dotenv.parse(fs.readFileSync(envFilePath));

  envConfig[key] = value;

  const newEnvContent = Object.entries(envConfig)
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');

  fs.writeFileSync(envFilePath, newEnvContent);
};

export const getEnv = (envPath: string, key: string): string | undefined => {
  const envFilePath = path.resolve(__dirname + '../../../../', envPath); // Sesuaikan path jika diperlukan
  const envConfig = dotenv.parse(fs.readFileSync(envFilePath));
  return envConfig[key];
};
