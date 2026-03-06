import { Icon } from '@eds/components/Icon';
import { Popover } from '@eds/components/Popover';
import { tokens } from '@eds/tokens';
import React, { useRef, useState } from 'react';
import { NotificationItem, type NotificationData } from './NotificationItem';

export type NotificationPanelProps = {
  notifications: NotificationData[];
  onNotificationClick: (notification: NotificationData) => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  loading?: boolean;
};

export const NotificationPanel = ({
  notifications,
  onNotificationClick,
  onMarkAsRead,
  onMarkAllAsRead,
  loading = false,
}: NotificationPanelProps) => {
  const [open, setOpen] = useState(false);
  const bellRef = useRef<HTMLButtonElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const bellStyle: React.CSSProperties = {
    position: 'relative',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: tokens.spacing.spacingXXSmall,
    borderRadius: tokens.radius.radiusMedium,
    color: tokens.color.textInverse,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const badgeStyle: React.CSSProperties = {
    position: 'absolute',
    top: '-2px',
    right: '-2px',
    minWidth: '16px',
    height: '16px',
    borderRadius: tokens.radius.radiusCircle,
    backgroundColor: tokens.color.error,
    color: tokens.color.textInverse,
    fontSize: '10px',
    fontWeight: tokens.typography.fontWeightBold as React.CSSProperties['fontWeight'],
    fontFamily: tokens.typography.fontFamilyBase,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 4px',
    lineHeight: 1,
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${tokens.spacing.spacingSmall} ${tokens.spacing.spacingMedium}`,
    borderBottom: `1px solid ${tokens.color.neutral1}`,
  };

  const headerTitleStyle: React.CSSProperties = {
    fontSize: tokens.typography.fontSizeLarge,
    fontWeight: tokens.typography.fontWeightBold as React.CSSProperties['fontWeight'],
    fontFamily: tokens.typography.fontFamilyBase,
    color: tokens.color.textDefault,
  };

  const markAllStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: unreadCount > 0 ? 'pointer' : 'default',
    fontSize: tokens.typography.fontSizeSmall,
    color: unreadCount > 0 ? tokens.color.brandPrimary : tokens.color.textPlaceholder,
    fontFamily: tokens.typography.fontFamilyBase,
    padding: 0,
  };

  const listStyle: React.CSSProperties = {
    overflowY: 'auto',
    maxHeight: '400px',
  };

  const emptyStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacing.spacingXXLarge,
    gap: tokens.spacing.spacingSmall,
    color: tokens.color.textPlaceholder,
    fontFamily: tokens.typography.fontFamilyBase,
    fontSize: tokens.typography.fontSizeMedium,
  };

  const loadingStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacing.spacingXLarge,
    color: tokens.color.textPlaceholder,
    fontFamily: tokens.typography.fontFamilyBase,
    fontSize: tokens.typography.fontSizeMedium,
  };

  return (
    <>
      <button
        ref={bellRef}
        style={bellStyle}
        onClick={() => setOpen((prev) => !prev)}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        type="button"
      >
        <Icon name={unreadCount > 0 ? 'bell-filled' : 'bell'} size={20} />
        {unreadCount > 0 && (
          <span style={badgeStyle} aria-hidden="true">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <Popover
        open={open}
        onClose={() => setOpen(false)}
        anchorRef={bellRef}
        placement="bottom-end"
        width={380}
        aria-label="Notifications panel"
      >
        <div style={headerStyle}>
          <span style={headerTitleStyle}>Notifications</span>
          <button
            style={markAllStyle}
            onClick={onMarkAllAsRead}
            disabled={unreadCount === 0}
            type="button"
          >
            Mark all as read
          </button>
        </div>

        {loading ? (
          <div style={loadingStyle}>Loading notifications…</div>
        ) : notifications.length === 0 ? (
          <div style={emptyStyle}>
            <Icon name="bell" size={32} />
            <span>No notifications yet</span>
          </div>
        ) : (
          <div style={listStyle} role="feed" aria-label="Notification feed">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={() => {
                  onNotificationClick(notification);
                  setOpen(false);
                }}
                onMarkAsRead={() => onMarkAsRead(notification.id)}
              />
            ))}
          </div>
        )}
      </Popover>
    </>
  );
};
