import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddEdfProfileColumns1772300000000 implements MigrationInterface {
  name = 'AddEdfProfileColumns1772300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // workspace.edfProfileId — which EDF profile the workspace uses (default: eds-v1)
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "edfProfileId" character varying NOT NULL DEFAULT 'eds-v1'`,
    );

    // workspace.edfProfilePolicy — can users override the workspace EDF profile?
    await queryRunner.query(
      `CREATE TYPE "core"."workspace_edfProfilePolicy_enum" AS ENUM('ALLOW_USER_CHOICE', 'FORCE_WORKSPACE')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "edfProfilePolicy" "core"."workspace_edfProfilePolicy_enum" NOT NULL DEFAULT 'ALLOW_USER_CHOICE'`,
    );

    // user.edfProfileId — personal EDF profile override (null = use workspace default)
    await queryRunner.query(
      `ALTER TABLE "core"."user" ADD "edfProfileId" character varying DEFAULT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."user" DROP COLUMN "edfProfileId"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP COLUMN "edfProfilePolicy"`,
    );
    await queryRunner.query(
      `DROP TYPE "core"."workspace_edfProfilePolicy_enum"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP COLUMN "edfProfileId"`,
    );
  }
}
