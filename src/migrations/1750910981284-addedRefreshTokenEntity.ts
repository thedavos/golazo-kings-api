import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedRefreshTokenEntity1750910981284 implements MigrationInterface {
    name = 'AddedRefreshTokenEntity1750910981284'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`refresh_tokens\` (\`id\` int NOT NULL AUTO_INCREMENT, \`token\` varchar(255) NOT NULL, \`expiresAt\` datetime NOT NULL, \`revoked\` tinyint NOT NULL DEFAULT 0, \`revokedAt\` datetime NULL, \`userAgent\` varchar(255) NULL, \`ipAddress\` varchar(255) NULL, \`userId\` int NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`isBlocked\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`lastLoginAt\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`failedLoginAttempts\` int NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`refresh_tokens\` ADD CONSTRAINT \`FK_610102b60fea1455310ccd299de\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`refresh_tokens\` DROP FOREIGN KEY \`FK_610102b60fea1455310ccd299de\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`failedLoginAttempts\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`lastLoginAt\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`isBlocked\``);
        await queryRunner.query(`DROP TABLE \`refresh_tokens\``);
    }

}
