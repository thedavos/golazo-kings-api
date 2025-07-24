import { MigrationInterface, QueryRunner } from "typeorm";

export class ModifiedPlayerPosition1753337330672 implements MigrationInterface {
    name = 'ModifiedPlayerPosition1753337330672'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`players\` CHANGE \`position\` \`position\` enum ('Portero', 'Portera', 'Defensa', 'Mediocampista', 'Delantero', 'Delantera', 'Defensor', 'Defensa Centro') NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`players\` CHANGE \`position\` \`position\` enum ('Portero', 'Defensa', 'Mediocampista', 'Delantero') NULL`);
    }

}
