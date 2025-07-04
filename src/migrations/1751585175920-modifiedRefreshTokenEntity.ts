import { MigrationInterface, QueryRunner } from "typeorm";

export class ModifiedRefreshTokenEntity1751585175920 implements MigrationInterface {
    name = 'ModifiedRefreshTokenEntity1751585175920'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`refresh_tokens\` DROP COLUMN \`token\``);
        await queryRunner.query(`ALTER TABLE \`refresh_tokens\` ADD \`token\` text NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`refresh_tokens\` DROP COLUMN \`token\``);
        await queryRunner.query(`ALTER TABLE \`refresh_tokens\` ADD \`token\` varchar(255) NOT NULL`);
    }

}
