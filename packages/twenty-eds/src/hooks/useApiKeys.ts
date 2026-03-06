import { gql } from '@eds/utils/api';
import { useCallback, useEffect, useState } from 'react';

export type ApiKey = {
  id: string;
  name: string;
  expiresAt: string | null;
  createdAt: string;
};

export type UseApiKeysReturn = {
  apiKeys: ApiKey[];
  loading: boolean;
  error: string | null;
  createApiKey: (name: string, expiresAt?: string) => Promise<{ id: string; token: string }>;
  revokeApiKey: (id: string) => Promise<void>;
  refresh: () => void;
};

const GET_API_KEYS_QUERY = `
  query GetApiKeys {
    apiKeys(filter: { revokedAt: { is: NULL } }) {
      edges {
        node {
          id
          name
          expiresAt
          createdAt
        }
      }
    }
  }
`;

const CREATE_API_KEY_MUTATION = `
  mutation CreateApiKey($name: String!, $expiresAt: DateTime) {
    createApiKey(data: { name: $name, expiresAt: $expiresAt }) {
      id
      name
      expiresAt
    }
  }
`;

// After creating, generate the actual token — tokens are not stored server-side,
// only returned once at creation time.
const GENERATE_TOKEN_MUTATION = `
  mutation GenerateApiKeyToken($apiKeyId: String!, $expiresAt: String!) {
    generateApiKeyToken(apiKeyId: $apiKeyId, expiresAt: $expiresAt) {
      token
    }
  }
`;

const DELETE_API_KEY_MUTATION = `
  mutation DeleteOneApiKey($id: String!) {
    deleteOneApiKey(id: $id) {
      id
    }
  }
`;

// Default expiration: 1 year from now (ISO 8601)
const defaultExpiresAt = () =>
  new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

export const useApiKeys = (): UseApiKeysReturn => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  const refresh = useCallback(() => setRefreshToken((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    gql<{ apiKeys: { edges: Array<{ node: ApiKey }> } }>(GET_API_KEYS_QUERY)
      .then((result) => {
        if (cancelled) return;
        if (result.errors) {
          setError(result.errors[0]?.message ?? 'Failed to load API keys');
          return;
        }
        setApiKeys(result.data?.apiKeys.edges.map((e) => e.node) ?? []);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [refreshToken]);

  const createApiKey = useCallback(
    async (name: string, expiresAt?: string): Promise<{ id: string; token: string }> => {
      const resolvedExpiresAt = expiresAt ?? defaultExpiresAt();

      const createResult = await gql<{ createApiKey: ApiKey }>(CREATE_API_KEY_MUTATION, {
        name,
        expiresAt: resolvedExpiresAt,
      });

      if (createResult.errors) {
        throw new Error(createResult.errors[0]?.message ?? 'Failed to create API key');
      }

      const newKey = createResult.data?.createApiKey;
      if (!newKey) throw new Error('No API key returned');

      const tokenResult = await gql<{ generateApiKeyToken: { token: string } }>(
        GENERATE_TOKEN_MUTATION,
        { apiKeyId: newKey.id, expiresAt: resolvedExpiresAt },
      );

      if (tokenResult.errors) {
        throw new Error(tokenResult.errors[0]?.message ?? 'Failed to generate API key token');
      }

      const token = tokenResult.data?.generateApiKeyToken?.token;
      if (!token) throw new Error('No token returned');

      refresh();
      return { id: newKey.id, token };
    },
    [refresh],
  );

  const revokeApiKey = useCallback(async (id: string) => {
    const result = await gql(DELETE_API_KEY_MUTATION, { id });
    if (result.errors) throw new Error(result.errors[0]?.message ?? 'Failed to revoke API key');
    refresh();
  }, [refresh]);

  return { apiKeys, loading, error, createApiKey, revokeApiKey, refresh };
};
