import { MigrationInterface, QueryRunner } from "typeorm";

export class ImprovedPlayerPosition1753338887078 implements MigrationInterface {
    name = 'ImprovedPlayerPosition1753338887078'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`players\` CHANGE \`position\` \`position\` enum ('Portero', 'Portera', 'Defensa Lateral Derecho', 'Defensa Lateral Izquierdo', 'Defensa Central', 'Defensa', 'Volante Izquierdo Extremo', 'Volante Izquierdo', 'Volante Derecho Extremo', 'Volante Derecho', 'Medio Centro Derecho', 'Medio Centro Izquierdo', 'Medio Centro', 'Media Punta', 'Delantero Centro', 'Delantera Centro', 'Delantero Izquierdo', 'Delantero Derecho') NULL`);
        await queryRunner.query(`ALTER TABLE \`players\` CHANGE \`positionAbbreviation\` \`positionAbbreviation\` enum ('PO', 'DFC', 'DFI', 'DFD', 'DF', 'VIE', 'VI', 'VDE', 'VD', 'MC', 'MCD', 'MCI', 'MI', 'MD', 'MP', 'DC', 'DI', 'DD') NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`players\` CHANGE \`positionAbbreviation\` \`positionAbbreviation\` enum ('PO', 'DFC', 'DFI', 'DFD', 'MC', 'MI', 'MD', 'DC') NULL`);
        await queryRunner.query(`ALTER TABLE \`players\` CHANGE \`position\` \`position\` enum ('Portero', 'Portera', 'Defensa', 'Mediocampista', 'Delantero', 'Delantera', 'Defensor', 'Defensa Centro') NULL`);
    }

}
