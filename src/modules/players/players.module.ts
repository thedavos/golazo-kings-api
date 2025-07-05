import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayersService } from './players.service';
import { PlayersController } from './players.controller';
import { Player } from './domain/entities/player.entity';
import { PlayerStats } from './domain/entities/playerStats.entity';
import { ImageModule } from '@/modules/image/image.module';

@Module({
  imports: [TypeOrmModule.forFeature([Player, PlayerStats]), ImageModule],
  controllers: [PlayersController],
  providers: [PlayersService],
  exports: [PlayersService],
})
export class PlayersModule {}
