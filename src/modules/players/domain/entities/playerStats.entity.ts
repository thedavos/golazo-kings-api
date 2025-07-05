import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Player } from '@modules/players/domain/entities/player.entity';
import { Season } from '@modules/leagues/domain/entities/season.entity';

@Entity('player_stats')
export class PlayerStats {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  playerId: number;

  @Column()
  seasonId: number; // referencia a temporada

  @Column({ type: 'int', default: 0 })
  matchesPlayed: number;

  @Column({ type: 'int', default: 0 })
  goals: number;

  @Column({ type: 'int', default: 0 })
  assists: number;

  @Column({ type: 'int', default: 0 })
  yellowCards: number;

  @Column({ type: 'int', default: 0 })
  redCards: number;

  @Column({ type: 'int', default: 0 })
  minutesPlayed: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  averageRating: number;

  @ManyToOne(() => Player)
  player: Player;

  @ManyToOne(() => Season)
  season: Season;
}
