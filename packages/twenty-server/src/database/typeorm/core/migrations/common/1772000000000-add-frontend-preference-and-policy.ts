import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddFrontendPreferenceAndPolicy1772000000000
  implements MigrationInterface
{
  name = 'AddFrontendPreferenceAndPolicy1772000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "core"."user_frontendPreference_enum" AS ENUM('TWENTY', 'SFDS2')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."user" ADD "frontendPreference" "core"."user_frontendPreference_enum" NOT NULL DEFAULT 'TWENTY'`,
    );

    await queryRunner.query(
      `CREATE TYPE "core"."workspace_frontendPolicy_enum" AS ENUM('ALLOW_USER_CHOICE', 'FORCE_TWENTY', 'FORCE_SFDS2')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "frontendPolicy" "core"."workspace_frontendPolicy_enum" NOT NULL DEFAULT 'ALLOW_USER_CHOICE'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP COLUMN "frontendPolicy"`,
    );
    await queryRunner.query(
      `DROP TYPE "core"."workspace_frontendPolicy_enum"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."user" DROP COLUMN "frontendPreference"`,
    );
    await queryRunner.query(
      `DROP TYPE "core"."user_frontendPreference_enum"`,
    );
  }
}
