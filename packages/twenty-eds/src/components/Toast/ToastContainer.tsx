import { tokens } from '@eds/tokens';
import React from 'react';

import type { ToastData } from './Toast';
import { Toast } from './Toast';

export type ToastContainerProps = {
  toasts: ToastData[];
  onClose: (id: string) => void;
};

export const ToastContainer = ({ toasts, onClose }: ToastContainerProps) => {
  if (toasts.length === 0) return null;

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    top: tokens.spacing.spacingLarge,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: tokens.zIndex.zIndexToast,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.spacingXSmall,
    maxWidth: 640,
    width: '90vw',
    pointerEvents: 'none',
  };

  return (
    <div style={containerStyle} aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} style={{ pointerEvents: 'auto' }}>
          <Toast {...toast} onClose={onClose} />
        </div>
      ))}
    </div>
  );
};
