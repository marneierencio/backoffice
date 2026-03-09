import { gql, gqlWorkspace, setAuthToken } from '@eds/utils/api';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

export type AuthUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  frontendPreference: 'TWENTY' | 'EDS';
  workspaceMemberId: string | null;
  locale: string | null;
  colorScheme: string | null;
};

type RawCurrentUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  frontendPreference: 'TWENTY' | 'EDS';
  workspaceMember?: {
    id: string;
    locale: string | null;
    colorScheme: string | null;
  } | null;
};

export type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateFrontendPreference: (preference: 'TWENTY' | 'EDS') => Promise<void>;
  updateLocale: (locale: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = 'eds_auth_token';

const CURRENT_USER_QUERY = `
  query CurrentUser {
    currentUser {
      id
      firstName
      lastName
      email
      frontendPreference
      workspaceMember {
        id
        locale
        colorScheme
      }
    }
  }
`;

const UPDATE_LOCALE_MUTATION = `
  mutation UpdateWorkspaceMemberLocale($idToUpdate: UUID!, $data: WorkspaceMemberUpdateInput!) {
    updateWorkspaceMember(id: $idToUpdate, data: $data) {
      id
      locale
    }
  }
`;

// SignIn returns a workspace-agnostic token AND a list of available workspaces.
// Each workspace carries a loginToken that must be exchanged for a
// workspace-scoped ACCESS token before querying the /graphql endpoint.
const LOGIN_MUTATION = `
  mutation SignIn($email: String!, $password: String!) {
    signIn(email: $email, password: $password) {
      tokens {
        accessOrWorkspaceAgnosticToken {
          token
        }
      }
      availableWorkspaces {
        availableWorkspacesForSignIn {
          id
          displayName
          loginToken
        }
      }
    }
  }
`;

// Exchange a workspace-specific loginToken for a workspace-scoped ACCESS token.
// The 'origin' arg lets the server verify the workspace domain.
const GET_AUTH_TOKENS_FROM_LOGIN_TOKEN_MUTATION = `
  mutation GetAuthTokensFromLoginToken($loginToken: String!, $origin: String!) {
    getAuthTokensFromLoginToken(loginToken: $loginToken, origin: $origin) {
      tokens {
        accessOrWorkspaceAgnosticToken {
          token
        }
      }
    }
  }
`;

const UPDATE_FRONTEND_PREFERENCE_MUTATION = `
  mutation UpdateUserFrontendPreference($frontendPreference: FrontendPreference!) {
    updateUserFrontendPreference(frontendPreference: $frontendPreference)
  }
`;

type AvailableWorkspace = {
  id: string;
  displayName?: string;
  loginToken?: string;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUser = useCallback(async (authToken: string) => {
    setAuthToken(authToken);
    const result = await gql<{ currentUser: RawCurrentUser }>(CURRENT_USER_QUERY);

    if (result.errors || !result.data?.currentUser) {
      throw new Error('Failed to fetch current user');
    }

    const raw = result.data.currentUser;
    return {
      id: raw.id,
      firstName: raw.firstName,
      lastName: raw.lastName,
      email: raw.email,
      frontendPreference: raw.frontendPreference,
      workspaceMemberId: raw.workspaceMember?.id ?? null,
      locale: raw.workspaceMember?.locale ?? null,
      colorScheme: raw.workspaceMember?.colorScheme ?? null,
    } satisfies AuthUser;
  }, []);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    fetchCurrentUser(token)
      .then(setUser)
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setAuthToken(null);
      })
      .finally(() => setIsLoading(false));
  }, [token, fetchCurrentUser]);

  // Exchange a workspace loginToken for a workspace-scoped ACCESS token
  const exchangeLoginToken = useCallback(async (loginToken: string): Promise<string> => {
    // Temporarily use the workspace-agnostic token so the mutation can reach /metadata
    const result = await gql<{
      getAuthTokensFromLoginToken: {
        tokens: {
          accessOrWorkspaceAgnosticToken: {
            token: string;
          };
        };
      };
    }>(
      GET_AUTH_TOKENS_FROM_LOGIN_TOKEN_MUTATION,
      { loginToken, origin: window.location.origin },
    );

    const accessToken =
      result.data?.getAuthTokensFromLoginToken?.tokens?.accessOrWorkspaceAgnosticToken?.token;

    if (result.errors || !accessToken) {
      throw new Error(result.errors?.[0]?.message ?? 'Failed to exchange login token');
    }

    return accessToken;
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await gql<{
      signIn: {
        tokens: {
          accessOrWorkspaceAgnosticToken: {
            token: string;
          };
        };
        availableWorkspaces: {
          availableWorkspacesForSignIn: AvailableWorkspace[];
        };
      };
    }>(
      LOGIN_MUTATION,
      { email, password },
    );

    const agnosticToken = result.data?.signIn?.tokens?.accessOrWorkspaceAgnosticToken?.token;

    if (result.errors || !agnosticToken) {
      throw new Error(result.errors?.[0]?.message ?? 'Login failed');
    }

    // Set the agnostic token temporarily so we can call /metadata mutations
    setAuthToken(agnosticToken);

    // Find the first workspace with a loginToken and exchange it for a
    // workspace-scoped ACCESS token.  This is required so that queries to
    // the /graphql endpoint can resolve the workspace-specific schema
    // (PersonFilterInput, CompanyFilterInput, etc.).
    const workspaces =
      result.data?.signIn?.availableWorkspaces?.availableWorkspacesForSignIn ?? [];
    const targetWorkspace = workspaces.find((ws) => ws.loginToken);

    let finalToken: string;

    if (targetWorkspace?.loginToken) {
      finalToken = await exchangeLoginToken(targetWorkspace.loginToken);
    } else {
      // Fallback: no workspace loginToken available (e.g. single-workspace
      // setup where the agnostic token already carries workspace context)
      finalToken = agnosticToken;
    }

    localStorage.setItem(TOKEN_KEY, finalToken);
    setToken(finalToken);

    const currentUser = await fetchCurrentUser(finalToken);

    setUser(currentUser);
  }, [fetchCurrentUser, exchangeLoginToken]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setAuthToken(null);
  }, []);

  const updateFrontendPreference = useCallback(
    async (preference: 'TWENTY' | 'EDS') => {
      const result = await gql<{ updateUserFrontendPreference: boolean }>(
        UPDATE_FRONTEND_PREFERENCE_MUTATION,
        { frontendPreference: preference },
      );

      if (result.errors) {
        throw new Error(result.errors[0]?.message ?? 'Update failed');
      }

      setUser((prev) => (prev ? { ...prev, frontendPreference: preference } : prev));
    },
    [],
  );

  const updateLocale = useCallback(
    async (locale: string) => {
      const workspaceMemberId = user?.workspaceMemberId;

      if (!workspaceMemberId) {
        throw new Error('Workspace member not found');
      }

      const result = await gqlWorkspace<{
        updateWorkspaceMember: { id: string; locale: string };
      }>(UPDATE_LOCALE_MUTATION, { idToUpdate: workspaceMemberId, data: { locale } });

      if (result.errors) {
        throw new Error(result.errors[0]?.message ?? 'Update failed');
      }

      setUser((prev) => (prev ? { ...prev, locale } : prev));
    },
    [user?.workspaceMemberId],
  );

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, updateFrontendPreference, updateLocale }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return ctx;
};
