import { Injectable } from '@nestjs/common';

import { assertIsDefinedOrThrow } from 'twenty-shared/utils';

import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type CreateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { WorkspaceNotFoundDefaultError } from 'src/engine/core-modules/workspace/workspace.exception';
import { ErencioNameFormulaService } from 'src/modules/erencio/services/erencio-name-formula.service';

@WorkspaceQueryHook('*.createOne')
@Injectable()
export class ErencioNameFormulaCreateOnePreQueryHook
  implements WorkspacePreQueryHookInstance
{
  constructor(private readonly nameFormulaService: ErencioNameFormulaService) {}

  async execute(
    authContext: AuthContext,
    objectName: string,
    payload: CreateOneResolverArgs,
  ): Promise<CreateOneResolverArgs> {
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

    const computedName = this.nameFormulaService.buildNameFromValues(
      formulaFieldNames,
      payload.data as Record<string, unknown>,
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
