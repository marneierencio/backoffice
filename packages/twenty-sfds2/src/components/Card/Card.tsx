import React from 'react';
import { tokens } from '@sfds2/tokens';

export type CardVariant = 'default' | 'narrow' | 'highlight';

export type CardProps = {
  title?: string;
  description?: string;
  children?: React.ReactNode;
  variant?: CardVariant;
  headerRight?: React.ReactNode;
  footer?: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
};

export const Card = ({
  title,
  description,
  children,
  variant = 'default',
  headerRight,
  footer,
  onClick,
  style,
}: CardProps) => {
  const cardStyle: React.CSSProperties = {
    backgroundColor: tokens.color.neutral0,
    border: `1px solid ${tokens.color.borderDefault}`,
    borderRadius: tokens.radius.radiusLarge,
    boxShadow: tokens.elevation.elevationRaised,
    fontFamily: tokens.typography.fontFamilyBase,
    overflow: 'hidden',
    cursor: onClick ? 'pointer' : 'default',
    transition: onClick ? 'box-shadow 0.15s ease' : undefined,
    ...(variant === 'highlight' && {
      borderLeft: `4px solid ${tokens.color.brandPrimary}`,
    }),
    ...style,
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: `${tokens.spacing.spacingMedium} ${tokens.spacing.spacingLarge}`,
    borderBottom: (title ?? description) ? `1px solid ${tokens.color.borderDefault}` : undefined,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: tokens.typography.fontSizeLarge,
    fontWeight: tokens.typography.fontWeightBold,
    color: tokens.color.textDefault,
    lineHeight: tokens.typography.lineHeightHeading,
    marginBottom: description ? tokens.spacing.spacingXXXSmall : undefined,
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize: tokens.typography.fontSizeSmall,
    color: tokens.color.textPlaceholder,
    lineHeight: tokens.typography.lineHeightText,
  };

  const bodyStyle: React.CSSProperties = {
    padding: tokens.spacing.spacingLarge,
  };

  const footerStyle: React.CSSProperties = {
    padding: `${tokens.spacing.spacingSmall} ${tokens.spacing.spacingLarge}`,
    borderTop: `1px solid ${tokens.color.borderDefault}`,
    backgroundColor: tokens.color.neutral1,
  };

  return (
    <div style={cardStyle} onClick={onClick}>
      {(title ?? description ?? headerRight) && (
        <div style={headerStyle}>
          <div>
            {title && <h3 style={titleStyle}>{title}</h3>}
            {description && <p style={descriptionStyle}>{description}</p>}
          </div>
          {headerRight}
        </div>
      )}
      {children && <div style={bodyStyle}>{children}</div>}
      {footer && <div style={footerStyle}>{footer}</div>}
    </div>
  );
};
