import { gql } from '@backoffice/utils/api';
import { useCallback, useEffect, useState } from 'react';

export type WorkspaceSettings = {
  id: string;
  displayName: string;
  logo: string | null;
  frontendPolicy: 'ALLOW_USER_CHOICE' | 'FORCE_TWENTY' | 'FORCE_BACKOFFICE';
  domainName: { primaryLinkUrl: string } | null;
};

export type UseWorkspaceSettingsReturn = {
  settings: WorkspaceSettings | null;
  loading: boolean;
  error: string | null;
  updateName: (name: string) => Promise<void>;
  updateFrontendPolicy: (policy: WorkspaceSettings['frontendPolicy']) => Promise<void>;
  deleteWorkspace: () => Promise<void>;
  refresh: () => void;
};

const GET_WORKSPACE_QUERY = `
  query GetCurrentWorkspace {
    currentWorkspace {
      id
      displayName
      logo
      frontendPolicy
      domainName {
        primaryLinkUrl
      }
    }
  }
`;

const UPDATE_WORKSPACE_MUTATION = `
  mutation UpdateWorkspace($input: UpdateWorkspaceInput!) {
    updateWorkspace(data: $input) {
      id
      displayName
      frontendPolicy
    }
  }
`;

const DELETE_WORKSPACE_MUTATION = `
  mutation DeleteCurrentWorkspace {
    deleteCurrentWorkspace {
      id
    }
  }
`;

export const useWorkspaceSettings = (): UseWorkspaceSettingsReturn => {
  const [settings, setSettings] = useState<WorkspaceSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  const refresh = useCallback(() => setRefreshToken((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    gql<{ currentWorkspace: WorkspaceSettings }>(GET_WORKSPACE_QUERY)
      .then((result) => {
        if (cancelled) return;
        if (result.errors) {
          setError(result.errors[0]?.message ?? 'Failed to load workspace settings');
          return;
        }
        setSettings(result.data?.currentWorkspace ?? null);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [refreshToken]);

  const updateName = useCallback(async (displayName: string) => {
    const result = await gql(UPDATE_WORKSPACE_MUTATION, { input: { displayName } });
    if (result.errors) throw new Error(result.errors[0]?.message ?? 'Update failed');
    refresh();
  }, [refresh]);

  const updateFrontendPolicy = useCallback(async (frontendPolicy: WorkspaceSettings['frontendPolicy']) => {
    const result = await gql(UPDATE_WORKSPACE_MUTATION, { input: { frontendPolicy } });
    if (result.errors) throw new Error(result.errors[0]?.message ?? 'Update failed');
    refresh();
  }, [refresh]);

  const deleteWorkspace = useCallback(async () => {
    const result = await gql(DELETE_WORKSPACE_MUTATION);
    if (result.errors) throw new Error(result.errors[0]?.message ?? 'Delete failed');
  }, []);

  return { settings, loading, error, updateName, updateFrontendPolicy, deleteWorkspace, refresh };
};
