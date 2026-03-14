// API client for the Seleção de Cuidadores public app.
// Uses the Twenty REST API with an API key for unauthenticated public access.
// The API key is configured per workspace and grants permission to create Contato records.
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
    const response = await fetch(`${getRestApiUrl()}/contatos?limit=1`, {
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

// Submits a complete candidatura: creates Contato record + CandidaturaCuidador record.
// Personal data (identity, address, contact, communications consent) → Contato.
// Professional data (availability, course, questionnaire, status) → CandidaturaCuidador.
export const createCandidatura = async (formData: AllFormData): Promise<ApiResult<{ contatoId: string; candidaturaId?: string }>> => {
  try {
    const restApiUrl = getRestApiUrl();
    const headers = authHeaders();

    const email = formData.step1.email.trim();

    // Step A: Create the Contato record; if the email already exists, find the existing contato.
    const contatoPayload = {
      nomeCompleto: formData.step1.nomeCompleto.trim(),
      dataNascimento: formData.step1.dataNascimento || null,
      genero: formData.step1.genero,
      cpf: formData.step1.cpf,
      rg: formData.step1.rg.trim(),
      celular: formData.step1.celular,
      email: email,
      logradouro: formData.step1.logradouro.trim(),
      numero: formData.step1.numero.trim(),
      complemento: formData.step1.complemento.trim(),
      cep: formData.step1.cep,
      bairro: formData.step1.bairro.trim(),
      municipio: formData.step1.municipio.trim(),
      estado: formData.step1.estado,
      aceitaComunicacoes: formData.step4.aceitaComunicacoes,
    };

    const contatoResponse = await fetch(`${restApiUrl}/contatos`, {
      method: 'POST',
      headers,
      body: JSON.stringify(contatoPayload),
    });

    let contatoId: string;

    if (contatoResponse.ok) {
      const contatoResult = await contatoResponse.json();
      contatoId = contatoResult?.data?.createContato?.id ?? contatoResult?.id ?? '';
    } else {
      const body = await contatoResponse.text();
      const isDuplicate = body.includes('duplicate') || body.includes('Duplicate');
      if (contatoResponse.status === 400 && isDuplicate) {
        // Contato already exists — look them up by email.
        const encodedEmail = encodeURIComponent(`"${email}"`);
        const searchResponse = await fetch(
          `${restApiUrl}/contatos?filter=email[eq]:${encodedEmail}&limit=1`,
          { method: 'GET', headers },
        );
        if (!searchResponse.ok) {
          return { error: 'Erro ao localizar cadastro existente. Tente novamente.' };
        }
        const searchResult = await searchResponse.json();
        // REST API returns { data: { contatos: { edges: [{ node: { id } }] } } }
        const edges: Array<{ node: { id: string } }> =
          searchResult?.data?.contatos?.edges ??
          searchResult?.contatos?.edges ??
          searchResult?.data?.edges ??
          searchResult?.edges ??
          [];
        contatoId = edges[0]?.node?.id ?? '';
        if (!contatoId) {
          return { error: toUserFriendlyError(contatoResponse.status, body, 'Erro ao registrar dados de identificação') };
        }
      } else {
        return { error: toUserFriendlyError(contatoResponse.status, body, 'Erro ao registrar dados de identificação') };
      }
    }

    // Step B: Create the CandidaturaCuidador record
    const candidaturaPayload = {
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
      // Status (default: awaiting analysis)
      status: 'AGUARDANDO_ANALISE',
      // Relation to Contato
      ...(contatoId ? { contato: { id: contatoId } } : {}),
    };

    const candidaturaResponse = await fetch(`${restApiUrl}/candidaturasCuidadores`, {
      method: 'POST',
      headers,
      body: JSON.stringify(candidaturaPayload),
    });

    if (!candidaturaResponse.ok) {
      // Candidatura creation failed, but Contato was created — return partial success
      const body = await candidaturaResponse.text();
      // Twenty returns 404 or 400 with "object not found" when the custom object
      // hasn't been created in the workspace yet — degrade gracefully.
      const isObjectNotFound =
        candidaturaResponse.status === 404 ||
        (candidaturaResponse.status === 400 && body.includes('not found'));
      if (isObjectNotFound) {
        console.warn('CandidaturaCuidador object not found in workspace. Only Contato record was created.');
        return { data: { contatoId } };
      }
      return { error: `Erro ao registrar candidatura (${candidaturaResponse.status}): ${body}` };
    }

    const candidaturaResult = await candidaturaResponse.json();
    const candidaturaId: string = candidaturaResult?.data?.createCandidaturaCuidador?.id ?? candidaturaResult?.id ?? '';

    return { data: { contatoId, candidaturaId } };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Erro desconhecido ao enviar candidatura',
    };
  }
};

export type CandidaturaCuidador = {
  id: string;
  status: string;
};

// Fetches a CandidaturaCuidador record by ID.
export const getCandidaturaCuidador = async (id: string): Promise<ApiResult<CandidaturaCuidador>> => {
  try {
    const response = await fetch(`${getRestApiUrl()}/candidaturasCuidadores/${id}`, {
      method: 'GET',
      headers: authHeaders(),
    });
    if (!response.ok) {
      const body = await response.text();
      return { error: toUserFriendlyError(response.status, body, 'Erro ao buscar candidatura') };
    }
    const result = await response.json();
    const record: CandidaturaCuidador =
      result?.data?.candidaturaCuidador ?? result?.data ?? result;
    return { data: record };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Erro ao buscar candidatura' };
  }
};

// Uploads a file via GraphQL multipart upload (graphql-upload protocol).
// Returns the file path (used to create attachment records).
export const uploadArquivo = async (file: File): Promise<ApiResult<{ path: string; token: string }>> => {
  try {
    const apiKey = getApiKey();
    const query = `
      mutation UploadFile($file: Upload!, $fileFolder: FileFolder) {
        uploadFile(file: $file, fileFolder: $fileFolder) {
          path
          token
        }
      }
    `;
    const formData = new FormData();
    formData.append(
      'operations',
      JSON.stringify({ query, variables: { file: null, fileFolder: 'Attachment' } }),
    );
    formData.append('map', JSON.stringify({ '0': ['variables.file'] }));
    formData.append('0', file, file.name);

    const response = await fetch(`${getApiBaseUrl()}/graphql`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: formData,
    });

    if (!response.ok) {
      const body = await response.text();
      return { error: toUserFriendlyError(response.status, body, 'Erro ao enviar arquivo') };
    }

    const result = await response.json() as { data?: { uploadFile?: { path: string; token: string } }; errors?: Array<{ message: string }> };
    if (result.errors?.length) {
      return { error: result.errors[0].message };
    }
    const uploaded = result?.data?.uploadFile;
    if (!uploaded?.path) {
      return { error: 'Resposta inesperada do servidor ao enviar arquivo.' };
    }
    return { data: uploaded };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Erro ao enviar arquivo' };
  }
};

