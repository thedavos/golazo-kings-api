import { ConfigType, registerAs } from '@nestjs/config';

const swaggerConfig = registerAs('swagger', () => ({
  enabled: process.env.SWAGGER_ENABLED === 'true',
  title: process.env.SWAGGER_TITLE || 'GolazoKings API',
  description:
    process.env.SWAGGER_DESCRIPTION || 'API para la plataforma GolazoKings',
  version: process.env.SWAGGER_VERSION || '1.0',
  path: process.env.SWAGGER_PATH || 'api/docs',
}));

export type SwaggerConfig = ConfigType<typeof swaggerConfig>;

export default swaggerConfig;
