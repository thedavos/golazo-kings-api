import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsString,
  IsBoolean,
  IsOptional,
  validateSync,
  Min,
  Max,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
  Local = 'local',
}

class EnvironmentVariables {
  // Node Environment
  @IsEnum(Environment)
  NODE_ENV: Environment;

  // Application
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT: number;

  @IsString()
  HOST: string;

  @IsString()
  API_PREFIX: string;

  @IsString()
  API_VERSION: string;

  @IsString()
  DEFAULT_API_VERSION: string;

  // Database
  @IsString()
  DB_HOST: string;

  @IsString()
  DB_PORT: string;

  @IsString()
  DB_DATABASE: string;

  @IsString()
  DB_USERNAME: string;

  @IsString()
  DB_PASSWORD: string;

  @IsString()
  DB_ROOT_PASSWORD: string;

  @IsBoolean()
  DB_SYNCHRONIZE: boolean;

  @IsBoolean()
  DB_LOGGING: boolean;

  // CORS
  @IsString()
  @IsOptional()
  CORS_ORIGIN?: string;

  @IsString()
  @IsOptional()
  CORS_METHODS?: string;

  @IsBoolean()
  @IsOptional()
  CORS_CREDENTIALS?: boolean;

  // Swagger
  @IsBoolean()
  SWAGGER_ENABLED: boolean;

  @IsString()
  @IsOptional()
  SWAGGER_TITLE?: string;

  @IsString()
  @IsOptional()
  SWAGGER_DESCRIPTION?: string;

  @IsString()
  @IsOptional()
  SWAGGER_VERSION?: string;

  @IsString()
  @IsOptional()
  SWAGGER_PATH?: string;

  // Logging
  @IsString()
  @IsOptional()
  LOG_LEVEL?: string;

  @IsBoolean()
  @IsOptional()
  LOG_TO_FILE?: boolean;

  @IsString()
  @IsOptional()
  LOG_FILE_PATH?: string;

  @IsString()
  B2_ACCESS_KEY_ID: string;

  @IsString()
  B2_SECRET_ACCESS_KEY: string;

  @IsString()
  B2_BUCKET_NAME: string;

  @IsString()
  B2_ENDPOINT: string;

  @IsString()
  B2_REGION: string;

  @IsString()
  B2_PUBLIC_URL_BASE: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(
    EnvironmentVariables,
    {
      // Node Environment
      NODE_ENV: config.NODE_ENV,
      PORT: config.PORT,
      HOST: config.HOST,
      API_PREFIX: config.API_PREFIX,
      API_VERSION: config.API_VERSION,
      DEFAULT_API_VERSION: config.DEFAULT_API_VERSION,

      // Database
      DB_HOST: config.DB_HOST,
      DB_PORT: config.DB_PORT,
      DB_DATABASE: config.DB_DATABASE,
      DB_USERNAME: config.DB_USERNAME,
      DB_PASSWORD: config.DB_PASSWORD,
      DB_ROOT_PASSWORD: config.DB_ROOT_PASSWORD,
      DB_SYNCHRONIZE: config.DB_SYNCHRONIZE,
      DB_LOGGING: config.DB_LOGGING,

      // CORS
      CORS_ORIGIN: config.CORS_ORIGIN,
      CORS_METHODS: config.CORS_METHODS,
      CORS_CREDENTIALS: config.CORS_CREDENTIALS,

      // Swagger
      SWAGGER_ENABLED: config.SWAGGER_ENABLED,
      SWAGGER_TITLE: config.SWAGGER_TITLE,
      SWAGGER_DESCRIPTION: config.SWAGGER_DESCRIPTION,
      SWAGGER_VERSION: config.SWAGGER_VERSION,
      SWAGGER_PATH: config.SWAGGER_PATH,

      // Logging
      LOG_LEVEL: config.LOG_LEVEL,
      LOG_TO_FILE: config.LOG_TO_FILE,
      LOG_FILE_PATH: config.LOG_FILE_PATH,

      // B2
      B2_ACCESS_KEY_ID: config.B2_ACCESS_KEY_ID,
      B2_SECRET_ACCESS_KEY: config.B2_SECRET_ACCESS_KEY,
      B2_BUCKET_NAME: config.B2_BUCKET_NAME,
      B2_ENDPOINT: config.B2_ENDPOINT,
      B2_REGION: config.B2_REGION,
      B2_PUBLIC_URL_BASE: config.B2_PUBLIC_URL_BASE,

      // Admin
      KINGS_LEAGUE_BASE_URL: config.KINGS_LEAGUE_BASE_URL,
      QUEENS_LEAGUE_BASE_URL: config.QUEENS_LEAGUE_BASE_URL,
    },
    { enableImplicitConversion: true },
  );

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const errorMessages = errors.map((error) => {
      const constraints = Object.values(error.constraints || {});
      return `${error.property}: ${constraints.join(', ')}`;
    });

    throw new Error(
      [
        '❌ Error de validación en variables de entorno:',
        ...errorMessages,
        '',
        '👉 Por favor, verifica tu archivo .env y asegúrate de que todas las variables requeridas estén configuradas correctamente.',
      ].join('\n'),
    );
  }

  return validatedConfig;
}
