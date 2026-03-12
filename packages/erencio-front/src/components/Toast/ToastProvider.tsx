import React, { createContext, useCallback, useRef, useState } from 'react';

import type { ToastData, ToastMode, ToastVariant } from './Toast';
import { ToastContainer } from './ToastContainer';

type ToastInput = Omit<ToastData, 'id'>;

export type ToastContextValue = {
  showToast: (toast: ToastInput) => void;
  showSuccess: (message: string, detail?: string) => void;
  showError: (message: string, detail?: string) => void;
  showWarning: (message: string, detail?: string) => void;
  showInfo: (message: string, detail?: string) => void;
};

export const ToastContext = createContext<ToastContextValue | null>(null);

// Default dismiss behavior per SLDS 2 spec
const getDefaultMode = (variant: ToastVariant, hasLink: boolean): ToastMode => {
  if (variant === 'success' && !hasLink) return 'dismissible';
  return 'sticky';
};

const getDefaultDuration = (hasLink: boolean): number => {
  return hasLink ? 9600 : 4800;
};

let toastCounter = 0;

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const showToast = useCallback(
    (input: ToastInput) => {
      const id = `toast-${++toastCounter}`;
      const hasLink = !!input.link;
      const mode = input.mode ?? getDefaultMode(input.variant, hasLink);
      const toast: ToastData = { ...input, id, mode };

      setToasts((prev) => [...prev, toast]);

      if (mode === 'dismissible') {
        const ms = input.durationMs ?? getDefaultDuration(hasLink);
        const timer = setTimeout(() => removeToast(id), ms);
        timersRef.current.set(id, timer);
      }
    },
    [removeToast],
  );

  const showSuccess = useCallback(
    (message: string, detail?: string) => showToast({ variant: 'success', message, detail }),
    [showToast],
  );

  const showError = useCallback(
    (message: string, detail?: string) => showToast({ variant: 'error', message, detail }),
    [showToast],
  );

  const showWarning = useCallback(
    (message: string, detail?: string) => showToast({ variant: 'warning', message, detail }),
    [showToast],
  );

  const showInfo = useCallback(
    (message: string, detail?: string) => showToast({ variant: 'info', message, detail }),
    [showToast],
  );

  const value: ToastContextValue = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
};
