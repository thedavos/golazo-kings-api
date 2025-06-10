import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Generated,
  PrimaryColumn,
} from 'typeorm';
import { Season } from '@/modules/leagues/domain/entities/season.entity';
import { Team } from '@/modules/teams/domain/entities/team.entity';

@Entity('standings')
export class Standing {
  @PrimaryGeneratedColumn('increment', { type: 'int' })
  id: number;

  @PrimaryColumn({ type: 'varchar', length: 36, unique: true })
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
  @Column({ type: 'int' })
  seasonId: number;

  @Column()
  seasonUuid: string;

  @Column({ type: 'int' })
  teamId: number;

  @Column()
  teamUuid: string;

  @Index(['seasonId', 'teamId'], { unique: true })
  @ManyToOne(() => Season, (season) => season.standings, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    nullable: false,
  })
  @JoinColumn([
    { name: 'seasonId', referencedColumnName: 'id' },
    { name: 'seasonUuid', referencedColumnName: 'uuid' },
  ])
  season: Season;

  @ManyToOne(() => Team, (team) => team.standings, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    nullable: false,
  })
  @JoinColumn([
    { name: 'teamId', referencedColumnName: 'id' },
    { name: 'teamUuid', referencedColumnName: 'uuid' },
  ])
  team: Team;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
