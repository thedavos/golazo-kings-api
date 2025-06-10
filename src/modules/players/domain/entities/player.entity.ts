import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Generated,
  PrimaryColumn,
} from 'typeorm';
import { Team } from '@/modules/teams/domain/entities/team.entity'; // Ajusta la ruta
import {
  PlayerPosition,
  PlayerPositionAbbreviation,
} from '@/modules/players/domain/value-objects/player-position.enum';

@Entity('players')
export class Player {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @PrimaryColumn({ unique: true })
  @Generated('uuid')
  uuid: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Column({
    type: 'enum',
    enum: PlayerPosition,
    nullable: true,
  })
  position: PlayerPosition;

  @Column({
    type: 'enum',
    enum: PlayerPositionAbbreviation,
    nullable: true,
  })
  positionAbbreviation: PlayerPositionAbbreviation;

  @Column({ type: 'int', nullable: true })
  jerseyNumber: number;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  nationality: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  imageUrl: string;

  @Column({ type: 'int' })
  teamId: number;

  @Column()
  teamUuid: string;

  @ManyToOne(() => Team, (team) => team.players, {
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

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
