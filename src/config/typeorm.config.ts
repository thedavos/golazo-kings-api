import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

const environment = process.env.NODE_ENV || 'development';
const envFile = `.env.${environment}`;

// Cargar el archivo de entorno correcto
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

// Para debug - comenta estas líneas después
console.log(`Usando archivo de entorno: ${envFile}`);
console.log('Database connection params:');
console.log(`Host: ${process.env.DB_HOST}`);
console.log(`Username: ${process.env.DB_USERNAME}`);
console.log(`Database: ${process.env.DB_DATABASE}`);
console.log(`Password provided: ${process.env.DB_PASSWORD ? 'Yes' : 'No'}`);

export default new DataSource({
  type: 'mysql',
  host:
    process.env.NODE_ENV === 'development' ? 'localhost' : process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  logging: process.env.DB_LOGGING === 'true',
  synchronize: false,
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['src/migrations/*{.ts,.js}'],
  migrationsTableName: 'migrations_typeorm',
});
