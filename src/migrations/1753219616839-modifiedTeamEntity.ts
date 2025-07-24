import { MigrationInterface, QueryRunner } from "typeorm";

export class ModifiedTeamEntity1753219616839 implements MigrationInterface {
    name = 'ModifiedTeamEntity1753219616839'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`teams\` ADD \`isQueensLeagueTeam\` tinyint NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`teams\` DROP COLUMN \`isQueensLeagueTeam\``);
    }

}
