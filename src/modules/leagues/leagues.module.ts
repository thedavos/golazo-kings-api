import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { League } from './domain/entities/league.entity';
import { Season } from './domain/entities/season.entity';
import { LeaguesService } from './leagues.service';
import { LeagueRepository } from './league.repository';
import { LeaguesController } from './leagues.controller';

@Module({
  imports: [TypeOrmModule.forFeature([League, Season])],
  controllers: [LeaguesController],
  providers: [LeaguesService, LeagueRepository],
})
export class LeaguesModule {}
