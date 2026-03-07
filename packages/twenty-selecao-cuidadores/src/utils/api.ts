// API client for the Seleção de Cuidadores public app.
// Uses the Twenty REST API with an API key for unauthenticated public access.
// The API key is configured per workspace and grants permission to create People records.

const apiBaseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? '';

const REST_API_URL =
  import.meta.env.VITE_REST_API_URL ?? `${apiBaseUrl}/api/rest`;

const API_KEY = import.meta.env.VITE_API_KEY ?? '';

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
    const response = await fetch(`${REST_API_URL}/people`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
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
