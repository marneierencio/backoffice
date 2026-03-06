import { useEffect } from 'react';

export type UseKeyboardShortcutOptions = {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  enabled?: boolean;
  preventDefault?: boolean;
};

export const useKeyboardShortcut = (
  options: UseKeyboardShortcutOptions,
  callback: () => void,
) => {
  const {
    key,
    ctrlKey = false,
    metaKey = false,
    shiftKey = false,
    altKey = false,
    enabled = true,
    preventDefault = true,
  } = options;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== key.toLowerCase()) return;

      // Cross-platform: treat ctrlKey and metaKey as interchangeable
      const wantsCtrlOrMeta = ctrlKey || metaKey;
      const hasCtrlOrMeta = e.ctrlKey || e.metaKey;

      if (wantsCtrlOrMeta && !hasCtrlOrMeta) return;
      if (!wantsCtrlOrMeta && hasCtrlOrMeta) return;

      if (shiftKey && !e.shiftKey) return;
      if (!shiftKey && e.shiftKey) return;

      if (altKey && !e.altKey) return;
      if (!altKey && e.altKey) return;

      if (preventDefault) e.preventDefault();
      callback();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [key, ctrlKey, metaKey, shiftKey, altKey, enabled, preventDefault, callback]);
};
