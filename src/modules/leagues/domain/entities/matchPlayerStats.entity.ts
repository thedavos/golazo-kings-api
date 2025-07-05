import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Player } from '@modules/players/domain/entities/player.entity';
import { Match } from '@modules/leagues/domain/entities/match.entity';

@Entity('match_player_stats')
export class MatchPlayerStats {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  playerId: number;

  @Column()
  matchId: number;

  @Column({ type: 'int', default: 0 })
  yellowCards: number;

  @Column({ type: 'int', default: 0 })
  redCards: number;

  @Column({ type: 'int', default: 0 })
  minutesPlayed: number;

  @Column({ type: 'boolean', default: false })
  wasStarter: boolean;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  rating: number;

  @Column({ type: 'boolean', default: false })
  isMvp: boolean;

  // ====== CAMPOS BÁSICOS ======
  @Column({ type: 'int', default: 0 })
  foulsCommitted: number;

  @Column({ type: 'int', default: 0 })
  foulsReceived: number;

  @Column({ type: 'int', default: 0 })
  saves: number;

  @Column({ type: 'int', default: 0 })
  shotsOnTarget: number;

  @Column({ type: 'int', default: 0 })
  shotsOffTarget: number;

  // ====== FASES ESPECÍFICAS DE KINGS LEAGUE ======

  // 1vs1 INICIAL (Minuto 1)
  @Column({ type: 'boolean', default: false })
  playedIn1vs1Initial: boolean;

  @Column({ type: 'int', default: 0 })
  goalsIn1vs1Initial: number;

  @Column({ type: 'int', default: 0 })
  savesIn1vs1Initial: number;

  // ESCALADO (Minutos 2-7)
  @Column({ type: 'int', default: 0 })
  entryMinute: number;

  @Column({ type: 'int', default: 0 })
  goalsInScaling: number;

  @Column({ type: 'int', default: 0 })
  assistsInScaling: number;

  // 7vs7 PRIMERA FASE (Minutos 8-18)
  @Column({ type: 'int', default: 0 })
  goalsInFirst7vs7: number;

  @Column({ type: 'int', default: 0 })
  assistsInFirst7vs7: number;

  // FASE DEL DADO (Minutos 18-20)
  @Column({ type: 'boolean', default: false })
  playedInDicePhase: boolean;

  @Column({ type: 'varchar', length: 20, nullable: true })
  dicePhaseMode: string;

  @Column({ type: 'int', default: 0 })
  goalsInDicePhase: number;

  @Column({ type: 'int', default: 0 })
  assistsInDicePhase: number;

  @Column({ type: 'int', default: 0 })
  savesInDicePhase: number;

  // 7vs7 SEGUNDA FASE (Minutos 20-38)
  @Column({ type: 'int', default: 0 })
  goalsInSecond7vs7: number;

  @Column({ type: 'int', default: 0 })
  assistsInSecond7vs7: number;

  // FASE FINAL (Minutos 38-40)
  @Column({ type: 'boolean', default: false })
  playedInFinalPhase: boolean;

  @Column({ type: 'varchar', length: 20, nullable: true })
  finalPhaseMode: string;

  @Column({ type: 'int', default: 0 })
  goalsInFinalPhase: number;

  @Column({ type: 'int', default: 0 })
  assistsInFinalPhase: number;

  @Column({ type: 'boolean', default: false })
  scoredDoubleGoal: boolean;

  @Column({ type: 'boolean', default: false })
  scoredGoldenGoal: boolean;

  // ====== PENALTY SHOOTOUT ======
  @Column({ type: 'int', default: 0 })
  penaltyShootoutGoals: number;

  @Column({ type: 'int', default: 0 })
  penaltyShootoutMisses: number;

  @Column({ type: 'int', default: 0 })
  penaltyShootoutSaves: number;

  @Column({ type: 'boolean', default: false })
  participatedInPenaltyShootout: boolean;

  @Column({ type: 'boolean', default: false })
  scoredDecisivePenalty: boolean;

  @Column({ type: 'boolean', default: false })
  missedDecisivePenalty: boolean;

  @Column({ type: 'boolean', default: false })
  savedDecisivePenalty: boolean;

  // ====== ARMAS SECRETAS ======

