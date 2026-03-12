// SectionHeader — reusable heading block for settings sections
// Mirrors SLDS 2 Section + H2Title pattern
import { tokens } from '@backoffice/tokens';
import React from 'react';

export type SectionHeaderProps = {
  title: string;
  description?: string;
  rightAction?: React.ReactNode;
  style?: React.CSSProperties;
};

export const SectionHeader = ({
  title,
  description,
  rightAction,
  style,
}: SectionHeaderProps) => {
  const wrapperStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: tokens.spacing.spacingSmall,
    marginBottom: tokens.spacing.spacingMedium,
    borderBottom: `1px solid ${tokens.color.borderDefault}`,
    fontFamily: tokens.typography.fontFamilyBase,
    ...style,
  };

  const textBlockStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.spacingXXSmall,
    minWidth: 0,
    flex: 1,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: tokens.typography.fontSizeLarge,
    fontWeight: tokens.typography.fontWeightMedium,
    color: tokens.color.textDefault,
    lineHeight: tokens.typography.lineHeightHeading,
    margin: 0,
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize: tokens.typography.fontSizeMedium,
    color: tokens.color.textPlaceholder,
    lineHeight: tokens.typography.lineHeightText,
    margin: 0,
  };

  const rightActionStyle: React.CSSProperties = {
    marginLeft: tokens.spacing.spacingMedium,
    flexShrink: 0,
    alignSelf: 'center',
  };

  return (
    <div style={wrapperStyle}>
      <div style={textBlockStyle}>
        <h2 style={titleStyle}>{title}</h2>
        {description && <p style={descriptionStyle}>{description}</p>}
      </div>
      {rightAction && <div style={rightActionStyle}>{rightAction}</div>}
    </div>
  );
};
