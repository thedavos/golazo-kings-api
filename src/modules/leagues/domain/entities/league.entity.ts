import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  Generated,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Season } from '@/modules/leagues/domain/entities/season.entity';
import { Team } from '@/modules/teams/domain/entities/team.entity';
import { LeagueStatus } from '@modules/leagues/domain/value-objects/league-status.enum';

@Entity('leagues')
export class League {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @PrimaryColumn({ unique: true })
  @Generated('uuid')
  uuid: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({ type: 'varchar', length: 10 })
  abbr: string;

  @Column({ type: 'varchar', length: 100 })
  country: string;

  @Column({ type: 'varchar', length: 100 })
  city: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  logoUrl: string;

  @Column({ type: 'int', nullable: true })
  foundationYear: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  website: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  twitterHandle: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  instagramHandle: string;

  @Column({ type: 'int', default: 0 })
  numberOfTeams: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  rules: string;

  @Column({
    type: 'enum',
    enum: LeagueStatus,
    default: LeagueStatus.DRAFT,
  })
  status: LeagueStatus;

  @Column({ default: false })
  isActive: boolean;

  @Column({ default: true })
  isVisible: boolean;

  @OneToMany(() => Season, (season) => season.league)
  seasons: Season[];

  @OneToMany(() => Team, (team) => team.league)
  teams: Team[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  get isQueens() {
    return this.name.toLowerCase().includes('queens');
  }
}
