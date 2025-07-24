import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedQueensLeagueFieldToPlayerEntity1753383640943 implements MigrationInterface {
    name = 'AddedQueensLeagueFieldToPlayerEntity1753383640943'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`players\` ADD \`isQueensLeaguePlayer\` tinyint NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`players\` DROP COLUMN \`isQueensLeaguePlayer\``);
    }

}
