import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedPlayerEntities1751742586002 implements MigrationInterface {
    name = 'AddedPlayerEntities1751742586002'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`player_stats\` (\`id\` int NOT NULL AUTO_INCREMENT, \`playerId\` int NOT NULL, \`seasonId\` int NOT NULL, \`matchesPlayed\` int NOT NULL DEFAULT '0', \`goals\` int NOT NULL DEFAULT '0', \`assists\` int NOT NULL DEFAULT '0', \`yellowCards\` int NOT NULL DEFAULT '0', \`redCards\` int NOT NULL DEFAULT '0', \`minutesPlayed\` int NOT NULL DEFAULT '0', \`averageRating\` decimal(3,2) NULL, \`playerUuid\` varchar(255) NULL, \`seasonUuid\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`match_player_stats\` (\`id\` int NOT NULL AUTO_INCREMENT, \`playerId\` int NOT NULL, \`matchId\` int NOT NULL, \`yellowCards\` int NOT NULL DEFAULT '0', \`redCards\` int NOT NULL DEFAULT '0', \`minutesPlayed\` int NOT NULL DEFAULT '0', \`wasStarter\` tinyint NOT NULL DEFAULT 0, \`rating\` decimal(3,2) NULL, \`isMvp\` tinyint NOT NULL DEFAULT 0, \`foulsCommitted\` int NOT NULL DEFAULT '0', \`foulsReceived\` int NOT NULL DEFAULT '0', \`saves\` int NOT NULL DEFAULT '0', \`shotsOnTarget\` int NOT NULL DEFAULT '0', \`shotsOffTarget\` int NOT NULL DEFAULT '0', \`playedIn1vs1Initial\` tinyint NOT NULL DEFAULT 0, \`goalsIn1vs1Initial\` int NOT NULL DEFAULT '0', \`savesIn1vs1Initial\` int NOT NULL DEFAULT '0', \`entryMinute\` int NOT NULL DEFAULT '0', \`goalsInScaling\` int NOT NULL DEFAULT '0', \`assistsInScaling\` int NOT NULL DEFAULT '0', \`goalsInFirst7vs7\` int NOT NULL DEFAULT '0', \`assistsInFirst7vs7\` int NOT NULL DEFAULT '0', \`playedInDicePhase\` tinyint NOT NULL DEFAULT 0, \`dicePhaseMode\` varchar(20) NULL, \`goalsInDicePhase\` int NOT NULL DEFAULT '0', \`assistsInDicePhase\` int NOT NULL DEFAULT '0', \`savesInDicePhase\` int NOT NULL DEFAULT '0', \`goalsInSecond7vs7\` int NOT NULL DEFAULT '0', \`assistsInSecond7vs7\` int NOT NULL DEFAULT '0', \`playedInFinalPhase\` tinyint NOT NULL DEFAULT 0, \`finalPhaseMode\` varchar(20) NULL, \`goalsInFinalPhase\` int NOT NULL DEFAULT '0', \`assistsInFinalPhase\` int NOT NULL DEFAULT '0', \`scoredDoubleGoal\` tinyint NOT NULL DEFAULT 0, \`scoredGoldenGoal\` tinyint NOT NULL DEFAULT 0, \`penaltyShootoutGoals\` int NOT NULL DEFAULT '0', \`penaltyShootoutMisses\` int NOT NULL DEFAULT '0', \`penaltyShootoutSaves\` int NOT NULL DEFAULT '0', \`participatedInPenaltyShootout\` tinyint NOT NULL DEFAULT 0, \`scoredDecisivePenalty\` tinyint NOT NULL DEFAULT 0, \`missedDecisivePenalty\` tinyint NOT NULL DEFAULT 0, \`savedDecisivePenalty\` tinyint NOT NULL DEFAULT 0, \`secretWeaponPenaltyGoals\` int NOT NULL DEFAULT '0', \`secretWeaponPenaltyMisses\` int NOT NULL DEFAULT '0', \`secretWeaponPenaltyShootoutUsed\` tinyint NOT NULL DEFAULT 0, \`secretWeaponDoubleGoalUsed\` tinyint NOT NULL DEFAULT 0, \`secretWeaponDoubleGoalScored\` int NOT NULL DEFAULT '0', \`secretWeaponStarPlayerUsed\` tinyint NOT NULL DEFAULT 0, \`secretWeaponStarPlayerGoals\` int NOT NULL DEFAULT '0', \`secretWeaponActivated\` varchar(50) NULL, \`wasSubstitutedByPresident\` tinyint NOT NULL DEFAULT 0, \`substitutionMinute\` int NULL, \`playerUuid\` varchar(255) NULL, \`matchUuid\` varchar(255) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`players\` DROP COLUMN \`dateOfBirth\``);
        await queryRunner.query(`ALTER TABLE \`players\` DROP COLUMN \`imageUrl\``);
        await queryRunner.query(`ALTER TABLE \`seasons\` ADD \`isCurrent\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`players\` ADD \`nickname\` varchar(100) NULL`);
        await queryRunner.query(`ALTER TABLE \`players\` ADD \`height\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`players\` ADD \`weight\` decimal(5,2) NULL`);
        await queryRunner.query(`ALTER TABLE \`players\` ADD \`isActive\` tinyint NOT NULL DEFAULT 1`);
        await queryRunner.query(`ALTER TABLE \`players\` ADD \`marketValue\` decimal(10,2) NULL`);
        await queryRunner.query(`ALTER TABLE \`players\` ADD \`profileImageUrl\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`players\` ADD \`preferredFoot\` enum ('Right', 'Left', 'Both') NULL`);
        await queryRunner.query(`ALTER TABLE \`players\` ADD \`birthDate\` date NULL`);
        await queryRunner.query(`ALTER TABLE \`players\` ADD \`socialMediaHandle\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`players\` ADD \`isWildCard\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`players\` ADD \`wildCardType\` enum ('streamer', 'special_guest', 'influencer', 'legend', 'first_division', 'second_division', 'regular') NULL`);
        await queryRunner.query(`ALTER TABLE \`players\` ADD \`wildCardDescription\` varchar(200) NULL`);
        await queryRunner.query(`ALTER TABLE \`players\` ADD \`formerTeam\` varchar(100) NULL`);
        await queryRunner.query(`ALTER TABLE \`players\` ADD \`referenceId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`players\` ADD \`referenceUrl\` varchar(50) NULL`);
        await queryRunner.query(`ALTER TABLE \`teams\` ADD \`referenceId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`teams\` ADD \`referenceUrl\` varchar(50) NULL`);
        await queryRunner.query(`ALTER TABLE \`seasons\` CHANGE \`status\` \`status\` enum ('Planned', 'Ongoing', 'Completed', 'Cancelled', 'Finished') NOT NULL DEFAULT 'Planned'`);
        await queryRunner.query(`ALTER TABLE \`player_stats\` ADD CONSTRAINT \`FK_e62ff6895d1e5106209444b99bd\` FOREIGN KEY (\`playerId\`, \`playerUuid\`) REFERENCES \`players\`(\`id\`,\`uuid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`player_stats\` ADD CONSTRAINT \`FK_7875c0fb2afbacc5d4d191b3676\` FOREIGN KEY (\`seasonId\`, \`seasonUuid\`) REFERENCES \`seasons\`(\`id\`,\`uuid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`match_player_stats\` ADD CONSTRAINT \`FK_306b97b9cb033d8b514082989df\` FOREIGN KEY (\`playerId\`, \`playerUuid\`) REFERENCES \`players\`(\`id\`,\`uuid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`match_player_stats\` ADD CONSTRAINT \`FK_396db87f0a890f961a38ae684a9\` FOREIGN KEY (\`matchId\`, \`matchUuid\`) REFERENCES \`matches\`(\`id\`,\`uuid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`match_player_stats\` DROP FOREIGN KEY \`FK_396db87f0a890f961a38ae684a9\``);
        await queryRunner.query(`ALTER TABLE \`match_player_stats\` DROP FOREIGN KEY \`FK_306b97b9cb033d8b514082989df\``);
        await queryRunner.query(`ALTER TABLE \`player_stats\` DROP FOREIGN KEY \`FK_7875c0fb2afbacc5d4d191b3676\``);
        await queryRunner.query(`ALTER TABLE \`player_stats\` DROP FOREIGN KEY \`FK_e62ff6895d1e5106209444b99bd\``);
        await queryRunner.query(`ALTER TABLE \`seasons\` CHANGE \`status\` \`status\` enum ('Planned', 'Ongoing', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Planned'`);
        await queryRunner.query(`ALTER TABLE \`teams\` DROP COLUMN \`referenceUrl\``);
        await queryRunner.query(`ALTER TABLE \`teams\` DROP COLUMN \`referenceId\``);
        await queryRunner.query(`ALTER TABLE \`players\` DROP COLUMN \`referenceUrl\``);
        await queryRunner.query(`ALTER TABLE \`players\` DROP COLUMN \`referenceId\``);
        await queryRunner.query(`ALTER TABLE \`players\` DROP COLUMN \`formerTeam\``);
        await queryRunner.query(`ALTER TABLE \`players\` DROP COLUMN \`wildCardDescription\``);
        await queryRunner.query(`ALTER TABLE \`players\` DROP COLUMN \`wildCardType\``);
        await queryRunner.query(`ALTER TABLE \`players\` DROP COLUMN \`isWildCard\``);
        await queryRunner.query(`ALTER TABLE \`players\` DROP COLUMN \`socialMediaHandle\``);
        await queryRunner.query(`ALTER TABLE \`players\` DROP COLUMN \`birthDate\``);
        await queryRunner.query(`ALTER TABLE \`players\` DROP COLUMN \`preferredFoot\``);
        await queryRunner.query(`ALTER TABLE \`players\` DROP COLUMN \`profileImageUrl\``);
        await queryRunner.query(`ALTER TABLE \`players\` DROP COLUMN \`marketValue\``);
        await queryRunner.query(`ALTER TABLE \`players\` DROP COLUMN \`isActive\``);
        await queryRunner.query(`ALTER TABLE \`players\` DROP COLUMN \`weight\``);
        await queryRunner.query(`ALTER TABLE \`players\` DROP COLUMN \`height\``);
        await queryRunner.query(`ALTER TABLE \`players\` DROP COLUMN \`nickname\``);
        await queryRunner.query(`ALTER TABLE \`seasons\` DROP COLUMN \`isCurrent\``);
        await queryRunner.query(`ALTER TABLE \`players\` ADD \`imageUrl\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`players\` ADD \`dateOfBirth\` date NULL`);
        await queryRunner.query(`DROP TABLE \`match_player_stats\``);
        await queryRunner.query(`DROP TABLE \`player_stats\``);
    }

}
