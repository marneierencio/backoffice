import { useContext } from 'react';

import type { ToastContextValue } from '@backoffice/components/Toast/ToastProvider';
import { ToastContext } from '@backoffice/components/Toast/ToastProvider';

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
};
