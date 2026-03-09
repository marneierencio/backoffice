// CopyInput — read-only input with copy-to-clipboard button
// Based on SLDS 2 Input with icon suffix pattern
import { Icon } from '@eds/components/Icon';
import { tokens } from '@eds/tokens';
import React, { useId, useState } from 'react';

export type CopyInputProps = {
  value: string;
  label?: string;
  masked?: boolean;
  successMessage?: string;
  id?: string;
  style?: React.CSSProperties;
};

export const CopyInput = ({
  value,
  label,
  masked = false,
  successMessage = 'Copied!',
  id: idProp,
  style,
}: CopyInputProps) => {
  const autoId = useId();
  const inputId = idProp ?? autoId;
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for environments without clipboard API
      const textarea = document.createElement('textarea');
      textarea.value = value;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.spacingXXSmall,
    fontFamily: tokens.typography.fontFamilyBase,
    ...style,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: tokens.typography.fontSizeMedium,
    fontWeight: tokens.typography.fontWeightMedium,
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
    paddingLeft: tokens.spacing.spacingSmall,
    paddingRight: masked ? '72px' : '40px',
    border: `1px solid ${tokens.color.borderInput}`,
    borderRadius: tokens.radius.radiusMedium,
    backgroundColor: tokens.color.neutral1,
    color: tokens.color.textDefault,
    fontSize: tokens.typography.fontSizeMedium,
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box',
    cursor: 'text',
  };

  const iconButtonBaseStyle: React.CSSProperties = {
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: tokens.radius.radiusSmall,
    color: copied ? tokens.color.success : tokens.color.textPlaceholder,
    transition: 'color 0.15s ease',
  };

  const copyBtnStyle: React.CSSProperties = {
    ...iconButtonBaseStyle,
    right: '8px',
  };

  const eyeBtnStyle: React.CSSProperties = {
    ...iconButtonBaseStyle,
    right: '36px',
    color: tokens.color.textPlaceholder,
  };

  const displayValue = masked && !revealed
    ? '•'.repeat(Math.min(value.length, 32))
    : value;

  return (
    <div style={containerStyle}>
      {label && <label htmlFor={inputId} style={labelStyle}>{label}</label>}
      <div style={inputWrapperStyle}>
        <input
          id={inputId}
          type="text"
          readOnly
          value={displayValue}
          style={inputStyle}
          aria-label={label ?? 'Value'}
        />
        {masked && (
          <button
            type="button"
            style={eyeBtnStyle}
            onClick={() => setRevealed((r) => !r)}
            aria-label={revealed ? 'Hide value' : 'Reveal value'}
          >
            <Icon name={revealed ? 'eye-off' : 'eye'} size={14} color="currentColor" aria-hidden />
          </button>
        )}
        <button
          type="button"
          style={copyBtnStyle}
          onClick={handleCopy}
          aria-label={`Copy ${label ?? 'value'}`}
          title={copied ? successMessage : `Copy ${label ?? 'value'}`}
        >
          <Icon
            name={copied ? 'check-circle' : 'copy'}
            size={14}
            color="currentColor"
            aria-hidden
          />
        </button>
      </div>
      {copied && (
        <p
          role="status"
          aria-live="polite"
          style={{
            fontSize: tokens.typography.fontSizeSmall,
            color: tokens.color.success,
            margin: 0,
          }}
        >
          {successMessage}
        </p>
      )}
    </div>
  );
};
