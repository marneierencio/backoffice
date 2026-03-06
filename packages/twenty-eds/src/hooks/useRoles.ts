import { gql } from '@eds/utils/api';
import { useCallback, useEffect, useState } from 'react';

export type Role = {
  id: string;
  name: string;
  description: string | null;
  isEditable: boolean;
  memberCount: number;
};

export type UseRolesReturn = {
  roles: Role[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

const GET_ROLES_QUERY = `
  query GetRoles {
    roles {
      id
      name
      description
      isEditable
      workspaceMembers {
        id
      }
    }
  }
`;

type RoleRaw = {
  id: string;
  name: string;
  description: string | null;
  isEditable: boolean;
  workspaceMembers: Array<{ id: string }>;
};

export const useRoles = (): UseRolesReturn => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  const refresh = useCallback(() => setRefreshToken((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    gql<{ roles: RoleRaw[] }>(GET_ROLES_QUERY)
      .then((result) => {
        if (cancelled) return;
        if (result.errors) {
          setError(result.errors[0]?.message ?? 'Failed to load roles');
          return;
        }
        setRoles(
          (result.data?.roles ?? []).map((r) => ({
            id: r.id,
            name: r.name,
            description: r.description,
            isEditable: r.isEditable,
            memberCount: r.workspaceMembers?.length ?? 0,
          })),
        );
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [refreshToken]);

  return { roles, loading, error, refresh };
};
