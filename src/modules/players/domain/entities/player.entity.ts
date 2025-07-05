import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Team } from '@/modules/teams/domain/entities/team.entity';
import { PlayerStats } from '@modules/players/domain/entities/playerStats.entity';
import { MatchPlayerStats } from '@modules/leagues/domain/entities/matchPlayerStats.entity';
import {
  PlayerPosition,
  PlayerPositionAbbreviation,
} from '@/modules/players/domain/value-objects/player-position.enum';
import { PlayerPreferredFoot } from '@modules/players/domain/value-objects/player-preferred-foot.enum';
import { PlayerWildcardType } from '@modules/players/domain/value-objects/player-wildcard-type.enum';

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

  @Column({ type: 'varchar', length: 100, nullable: true })
  nickname: string;

  @Column({ type: 'int', nullable: true })
  height: number; // En metros

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  weight: number; // En kg

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  marketValue: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  profileImageUrl: string;

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

  @Column({ type: 'enum', enum: PlayerPreferredFoot, nullable: true })
  preferredFoot: PlayerPreferredFoot;

  @Column({ type: 'int', nullable: true })
  jerseyNumber: number;

  @Column({ type: 'date', nullable: true })
  birthDate: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  nationality: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  socialMediaHandle: string;

  @Column({ type: 'boolean', default: false })
  isWildCard: boolean;

  @Column({
    type: 'enum',
    enum: PlayerWildcardType,
    nullable: true,
  })
  wildCardType: PlayerWildcardType;

  @Column({ type: 'varchar', length: 200, nullable: true })
  wildCardDescription: string; // Descripción adicional para WildCards

  @Column({ type: 'varchar', length: 100, nullable: true })
  formerTeam: string; // Para jugadores de primera/segunda división

  @Column({ type: 'int', nullable: true })
  referenceId: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  referenceUrl: string;

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

  @OneToMany(() => PlayerStats, (stats) => stats.player)
  seasonStats: PlayerStats[];

  @OneToMany(() => MatchPlayerStats, (stats) => stats.player)
  matchStats: MatchPlayerStats[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  get displayName(): string {
    return this.nickname || this.fullName;
  }

  get age(): number | null {
    if (!this.birthDate) return null;
    const today = new Date();
    const birthDate = new Date(this.birthDate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  get bmi(): number | null {
    if (!this.height || !this.weight) return null;
    return this.weight / (this.height * this.height);
  }

  // ====== GETTERS ESPECÍFICOS PARA KINGS LEAGUE ======
  get isDraftPlayer(): boolean {
    return !this.isWildCard;
  }

  get isSpecialGuest(): boolean {
    return (
      this.isWildCard && this.wildCardType === PlayerWildcardType.SPECIAL_GUEST
    );
  }

  get isStreamer(): boolean {
    return this.isWildCard && this.wildCardType === PlayerWildcardType.STREAMER;
  }

  get isInfluencer(): boolean {
    return (
      this.isWildCard && this.wildCardType === PlayerWildcardType.INFLUENCER
    );
  }

  get isLegendPlayer() {
    return this.isWildCard && this.wildCardType === PlayerWildcardType.LEGEND;
  }

  get isFirstDivisionPlayer(): boolean {
    return (
      this.isWildCard && this.wildCardType === PlayerWildcardType.FIRST_DIVISION
    );
  }

  get isSecondDivisionPlayer(): boolean {
    return (
      this.isWildCard &&
      this.wildCardType === PlayerWildcardType.SECOND_DIVISION
    );
  }

  get isRegularWildCard(): boolean {
    return this.isWildCard && this.wildCardType === PlayerWildcardType.REGULAR;
  }

  get isContentCreator(): boolean {
    return this.isStreamer || this.isInfluencer;
  }

  get playerCategory(): string {
    if (this.isDraftPlayer) {
      return 'Draft';
    }

    return 'WildCard';
  }

  get hasSpecialBackground(): boolean {
    return (
      this.isFirstDivisionPlayer ||
      this.isSecondDivisionPlayer ||
      this.isLegendPlayer ||
      this.isContentCreator
    );
  }

  get mvps(): number {
    return this.matchStats.filter((stat) => stat.isMvp).length;
  }

  get currentSeasonRating(): number | null {
    const currentSeason = this.seasonStats.find(
      (stat) => stat.season.isCurrent,
    );
    return currentSeason?.averageRating || null;
  }

  get careerRating(): number | null {
    const allRatings = this.seasonStats
      .filter((stat) => stat.averageRating !== null)
      .map((stat) => stat.averageRating);

    if (allRatings.length === 0) return null;

    return (
      allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length
    );
  }

  get bestSeasonRating(): number | null {
    const ratings = this.seasonStats
      .filter((stat) => stat.averageRating !== null)
      .map((stat) => stat.averageRating);

    return ratings.length > 0 ? Math.max(...ratings) : null;
  }
}
