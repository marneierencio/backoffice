import { tokens } from '@backoffice/tokens';
import React, { useId } from 'react';

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type SelectProps = {
  id?: string;
  label?: string;
  value?: string;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  hint?: string;
  onChange?: (value: string) => void;
  name?: string;
  'aria-label'?: string;
};

export const Select = ({
  id,
  label,
  value,
  options,
  placeholder,
  disabled = false,
  required = false,
  error,
  hint,
  onChange,
  name,
  'aria-label': ariaLabel,
}: SelectProps) => {
  const generatedId = useId();
  const selectId = id ?? name ?? generatedId;

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

  const selectStyle: React.CSSProperties = {
    width: '100%',
    height: '36px',
    padding: `0 ${tokens.spacing.spacingSmall}`,
    border: `1px solid ${error ? tokens.color.borderError : tokens.color.borderInput}`,
    borderRadius: tokens.radius.radiusMedium,
    fontSize: tokens.typography.fontSizeMedium,
    color: disabled ? tokens.color.textDisabled : tokens.color.textDefault,
    backgroundColor: disabled ? tokens.color.neutral1 : tokens.color.neutral0,
    fontFamily: tokens.typography.fontFamilyBase,
    outline: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    appearance: 'auto',
    transition: `border-color ${tokens.duration.durationQuickly}`,
  };

  const hintStyle: React.CSSProperties = {
    fontSize: tokens.typography.fontSizeSmall,
    color: error ? tokens.color.error : tokens.color.textPlaceholder,
  };

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange?.(event.target.value);
  };

  return (
    <div style={containerStyle}>
      {label && (
        <label htmlFor={selectId} style={labelStyle}>
          {label}
          {required && (
            <span style={{ color: tokens.color.error, marginLeft: '2px' }}>*</span>
          )}
        </label>
      )}
      <select
        id={selectId}
        name={name}
        value={value}
        disabled={disabled}
        required={required}
        onChange={handleChange}
        style={selectStyle}
        aria-invalid={Boolean(error)}
        aria-describedby={hint ?? error ? `${selectId}-hint` : undefined}
        aria-label={ariaLabel ?? label}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      {(hint ?? error) && (
        <span id={`${selectId}-hint`} style={hintStyle}>
          {error ?? hint}
        </span>
      )}
    </div>
  );
};
