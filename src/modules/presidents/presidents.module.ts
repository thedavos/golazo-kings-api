import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PresidentsService } from './presidents.service';
import { PresidentsController } from './presidents.controller';
import { President } from './domain/entities/president.entity';
import { Team } from '@/modules/teams/domain/entities/team.entity';
import { League } from '@/modules/leagues/domain/entities/league.entity';

@Module({
  imports: [TypeOrmModule.forFeature([President, Team, League])],
  controllers: [PresidentsController],
  providers: [PresidentsService],
  exports: [PresidentsService],
})
export class PresidentsModule {}
