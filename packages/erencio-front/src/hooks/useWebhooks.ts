// Hook for Webhook management — Twenty exposes webhook CRUD through the
// workspace GraphQL endpoint.
import { gqlWorkspace } from '@backoffice/utils/api';
import { useCallback, useEffect, useState } from 'react';

export type WebhookOperation = 'create' | 'update' | 'delete' | '*';

export type Webhook = {
  id: string;
  targetUrl: string;
  operations: WebhookOperation[];
  description: string | null;
  createdAt: string;
};

export type UseWebhooksReturn = {
  webhooks: Webhook[];
  loading: boolean;
  error: string | null;
  createWebhook: (input: { targetUrl: string; operations: WebhookOperation[]; description?: string }) => Promise<Webhook>;
  deleteWebhook: (id: string) => Promise<void>;
  refresh: () => void;
};

const GET_WEBHOOKS_QUERY = `
  query GetWebhooks {
    webhooks(orderBy: { createdAt: DescNullsLast }) {
      edges {
        node {
          id
          targetUrl
          operations
          description
          createdAt
        }
      }
    }
  }
`;

const CREATE_WEBHOOK_MUTATION = `
  mutation CreateWebhook($input: WebhookCreateInput!) {
    createWebhook(data: $input) {
      id
      targetUrl
      operations
      description
      createdAt
    }
  }
`;

const DELETE_WEBHOOK_MUTATION = `
  mutation DeleteWebhook($id: ID!) {
    deleteWebhook(id: $id) {
      id
    }
  }
`;

const normalise = (node: Record<string, unknown>): Webhook => ({
  id: node.id as string,
  targetUrl: node.targetUrl as string,
  operations: (node.operations as WebhookOperation[]) ?? [],
  description: (node.description as string | null) ?? null,
  createdAt: node.createdAt as string,
});

export const useWebhooks = (): UseWebhooksReturn => {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  const refresh = useCallback(() => setRefreshToken((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    gqlWorkspace<{ webhooks: { edges: Array<{ node: Record<string, unknown> }> } }>(GET_WEBHOOKS_QUERY)
      .then((result) => {
        if (cancelled) return;
        if (result.errors) {
          setError(result.errors[0]?.message ?? 'Failed to load webhooks');
          return;
        }
        const nodes = result.data?.webhooks?.edges?.map((e) => normalise(e.node)) ?? [];
        setWebhooks(nodes);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [refreshToken]);

  const createWebhook = useCallback(
    async (input: { targetUrl: string; operations: WebhookOperation[]; description?: string }): Promise<Webhook> => {
      const result = await gqlWorkspace<{ createWebhook: Record<string, unknown> }>(CREATE_WEBHOOK_MUTATION, {
        input: {
          targetUrl: input.targetUrl,
          operations: input.operations,
          ...(input.description ? { description: input.description } : {}),
        },
      });
      if (result.errors) throw new Error(result.errors[0]?.message ?? 'Failed to create webhook');
      return normalise(result.data!.createWebhook);
    },
    [],
  );

  const deleteWebhook = useCallback(async (id: string): Promise<void> => {
    const result = await gqlWorkspace(DELETE_WEBHOOK_MUTATION, { id });
    if (result.errors) throw new Error(result.errors[0]?.message ?? 'Failed to delete webhook');
  }, []);

  return { webhooks, loading, error, createWebhook, deleteWebhook, refresh };
};
