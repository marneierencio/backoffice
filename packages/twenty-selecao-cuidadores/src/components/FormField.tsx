import { type InputHTMLAttributes } from 'react';
import styles from './FormField.module.css';

type FormFieldProps = {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  children?: React.ReactNode;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'children'>;

export const FormField = ({
  label,
  htmlFor,
  required,
  error,
  helpText,
  children,
  ...inputProps
}: FormFieldProps) => (
  <div className={styles.field}>
    <label className={styles.label} htmlFor={htmlFor}>
      {label}
      {required && <abbr className={styles.required} title="obrigatório"> *</abbr>}
    </label>
    {children ?? (
      <input
        id={htmlFor}
        className={`${styles.input} ${error ? styles.inputError : ''}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${htmlFor}-error` : undefined}
        required={required}
        {...inputProps}
      />
    )}
    {error && (
      <p id={`${htmlFor}-error`} className={styles.error} role="alert">
        {error}
      </p>
    )}
    {helpText && !error && (
      <p className={styles.help}>{helpText}</p>
    )}
  </div>
);
