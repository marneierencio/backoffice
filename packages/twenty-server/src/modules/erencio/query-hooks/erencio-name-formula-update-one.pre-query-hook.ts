import { Injectable } from '@nestjs/common';

import { assertIsDefinedOrThrow } from 'twenty-shared/utils';

import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type UpdateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { WorkspaceNotFoundDefaultError } from 'src/engine/core-modules/workspace/workspace.exception';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { ErencioNameFormulaService } from 'src/modules/erencio/services/erencio-name-formula.service';

@WorkspaceQueryHook('*.updateOne')
@Injectable()
export class ErencioNameFormulaUpdateOnePreQueryHook
  implements WorkspacePreQueryHookInstance
{
  constructor(
    private readonly nameFormulaService: ErencioNameFormulaService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async execute(
    authContext: AuthContext,
    objectName: string,
    payload: UpdateOneResolverArgs,
  ): Promise<UpdateOneResolverArgs> {
    const workspace = authContext.workspace;

    assertIsDefinedOrThrow(workspace, WorkspaceNotFoundDefaultError);

    const formulaFieldNames =
      await this.nameFormulaService.getFormulaFieldNames(
        workspace.id,
        objectName,
      );

    if (!formulaFieldNames) {
      return payload;
    }

    // Load current record to fill in formula field values not in the update payload
    const currentRecord = await this.globalWorkspaceOrmManager
      .executeInWorkspaceContext(async () => {
        const repo = await this.globalWorkspaceOrmManager.getRepository<
          Record<string, unknown>
        >(workspace.id, objectName);

        return repo.findOne({ where: { id: payload.id } });
      }, buildSystemAuthContext(workspace.id))
      .catch(() => null);

    const mergedRecord: Record<string, unknown> = {
      ...(currentRecord ?? {}),
      ...(payload.data as Record<string, unknown>),
    };

    const computedName = this.nameFormulaService.buildNameFromValues(
      formulaFieldNames,
      mergedRecord,
    );

    return {
      ...payload,
      data: {
        ...payload.data,
        name: computedName,
      },
    };
  }
}
