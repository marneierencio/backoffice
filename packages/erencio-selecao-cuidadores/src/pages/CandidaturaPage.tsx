import { FormField } from '@selecao/components/FormField';
import { createPerson } from '@selecao/utils/api';
import { type FormEvent, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CandidaturaPage.module.css';

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  phoneCountryCode: string;
  phoneNumber: string;
  jobTitle: string;
  city: string;
};

const INITIAL_FORM: FormData = {
  firstName: '',
  lastName: '',
  email: '',
  phoneCountryCode: '+55',
  phoneNumber: '',
  jobTitle: '',
  city: '',
};

type FormErrors = Partial<Record<keyof FormData, string>>;

const validate = (data: FormData): FormErrors => {
  const errors: FormErrors = {};

  if (!data.firstName.trim()) {
    errors.firstName = 'Nome é obrigatório';
  }
  if (!data.lastName.trim()) {
    errors.lastName = 'Sobrenome é obrigatório';
  }
  if (!data.email.trim()) {
    errors.email = 'E-mail é obrigatório';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'E-mail inválido';
  }
  if (!data.phoneNumber.trim()) {
    errors.phoneNumber = 'Telefone é obrigatório';
  }

  return errors;
};

export const CandidaturaPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = useCallback(
    (field: keyof FormData) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
        setErrors((prev) => ({ ...prev, [field]: undefined }));
        setSubmitError(null);
      },
    [],
  );

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      const validationErrors = validate(form);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      setSubmitting(true);
      setSubmitError(null);

      const result = await createPerson({
        name: {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
        },
        emails: {
          primaryEmail: form.email.trim(),
          additionalEmails: [],
        },
        phones: {
          primaryPhoneNumber: form.phoneNumber.trim(),
          primaryPhoneCountryCode: form.phoneCountryCode.trim(),
          additionalPhones: [],
        },
        jobTitle: form.jobTitle.trim(),
        city: form.city.trim(),
      });

      setSubmitting(false);

      if (result.error) {
        setSubmitError(result.error);
        return;
      }

      navigate('/confirmacao');
    },
    [form, navigate],
  );

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h1 className={styles.heading}>Cadastro de Candidatura</h1>
          <p className={styles.subtitle}>
            Preencha seus dados para participar do processo de seleção de cuidadores.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className={styles.form}>
          {/* Seção: Dados pessoais */}
          <fieldset className={styles.section}>
            <legend className={styles.sectionTitle}>Dados Pessoais</legend>

            <div className={styles.row}>
              <FormField
                label="Nome"
                htmlFor="firstName"
                required
                error={errors.firstName}
                value={form.firstName}
                onChange={handleChange('firstName')}
                placeholder="Ex: Maria"
                autoComplete="given-name"
              />
              <FormField
                label="Sobrenome"
                htmlFor="lastName"
                required
                error={errors.lastName}
                value={form.lastName}
                onChange={handleChange('lastName')}
                placeholder="Ex: Silva"
                autoComplete="family-name"
              />
            </div>

            <FormField
              label="Cargo / Função desejada"
              htmlFor="jobTitle"
              value={form.jobTitle}
              onChange={handleChange('jobTitle')}
              placeholder="Ex: Cuidador(a) de idosos"
            />

            <FormField
              label="Cidade"
              htmlFor="city"
              value={form.city}
              onChange={handleChange('city')}
              placeholder="Ex: São Paulo"
              autoComplete="address-level2"
            />
          </fieldset>

          {/* Seção: Contato */}
          <fieldset className={styles.section}>
            <legend className={styles.sectionTitle}>Informações de Contato</legend>

            <FormField
              label="E-mail"
              htmlFor="email"
              type="email"
              required
              error={errors.email}
              value={form.email}
              onChange={handleChange('email')}
              placeholder="seu@email.com"
              autoComplete="email"
            />

            <div className={styles.phoneRow}>
              <div className={styles.phoneCode}>
                <FormField
                  label="DDI"
                  htmlFor="phoneCountryCode"
                  value={form.phoneCountryCode}
                  onChange={handleChange('phoneCountryCode')}
                  placeholder="+55"
                  autoComplete="tel-country-code"
                />
              </div>
              <div className={styles.phoneNumber}>
                <FormField
                  label="Telefone"
                  htmlFor="phoneNumber"
                  type="tel"
                  required
                  error={errors.phoneNumber}
                  value={form.phoneNumber}
                  onChange={handleChange('phoneNumber')}
                  placeholder="(11) 99999-0000"
                  autoComplete="tel-national"
                />
              </div>
            </div>
          </fieldset>

          {/* Mensagem de erro geral */}
          {submitError && (
            <div className={styles.submitError} role="alert">
              {submitError}
            </div>
          )}

          {/* Botão de envio */}
          <div className={styles.actions}>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={submitting}
            >
              {submitting ? 'Enviando…' : 'Submeter candidatura'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
