import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class RenameSfds2ToEdsFrontendEnums1772100000000
  implements MigrationInterface
{
  name = 'RenameSfds2ToEdsFrontendEnums1772100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Rename FrontendPreference enum value: SFDS2 → EDS
    await queryRunner.query(
      `ALTER TYPE "core"."user_frontendPreference_enum" RENAME VALUE 'SFDS2' TO 'EDS'`,
    );

    // Rename FrontendPolicy enum value: FORCE_SFDS2 → FORCE_EDS
    await queryRunner.query(
      `ALTER TYPE "core"."workspace_frontendPolicy_enum" RENAME VALUE 'FORCE_SFDS2' TO 'FORCE_EDS'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert: EDS → SFDS2
    await queryRunner.query(
      `ALTER TYPE "core"."user_frontendPreference_enum" RENAME VALUE 'EDS' TO 'SFDS2'`,
    );

    // Revert: FORCE_EDS → FORCE_SFDS2
    await queryRunner.query(
      `ALTER TYPE "core"."workspace_frontendPolicy_enum" RENAME VALUE 'FORCE_EDS' TO 'FORCE_SFDS2'`,
    );
  }
}
