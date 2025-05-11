import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { President } from '@/modules/presidents/domain/entities/president.entity';
import { Standing } from '@/modules/leagues/domain/entities/standing.entity';
import { League } from '@/modules/leagues/domain/entities/league.entity';
import { Match } from '@/modules/leagues/domain/entities/match.entity';
import { Season } from '@/modules/leagues/domain/entities/season.entity';
import { Image } from '@/modules/image/domain/entities/image.entity';
import { Player } from '@/modules/players/domain/entities/player.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('database.host'),
        port: +configService.get('database.port'),
        username: configService.get('database.username') as string,
        password: configService.get('database.password') as string,
        root: configService.get('database.rootPassword') as string,
        database: configService.get('database.database') as string,
        synchronize: configService.get('database.synchronize'),
        logging: configService.get('database.logging'),
        migrations: configService.get('database.migrations'),
        migrationsTableName: configService.get('database.migrationsTableName'),
        migrationsRun: configService.get('database.migrationsRun'),
        entities: [President, Standing, League, Match, Season, Image, Player],
        autoLoadEntities: true,
      }),
    }),
  ],
})
export class DatabaseModule {}
