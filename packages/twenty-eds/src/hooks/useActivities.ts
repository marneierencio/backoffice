// Hook for Tasks / Activities — Twenty stores tasks as records in the
// workspace GraphQL endpoint under the `tasks` object type.
import { gqlWorkspace } from '@eds/utils/api';
import { useCallback, useEffect, useState } from 'react';

export type ActivityStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export type Activity = {
  id: string;
  title: string;
  body: string | null;
  status: ActivityStatus;
  dueAt: string | null;
  assignee: {
    id: string;
    name: { firstName: string; lastName: string };
  } | null;
  createdAt: string;
  updatedAt: string;
};

export type UseActivitiesReturn = {
  activities: Activity[];
  loading: boolean;
  error: string | null;
  createActivity: (input: { title: string; body?: string; status?: ActivityStatus; dueAt?: string }) => Promise<Activity>;
  updateActivity: (id: string, input: Partial<Pick<Activity, 'title' | 'body' | 'status' | 'dueAt'>>) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
  refresh: () => void;
};

const GET_TASKS_QUERY = `
  query GetTasks {
    tasks(orderBy: { createdAt: DescNullsLast }) {
      edges {
        node {
          id
          title
          bodyV2 {
            markdown
          }
          status
          dueAt
          assignee {
            id
            name {
              firstName
              lastName
            }
          }
          createdAt
          updatedAt
        }
      }
    }
  }
`;

const CREATE_TASK_MUTATION = `
  mutation CreateTask($input: TaskCreateInput!) {
    createTask(data: $input) {
      id
      title
      status
      dueAt
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_TASK_MUTATION = `
  mutation UpdateTask($id: ID!, $input: TaskUpdateInput!) {
    updateTask(id: $id, data: $input) {
      id
      title
      status
      dueAt
      updatedAt
    }
  }
`;

const DELETE_TASK_MUTATION = `
  mutation DeleteTask($id: ID!) {
    deleteTask(id: $id) {
      id
    }
  }
`;

// Normalise the raw node (bodyV2 → body string)
const normalise = (node: Record<string, unknown>): Activity => ({
  id: node.id as string,
  title: node.title as string,
  body: (node.bodyV2 as { markdown?: string } | null)?.markdown ?? null,
  status: (node.status as ActivityStatus) ?? 'TODO',
  dueAt: node.dueAt as string | null,
  assignee: node.assignee as Activity['assignee'],
  createdAt: node.createdAt as string,
  updatedAt: node.updatedAt as string,
});

export const useActivities = (): UseActivitiesReturn => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  const refresh = useCallback(() => setRefreshToken((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    gqlWorkspace<{ tasks: { edges: Array<{ node: Record<string, unknown> }> } }>(GET_TASKS_QUERY)
      .then((result) => {
        if (cancelled) return;
        if (result.errors) {
          setError(result.errors[0]?.message ?? 'Failed to load activities');
          return;
        }
        const nodes = result.data?.tasks?.edges?.map((e) => normalise(e.node)) ?? [];
        setActivities(nodes);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [refreshToken]);

  const createActivity = useCallback(
    async (input: { title: string; body?: string; status?: ActivityStatus; dueAt?: string }): Promise<Activity> => {
      const result = await gqlWorkspace<{ createTask: Record<string, unknown> }>(CREATE_TASK_MUTATION, {
        input: {
          title: input.title,
          status: input.status ?? 'TODO',
          ...(input.dueAt ? { dueAt: input.dueAt } : {}),
        },
      });
      if (result.errors) throw new Error(result.errors[0]?.message ?? 'Failed to create task');
      return normalise(result.data!.createTask);
    },
    [],
  );

  const updateActivity = useCallback(
    async (id: string, input: Partial<Pick<Activity, 'title' | 'body' | 'status' | 'dueAt'>>): Promise<void> => {
      const result = await gqlWorkspace(UPDATE_TASK_MUTATION, { id, input });
      if (result.errors) throw new Error(result.errors[0]?.message ?? 'Failed to update task');
    },
    [],
  );

  const deleteActivity = useCallback(async (id: string): Promise<void> => {
    const result = await gqlWorkspace(DELETE_TASK_MUTATION, { id });
    if (result.errors) throw new Error(result.errors[0]?.message ?? 'Failed to delete task');
  }, []);

  return { activities, loading, error, createActivity, updateActivity, deleteActivity, refresh };
};
