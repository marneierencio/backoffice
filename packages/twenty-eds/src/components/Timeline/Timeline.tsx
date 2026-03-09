import { Avatar } from '@eds/components/Avatar';
import { EmptyState } from '@eds/components/EmptyState';
import type { IconName } from '@eds/components/Icon';
import { Icon } from '@eds/components/Icon';
import { Spinner } from '@eds/components/Spinner';
import { tokens } from '@eds/tokens';
import React from 'react';

export type TimelineEventType =
  | 'created'
  | 'updated'
  | 'note'
  | 'email'
  | 'task'
  | 'call'
  | 'event';

export type TimelineEvent = {
  id: string;
  type: TimelineEventType;
  title: string;
  description?: string;
  timestamp: string;
  author?: { name: string; avatarUrl?: string };
  icon?: React.ReactNode;
};

export type TimelineProps = {
  events: TimelineEvent[];
  loading?: boolean;
  maxVisible?: number;
  onShowMore?: () => void;
  emptyMessage?: string;
};

const eventIconMap: Record<TimelineEventType, IconName> = {
  created: 'success',
  updated: 'edit',
  note: 'note',
  email: 'email',
  task: 'task',
  call: 'phone-icon',
  event: 'calendar',
};

const eventColorMap: Record<TimelineEventType, string> = {
  created: tokens.color.success,
  updated: tokens.color.brandPrimary,
  note: tokens.color.neutral5,
  email: tokens.color.brandPrimary,
  task: tokens.color.warning,
  call: tokens.color.success,
  event: tokens.color.brandPrimary,
};

// Format relative time: "2 hours ago", "Yesterday", "Mar 15, 2025"
const formatRelativeTime = (isoDate: string): string => {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

export const Timeline = ({
  events,
  loading = false,
  maxVisible = 10,
  onShowMore,
  emptyMessage = 'No activity yet',
}: TimelineProps) => {
  const visibleEvents = events.slice(0, maxVisible);
  const hasMore = events.length > maxVisible;

  if (!loading && events.length === 0) {
    return <EmptyState title={emptyMessage} icon="📋" />;
  }

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    fontFamily: tokens.typography.fontFamilyBase,
    paddingLeft: 40,
  };

  // Vertical line
  const lineStyle: React.CSSProperties = {
    position: 'absolute',
    left: 19,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: tokens.color.neutral2,
  };

  return (
    <div style={containerStyle}>
      <div style={lineStyle} aria-hidden="true" />

      {visibleEvents.map((event) => {
        const dotColor = eventColorMap[event.type];
        const iconName = eventIconMap[event.type];

        return (
          <div
            key={event.id}
            style={{
              position: 'relative',
              paddingBottom: tokens.spacing.spacingMedium,
              paddingLeft: tokens.spacing.spacingMedium,
            }}
          >
            {/* Dot / Icon on the timeline line */}
            <div
              style={{
                position: 'absolute',
                left: -28,
                top: 2,
                width: 20,
                height: 20,
                borderRadius: '50%',
                backgroundColor: tokens.color.neutral0,
                border: `2px solid ${dotColor}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-hidden="true"
            >
              {event.icon ?? <Icon name={iconName} size={10} color={dotColor} />}
            </div>

            {/* Content */}
            <div>
              <div
                style={{
                  fontSize: tokens.typography.fontSizeMedium,
                  fontWeight: tokens.typography.fontWeightMedium,
                  color: tokens.color.textDefault,
                  lineHeight: tokens.typography.lineHeightText,
                }}
              >
                {event.title}
              </div>

              {event.description && (
                <div
                  style={{
                    fontSize: tokens.typography.fontSizeSmall,
                    color: tokens.color.textLabel,
                    marginTop: tokens.spacing.spacingXXSmall,
                    lineHeight: tokens.typography.lineHeightText,
                  }}
                >
                  {event.description}
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing.spacingXSmall,
                  marginTop: tokens.spacing.spacingXXSmall,
                  fontSize: tokens.typography.fontSizeXSmall,
                  color: tokens.color.textPlaceholder,
                }}
              >
                {event.author && (
                  <>
                    <Avatar
                      name={event.author.name}
                      src={event.author.avatarUrl}
                      type="user"
                      size="x-small"
                    />
                    <span>{event.author.name}</span>
                    <span aria-hidden="true">·</span>
                  </>
                )}
                <Icon name="clock" size={12} color={tokens.color.textPlaceholder} />
                <time dateTime={event.timestamp}>{formatRelativeTime(event.timestamp)}</time>
              </div>
            </div>
          </div>
        );
      })}

      {loading && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            padding: tokens.spacing.spacingMedium,
          }}
        >
          <Spinner size="small" label="Loading" inline />
        </div>
      )}

      {hasMore && onShowMore && !loading && (
        <button
          onClick={onShowMore}
          style={{
            display: 'block',
            width: '100%',
            padding: `${tokens.spacing.spacingXSmall} 0`,
            border: 'none',
            backgroundColor: 'transparent',
            color: tokens.color.textLink,
            fontSize: tokens.typography.fontSizeSmall,
            fontFamily: tokens.typography.fontFamilyBase,
            cursor: 'pointer',
            textAlign: 'center',
          }}
        >
          Show more activity
        </button>
      )}
    </div>
  );
};
