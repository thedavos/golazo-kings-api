import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Generated,
  PrimaryColumn,
} from 'typeorm';
import { League } from '@/modules/leagues/domain/entities/league.entity';
import { Standing } from '@/modules/leagues/domain/entities/standing.entity';
import { Match } from '@/modules/leagues/domain/entities/match.entity';
import { SeasonStatus } from '@/modules/leagues/domain/value-objects/season-status.enum';

@Entity('seasons')
export class Season {
  @PrimaryGeneratedColumn('increment', { type: 'int' })
  id: number;

  @PrimaryColumn({ type: 'varchar', length: 36, unique: true })
  @Generated('uuid')
  uuid: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({
    type: 'enum',
    enum: SeasonStatus,
    default: SeasonStatus.PLANNED,
  })
  status: SeasonStatus;

  @Column({ type: 'boolean', default: false })
  isCurrent: boolean;

  @Column()
  leagueId: number;

  @Column()
  leagueUuid: string;

  @ManyToOne(() => League, (league) => league.seasons, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    nullable: false,
  })
  @JoinColumn([
    { name: 'leagueId', referencedColumnName: 'id' },
    { name: 'leagueUuid', referencedColumnName: 'uuid' },
  ])
  league: League;

  @OneToMany(() => Standing, (standing) => standing.season)
  standings: Standing[];

  @OneToMany(() => Match, (match) => match.season)
  matches: Match[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  get isActive(): boolean {
    return this.status === SeasonStatus.ONGOING;
  }

  get isFinished(): boolean {
    return this.status === SeasonStatus.FINISHED;
  }

  get isPlanned(): boolean {
    return this.status === SeasonStatus.PLANNED;
  }

  get daysUntilStart(): number {
    const today = new Date();
    const start = new Date(this.startDate);
    const diffTime = start.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get daysUntilEnd(): number {
    const today = new Date();
    const end = new Date(this.endDate);
    const diffTime = end.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get duration(): number {
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    const diffTime = end.getTime() - start.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
