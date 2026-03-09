import { gql, gqlWorkspace } from '@eds/utils/api';
import { useCallback, useEffect, useState } from 'react';

export type WorkspaceMember = {
  id: string;
  userId: string;
  name: { firstName: string; lastName: string };
  userEmail: string;
  avatarUrl: string | null;
  createdAt: string;
};

export type WorkspaceInvitation = {
  id: string;
  email: string;
  expiresAt: string | null;
};

export type UseWorkspaceMembersReturn = {
  members: WorkspaceMember[];
  invitations: WorkspaceInvitation[];
  inviteLink: string | null;
  loading: boolean;
  error: string | null;
  sendInvitation: (emails: string[]) => Promise<void>;
  removeMember: (userId: string) => Promise<void>;
  generateInviteLink: () => Promise<void>;
  refresh: () => void;
};

const FIND_MEMBERS_QUERY = `
  query FindManyWorkspaceMembers($first: Int) {
    workspaceMembers(
      first: $first
      orderBy: [{ createdAt: AscNullsLast }]
    ) {
      edges {
        node {
          id
          userId
          name { firstName lastName }
          userEmail
          avatarUrl
          createdAt
        }
      }
      totalCount
    }
  }
`;

const GET_INVITATIONS_QUERY = `
  query GetWorkspaceInvitations {
    workspaceInvitations {
      id
      email
      expiresAt
    }
  }
`;

const SEND_INVITATIONS_MUTATION = `
  mutation SendInvitations($emails: [String!]!) {
    sendInvitations(emails: $emails)
  }
`;

const GENERATE_INVITE_LINK_MUTATION = `
  mutation GenerateWorkspaceInviteLink {
    generateWorkspaceInviteLink
  }
`;

const DELETE_MEMBER_MUTATION = `
  mutation DeleteUserWorkspace($userId: String!) {
    deleteUserWorkspace(userId: $userId) {
      success
    }
  }
`;

export const useWorkspaceMembers = (): UseWorkspaceMembersReturn => {
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [invitations, setInvitations] = useState<WorkspaceInvitation[]>([]);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  const refresh = useCallback(() => setRefreshToken((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      gqlWorkspace<{ workspaceMembers: { edges: Array<{ node: WorkspaceMember }> } }>(
        FIND_MEMBERS_QUERY,
        { first: 100 },
      ),
      gql<{ workspaceInvitations: WorkspaceInvitation[] }>(GET_INVITATIONS_QUERY),
    ])
      .then(([membersResult, invitationsResult]) => {
        if (cancelled) return;
        if (membersResult.errors) {
          setError(membersResult.errors[0]?.message ?? 'Failed to load members');
          return;
        }
        setMembers(
          membersResult.data?.workspaceMembers.edges.map((e) => e.node) ?? [],
        );
        setInvitations(invitationsResult.data?.workspaceInvitations ?? []);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [refreshToken]);

  const sendInvitation = useCallback(async (emails: string[]) => {
    const result = await gql(SEND_INVITATIONS_MUTATION, { emails });
    if (result.errors) throw new Error(result.errors[0]?.message ?? 'Failed to send invitation');
    refresh();
  }, [refresh]);

  const removeMember = useCallback(async (userId: string) => {
    const result = await gqlWorkspace(DELETE_MEMBER_MUTATION, { userId });
    if (result.errors) throw new Error(result.errors[0]?.message ?? 'Failed to remove member');
    refresh();
  }, [refresh]);

  const generateInviteLink = useCallback(async () => {
    const result = await gql<{ generateWorkspaceInviteLink: string }>(
      GENERATE_INVITE_LINK_MUTATION,
    );
    if (result.errors) throw new Error(result.errors[0]?.message ?? 'Failed to generate link');
    setInviteLink(result.data?.generateWorkspaceInviteLink ?? null);
  }, []);

  return {
    members,
    invitations,
    inviteLink,
    loading,
    error,
    sendInvitation,
    removeMember,
    generateInviteLink,
    refresh,
  };
};
