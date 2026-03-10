// API client for the Seleção de Cuidadores public app.
// Uses the Twenty REST API with an API key for unauthenticated public access.
// The API key is configured per workspace and grants permission to create People records.
//
// Configuration priority:
//   1. window.__SELECAO_CONFIG__ (runtime, set via <script> in index.html or config.js)
//   2. VITE_* environment variables (build time)
//   3. Relative paths (same-origin fallback)

import { type AllFormData } from '@selecao/types/candidatura';

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
  return (runtime.apiKey ?? import.meta.env.VITE_API_KEY ?? '').trim();
};

export type ApiResult<TData = unknown> = {
  data?: TData;
  error?: string;
};

const authHeaders = (): Record<string, string> => {
  const apiKey = getApiKey();
  if (!apiKey || apiKey === '__SELECAO_API_KEY__') {
    throw new Error(
      'API Key não configurada. Para desenvolvimento local, crie o arquivo ' +
      'packages/twenty-selecao-cuidadores/.env com VITE_API_KEY=<sua_api_key>. ' +
      'A API Key deve ser gerada em Configurações → APIs & Webhooks no workspace Twenty.',
    );
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  };
};

const toUserFriendlyError = (status: number, body: string, context: string): string => {
  try {
    const json = JSON.parse(body) as { error?: string; messages?: string[] };
    if (status === 401) {
      const detail = json.error ?? '';
      if (detail === 'WORKSPACE_NOT_FOUND') {
        return (
          'API Key inválida: o workspace não foi encontrado. ' +
          'Possíveis causas: (1) a API Key foi gerada antes de um reset do banco de dados; ' +
          '(2) a mesma chave foi usada em ambos os ambientes (prod e dev precisam de chaves diferentes); ' +
          '(3) o container não foi reiniciado após atualizar SELECAO_CUIDADORES_API_KEY no .env. ' +
          'Solução: gere uma nova API Key em Configurações → APIs & Webhooks, ' +
          'salve o TOKEN (começa com eyJ) no .env e reinicie o container.'
        );
      }
      if (detail === 'UNAUTHENTICATED') {
        return (
          'API Key inválida: token malformado. ' +
          'Certifique-se de que copiou o token completo (começa com eyJ) de Configurações → APIs & Webhooks. ' +
          'Verifique se não há espaços extras ou quebras de linha na variável SELECAO_CUIDADORES_API_KEY.'
        );
      }
      if (detail === 'FORBIDDEN_EXCEPTION') {
        return (
          'API Key revogada. Gere uma nova chave em Configurações → APIs & Webhooks.'
        );
      }
      return 'API Key inválida ou expirada. Verifique a configuração da API Key.'
    }
    const msg = json.messages?.join(', ') ?? body;
    return `${context} (${status}): ${msg}`;
  } catch {
    return `${context} (${status}): ${body}`;
  }
};

// Pre-flight check: verifies the API key before form submission.
// Returns null if OK, or an error string if auth fails.
export const checkApiConnection = async (): Promise<string | null> => {
  try {
    const headers = authHeaders();
    const response = await fetch(`${getRestApiUrl()}/people?limit=1`, {
      method: 'GET',
      headers,
    });
    if (response.status === 401) {
      const body = await response.text();
      return toUserFriendlyError(401, body, 'Verificação da API Key');
    }
    return null;
  } catch (err) {
    if (err instanceof Error && err.message.includes('API Key não configurada')) {
      return err.message;
    }
    return null; // network errors are not auth errors
  }
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

    const response = await fetch(`${restApiUrl}/people`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const body = await response.text();
      return { error: `Erro ao criar registro de pessoa (${response.status}): ${body}` };
    }

    const result = await response.json();
    return { data: result?.data?.createPerson ?? result };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Erro desconhecido ao enviar dados',
    };
  }
};

const splitFullName = (fullName: string): { firstName: string; lastName: string } => {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: '' };
  return {
    firstName: parts.slice(0, Math.ceil(parts.length / 2)).join(' '),
    lastName: parts.slice(Math.ceil(parts.length / 2)).join(' '),
  };
};

