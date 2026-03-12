import { tokens } from '@backoffice/tokens';
import React, { useCallback, useEffect, useRef, useState } from 'react';

export type PopoverPlacement = 'bottom-start' | 'bottom-end' | 'bottom-center' | 'top-start' | 'top-end' | 'top-center';

export type PopoverProps = {
  open: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
  placement?: PopoverPlacement;
  width?: number | string;
  maxHeight?: number | string;
  children: React.ReactNode;
  closeOnOutsideClick?: boolean;
  closeOnEscape?: boolean;
  'aria-label'?: string;
};

export const Popover = ({
  open,
  onClose,
  anchorRef,
  placement = 'bottom-start',
  width,
  maxHeight,
  children,
  closeOnOutsideClick = true,
  closeOnEscape = true,
  'aria-label': ariaLabel,
}: PopoverProps) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const calculatePosition = useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;

    const rect = anchor.getBoundingClientRect();
    let top: number;
    let left: number;

    const isTop = placement.startsWith('top');

    if (isTop) {
      top = rect.top - 4;
    } else {
      top = rect.bottom + 4;
    }

    if (placement.endsWith('start')) {
      left = rect.left;
    } else if (placement.endsWith('end')) {
      left = rect.right;
    } else {
      left = rect.left + rect.width / 2;
    }

    setPosition({ top, left });
  }, [anchorRef, placement]);

  useEffect(() => {
    if (!open) return;
    calculatePosition();

    const handleScroll = () => calculatePosition();
    const handleResize = () => calculatePosition();

    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [open, calculatePosition]);

  useEffect(() => {
    if (!open || !closeOnOutsideClick) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        panelRef.current &&
        !panelRef.current.contains(target) &&
        anchorRef.current &&
        !anchorRef.current.contains(target)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, closeOnOutsideClick, onClose, anchorRef]);

  useEffect(() => {
    if (!open || !closeOnEscape) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, closeOnEscape, onClose]);

  if (!open) return null;

  const transformOriginMap: Record<string, string> = {
    'bottom-start': 'top left',
    'bottom-end': 'top right',
    'bottom-center': 'top center',
    'top-start': 'bottom left',
    'top-end': 'bottom right',
    'top-center': 'bottom center',
  };

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    top: position.top,
    left: placement.endsWith('end') ? undefined : position.left,
    right: placement.endsWith('end') ? window.innerWidth - position.left : undefined,
    transform: placement.endsWith('center') ? 'translateX(-50%)' : undefined,
    width: width,
    maxHeight: maxHeight,
    backgroundColor: tokens.color.neutral0,
    borderRadius: tokens.radius.radiusMedium,
    boxShadow: tokens.elevation.elevationDropdown,
    border: `1px solid ${tokens.color.neutral2}`,
    zIndex: tokens.zIndex.zIndexDropdown,
    overflow: 'hidden',
    transformOrigin: transformOriginMap[placement] ?? 'top left',
    animation: 'backoffice-fade-in 200ms ease-out',
  };

  return (
    <div
      ref={panelRef}
      style={containerStyle}
      role="dialog"
      aria-label={ariaLabel}
    >
      {children}
    </div>
  );
};
