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
import { Team } from '@/modules/teams/domain/entities/team.entity';

@Entity('presidents')
export class President {
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

  @Column({ type: 'varchar', length: 100 })
  nickName: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  nationality: string;

  @Column({ type: 'date' })
  termStartDate: Date;

  @Column({ type: 'date', nullable: true })
  termEndDate: Date | null;

  @Column({ default: true }) // Para identificar fácilmente al presidente actual de la liga
  isActive: boolean;

  @Column({ type: 'varchar', length: 512, nullable: true })
  imageUrl: string;

  @Column()
  teamId: number;

  @Column()
  teamUuid: string;

  @ManyToOne(() => Team, (team) => team.presidents, {
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
