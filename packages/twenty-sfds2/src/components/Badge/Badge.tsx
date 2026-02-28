import { tokens } from '@sfds2/tokens';
import React from 'react';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'brand';
export type BadgeSize = 'small' | 'medium';

export type BadgeProps = {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  iconLeft?: React.ReactNode;
};

const variantMap: Record<BadgeVariant, { bg: string; color: string; border: string }> = {
  default: { bg: tokens.color.neutral2, color: tokens.color.textLabel, border: tokens.color.neutral3 },
  success: { bg: tokens.color.successLight, color: tokens.color.success, border: tokens.color.success },
  warning: { bg: tokens.color.warningLight, color: tokens.color.warning, border: tokens.color.warning },
  error: { bg: tokens.color.errorLight, color: tokens.color.error, border: tokens.color.error },
  info: { bg: tokens.color.infoLight, color: tokens.color.info, border: tokens.color.info },
  brand: { bg: tokens.color.brandPrimaryLight, color: tokens.color.brandPrimary, border: tokens.color.brandPrimary },
};

export const Badge = ({ label, variant = 'default', size = 'medium', iconLeft }: BadgeProps) => {
  const colors = variantMap[variant];

  const badgeStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: tokens.spacing.spacingXXXSmall,
    padding: size === 'small'
      ? `2px ${tokens.spacing.spacingXXSmall}`
      : `${tokens.spacing.spacingXXXSmall} ${tokens.spacing.spacingXSmall}`,
    borderRadius: tokens.radius.radiusPill,
    border: `1px solid ${colors.border}`,
    backgroundColor: colors.bg,
    color: colors.color,
    fontSize: size === 'small' ? tokens.typography.fontSizeXSmall : tokens.typography.fontSizeSmall,
    fontWeight: tokens.typography.fontWeightBold,
    fontFamily: tokens.typography.fontFamilyBase,
    lineHeight: '1',
    whiteSpace: 'nowrap',
  };

  return (
    <span style={badgeStyle}>
      {iconLeft}
      {label}
    </span>
  );
};
