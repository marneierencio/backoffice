import { tokens } from '@sfds2/tokens';
import React, { useId } from 'react';

export type InputProps = {
  id?: string;
  label?: string;
  value?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'search' | 'tel' | 'url';
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  error?: string;
  hint?: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  name?: string;
  autoComplete?: string;
};

export const Input = ({
  id,
  label,
  value,
  placeholder,
  type = 'text',
  disabled = false,
  readOnly = false,
  required = false,
  error,
  hint,
  iconLeft,
  iconRight,
  onChange,
  onBlur,
  onFocus,
  name,
  autoComplete,
}: InputProps) => {
  const generatedId = useId();
  const inputId = id ?? name ?? generatedId;

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.spacingXXSmall,
    fontFamily: tokens.typography.fontFamilyBase,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: tokens.typography.fontSizeSmall,
    fontWeight: tokens.typography.fontWeightBold,
    color: tokens.color.textLabel,
  };

  const inputWrapperStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: '36px',
    padding: `0 ${tokens.spacing.spacingSmall}`,
    paddingLeft: iconLeft ? tokens.spacing.spacingXLarge : tokens.spacing.spacingSmall,
    paddingRight: iconRight ? tokens.spacing.spacingXLarge : tokens.spacing.spacingSmall,
    border: `1px solid ${error ? tokens.color.borderError : tokens.color.borderInput}`,
    borderRadius: tokens.radius.radiusMedium,
    fontSize: tokens.typography.fontSizeMedium,
    color: disabled ? tokens.color.textDisabled : tokens.color.textDefault,
    backgroundColor: disabled ? tokens.color.neutral1 : tokens.color.neutral0,
    fontFamily: tokens.typography.fontFamilyBase,
    outline: 'none',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
    cursor: disabled ? 'not-allowed' : 'text',
  };

  const hintStyle: React.CSSProperties = {
    fontSize: tokens.typography.fontSizeSmall,
    color: error ? tokens.color.error : tokens.color.textPlaceholder,
  };

  return (
    <div style={containerStyle}>
      {label && (
        <label htmlFor={inputId} style={labelStyle}>
          {label}
          {required && (
            <span style={{ color: tokens.color.error, marginLeft: '2px' }}>*</span>
          )}
        </label>
      )}
      <div style={inputWrapperStyle}>
        {iconLeft && (
          <span
            style={{
              position: 'absolute',
              left: tokens.spacing.spacingXSmall,
              color: tokens.color.textPlaceholder,
              pointerEvents: 'none',
            }}
          >
            {iconLeft}
          </span>
        )}
        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          autoComplete={autoComplete}
          style={inputStyle}
          aria-invalid={Boolean(error)}
          aria-describedby={hint ?? error ? `${inputId}-hint` : undefined}
        />
        {iconRight && (
          <span
            style={{
              position: 'absolute',
              right: tokens.spacing.spacingXSmall,
              color: tokens.color.textPlaceholder,
              pointerEvents: 'none',
            }}
          >
            {iconRight}
          </span>
        )}
      </div>
      {(hint ?? error) && (
        <span id={`${inputId}-hint`} style={hintStyle}>
          {error ?? hint}
        </span>
      )}
    </div>
  );
};
