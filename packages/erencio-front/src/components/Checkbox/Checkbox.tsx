import { Icon } from '@backoffice/components/Icon';
import { tokens } from '@backoffice/tokens';
import React, { useEffect, useId, useRef } from 'react';

export type CheckboxProps = {
  id?: string;
  label?: string;
  checked?: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  'aria-label'?: string;
};

export const Checkbox = ({
  id,
  label,
  checked = false,
  indeterminate = false,
  disabled = false,
  onChange,
  'aria-label': ariaLabel,
}: CheckboxProps) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  const containerStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: tokens.spacing.spacingXSmall,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
  };

  const boxSize = 16;

  const boxStyle: React.CSSProperties = {
    position: 'relative',
    width: `${boxSize}px`,
    height: `${boxSize}px`,
    flexShrink: 0,
  };

  // Hide native checkbox, overlay custom visual
  const nativeInputStyle: React.CSSProperties = {
    position: 'absolute',
    width: `${boxSize}px`,
    height: `${boxSize}px`,
    margin: 0,
    padding: 0,
    opacity: 0,
    cursor: disabled ? 'not-allowed' : 'pointer',
    zIndex: 1,
  };

  const isActive = checked || indeterminate;

  const visualBoxStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: `${boxSize}px`,
    height: `${boxSize}px`,
    borderRadius: tokens.radius.radiusSmall,
    border: isActive
      ? `1px solid ${tokens.color.brandPrimary}`
      : `1px solid ${tokens.color.borderInput}`,
    backgroundColor: isActive ? tokens.color.brandPrimary : tokens.color.neutral0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: `background-color ${tokens.duration.durationQuickly}, border-color ${tokens.duration.durationQuickly}`,
    pointerEvents: 'none',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: tokens.typography.fontSizeMedium,
    fontWeight: tokens.typography.fontWeightRegular,
    color: disabled ? tokens.color.textDisabled : tokens.color.textDefault,
    fontFamily: tokens.typography.fontFamilyBase,
    lineHeight: tokens.typography.lineHeightText,
    userSelect: 'none',
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(event.target.checked);
  };

  return (
    <label style={containerStyle} htmlFor={inputId}>
      <span style={boxStyle}>
        <input
          ref={inputRef}
          id={inputId}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={handleChange}
          style={nativeInputStyle}
          aria-label={ariaLabel ?? label}
        />
        <span style={visualBoxStyle}>
          {checked && !indeterminate && (
            <Icon name="check" size={12} color={tokens.color.textInverse} />
          )}
          {indeterminate && (
            <Icon name="minus" size={12} color={tokens.color.textInverse} />
          )}
        </span>
      </span>
      {label && <span style={labelStyle}>{label}</span>}
    </label>
  );
};
