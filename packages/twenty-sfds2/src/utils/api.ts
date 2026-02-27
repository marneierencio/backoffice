// Minimal API client for SFDS2 frontend communicating with the Twenty backend
const API_URL = import.meta.env.VITE_API_URL ?? '/api';

export type FetchOptions = {
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const getAuthToken = (): string | null => authToken;

export const gql = async <TData = unknown>(
  query: string,
  variables?: Record<string, unknown>,
  options?: FetchOptions,
): Promise<{ data?: TData; errors?: Array<{ message: string }> }> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers ?? {}),
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_URL}/graphql`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
    signal: options?.signal,
  });

  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`);
  }

  return response.json() as Promise<{ data?: TData; errors?: Array<{ message: string }> }>;
};
