import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from '@infrastructure/database/database.module';
import { appConfig, databaseConfig, swaggerConfig, b2Config } from '@/config';
import { validate } from '@config/env.validation';
import { PresidentsModule } from '@modules/presidents/presidents.module';
import { LeaguesModule } from '@modules/leagues/leagues.module';
import { TeamsModule } from '@/modules/teams/teams.module';
import { PlayersModule } from '@/modules/players/players.module';
import { ImageModule } from '@/modules/image/image.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, swaggerConfig, b2Config],
      envFilePath: '.env.development',
      validate,
    }),
    DatabaseModule,
    ImageModule,
    PresidentsModule,
    LeaguesModule,
    TeamsModule,
    PlayersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
