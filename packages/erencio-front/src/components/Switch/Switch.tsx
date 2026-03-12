// Switch (toggle) — follows SLDS 2 Checkbox Toggle pattern
// https://www.lightningdesignsystem.com/components/checkbox-toggle/
import { tokens } from '@backoffice/tokens';
import React, { useId } from 'react';

export type SwitchProps = {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  helpText?: string;
  id?: string;
  'aria-label'?: string;
};

export const Switch = ({
  label,
  checked,
  onChange,
  disabled = false,
  helpText,
  id: idProp,
  'aria-label': ariaLabel,
}: SwitchProps) => {
  const autoId = useId();
  const inputId = idProp ?? autoId;

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.spacingXXSmall,
    fontFamily: tokens.typography.fontFamilyBase,
    opacity: disabled ? 0.5 : 1,
  };

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.spacingSmall,
    cursor: disabled ? 'not-allowed' : 'pointer',
  };

  const trackStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    width: '40px',
    height: '24px',
    borderRadius: tokens.radius.radiusPill,
    backgroundColor: checked ? tokens.color.brandPrimary : tokens.color.neutral3,
    transition: 'background-color 0.15s ease',
    cursor: disabled ? 'not-allowed' : 'pointer',
    flexShrink: 0,
  };

  const thumbStyle: React.CSSProperties = {
    position: 'absolute',
    top: '4px',
    left: checked ? '20px' : '4px',
    width: '16px',
    height: '16px',
    borderRadius: tokens.radius.radiusCircle,
    backgroundColor: tokens.color.neutral0,
    boxShadow: tokens.elevation.elevationRaised,
    transition: 'left 0.15s ease',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: tokens.typography.fontSizeMedium,
    color: tokens.color.textLabel,
    userSelect: 'none',
  };

  const helpTextStyle: React.CSSProperties = {
    fontSize: tokens.typography.fontSizeSmall,
    color: tokens.color.textPlaceholder,
  };

  return (
    <div style={containerStyle}>
      <label htmlFor={inputId} style={rowStyle}>
        {/* Visually hidden native checkbox for a11y */}
        <input
          id={inputId}
          type="checkbox"
          role="switch"
          aria-checked={checked}
          aria-label={ariaLabel ?? label}
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          style={{
            position: 'absolute',
            width: '1px',
            height: '1px',
            padding: 0,
            margin: '-1px',
            overflow: 'hidden',
            clip: 'rect(0,0,0,0)',
            whiteSpace: 'nowrap',
            borderWidth: 0,
          }}
        />
        <span style={trackStyle} aria-hidden="true">
          <span style={thumbStyle} />
        </span>
        {label && <span style={labelStyle}>{label}</span>}
      </label>
      {helpText && <p style={helpTextStyle}>{helpText}</p>}
    </div>
  );
};
