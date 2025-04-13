import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { League } from './domain/entities/league.entity';
import { Season } from './domain/entities/season.entity';
import { LeaguesService } from './application/services/leagues.service';
import { LeagueRepository } from './infrastructure/repositories/league.repository';
import { LeaguesController } from './presentation/controllers/leagues.controller';

@Module({
  imports: [TypeOrmModule.forFeature([League, Season])],
  controllers: [LeaguesController],
  providers: [LeaguesService, LeagueRepository],
})
export class LeaguesModule {}
