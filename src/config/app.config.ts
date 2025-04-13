import { registerAs } from '@nestjs/config';
import * as process from 'node:process';

export const appEnvVariables = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT) || 3000,
  HOST: process.env.HOST || 'localhost',
  API_PREFIX: process.env.API_PREFIX || 'api',
  API_VERSION: process.env.API_VERSION || '1',
  DEFAULT_API_VERSION: process.env.DEFAULT_API_VERSION || '1',
  CORS_ORIGIN: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  CORS_METHODS: process.env.CORS_METHODS?.split(',') || [
    'GET',
    'POST',
    'PUT',
    'DELETE',
    'PATCH',
  ],
  CORS_CREDENTIALS: process.env.CORS_CREDENTIALS === 'true',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  LOG_TO_FILE: process.env.LOG_TO_FILE === 'true',
  LOG_FILE_PATH: process.env.LOG_FILE_PATH || './logs/app.log',
};

export default registerAs('app', () => ({
  nodeEnv: appEnvVariables.NODE_ENV,
  port: appEnvVariables.PORT,
  host: appEnvVariables.HOST,
  apiPrefix: appEnvVariables.API_PREFIX,
  apiVersion: appEnvVariables.API_VERSION,
  defaultApiVersion: appEnvVariables.DEFAULT_API_VERSION,
  cors: {
    origin: appEnvVariables.CORS_ORIGIN,
    methods: appEnvVariables.CORS_METHODS,
    credentials: appEnvVariables.CORS_CREDENTIALS,
  },
  logging: {
    level: appEnvVariables.LOG_LEVEL,
    toFile: appEnvVariables.LOG_TO_FILE,
    filePath: appEnvVariables.LOG_FILE_PATH,
  },
}));
