import { tokens } from '@backoffice/tokens';
import React from 'react';

export type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
};

export const EmptyState = ({ title, description, icon, action }: EmptyStateProps) => {
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacing.spacingXXLarge,
    textAlign: 'center',
    fontFamily: tokens.typography.fontFamilyBase,
  };

  const iconStyle: React.CSSProperties = {
    fontSize: '3rem',
    color: tokens.color.textPlaceholder,
    marginBottom: tokens.spacing.spacingMedium,
    lineHeight: '1',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: tokens.typography.fontSizeXLarge,
    fontWeight: tokens.typography.fontWeightBold,
    color: tokens.color.textDefault,
    lineHeight: tokens.typography.lineHeightHeading,
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize: tokens.typography.fontSizeMedium,
    color: tokens.color.textPlaceholder,
    marginTop: tokens.spacing.spacingXSmall,
    lineHeight: tokens.typography.lineHeightText,
    maxWidth: '400px',
  };

  const actionStyle: React.CSSProperties = {
    marginTop: tokens.spacing.spacingMedium,
  };

  return (
    <div style={containerStyle} role="status">
      {icon && <div style={iconStyle}>{icon}</div>}
      <h3 style={titleStyle}>{title}</h3>
      {description && <p style={descriptionStyle}>{description}</p>}
      {action && <div style={actionStyle}>{action}</div>}
    </div>
  );
};
