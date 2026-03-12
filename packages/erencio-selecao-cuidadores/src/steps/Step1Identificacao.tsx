import { FormField } from '@selecao/components/FormField';
import { type Step1Data } from '@selecao/types/candidatura';
import { lookupCep } from '@selecao/utils/cep';
import { maskCEP, maskCPF, maskPhone } from '@selecao/utils/masks';
import { useCallback } from 'react';
import styles from './Step1Identificacao.module.css';

const ESTADOS = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' },
];

const GENEROS = [
  { value: 'feminino_cis', label: 'Feminino (Cisgênero)' },
  { value: 'masculino_cis', label: 'Masculino (Cisgênero)' },
  { value: 'feminino_trans', label: 'Feminino (Transgênero)' },
  { value: 'masculino_trans', label: 'Masculino (Transgênero)' },
];

export type Step1Errors = Partial<Record<keyof Step1Data, string>>;

type Step1Props = {
  data: Step1Data;
  onChange: (updates: Partial<Step1Data>) => void;
  errors: Step1Errors;
};

export const Step1Identificacao = ({ data, onChange, errors }: Step1Props) => {
  const handleCepChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const masked = maskCEP((e as React.ChangeEvent<HTMLInputElement>).target.value);
      onChange({ cep: masked });

      const digits = masked.replace(/\D/g, '');
      if (digits.length === 8) {
        const result = await lookupCep(digits);
        if (result) {
          onChange({
            bairro: result.bairro,
            municipio: result.municipio,
            estado: result.estado,
          });
        }
      }
    },
    [onChange],
  );

  return (
    <div className={styles.stepContent}>
      <fieldset className={styles.section}>
        <legend className={styles.sectionTitle}>Dados Pessoais</legend>

        <FormField
          label="Nome completo"
          htmlFor="nomeCompleto"
          required
          error={errors.nomeCompleto}
          value={data.nomeCompleto}
          onChange={(e) => onChange({ nomeCompleto: e.target.value })}
          placeholder="Ex: Maria da Silva"
          autoComplete="name"
          maxLength={200}
        />

        <div className={styles.row}>
          <FormField
            label="Data de nascimento"
            htmlFor="dataNascimento"
            type="date"
            required
            error={errors.dataNascimento}
            value={data.dataNascimento}
            onChange={(e) => onChange({ dataNascimento: e.target.value })}
            max={new Date().toISOString().split('T')[0]}
          />

          <FormField
            label="Gênero"
            htmlFor="genero"
            required
            error={errors.genero}
          >
            <select
              id="genero"
              className={`selecao-control selecao-control-select ${errors.genero ? 'selecao-control--error' : ''}`}
              value={data.genero}
              onChange={(e) => onChange({ genero: e.target.value })}
              required
              aria-invalid={!!errors.genero}
              aria-describedby={errors.genero ? 'genero-error' : undefined}
            >
              <option value="">Selecione...</option>
              {GENEROS.map((g) => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
          </FormField>
        </div>

        <div className={styles.row}>
          <FormField
            label="CPF"
            htmlFor="cpf"
            required
            error={errors.cpf}
            value={data.cpf}
            onChange={(e) => onChange({ cpf: maskCPF(e.target.value) })}
            placeholder="000.000.000-00"
            inputMode="numeric"
            maxLength={14}
          />

          <FormField
            label="Carteira de Identidade (RG)"
            htmlFor="rg"
            required
            error={errors.rg}
            value={data.rg}
            onChange={(e) => onChange({ rg: e.target.value })}
            placeholder="Ex: 12.345.678-9"
            maxLength={100}
          />
        </div>
      </fieldset>

      <fieldset className={styles.section}>
        <legend className={styles.sectionTitle}>Contato</legend>

        <div className={styles.row}>
          <FormField
            label="Celular"
            htmlFor="celular"
            type="tel"
            required
            error={errors.celular}
            value={data.celular}
            onChange={(e) => onChange({ celular: maskPhone(e.target.value) })}
            placeholder="(00) 00000-0000"
            inputMode="numeric"
            maxLength={15}
            autoComplete="tel-national"
          />

          <FormField
            label="E-mail"
            htmlFor="email"
            type="email"
            required
            error={errors.email}
            value={data.email}
            onChange={(e) => onChange({ email: e.target.value })}
            placeholder="seu@email.com"
            autoComplete="email"
          />
        </div>
      </fieldset>

      <fieldset className={styles.section}>
        <legend className={styles.sectionTitle}>Endereço</legend>

        <div className={styles.rowCep}>
          <div className={styles.cepField}>
            <FormField
              label="CEP"
              htmlFor="cep"
              required
              error={errors.cep}
              value={data.cep}
              onChange={handleCepChange}
              placeholder="00000-000"
              inputMode="numeric"
              maxLength={9}
            />
          </div>
          <div className={styles.logradouroField}>
            <FormField
              label="Logradouro"
              htmlFor="logradouro"
              required
              error={errors.logradouro}
              value={data.logradouro}
              onChange={(e) => onChange({ logradouro: e.target.value })}
              placeholder="Nome da rua, avenida, etc."
              autoComplete="street-address"
            />
          </div>
        </div>

        <div className={styles.row}>
          <FormField
            label="Número"
            htmlFor="numero"
            required
            error={errors.numero}
            value={data.numero}
            onChange={(e) => onChange({ numero: e.target.value })}
            placeholder="Ex: 123"
            maxLength={20}
          />

          <FormField
            label="Complemento"
            htmlFor="complemento"
            error={errors.complemento}
            value={data.complemento}
            onChange={(e) => onChange({ complemento: e.target.value })}
            placeholder="Apto, bloco, etc. (opcional)"
            maxLength={100}
          />
        </div>

        <div className={styles.row}>
          <FormField
            label="Bairro"
            htmlFor="bairro"
            required
            error={errors.bairro}
            value={data.bairro}
            onChange={(e) => onChange({ bairro: e.target.value })}
            placeholder="Preenchido automaticamente pelo CEP"
            autoComplete="address-level3"
          />

          <FormField
            label="Município"
            htmlFor="municipio"
            required
            error={errors.municipio}
            value={data.municipio}
            onChange={(e) => onChange({ municipio: e.target.value })}
            placeholder="Preenchido automaticamente pelo CEP"
            autoComplete="address-level2"
          />
        </div>

        <div className={styles.estadoRow}>
          <FormField
            label="Estado (UF)"
            htmlFor="estado"
            required
            error={errors.estado}
          >
            <select
              id="estado"
              className={`selecao-control selecao-control-select ${errors.estado ? 'selecao-control--error' : ''}`}
              value={data.estado}
              onChange={(e) => onChange({ estado: e.target.value })}
              required
              aria-invalid={!!errors.estado}
              aria-describedby={errors.estado ? 'estado-error' : undefined}
            >
              <option value="">Selecione o estado...</option>
              {ESTADOS.map((uf) => (
                <option key={uf.value} value={uf.value}>{uf.label}</option>
              ))}
            </select>
          </FormField>
        </div>
      </fieldset>
    </div>
  );
};

export const validateStep1 = (data: Step1Data): Step1Errors => {
  const errors: Step1Errors = {};

  if (!data.nomeCompleto.trim()) errors.nomeCompleto = 'Nome completo é obrigatório';
  if (!data.dataNascimento) errors.dataNascimento = 'Data de nascimento é obrigatória';
  if (!data.genero) errors.genero = 'Gênero é obrigatório';

  const cpfDigits = data.cpf.replace(/\D/g, '');
  if (cpfDigits.length !== 11) errors.cpf = 'CPF deve ter 11 dígitos';

  if (!data.rg.trim()) errors.rg = 'Carteira de Identidade é obrigatória';

  const phoneDigits = data.celular.replace(/\D/g, '');
  if (phoneDigits.length < 10) errors.celular = 'Celular inválido';

  if (!data.email.trim()) {
    errors.email = 'E-mail é obrigatório';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'E-mail inválido';
  }

  if (!data.logradouro.trim()) errors.logradouro = 'Logradouro é obrigatório';
  if (!data.numero.trim()) errors.numero = 'Número é obrigatório';

  const cepDigits = data.cep.replace(/\D/g, '');
  if (cepDigits.length !== 8) errors.cep = 'CEP deve ter 8 dígitos';

  if (!data.bairro.trim()) errors.bairro = 'Bairro é obrigatório';
  if (!data.municipio.trim()) errors.municipio = 'Município é obrigatório';
  if (!data.estado) errors.estado = 'Estado é obrigatório';

  return errors;
};
