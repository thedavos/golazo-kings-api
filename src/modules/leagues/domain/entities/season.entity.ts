import {
  Column,
  Entity,
  // OneToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { League } from './league.entity';

@Entity('seasons')
export class Season {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @ManyToOne(() => League, (league) => league.seasons)
  league: League;
  //
  // @OneToMany(() => Standing, (standing) => standing.season)
  // standings: Standing[];
}
