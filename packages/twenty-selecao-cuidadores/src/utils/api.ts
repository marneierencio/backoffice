// API client for the Seleção de Cuidadores public app.
// Uses the Twenty REST API with an API key for unauthenticated public access.
// The API key is configured per workspace and grants permission to create People records.
//
// Configuration priority:
//   1. window.__SELECAO_CONFIG__ (runtime, set via <script> in index.html or config.js)
//   2. VITE_* environment variables (build time)
//   3. Relative paths (same-origin fallback)

type RuntimeConfig = {
  apiUrl?: string;
  apiKey?: string;
};

const getRuntimeConfig = (): RuntimeConfig =>
  (window as unknown as { __SELECAO_CONFIG__?: RuntimeConfig }).__SELECAO_CONFIG__ ?? {};

const getApiBaseUrl = (): string => {
  const runtime = getRuntimeConfig();
  return (runtime.apiUrl ?? import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');
};

const getRestApiUrl = (): string =>
  import.meta.env.VITE_REST_API_URL ?? `${getApiBaseUrl()}/rest`;

const getApiKey = (): string => {
  const runtime = getRuntimeConfig();
  return runtime.apiKey ?? import.meta.env.VITE_API_KEY ?? '';
};

export type ApiResult<TData = unknown> = {
  data?: TData;
  error?: string;
};

export const createPerson = async (input: {
  name: { firstName: string; lastName: string };
  emails: { primaryEmail: string; additionalEmails: string[] };
  phones: { primaryPhoneNumber: string; primaryPhoneCountryCode: string; additionalPhones: string[] };
  jobTitle: string;
  city: string;
}): Promise<ApiResult<{ id: string }>> => {
  try {
    const restApiUrl = getRestApiUrl();
    const apiKey = getApiKey();

    if (!apiKey || apiKey === '__SELECAO_API_KEY__') {
      return {
        error: 'Configuração incompleta: API Key não definida. Contacte o administrador do sistema.',
      };
    }

    const response = await fetch(`${restApiUrl}/people`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const body = await response.text();
      return { error: `Erro ao enviar candidatura (${response.status}): ${body}` };
    }

    const result = await response.json();
    return { data: result?.data?.createPerson ?? result };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Erro desconhecido ao enviar candidatura',
    };
  }
};