  // PENALTY como arma secreta
  @Column({ type: 'int', default: 0 })
  secretWeaponPenaltyGoals: number;

  @Column({ type: 'int', default: 0 })
  secretWeaponPenaltyMisses: number;

  // PENALTY SHOOTOUT como arma secreta (otorga una tanda completa)
  @Column({ type: 'boolean', default: false })
  secretWeaponPenaltyShootoutUsed: boolean;

  // GOL DOBLE como arma secreta
  @Column({ type: 'boolean', default: false })
  secretWeaponDoubleGoalUsed: boolean;

  @Column({ type: 'int', default: 0 })
  secretWeaponDoubleGoalScored: number; // Goles que contaron doble

  // JUGADOR ESTRELLA como arma secreta
  @Column({ type: 'boolean', default: false })
  secretWeaponStarPlayerUsed: boolean;

  @Column({ type: 'int', default: 0 })
  secretWeaponStarPlayerGoals: number; // Goles que contaron doble por ser estrella

  // Campo general para tracking
  @Column({ type: 'varchar', length: 50, nullable: true })
  secretWeaponActivated: string; // 'penalty', 'penalty_shootout', 'double_goal', 'star_player'

  // ====== SUSTITUCIONES ESPECIALES ======
  @Column({ type: 'boolean', default: false })
  wasSubstitutedByPresident: boolean;

  @Column({ type: 'int', nullable: true })
  substitutionMinute: number;

  // Relaciones
  @ManyToOne(() => Player)
  player: Player;

  @ManyToOne(() => Match)
  match: Match;

  // ====== GETTERS PARA TOTALES ======
  get goals(): number {
    return (
      this.goalsIn1vs1Initial +
      this.goalsInScaling +
      this.goalsInFirst7vs7 +
      this.goalsInDicePhase +
      this.goalsInSecond7vs7 +
      this.goalsInFinalPhase +
      this.secretWeaponPenaltyGoals +
      this.penaltyShootoutGoals
    );
  }

  get assists(): number {
    return (
      this.assistsInScaling +
      this.assistsInFirst7vs7 +
      this.assistsInDicePhase +
      this.assistsInSecond7vs7 +
      this.assistsInFinalPhase
    );
  }

  get totalSaves(): number {
    return (
      this.savesIn1vs1Initial +
      this.savesInDicePhase +
      this.saves +
      this.penaltyShootoutSaves
    );
  }

  // ====== GETTERS PARA ARMAS SECRETAS ======
  get totalSecretWeaponGoals(): number {
    return (
      this.secretWeaponPenaltyGoals +
      this.secretWeaponDoubleGoalScored +
      this.secretWeaponStarPlayerGoals
    );
  }

  get totalDoubleValueGoals(): number {
    // Goles que valieron doble (arma secreta + fase final)
    return (
      this.secretWeaponDoubleGoalScored +
      this.secretWeaponStarPlayerGoals +
      (this.scoredDoubleGoal ? this.goalsInFinalPhase : 0)
    );
  }

  get effectiveGoalContribution(): number {
    // Contribución real considerando goles dobles
    const regularGoals =
      this.goals -
      this.secretWeaponDoubleGoalScored -
      this.secretWeaponStarPlayerGoals;
    const doubleGoals =
      this.secretWeaponDoubleGoalScored + this.secretWeaponStarPlayerGoals;
    const finalPhaseDoubleGoals = this.scoredDoubleGoal
      ? this.goalsInFinalPhase
      : 0;

    return regularGoals + doubleGoals * 2 + finalPhaseDoubleGoals * 2;
  }

  get hasUsedSecretWeapon(): boolean {
    return this.secretWeaponActivated !== null;
  }

  // ====== GETTERS ADICIONALES ======
  get playedFullMatch(): boolean {
    return this.entryMinute <= 7 && this.substitutionMinute === null;
  }

  get wasImpactPlayer(): boolean {
    return (
      this.scoredDoubleGoal ||
      this.scoredGoldenGoal ||
      this.scoredDecisivePenalty ||
      this.savedDecisivePenalty ||
      this.hasUsedSecretWeapon
    );
  }

  get shotAccuracy(): number {
    const totalShots = this.shotsOnTarget + this.shotsOffTarget;
    if (totalShots === 0) return 0;
    return (this.shotsOnTarget / totalShots) * 100;
  }
}
