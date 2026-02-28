import { gql, setAuthToken } from '@sfds2/utils/api';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

export type AuthUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  frontendPreference: 'TWENTY' | 'SFDS2';
};

export type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateFrontendPreference: (preference: 'TWENTY' | 'SFDS2') => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = 'sfds2_auth_token';

const CURRENT_USER_QUERY = `
  query CurrentUser {
    currentUser {
      id
      firstName
      lastName
      email
      frontendPreference
    }
  }
`;

const LOGIN_MUTATION = `
  mutation GenerateJWT($email: String!, $password: String!) {
    generateJWT(email: $email, password: $password) {
      token
    }
  }
`;

const UPDATE_FRONTEND_PREFERENCE_MUTATION = `
  mutation UpdateUserFrontendPreference($frontendPreference: FrontendPreference!) {
    updateUserFrontendPreference(frontendPreference: $frontendPreference)
  }
`;

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUser = useCallback(async (authToken: string) => {
    setAuthToken(authToken);
    const result = await gql<{ currentUser: AuthUser }>(CURRENT_USER_QUERY);

    if (result.errors || !result.data?.currentUser) {
      throw new Error('Failed to fetch current user');
    }

    return result.data.currentUser;
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

  const login = useCallback(async (email: string, password: string) => {
    const result = await gql<{ generateJWT: { token: string } }>(
      LOGIN_MUTATION,
      { email, password },
    );

    if (result.errors || !result.data?.generateJWT?.token) {
      throw new Error(result.errors?.[0]?.message ?? 'Login failed');
    }

    const newToken = result.data.generateJWT.token;

    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);

    const currentUser = await fetchCurrentUser(newToken);

    setUser(currentUser);
  }, [fetchCurrentUser]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setAuthToken(null);
  }, []);

  const updateFrontendPreference = useCallback(
    async (preference: 'TWENTY' | 'SFDS2') => {
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

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, updateFrontendPreference }}>
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