// Creates an attachment record linked to a CandidaturaCuidador custom object.
export const criarAnexo = async (params: {
  candidaturaId: string;
  filePath: string;
  name: string;
  fileType: 'Image' | 'File';
}): Promise<ApiResult<{ id: string }>> => {
  try {
    const response = await fetch(`${getRestApiUrl()}/attachments`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        name: params.name,
        fullPath: params.filePath,
        type: params.fileType,
        custom: { id: params.candidaturaId },
      }),
    });
    if (!response.ok) {
      const body = await response.text();
      return { error: toUserFriendlyError(response.status, body, 'Erro ao registrar anexo') };
    }
    const result = await response.json();
    const record = result?.data?.createAttachment ?? result?.data ?? result;
    return { data: { id: record?.id ?? '' } };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Erro ao registrar anexo' };
  }
};

// Updates the status field of a CandidaturaCuidador record.
export const atualizarStatusCandidatura = async (
  id: string,
  status: string,
): Promise<ApiResult<void>> => {
  try {
    const response = await fetch(`${getRestApiUrl()}/candidaturasCuidadores/${id}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      const body = await response.text();
      return { error: toUserFriendlyError(response.status, body, 'Erro ao atualizar candidatura') };
    }
    return { data: undefined };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Erro ao atualizar candidatura' };
  }
};
