import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { LeaguesModule } from './modules/leagues/leagues.module';
// import { DatabaseModule } from '@infrastructure/database/database.module';
import { appConfig, databaseConfig, swaggerConfig } from '@/config';
import { validate } from '@config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, swaggerConfig],
      envFilePath: '.env.development',
      validate,
    }),
    // DatabaseModule,
    // LeaguesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
