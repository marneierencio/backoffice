import { Icon } from '@eds/components/Icon';
import { tokens } from '@eds/tokens';
import React, { useCallback, useEffect, useRef } from 'react';

export type ModalSize = 'small' | 'medium' | 'large';

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  tagline?: string;
  size?: ModalSize;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  'aria-label'?: string;
};

const sizeStyles: Record<ModalSize, React.CSSProperties> = {
  small: { width: '60vw', minWidth: 320, maxWidth: 480 },
  medium: { width: '70vw', minWidth: 400, maxWidth: 640 },
  large: { width: '90vw', minWidth: 480, maxWidth: 960 },
};

export const Modal = ({
  open,
  onClose,
  title,
  tagline,
  size = 'medium',
  children,
  footer,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  'aria-label': ariaLabel,
}: ModalProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Store the element that had focus when modal opened
  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement;

      // Focus first focusable element or the dialog itself
      requestAnimationFrame(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        const focusable = dialog.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusable) {
          focusable.focus();
        } else {
          dialog.focus();
        }
      });
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [open]);

  // Escape key handler
  useEffect(() => {
    if (!open || !closeOnEscape) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, closeOnEscape, onClose]);

  // Focus trap
  const handleTabKey = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const dialog = dialogRef.current;
      if (!dialog) return;

      const focusableElements = dialog.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    },
    [],
  );

  if (!open) return null;

  const backdropStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: tokens.zIndex.zIndexModal,
    animation: `eds-fade-in ${tokens.duration.durationPromptly} ease-out`,
  };

  const dialogStyle: React.CSSProperties = {
    ...sizeStyles[size],
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: tokens.color.neutral0,
    borderRadius: tokens.radius.radiusLarge,
    boxShadow: tokens.elevation.elevationModal,
    fontFamily: tokens.typography.fontFamilyBase,
    outline: 'none',
    animation: `eds-slide-up ${tokens.duration.durationPromptly} ease-out`,
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: `${tokens.spacing.spacingMedium} ${tokens.spacing.spacingLarge}`,
    borderBottom: title ? `1px solid ${tokens.color.borderDefault}` : undefined,
    flexShrink: 0,
  };

  const bodyStyle: React.CSSProperties = {
    padding: tokens.spacing.spacingLarge,
    overflowY: 'auto',
    flex: 1,
  };

  const footerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: tokens.spacing.spacingXSmall,
    padding: `${tokens.spacing.spacingMedium} ${tokens.spacing.spacingLarge}`,
    borderTop: `1px solid ${tokens.color.borderDefault}`,
    flexShrink: 0,
  };

  const titleId = title ? 'eds-modal-title' : undefined;

  return (
    <div
      style={backdropStyle}
      onClick={closeOnOverlayClick ? onClose : undefined}
      aria-hidden="true"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-label={!title ? ariaLabel : undefined}
        style={dialogStyle}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleTabKey}
      >
        {/* Header */}
        <div style={headerStyle}>
          <div style={{ flex: 1 }}>
            {title && (
              <h2
                id={titleId}
                style={{
                  margin: 0,
                  fontSize: tokens.typography.fontSizeXLarge,
                  fontWeight: tokens.typography.fontWeightBold,
                  color: tokens.color.textDefault,
                  lineHeight: tokens.typography.lineHeightHeading,
                }}
              >
                {title}
              </h2>
            )}
            {tagline && (
              <p
                style={{
                  margin: `${tokens.spacing.spacingXXSmall} 0 0`,
                  fontSize: tokens.typography.fontSizeSmall,
                  color: tokens.color.textPlaceholder,
                }}
              >
                {tagline}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              border: 'none',
              borderRadius: tokens.radius.radiusMedium,
              backgroundColor: 'transparent',
              color: tokens.color.textPlaceholder,
              cursor: 'pointer',
              flexShrink: 0,
              marginLeft: tokens.spacing.spacingSmall,
            }}
          >
            <Icon name="close" size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={bodyStyle}>{children}</div>

        {/* Footer */}
        {footer && <div style={footerStyle}>{footer}</div>}
      </div>
    </div>
  );
};
