import { type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import styles from './FormField.module.css';

type FormFieldProps = {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  children?: React.ReactNode;
  // Textarea support
  textarea?: boolean;
  rows?: number;
} & Omit<InputHTMLAttributes<HTMLInputElement> & TextareaHTMLAttributes<HTMLTextAreaElement>, 'children'>;

export const FormField = ({
  label,
  htmlFor,
  required,
  error,
  helpText,
  children,
  textarea,
  rows,
  ...inputProps
}: FormFieldProps) => {
  const fieldClass = `${styles.input} ${error ? styles.inputError : ''}`;

  const renderControl = () => {
    if (children !== undefined) return children;

    if (textarea === true || rows !== undefined) {
      return (
        <textarea
          id={htmlFor}
          className={fieldClass}
          rows={rows ?? 3}
          aria-invalid={!!error}
          aria-describedby={error ? `${htmlFor}-error` : undefined}
          required={required}
          {...(inputProps as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      );
    }

    return (
      <input
        id={htmlFor}
        className={fieldClass}
        aria-invalid={!!error}
        aria-describedby={error ? `${htmlFor}-error` : undefined}
        required={required}
        {...(inputProps as InputHTMLAttributes<HTMLInputElement>)}
      />
    );
  };

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={htmlFor}>
        {label}
        {required && <abbr className={styles.required} title="obrigatório"> *</abbr>}
      </label>
      {renderControl()}
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
};
