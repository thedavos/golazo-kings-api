import { registerAs } from '@nestjs/config';

export const swaggerEnvVariables = {
  SWAGGER_ENABLED: process.env.SWAGGER_ENABLED === 'true',
  SWAGGER_TITLE: process.env.SWAGGER_TITLE || 'GolazoKings API',
  SWAGGER_DESCRIPTION:
    process.env.SWAGGER_DESCRIPTION || 'API para la plataforma GolazoKings',
  SWAGGER_VERSION: process.env.SWAGGER_VERSION || '1.0',
  SWAGGER_PATH: process.env.SWAGGER_PATH || 'api/docs',
};

export default registerAs('swagger', () => ({
  enabled: swaggerEnvVariables.SWAGGER_ENABLED,
  title: swaggerEnvVariables.SWAGGER_TITLE,
  description: swaggerEnvVariables.SWAGGER_DESCRIPTION,
  version: swaggerEnvVariables.SWAGGER_VERSION,
  path: swaggerEnvVariables.SWAGGER_PATH,
}));
