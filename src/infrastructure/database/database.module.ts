import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService, ConfigType } from '@nestjs/config';
import databaseConfig from '@/config/database.config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        ...configService.get<ConfigType<typeof databaseConfig>>('database'),
      }),
    }),
  ],
})
export class DatabaseModule {}
