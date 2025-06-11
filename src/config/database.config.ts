import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  rootPassword: process.env.DB_ROOT_PASSWORD,
  database: process.env.DB_DATABASE,
  logging: process.env.DB_LOGGING === 'true',
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/migrations/*.js'],
  migrationsTableName: 'migrations',
  synchronize: false,
  migrationsRun: true,
}));
