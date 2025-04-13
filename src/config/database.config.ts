import { registerAs } from '@nestjs/config';

export const dbEnvVariables = {
  DB_HOST: process.env.DB_HOST,
  DB_PORT: Number(process.env.DB_PORT) || 3306,
  DB_USERNAME: process.env.DB_USERNAME,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_ROOT_PASSWORD: process.env.DB_ROOT_PASSWORD,
  DB_DATABASE: process.env.DB_DATABASE,
  DB_SYNCHRONIZE: process.env.DB_SYNCHRONIZE === 'true',
  DB_LOGGING: process.env.DB_LOGGING === 'true',
};

export default registerAs('database', () => ({
  host: dbEnvVariables.DB_HOST,
  port: dbEnvVariables.DB_PORT,
  username: dbEnvVariables.DB_USERNAME,
  password: dbEnvVariables.DB_PASSWORD,
  rootPassword: dbEnvVariables.DB_ROOT_PASSWORD,
  database: dbEnvVariables.DB_DATABASE,
  synchronize: dbEnvVariables.DB_SYNCHRONIZE,
  logging: dbEnvVariables.DB_LOGGING,
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/*{.ts,.js}'],
  migrationsTableName: 'migrations_typeorm',
}));
