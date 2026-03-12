import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class RenameEdsToBackofficeFrontendEnums1772200000000
  implements MigrationInterface
{
  name = 'RenameEdsToBackofficeFrontendEnums1772200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Rename FrontendPreference enum value: EDS → BACKOFFICE
    await queryRunner.query(
      `ALTER TYPE "core"."user_frontendPreference_enum" RENAME VALUE 'EDS' TO 'BACKOFFICE'`,
    );

    // Rename FrontendPolicy enum value: FORCE_EDS → FORCE_BACKOFFICE
    await queryRunner.query(
      `ALTER TYPE "core"."workspace_frontendPolicy_enum" RENAME VALUE 'FORCE_EDS' TO 'FORCE_BACKOFFICE'`,
    );

    // Rename feature flag key in all workspaces: IS_EDS_ENABLED → IS_BACKOFFICE_ENABLED
    await queryRunner.query(
      `UPDATE "core"."featureFlag" SET "key" = 'IS_BACKOFFICE_ENABLED' WHERE "key" = 'IS_EDS_ENABLED'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert feature flag key rename
    await queryRunner.query(
      `UPDATE "core"."featureFlag" SET "key" = 'IS_EDS_ENABLED' WHERE "key" = 'IS_BACKOFFICE_ENABLED'`,
    );

    // Revert: BACKOFFICE → EDS
    await queryRunner.query(
      `ALTER TYPE "core"."user_frontendPreference_enum" RENAME VALUE 'BACKOFFICE' TO 'EDS'`,
    );

    // Revert: FORCE_BACKOFFICE → FORCE_EDS
    await queryRunner.query(
      `ALTER TYPE "core"."workspace_frontendPolicy_enum" RENAME VALUE 'FORCE_BACKOFFICE' TO 'FORCE_EDS'`,
    );
  }
}
