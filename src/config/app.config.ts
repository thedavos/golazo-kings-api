import { ConfigType, registerAs } from '@nestjs/config';

const appConfigType = registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 3000,
  host: process.env.HOST || 'localhost',
  apiPrefix: process.env.API_PREFIX || '',
  apiVersion: process.env.API_VERSION || '1',
  defaultApiVersion: process.env.DEFAULT_API_VERSION || '1',
  cookieSecret: process.env.COOKIE_SECRET || 'secret',
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    methods: process.env.CORS_METHODS?.split(',') || [
      'GET',
      'POST',
      'PUT',
      'DELETE',
      'PATCH',
    ],
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    toFile: process.env.LOG_TO_FILE === 'true',
    filePath: process.env.LOG_FILE_PATH || './logs/app.log',
  },
}));

export type AppConfig = ConfigType<typeof appConfigType>;

export default appConfigType;
