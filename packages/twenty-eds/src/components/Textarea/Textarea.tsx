import { tokens } from '@eds/tokens';
import React, { useId, useMemo } from 'react';

export type TextareaProps = {
  id?: string;
  value: string;
  placeholder?: string;
  label?: string;
  rows?: number;
  maxLength?: number;
  disabled?: boolean;
  readOnly?: boolean;
  error?: boolean;
  resize?: 'none' | 'vertical' | 'both';
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLTextAreaElement>) => void;
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-required'?: boolean;
  'aria-invalid'?: boolean;
  style?: React.CSSProperties;
};

export const Textarea = ({
  id,
  value,
  placeholder,
  label,
  rows = 4,
  maxLength,
  disabled = false,
  readOnly = false,
  error = false,
  resize = 'vertical',
  onChange,
  onBlur,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'aria-required': ariaRequired,
  'aria-invalid': ariaInvalid,
  style,
}: TextareaProps) => {
  const autoId = useId();
  const textareaId = id ?? autoId;

  const charCount = value.length;
  const isOverLimit = maxLength != null && charCount > maxLength;

  const textareaStyle: React.CSSProperties = useMemo(
    () => ({
      width: '100%',
      minHeight: `${rows * 1.5}em`,
      padding: `${tokens.spacing.spacingXSmall} ${tokens.spacing.spacingSmall}`,
      border: `1px solid ${error || ariaInvalid ? tokens.color.borderError : tokens.color.borderInput}`,
      borderRadius: tokens.radius.radiusMedium,
      fontFamily: tokens.typography.fontFamilyBase,
      fontSize: tokens.typography.fontSizeMedium,
      lineHeight: tokens.typography.lineHeightText,
      color: disabled ? tokens.color.textDisabled : tokens.color.textDefault,
      backgroundColor: disabled
        ? tokens.color.neutral1
        : readOnly
          ? 'transparent'
          : tokens.color.neutral0,
      resize: readOnly ? 'none' : resize,
      outline: 'none',
      boxSizing: 'border-box' as const,
      cursor: disabled ? 'not-allowed' : readOnly ? 'default' : 'text',
      ...(readOnly && { border: 'none', padding: 0 }),
      ...style,
    }),
    [rows, error, ariaInvalid, disabled, readOnly, resize, style],
  );

  const counterStyle: React.CSSProperties = {
    textAlign: 'right',
    fontSize: tokens.typography.fontSizeSmall,
    color: isOverLimit ? tokens.color.error : tokens.color.textPlaceholder,
    marginTop: tokens.spacing.spacingXXSmall,
  };

  return (
    <div style={{ fontFamily: tokens.typography.fontFamilyBase }}>
      {label && (
        <label
          htmlFor={textareaId}
          style={{
            display: 'block',
            marginBottom: tokens.spacing.spacingXXSmall,
            fontSize: tokens.typography.fontSizeMedium,
            fontWeight: tokens.typography.fontWeightMedium,
            color: tokens.color.textLabel,
          }}
        >
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        value={value}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        disabled={disabled}
        readOnly={readOnly}
        onChange={onChange}
        onBlur={onBlur}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-required={ariaRequired}
        aria-invalid={ariaInvalid ?? error}
        style={textareaStyle}
        onFocus={(e) => {
          if (!readOnly && !disabled) {
            e.currentTarget.style.borderColor = error
              ? tokens.color.borderError
              : tokens.color.borderFocus;
            if (!error) {
              e.currentTarget.style.boxShadow = `0 0 0 1px ${tokens.color.brandPrimary}`;
            }
          }
        }}
        onBlurCapture={(e) => {
          e.currentTarget.style.borderColor = error
            ? tokens.color.borderError
            : tokens.color.borderInput;
          e.currentTarget.style.boxShadow = 'none';
        }}
      />
      {maxLength != null && (
        <div style={counterStyle}>
          {charCount}/{maxLength}
        </div>
      )}
    </div>
  );
};