// Submits a complete candidatura: creates People record + CandidaturaCuidador record.
export const createCandidatura = async (formData: AllFormData): Promise<ApiResult<{ personId: string; candidaturaId?: string }>> => {
  try {
    const restApiUrl = getRestApiUrl();
    const headers = authHeaders();

    const { firstName, lastName } = splitFullName(formData.step1.nomeCompleto);

    // Step A: Create or update the People record
    const personResponse = await fetch(`${restApiUrl}/people`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: { firstName, lastName },
        emails: {
          primaryEmail: formData.step1.email.trim(),
          additionalEmails: [],
        },
        phones: {
          primaryPhoneNumber: formData.step1.celular.replace(/\D/g, ''),
          primaryPhoneCountryCode: 'BR',
          additionalPhones: [],
        },
        city: formData.step1.municipio.trim(),
      }),
    });

    if (!personResponse.ok) {
      const body = await personResponse.text();
      return { error: toUserFriendlyError(personResponse.status, body, 'Erro ao registrar dados de identificação') };
    }

    const personResult = await personResponse.json();
    const personId: string = personResult?.data?.createPerson?.id ?? personResult?.id ?? '';

    // Step B: Create the CandidaturaCuidador record
    const candidaturaPayload = {
      // Identification (duplicated for standalone access in CRM)
      nomeCompleto: formData.step1.nomeCompleto.trim(),
      dataNascimento: formData.step1.dataNascimento,
      genero: formData.step1.genero,
      cpf: formData.step1.cpf,
      rg: formData.step1.rg.trim(),
      celular: formData.step1.celular,
      email: formData.step1.email.trim(),
      logradouro: formData.step1.logradouro.trim(),
      numero: formData.step1.numero.trim(),
      complemento: formData.step1.complemento.trim(),
      cep: formData.step1.cep,
      bairro: formData.step1.bairro.trim(),
      municipio: formData.step1.municipio.trim(),
      estado: formData.step1.estado,
      // Experience
      experiencia: formData.step2.experiencia.trim(),
      disponibilidadeDias: formData.step2.disponibilidadeDias.join(','),
      disponibilidadeTurnos: formData.step2.disponibilidadeTurnos.join(','),
      referencias: formData.step2.referencias.trim(),
      possuiCurso: formData.step2.possuiCurso,
      ...(formData.step2.possuiCurso && {
        instituicaoCurso: formData.step2.instituicaoCurso.trim(),
        cargaHoraria: Number(formData.step2.cargaHoraria),
        conclusaoCurso: formData.step2.conclusaoAno && formData.step2.conclusaoMes
          ? `${formData.step2.conclusaoAno}-${formData.step2.conclusaoMes}-01`
          : null,
      }),
      // Questionnaire
      respostaQ1: formData.step3.q1,
      respostaQ2: formData.step3.q2,
      respostaQ3: formData.step3.q3,
      respostaQ4: formData.step3.q4,
      respostaQ5: formData.step3.q5,
      respostaQ6: formData.step3.q6,
      respostaQ7: formData.step3.q7,
      respostaQ8: formData.step3.q8,
      respostaQ9: formData.step3.q9,
      respostaQ10: formData.step3.q10,
      questaoAberta11: formData.step3.q11.trim(),
      questaoAberta12: formData.step3.q12.trim(),
      questaoAberta13: formData.step3.q13.trim(),
      // Finalization
      aceitaComunicacoes: formData.step4.aceitaComunicacoes,
      // Status (default: awaiting analysis)
      status: 'AGUARDANDO_ANALISE',
      // Relation to People
      ...(personId ? { pessoas: { id: personId } } : {}),
    };

    const candidaturaResponse = await fetch(`${restApiUrl}/candidaturasCuidadores`, {
      method: 'POST',
      headers,
      body: JSON.stringify(candidaturaPayload),
    });

    if (!candidaturaResponse.ok) {
      // Candidatura creation failed, but Person was created — return partial success
      const body = await candidaturaResponse.text();
      if (candidaturaResponse.status === 404) {
        // Object not yet created in workspace — graceful degradation
        console.warn('CandidaturaCuidador object not found in workspace. Only People record was created.');
        return { data: { personId } };
      }
      return { error: `Erro ao registrar candidatura (${candidaturaResponse.status}): ${body}` };
    }

    const candidaturaResult = await candidaturaResponse.json();
    const candidaturaId: string = candidaturaResult?.data?.createCandidaturaCuidador?.id ?? candidaturaResult?.id ?? '';

    return { data: { personId, candidaturaId } };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Erro desconhecido ao enviar candidatura',
    };
  }
};
