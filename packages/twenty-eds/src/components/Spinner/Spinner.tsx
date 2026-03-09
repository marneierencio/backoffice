import { tokens } from '@eds/tokens';
import React from 'react';

export type SpinnerSize = 'x-small' | 'small' | 'medium' | 'large';

export type SpinnerProps = {
  size?: SpinnerSize;
  label?: string;
  inline?: boolean;
};

const sizeMap: Record<SpinnerSize, number> = {
  'x-small': 16,
  small: 24,
  medium: 32,
  large: 48,
};

// CSS keyframes injected once
const KEYFRAME_ID = 'eds-spinner-keyframe';

const ensureKeyframes = () => {
  if (typeof document === 'undefined') return;
  if (document.getElementById(KEYFRAME_ID)) return;

  const style = document.createElement('style');
  style.id = KEYFRAME_ID;
  style.textContent = `@keyframes eds-spin { to { transform: rotate(360deg); } }`;
  document.head.appendChild(style);
};

export const Spinner = ({
  size = 'medium',
  label = 'Loading',
  inline = false,
}: SpinnerProps) => {
  ensureKeyframes();

  const px = sizeMap[size];
  const borderWidth = Math.max(2, Math.round(px / 10));

  const spinnerStyle: React.CSSProperties = {
    width: `${px}px`,
    height: `${px}px`,
    border: `${borderWidth}px solid ${tokens.color.neutral2}`,
    borderTopColor: tokens.color.brandPrimary,
    borderRadius: '50%',
    animation: 'eds-spin 0.8s linear infinite',
    boxSizing: 'border-box',
  };

  if (inline) {
    return (
      <span
        role="status"
        aria-label={label}
        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <span style={spinnerStyle} />
        <span className="eds-assistive-text">{label}</span>
      </span>
    );
  }

  const overlayStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    zIndex: tokens.zIndex.zIndexRaised,
  };

  return (
    <div role="status" aria-label={label} style={overlayStyle}>
      <span style={spinnerStyle} />
      <span className="eds-assistive-text">{label}</span>
    </div>
  );
};
