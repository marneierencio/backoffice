import { tokens } from '@sfds2/tokens';
import React from 'react';

export type ButtonVariant = 'brand' | 'neutral' | 'outline' | 'ghost' | 'destructive';
export type ButtonSize = 'small' | 'medium' | 'large';

export type ButtonProps = {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  'aria-label'?: string;
};

const getVariantStyles = (variant: ButtonVariant): React.CSSProperties => {
  switch (variant) {
    case 'brand':
      return {
        backgroundColor: tokens.color.brandPrimary,
        color: tokens.color.textInverse,
        border: 'none',
      };
    case 'neutral':
      return {
        backgroundColor: tokens.color.neutral2,
        color: tokens.color.textDefault,
        border: `1px solid ${tokens.color.neutral3}`,
      };
    case 'outline':
      return {
        backgroundColor: 'transparent',
        color: tokens.color.brandPrimary,
        border: `1px solid ${tokens.color.brandPrimary}`,
      };
    case 'ghost':
      return {
        backgroundColor: 'transparent',
        color: tokens.color.brandPrimary,
        border: 'none',
      };
    case 'destructive':
      return {
        backgroundColor: tokens.color.error,
        color: tokens.color.textInverse,
        border: 'none',
      };
    default:
      return {};
  }
};

const getSizeStyles = (size: ButtonSize): React.CSSProperties => {
  switch (size) {
    case 'small':
      return {
        padding: `${tokens.spacing.spacingXXSmall} ${tokens.spacing.spacingXSmall}`,
        fontSize: tokens.typography.fontSizeSmall,
        height: '28px',
      };
    case 'large':
      return {
        padding: `${tokens.spacing.spacingSmall} ${tokens.spacing.spacingLarge}`,
        fontSize: tokens.typography.fontSizeBase,
        height: '48px',
      };
    default:
      return {
        padding: `${tokens.spacing.spacingXXSmall} ${tokens.spacing.spacingMedium}`,
        fontSize: tokens.typography.fontSizeMedium,
        height: '36px',
      };
  }
};

export const Button = ({
  label,
  variant = 'brand',
  size = 'medium',
  disabled = false,
  loading = false,
  iconLeft,
  iconRight,
  onClick,
  type = 'button',
  'aria-label': ariaLabel,
}: ButtonProps) => {
  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing.spacingXXSmall,
    borderRadius: tokens.radius.radiusMedium,
    fontWeight: tokens.typography.fontWeightBold,
    fontFamily: tokens.typography.fontFamilyBase,
    lineHeight: tokens.typography.lineHeightReset,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.5 : 1,
    transition: 'background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease',
    whiteSpace: 'nowrap',
    ...getVariantStyles(variant),
    ...getSizeStyles(size),
  };

  return (
    <button
      type={type}
      style={baseStyle}
      disabled={disabled || loading}
      onClick={onClick}
      aria-label={ariaLabel ?? label}
      aria-busy={loading}
    >
      {iconLeft}
      {loading ? 'Loading…' : label}
      {iconRight}
    </button>
  );
};
