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
import { Season } from './season.entity';
import { Team } from '@/modules/teams/domain/entities/team.entity';
import { MatchStatus } from '@/modules/leagues/domain/value-objects/match-status.enum';

@Entity('matches')
export class Match {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @PrimaryColumn({ unique: true })
  @Generated('uuid')
  uuid: string;

  @Index()
  @Column({ type: 'datetime', comment: 'Fecha y hora UTC del partido' })
  matchDate: Date;

  @Column({
    type: 'enum',
    enum: MatchStatus,
    default: MatchStatus.SCHEDULED,
  })
  status: MatchStatus;

  @Column({ type: 'int', nullable: true, comment: 'Goles del equipo local' })
  homeTeamScore: number | null;

  @Column({
    type: 'int',
    nullable: true,
    comment: 'Goles del equipo visitante',
  })
  awayTeamScore: number | null;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'Estadio o lugar del partido',
  })
  venue: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
    comment: 'Jornada o ronda de la temporada',
  })
  round: string | null; // Puede ser string si se necesita 'Quarter-finals', etc.

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Detalles adicionales, ej: motivo de suspensión',
  })
  details: string | null;

  @Column({ comment: 'FK a la temporada a la que pertenece el partido' })
  seasonId: number;

  @Column()
  seasonUuid: string;

  @Column({ comment: 'FK al equipo local' })
  homeTeamId: number;

  @Column()
  homeTeamUuid: string;

  @Column({ comment: 'FK al equipo visitante' })
  awayTeamId: number;

  @Column()
  awayTeamUuid: string;

  @ManyToOne(() => Season, (season) => season.matches, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    nullable: false,
  })
  @JoinColumn([
    { name: 'seasonId', referencedColumnName: 'id' },
    { name: 'seasonUuid', referencedColumnName: 'uuid' },
  ])
  season: Season;

  @ManyToOne(() => Team, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    nullable: false,
  })
  @JoinColumn([
    { name: 'homeTeamId', referencedColumnName: 'id' },
    { name: 'homeTeamUuid', referencedColumnName: 'uuid' },
  ])
  homeTeam: Team;

  @ManyToOne(() => Team, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    nullable: false,
  })
  @JoinColumn([
    { name: 'awayTeamId', referencedColumnName: 'id' },
    { name: 'awayTeamUuid', referencedColumnName: 'uuid' },
  ])
  awayTeam: Team;

  // --- Timestamps ---
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  get winnerTeamId(): number | null {
    if (
      this.status !== MatchStatus.FINISHED &&
      this.status !== MatchStatus.AWARDED
    ) {
      return null;
    }

    if (this.homeTeamScore === null || this.awayTeamScore === null) {
      return null;
    }

    if (this.homeTeamScore > this.awayTeamScore) {
      return this.homeTeamId;
    }

    if (this.awayTeamScore > this.homeTeamScore) {
      return this.awayTeamId;
    }

    return null;
  }

  get isDraw() {
    return this.homeTeamScore === this.awayTeamScore;
  }
}
