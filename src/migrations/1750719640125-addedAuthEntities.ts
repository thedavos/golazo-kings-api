import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddedAuthEntities1750719640125 implements MigrationInterface {
  name = 'AddedAuthEntities1750719640125';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`roles\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` enum ('SUPER_ADMIN', 'LEAGUE_MANAGER', 'TEAM_MANAGER', 'CONTENT_EDITOR', 'VIEWER') NOT NULL, \`permissions\` text NULL, \`description\` varchar(255) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_648e3f5447f725579d7d4ffdfb\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`users\` (\`id\` int NOT NULL AUTO_INCREMENT, \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`managedTeamId\` int NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`users_roles\` (\`user_id\` int NOT NULL, \`role_id\` int NOT NULL, INDEX \`IDX_e4435209df12bc1f001e536017\` (\`user_id\`), INDEX \`IDX_1cf664021f00b9cc1ff95e17de\` (\`role_id\`), PRIMARY KEY (\`user_id\`, \`role_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users_roles\` ADD CONSTRAINT \`FK_e4435209df12bc1f001e5360174\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users_roles\` ADD CONSTRAINT \`FK_1cf664021f00b9cc1ff95e17de4\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`users_roles\` DROP FOREIGN KEY \`FK_1cf664021f00b9cc1ff95e17de4\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`users_roles\` DROP FOREIGN KEY \`FK_e4435209df12bc1f001e5360174\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_1cf664021f00b9cc1ff95e17de\` ON \`users_roles\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_e4435209df12bc1f001e536017\` ON \`users_roles\``,
    );
    await queryRunner.query(`DROP TABLE \`users_roles\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``,
    );
    await queryRunner.query(`DROP TABLE \`users\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_648e3f5447f725579d7d4ffdfb\` ON \`roles\``,
    );
    await queryRunner.query(`DROP TABLE \`roles\``);
  }
}
