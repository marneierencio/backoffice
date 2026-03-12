import { Avatar } from '@backoffice/components/Avatar';
import { Icon, type IconName } from '@backoffice/components/Icon';
import { tokens } from '@backoffice/tokens';
import React from 'react';

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'mention' | 'reminder';

export type NotificationData = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  href?: string;
  actor?: {
    name: string;
    avatarUrl?: string;
  };
};

export type NotificationItemProps = {
  notification: NotificationData;
  onClick: () => void;
  onMarkAsRead: () => void;
};

const typeConfig: Record<NotificationType, { icon: IconName; bgColor: string }> = {
  info: { icon: 'info', bgColor: tokens.color.infoLight },
  success: { icon: 'success', bgColor: tokens.color.successLight },
  warning: { icon: 'warning', bgColor: tokens.color.warningLight },
  error: { icon: 'error-icon', bgColor: tokens.color.errorLight },
  mention: { icon: 'user', bgColor: tokens.color.brandPrimaryLight },
  reminder: { icon: 'clock', bgColor: tokens.color.warningLight },
};

const formatRelativeTime = (timestamp: string): string => {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(timestamp).toLocaleDateString();
};

export const NotificationItem = ({
  notification,
  onClick,
  onMarkAsRead,
}: NotificationItemProps) => {
  const config = typeConfig[notification.type];
  const isUnread = !notification.read;

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    gap: tokens.spacing.spacingSmall,
    padding: `${tokens.spacing.spacingSmall} ${tokens.spacing.spacingMedium}`,
    cursor: 'pointer',
    borderBottom: `1px solid ${tokens.color.neutral1}`,
    borderLeft: isUnread ? `3px solid ${tokens.color.brandPrimary}` : '3px solid transparent',
    backgroundColor: isUnread ? 'rgba(1, 118, 211, 0.05)' : 'transparent',
    fontFamily: tokens.typography.fontFamilyBase,
    position: 'relative',
  };

  const iconContainerStyle: React.CSSProperties = {
    width: '32px',
    height: '32px',
    borderRadius: tokens.radius.radiusCircle,
    backgroundColor: config.bgColor,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: tokens.typography.fontSizeMedium,
    fontWeight: isUnread ? (tokens.typography.fontWeightMedium as React.CSSProperties['fontWeight']) : (tokens.typography.fontWeightRegular as React.CSSProperties['fontWeight']),
    color: tokens.color.textDefault,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  const messageStyle: React.CSSProperties = {
    fontSize: tokens.typography.fontSizeSmall,
    color: tokens.color.textPlaceholder,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    marginTop: '2px',
  };

  const timeStyle: React.CSSProperties = {
    fontSize: tokens.typography.fontSizeXSmall,
    color: tokens.color.textPlaceholder,
    marginTop: tokens.spacing.spacingXXXSmall,
  };

  const markReadStyle: React.CSSProperties = {
    position: 'absolute',
    top: tokens.spacing.spacingSmall,
    right: tokens.spacing.spacingSmall,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '2px',
    borderRadius: tokens.radius.radiusSmall,
    color: tokens.color.brandPrimary,
    display: 'flex',
    alignItems: 'center',
    opacity: 0,
  };

  return (
    <div
      style={containerStyle}
      onClick={onClick}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor = tokens.color.neutral1;
        const btn = (e.currentTarget as HTMLElement).querySelector('[data-mark-read]') as HTMLElement;
        if (btn) btn.style.opacity = '1';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor = isUnread ? 'rgba(1, 118, 211, 0.05)' : 'transparent';
        const btn = (e.currentTarget as HTMLElement).querySelector('[data-mark-read]') as HTMLElement;
        if (btn) btn.style.opacity = '0';
      }}
      role="article"
      aria-label={`${notification.title} — ${formatRelativeTime(notification.timestamp)}`}
    >
      {notification.actor ? (
        <Avatar name={notification.actor.name} src={notification.actor.avatarUrl} size="small" type="user" />
      ) : (
        <div style={iconContainerStyle}>
          <Icon name={config.icon} size={16} />
        </div>
      )}
      <div style={contentStyle}>
        <div style={titleStyle}>{notification.title}</div>
        <div style={messageStyle}>{notification.message}</div>
        <div style={timeStyle}>{formatRelativeTime(notification.timestamp)}</div>
      </div>
      {isUnread && (
        <button
          data-mark-read
          style={markReadStyle}
          onClick={(e) => {
            e.stopPropagation();
            onMarkAsRead();
          }}
          aria-label="Mark as read"
          title="Mark as read"
          type="button"
        >
          <Icon name="eye" size={14} />
        </button>
      )}
    </div>
  );
};
