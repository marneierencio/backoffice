import { Avatar } from '@backoffice/components/Avatar';
import { Badge, type BadgeVariant } from '@backoffice/components/Badge';
import { tokens } from '@backoffice/tokens';
import React from 'react';

export type KanbanCardProps = {
  title: string;
  subtitle?: string;
  amount?: string;
  date?: string;
  avatarName?: string;
  avatarUrl?: string;
  tags?: { label: string; variant: BadgeVariant }[];
  onClick?: () => void;
  draggable?: boolean;
  style?: React.CSSProperties;
};

export const KanbanCard = ({
  title,
  subtitle,
  amount,
  date,
  avatarName,
  avatarUrl,
  tags,
  onClick,
  draggable = true,
  style,
}: KanbanCardProps) => {
  const containerStyle: React.CSSProperties = {
    backgroundColor: tokens.color.neutral0,
    borderRadius: tokens.radius.radiusMedium,
    border: `1px solid ${tokens.color.neutral2}`,
    padding: tokens.spacing.spacingSmall,
    cursor: onClick ? 'pointer' : 'default',
    fontFamily: tokens.typography.fontFamilyBase,
    position: 'relative',
    ...style,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: tokens.typography.fontSizeMedium,
    fontWeight: tokens.typography.fontWeightMedium as React.CSSProperties['fontWeight'],
    color: tokens.color.textDefault,
    marginBottom: tokens.spacing.spacingXXXSmall,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    paddingRight: avatarName ? '28px' : undefined,
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: tokens.typography.fontSizeSmall,
    color: tokens.color.textPlaceholder,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  const amountStyle: React.CSSProperties = {
    fontSize: tokens.typography.fontSizeMedium,
    fontWeight: tokens.typography.fontWeightBold as React.CSSProperties['fontWeight'],
    color: tokens.color.textDefault,
    marginTop: tokens.spacing.spacingXXSmall,
  };

  const dateStyle: React.CSSProperties = {
    fontSize: tokens.typography.fontSizeXSmall,
    color: tokens.color.textPlaceholder,
  };

  const tagsRowStyle: React.CSSProperties = {
    display: 'flex',
    gap: tokens.spacing.spacingXXXSmall,
    marginTop: tokens.spacing.spacingXSmall,
    flexWrap: 'wrap',
  };

  const avatarContainerStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: tokens.spacing.spacingSmall,
    right: tokens.spacing.spacingSmall,
  };

  return (
    <div
      style={containerStyle}
      draggable={draggable}
      onClick={onClick}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.boxShadow = tokens.elevation.elevationRaised;
        el.style.borderColor = tokens.color.neutral3;
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.boxShadow = 'none';
        el.style.borderColor = tokens.color.neutral2;
      }}
      role="listitem"
    >
      <div style={titleStyle}>{title}</div>
      {subtitle && <div style={subtitleStyle}>{subtitle}</div>}
      {amount && <div style={amountStyle}>{amount}</div>}
      {date && <div style={dateStyle}>{date}</div>}
      {tags && tags.length > 0 && (
        <div style={tagsRowStyle}>
          {tags.map((tag) => (
            <Badge key={tag.label} label={tag.label} variant={tag.variant} size="small" />
          ))}
        </div>
      )}
      {avatarName && (
        <div style={avatarContainerStyle}>
          <Avatar name={avatarName} src={avatarUrl} size="small" type="user" />
        </div>
      )}
    </div>
  );
};
