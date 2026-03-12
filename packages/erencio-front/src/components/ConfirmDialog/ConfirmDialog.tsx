import { Button } from '@backoffice/components/Button';
import { Icon } from '@backoffice/components/Icon';
import { Modal } from '@backoffice/components/Modal';
import { tokens } from '@backoffice/tokens';
import React from 'react';

export type ConfirmDialogVariant = 'destructive' | 'warning' | 'info';

export type ConfirmDialogProps = {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string | React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmDialogVariant;
  loading?: boolean;
  'aria-label'?: string;
};

const variantConfig: Record<
  ConfirmDialogVariant,
  { icon: 'error-icon' | 'warning' | 'info'; color: string; buttonVariant: 'destructive' | 'brand' }
> = {
  destructive: {
    icon: 'error-icon',
    color: tokens.color.error,
    buttonVariant: 'destructive',
  },
  warning: {
    icon: 'warning',
    color: tokens.color.warning,
    buttonVariant: 'brand',
  },
  info: {
    icon: 'info',
    color: tokens.color.brandPrimary,
    buttonVariant: 'brand',
  },
};

export const ConfirmDialog = ({
  open,
  onConfirm,
  onCancel,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancel',
  variant = 'destructive',
  loading = false,
  'aria-label': ariaLabel,
}: ConfirmDialogProps) => {
  const config = variantConfig[variant];
  const defaultConfirmLabel = variant === 'destructive' ? 'Delete' : 'Confirm';

  const headerContent = (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacing.spacingSmall,
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 32,
          height: 32,
          borderRadius: tokens.radius.radiusCircle,
          backgroundColor:
            variant === 'destructive'
              ? tokens.color.errorLight
              : variant === 'warning'
                ? tokens.color.warningLight
                : tokens.color.infoLight,
          flexShrink: 0,
        }}
      >
        <Icon name={config.icon} size={16} color={config.color} />
      </div>
      <span
        style={{
          fontSize: tokens.typography.fontSizeLarge,
          fontWeight: tokens.typography.fontWeightBold,
          color: tokens.color.textDefault,
        }}
      >
        {title}
      </span>
    </div>
  );

  const footerContent = (
    <div style={{ display: 'flex', gap: tokens.spacing.spacingXSmall, justifyContent: 'flex-end' }}>
      <Button label={cancelLabel} variant="neutral" onClick={onCancel} disabled={loading} />
      <Button
        label={confirmLabel ?? defaultConfirmLabel}
        variant={config.buttonVariant}
        onClick={onConfirm}
        loading={loading}
        disabled={loading}
      />
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={onCancel}
      size="small"
      footer={footerContent}
      aria-label={ariaLabel ?? title}
    >
      <div style={{ padding: `0 ${tokens.spacing.spacingXSmall}` }}>
        {/* Custom header (inside body since Modal title props don't support icons) */}
        <div style={{ marginBottom: tokens.spacing.spacingMedium }}>
          {headerContent}
        </div>

        {/* Message */}
        <div
          style={{
            fontSize: tokens.typography.fontSizeMedium,
            color: tokens.color.textDefault,
            lineHeight: tokens.typography.lineHeightText,
          }}
        >
          {typeof message === 'string' ? <p style={{ margin: 0 }}>{message}</p> : message}
        </div>
      </div>
    </Modal>
  );
};
