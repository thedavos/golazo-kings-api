import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
  Generated,
} from 'typeorm';
import { Season } from '@/modules/leagues/domain/entities/season.entity';
import { Team } from '@/modules/teams/domain/entities/team.entity';

@Entity('standings')
@Unique(['seasonId', 'teamId']) // Un equipo solo puede tener una fila por temporada
export class Standing {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ type: 'uuid', unique: true })
  @Generated('uuid')
  uuid: string;

  @Index()
  @Column({ type: 'int' })
  rank: number;

  @Column({ type: 'int', default: 0 })
  points: number;

  @Column({ type: 'int', default: 0 })
  played: number;

  @Column({ type: 'int', default: 0 })
  won: number;

  @Column({ type: 'int', default: 0 })
  drawn: number;

  @Column({ type: 'int', default: 0 })
  lost: number;

  @Column({ type: 'int', default: 0 })
  goalsFor: number; // Goles a Favor

  @Column({ type: 'int', default: 0 })
  goalsAgainst: number; // Goles en Contra

  @Column({ type: 'int', default: 0 })
  goalDifference: number; // Diferencia de Goles (GF - GA)

  @Column({ type: 'varchar', length: 20, nullable: true }) // Ej: "W-W-L-D-W"
  form: string; // Últimos 5 resultados, por ejemplo

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  // --- Relaciones ---
  @Index()
  @Column()
  seasonId: number; // FK a Season

  @Index()
  @Column()
  teamId: number; // FK a Team

  @ManyToOne(() => Season, (season) => season.standings, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'seasonId' })
  season: Season;

  @ManyToOne(() => Team, (team) => team.standings, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'teamId' })
  team: Team;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
