import { tokens } from '@eds/tokens';
import React from 'react';

export type CalendarEventVariant = 'default' | 'success' | 'warning' | 'error' | 'brand';

export type CalendarEventProps = {
  title: string;
  time?: string;
  variant?: CalendarEventVariant;
  onClick?: () => void;
  compact?: boolean;
};

const variantColorMap: Record<CalendarEventVariant, { dot: string; bg: string }> = {
  default: { dot: tokens.color.neutral5, bg: tokens.color.neutral1 },
  brand: { dot: tokens.color.brandPrimary, bg: tokens.color.brandPrimaryLight },
  success: { dot: tokens.color.success, bg: tokens.color.successLight },
  warning: { dot: tokens.color.warning, bg: tokens.color.warningLight },
  error: { dot: tokens.color.error, bg: tokens.color.errorLight },
};

export const CalendarEvent = ({
  title,
  time,
  variant = 'default',
  onClick,
  compact = false,
}: CalendarEventProps) => {
  const colors = variantColorMap[variant];

  if (compact) {
    return (
      <span
        style={{
          display: 'inline-block',
          width: '6px',
          height: '6px',
          borderRadius: tokens.radius.radiusCircle,
          backgroundColor: colors.dot,
          marginRight: '2px',
          cursor: onClick ? 'pointer' : 'default',
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
        title={time ? `${title} — ${time}` : title}
        role="button"
        aria-label={time ? `${title} at ${time}` : title}
        tabIndex={onClick ? 0 : -1}
        onKeyDown={(e) => {
          if (onClick && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            e.stopPropagation();
            onClick();
          }
        }}
      />
    );
  }

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '1px 4px',
    borderRadius: tokens.radius.radiusSmall,
    fontSize: tokens.typography.fontSizeXSmall,
    fontFamily: tokens.typography.fontFamilyBase,
    cursor: onClick ? 'pointer' : 'default',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    backgroundColor: 'transparent',
  };

  return (
    <div
      style={containerStyle}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor = colors.bg;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
      }}
      title={time ? `${title} — ${time}` : title}
      role="button"
      aria-label={time ? `${title} at ${time}` : title}
      tabIndex={onClick ? 0 : -1}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          e.stopPropagation();
          onClick();
        }
      }}
    >
      <span
        style={{
          display: 'inline-block',
          width: '4px',
          height: '4px',
          borderRadius: tokens.radius.radiusCircle,
          backgroundColor: colors.dot,
          flexShrink: 0,
        }}
      />
      <span
        style={{
          color: tokens.color.textDefault,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {title}
      </span>
    </div>
  );
};
