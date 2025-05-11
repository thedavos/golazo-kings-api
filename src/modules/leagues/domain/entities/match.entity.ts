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

  @Index() // Indexar por fecha suele ser útil
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

  @Index()
  @Column({ comment: 'FK a la temporada a la que pertenece el partido' })
  seasonId: number;

  @Index()
  @Column({ comment: 'FK al equipo local' })
  homeTeamId: number;

  @Index()
  @Column({ comment: 'FK al equipo visitante' })
  awayTeamId: number;

  @ManyToOne(() => Season, (season) => season.matches, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'seasonId' })
  season: Season;

  @ManyToOne(() => Team, {
    nullable: false,
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'homeTeamId' })
  homeTeam: Team;

  @ManyToOne(
    () => Team,
    /* No añadimos relación inversa en Team */ {
      nullable: false,
      onDelete: 'RESTRICT', // Misma consideración que homeTeam
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'awayTeamId' })
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
