import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayersService } from './players.service';
import { PlayersController } from './players.controller';
import { Player } from './domain/entities/player.entity';
import { ImageModule } from '@/modules/image/image.module';

@Module({
  imports: [TypeOrmModule.forFeature([Player]), ImageModule],
  controllers: [PlayersController],
  providers: [PlayersService],
  exports: [PlayersService], // Exportar si es necesario
})
export class PlayersModule {}
