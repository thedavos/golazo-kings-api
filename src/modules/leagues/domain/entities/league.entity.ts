import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Generated,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Season } from './season.entity';
import { LeagueStatus } from '@modules/leagues/domain/value-objects/league-status.enum';

@Entity('leagues')
export class League {
  @PrimaryGeneratedColumn('increment')
  id: string;

  @Generated('uuid')
  uuid: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ length: 10 })
  abbr: string;

  @Column()
  country: string;

  @Column()
  city: string;

  @Column({ nullable: true })
  logoUrl: string;

  @Column({ type: 'int', nullable: true })
  foundationYear: number;

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  twitterHandle: string;

  @Column({ nullable: true })
  instagramHandle: string;

  @Column({ type: 'int' })
  numberOfTeams: number;

  @Column({ type: 'text' })
  description: string;

  @Column({ nullable: true })
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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
