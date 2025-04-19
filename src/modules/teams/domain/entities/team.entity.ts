import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
  Generated,
} from 'typeorm';
import { League } from '@modules/leagues/domain/entities/league.entity';
import { Standing } from '@/modules/leagues/domain/entities/standing.entity';
import { Player } from '@/modules/players/domain/entities/player.entity';
import { President } from '@/modules/presidents/domain/entities/president.entity';

@Entity('teams')
export class Team {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'uuid', unique: true })
  @Generated('uuid')
  uuid: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  abbr: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  logoUrl: string;

  @Column({ type: 'varchar', length: 255 })
  city: string;

  @Column({ type: 'varchar', length: 255 })
  country: string;

  @Column({ type: 'int', nullable: true })
  foundationYear: number;

  @Column({ type: 'text', nullable: true })
  venue: string;

  @Index()
  @Column()
  leagueId: number;

  @ManyToOne(() => League, (league) => league, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'leagueId' })
  league: League;

  @OneToMany(() => Player, (player) => player.team) // Relación con Player
  players: Player[];

  @OneToMany(() => President, (president) => president.team)
  presidents: President[];

  @OneToMany(() => Standing, (standing) => standing.team) // Relación inversa con Standing
  standings: Standing[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
