import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from '@infrastructure/database/database.module';
import {
  appConfig,
  databaseConfig,
  swaggerConfig,
  b2Config,
  adminConfig,
  jwtConfig,
} from '@/config';
import { validate } from '@config/env.validation';
import { ApiResponseModule } from '@common/response';
import { PresidentsModule } from '@modules/presidents/presidents.module';
import { LeaguesModule } from '@modules/leagues/leagues.module';
import { TeamsModule } from '@/modules/teams/teams.module';
import { PlayersModule } from '@/modules/players/players.module';
import { ImageModule } from '@/modules/image/image.module';
import { AdminModule } from '@/modules/admin/admin.module';
import { HealthModule } from '@modules/health/health.module';
import { AuthModule } from '@modules/auth/auth.module';
import { ProblemsModule } from '@common/problems/problems.module';

@Module({
  imports: [
    ApiResponseModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfig,
        databaseConfig,
        swaggerConfig,
        b2Config,
        adminConfig,
        jwtConfig,
      ],
      envFilePath:
        process.env.NODE_ENV === 'development'
          ? '.env.development'
          : '.env.production',
      validate,
    }),
    DatabaseModule,
    ImageModule,
    PresidentsModule,
    LeaguesModule,
    TeamsModule,
    PlayersModule,
    AdminModule,
    AuthModule,
    HealthModule,
    ProblemsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
