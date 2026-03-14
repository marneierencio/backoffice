import { assertIsDefinedOrThrow } from 'twenty-shared/utils';

import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type CreateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { WorkspaceNotFoundDefaultError } from 'src/engine/core-modules/workspace/workspace.exception';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';

// Custom objects that receive a sequential numeric ID auto-generated on creation.
// The value is written to the `name` field (the primary display field in Twenty),
// which is labelled "Id" in the UI for these objects.
const AUTO_ID_OBJECTS = ['contato', 'candidaturaCuidador'] as const;

type AutoIdObject = (typeof AUTO_ID_OBJECTS)[number];

function isAutoIdObject(name: string): name is AutoIdObject {
  return (AUTO_ID_OBJECTS as readonly string[]).includes(name);
}

@WorkspaceQueryHook('*.createOne')
export class ErencioAutoIdCreateOnePreQueryHook
  implements WorkspacePreQueryHookInstance
{
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async execute(
    authContext: AuthContext,
    objectName: string,
    payload: CreateOneResolverArgs,
  ): Promise<CreateOneResolverArgs> {
    if (!isAutoIdObject(objectName)) {
      return payload;
    }

    const workspace = authContext.workspace;

    assertIsDefinedOrThrow(workspace, WorkspaceNotFoundDefaultError);

    // Use COUNT to determine the next sequential ID.
    // For practical purposes (low-volume, append-only objects) this is sufficient.
    const nextId =
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        async () => {
          const repo = await this.globalWorkspaceOrmManager.getRepository<{
            name: string | null;
          }>(workspace.id, objectName);

          const count = await repo.count();

          return count + 1;
        },
        buildSystemAuthContext(workspace.id),
      );

    return {
      ...payload,
      data: {
        ...payload.data,
        name: String(nextId).padStart(5, '0'),
      },
    };
  }
}
