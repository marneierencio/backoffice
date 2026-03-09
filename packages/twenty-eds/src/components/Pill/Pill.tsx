import { Icon, type IconName } from '@eds/components/Icon';
import { tokens } from '@eds/tokens';
import React from 'react';

export type PillVariant = 'default' | 'brand' | 'error';

export type PillProps = {
  label: string;
  icon?: IconName;
  avatarName?: string;
  onRemove?: () => void;
  disabled?: boolean;
  variant?: PillVariant;
};

const variantStyles: Record<PillVariant, { border: string; bg: string }> = {
  default: { border: tokens.color.neutral3, bg: tokens.color.neutral0 },
  brand: { border: tokens.color.brandPrimary, bg: tokens.color.brandPrimaryLight },
  error: { border: tokens.color.error, bg: tokens.color.errorLight },
};

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

export const Pill = ({
  label,
  icon,
  avatarName,
  onRemove,
  disabled = false,
  variant = 'default',
}: PillProps) => {
  const styles = variantStyles[variant];

  const containerStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: tokens.spacing.spacingXXXSmall,
    padding: `2px ${tokens.spacing.spacingXSmall} 2px ${tokens.spacing.spacingXXXSmall}`,
    borderRadius: tokens.radius.radiusPill,
    border: `1px solid ${styles.border}`,
    backgroundColor: styles.bg,
    fontSize: tokens.typography.fontSizeSmall,
    lineHeight: '1.5',
    fontFamily: tokens.typography.fontFamilyBase,
    opacity: disabled ? 0.5 : 1,
  };

  const avatarStyle: React.CSSProperties = {
    width: '16px',
    height: '16px',
    borderRadius: tokens.radius.radiusCircle,
    backgroundColor: tokens.color.brandPrimary,
    color: tokens.color.textInverse,
    fontSize: '8px',
    fontWeight: tokens.typography.fontWeightBold as React.CSSProperties['fontWeight'],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };

  const removeButtonStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'none',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    color: tokens.color.textPlaceholder,
    flexShrink: 0,
  };

  return (
    <span style={containerStyle} role="listitem">
      {avatarName && !icon && (
        <span style={avatarStyle} aria-hidden="true">
          {getInitials(avatarName)}
        </span>
      )}
      {icon && <Icon name={icon} size={16} />}
      <span style={{ color: tokens.color.textDefault, whiteSpace: 'nowrap' }}>{label}</span>
      {onRemove && !disabled && (
        <button
          onClick={onRemove}
          style={removeButtonStyle}
          aria-label={`Remove ${label}`}
          type="button"
        >
          <Icon name="close" size={12} />
        </button>
      )}
    </span>
  );
};
