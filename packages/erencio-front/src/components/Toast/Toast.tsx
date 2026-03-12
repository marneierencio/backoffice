import type { IconName } from '@backoffice/components/Icon';
import { Icon } from '@backoffice/components/Icon';
import { tokens } from '@backoffice/tokens';
import React from 'react';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export type ToastMode = 'dismissible' | 'sticky';

export type ToastData = {
  id: string;
  variant: ToastVariant;
  message: string;
  detail?: string;
  link?: { label: string; href: string };
  mode?: ToastMode;
  durationMs?: number;
};

export type ToastProps = ToastData & {
  onClose: (id: string) => void;
};

const variantConfig: Record<
  ToastVariant,
  { bg: string; border: string; iconColor: string; iconName: IconName }
> = {
  success: {
    bg: tokens.color.successLight,
    border: tokens.color.success,
    iconColor: tokens.color.success,
    iconName: 'success',
  },
  error: {
    bg: tokens.color.errorLight,
    border: tokens.color.error,
    iconColor: tokens.color.error,
    iconName: 'error-icon',
  },
  warning: {
    bg: tokens.color.warningLight,
    border: tokens.color.warning,
    iconColor: tokens.color.warning,
    iconName: 'warning',
  },
  info: {
    bg: tokens.color.infoLight,
    border: tokens.color.brandPrimary,
    iconColor: tokens.color.brandPrimary,
    iconName: 'info',
  },
};

export const Toast = ({ id, variant, message, detail, link, onClose }: ToastProps) => {
  const config = variantConfig[variant];

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: tokens.spacing.spacingSmall,
    minHeight: 48,
    padding: `${tokens.spacing.spacingSmall} ${tokens.spacing.spacingMedium}`,
    backgroundColor: config.bg,
    borderLeft: `4px solid ${config.border}`,
    borderRadius: tokens.radius.radiusMedium,
    boxShadow: tokens.elevation.elevationDropdown,
    fontFamily: tokens.typography.fontFamilyBase,
    animation: `backoffice-toast-enter 200ms ease-out`,
  };

  return (
    <div role="status" aria-atomic="true" style={containerStyle}>
      <div style={{ flexShrink: 0, marginTop: 2 }}>
        <Icon name={config.iconName} size={20} color={config.iconColor} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: tokens.typography.fontSizeMedium,
            fontWeight: tokens.typography.fontWeightMedium,
            color: tokens.color.textDefault,
            lineHeight: tokens.typography.lineHeightText,
          }}
        >
          {message}
        </div>
        {detail && (
          <div
            style={{
              fontSize: tokens.typography.fontSizeSmall,
              color: tokens.color.textLabel,
              lineHeight: tokens.typography.lineHeightText,
              marginTop: tokens.spacing.spacingXXSmall,
            }}
          >
            {detail}
          </div>
        )}
        {link && (
          <a
            href={link.href}
            style={{
              fontSize: tokens.typography.fontSizeSmall,
              color: tokens.color.textLink,
              marginTop: tokens.spacing.spacingXXSmall,
              display: 'inline-block',
              textDecoration: 'underline',
            }}
          >
            {link.label}
          </a>
        )}
      </div>
      <button
        onClick={() => onClose(id)}
        aria-label="Close notification"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 24,
          height: 24,
          border: 'none',
          borderRadius: tokens.radius.radiusMedium,
          backgroundColor: 'transparent',
          color: tokens.color.textPlaceholder,
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        <Icon name="close" size={14} />
      </button>
    </div>
  );
};
