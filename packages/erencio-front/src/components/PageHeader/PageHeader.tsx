import { tokens } from '@backoffice/tokens';
import React from 'react';

export type PageHeaderProps = {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
};

export const PageHeader = ({
  title,
  description,
  icon,
  actions,
  children,
}: PageHeaderProps) => {
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.spacingMedium,
    marginBottom: tokens.spacing.spacingLarge,
    fontFamily: tokens.typography.fontFamilyBase,
  };

  const topRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: tokens.spacing.spacingMedium,
    flexWrap: 'wrap',
  };

  const titleGroupStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.spacingSmall,
  };

  const iconStyle: React.CSSProperties = {
    fontSize: '1.5rem',
    lineHeight: '1',
    flexShrink: 0,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: tokens.typography.fontSizeXXLarge,
    fontWeight: tokens.typography.fontWeightBold,
    color: tokens.color.textDefault,
    lineHeight: tokens.typography.lineHeightHeading,
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize: tokens.typography.fontSizeMedium,
    color: tokens.color.textPlaceholder,
    marginTop: tokens.spacing.spacingXXSmall,
    lineHeight: tokens.typography.lineHeightText,
  };

  return (
    <div style={containerStyle}>
      <div style={topRowStyle}>
        <div>
          <div style={titleGroupStyle}>
            {icon && <span style={iconStyle}>{icon}</span>}
            <h1 style={titleStyle}>{title}</h1>
          </div>
          {description && <p style={descriptionStyle}>{description}</p>}
        </div>
        {actions && <div style={{ display: 'flex', gap: tokens.spacing.spacingXSmall, alignItems: 'center', flexShrink: 0 }}>{actions}</div>}
      </div>
      {children}
    </div>
  );
};
