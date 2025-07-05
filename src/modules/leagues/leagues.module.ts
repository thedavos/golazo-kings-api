import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { League } from './domain/entities/league.entity';
import { Season } from './domain/entities/season.entity';
import { Standing } from './domain/entities/standing.entity';
import { Match } from './domain/entities/match.entity';
import { MatchPlayerStats } from './domain/entities/matchPlayerStats.entity';
import { LeaguesService } from './leagues.service';
import { LeagueRepository } from './league.repository';
import { LeaguesController } from './leagues.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      League,
      Season,
      Standing,
      Match,
      MatchPlayerStats,
    ]),
  ],
  controllers: [LeaguesController],
  providers: [LeaguesService, LeagueRepository],
})
export class LeaguesModule {}
