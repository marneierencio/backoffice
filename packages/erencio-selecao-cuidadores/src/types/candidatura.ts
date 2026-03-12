export type Step1Data = {
  nomeCompleto: string;
  dataNascimento: string;
  genero: string;
  cpf: string;
  rg: string;
  celular: string;
  email: string;
  logradouro: string;
  numero: string;
  complemento: string;
  cep: string;
  bairro: string;
  municipio: string;
  estado: string;
};

export type Step2Data = {
  experiencia: string;
  disponibilidadeDias: string[];
  disponibilidadeTurnos: string[];
  referencias: string;
  possuiCurso: boolean;
  instituicaoCurso: string;
  cargaHoraria: string;
  conclusaoMes: string;
  conclusaoAno: string;
};

export type Step3Data = {
  q1: string;
  q2: string;
  q3: string;
  q4: string;
  q5: string;
  q6: string;
  q7: string;
  q8: string;
  q9: string;
  q10: string;
  q11: string;
  q12: string;
  q13: string;
};

export type Step4Data = {
  declaraVerdade: boolean;
  aceitaComunicacoes: boolean;
};

export type AllFormData = {
  step1: Step1Data;
  step2: Step2Data;
  step3: Step3Data;
  step4: Step4Data;
};

export const INITIAL_STEP1: Step1Data = {
  nomeCompleto: '',
  dataNascimento: '',
  genero: '',
  cpf: '',
  rg: '',
  celular: '',
  email: '',
  logradouro: '',
  numero: '',
  complemento: '',
  cep: '',
  bairro: '',
  municipio: '',
  estado: '',
};

export const INITIAL_STEP2: Step2Data = {
  experiencia: '',
  disponibilidadeDias: [],
  disponibilidadeTurnos: [],
  referencias: '',
  possuiCurso: false,
  instituicaoCurso: '',
  cargaHoraria: '',
  conclusaoMes: '',
  conclusaoAno: '',
};

export const INITIAL_STEP3: Step3Data = {
  q1: '',
  q2: '',
  q3: '',
  q4: '',
  q5: '',
  q6: '',
  q7: '',
  q8: '',
  q9: '',
  q10: '',
  q11: '',
  q12: '',
  q13: '',
};

export const INITIAL_STEP4: Step4Data = {
  declaraVerdade: false,
  aceitaComunicacoes: false,
};

export const INITIAL_FORM: AllFormData = {
  step1: INITIAL_STEP1,
  step2: INITIAL_STEP2,
  step3: INITIAL_STEP3,
  step4: INITIAL_STEP4,
};
