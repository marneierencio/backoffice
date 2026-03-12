import { Icon } from '@backoffice/components/Icon';
import { tokens } from '@backoffice/tokens';
import React from 'react';

export type FieldType =
  | 'text'
  | 'email'
  | 'phone'
  | 'number'
  | 'date'
  | 'currency'
  | 'url'
  | 'select'
  | 'boolean';

export type FieldRendererProps = {
  value: unknown;
  fieldType: FieldType;
  currencyCode?: string;
  dateFormat?: string;
  emptyText?: string;
};

// Format currency from micros (Twenty stores amounts as amountMicros)
const formatCurrency = (micros: number, currencyCode: string): string => {
  const amount = micros / 1_000_000;
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currencyCode,
    }).format(amount);
  } catch {
    return `${currencyCode} ${amount.toLocaleString()}`;
  }
};

const formatDate = (value: string): string => {
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return value;
  }
};

const formatNumber = (value: number): string => {
  return value.toLocaleString();
};

export const FieldRenderer = ({
  value,
  fieldType,
  currencyCode = 'USD',
  emptyText = '—',
}: FieldRendererProps) => {
  const isEmpty =
    value === null || value === undefined || value === '' || (typeof value === 'string' && !value.trim());

  if (isEmpty) {
    return (
      <span style={{ color: tokens.color.textPlaceholder, fontSize: tokens.typography.fontSizeMedium }}>
        {emptyText}
      </span>
    );
  }

  const baseStyle: React.CSSProperties = {
    fontSize: tokens.typography.fontSizeMedium,
    fontFamily: tokens.typography.fontFamilyBase,
    color: tokens.color.textDefault,
    lineHeight: tokens.typography.lineHeightText,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const linkStyle: React.CSSProperties = {
    ...baseStyle,
    color: tokens.color.textLink,
    textDecoration: 'none',
  };

  switch (fieldType) {
    case 'email':
      return (
        <a href={`mailto:${value as string}`} style={linkStyle}>
          {value as string}
        </a>
      );

    case 'phone':
      return (
        <a href={`tel:${value as string}`} style={linkStyle}>
          {value as string}
        </a>
      );

    case 'url': {
      const url = value as string;
      const displayUrl = url.replace(/^https?:\/\//, '').replace(/\/$/, '');
      return (
        <a
          href={url.startsWith('http') ? url : `https://${url}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ ...linkStyle, display: 'inline-flex', alignItems: 'center', gap: 4 }}
        >
          {displayUrl}
          <Icon name="external-link" size={12} color={tokens.color.textLink} />
        </a>
      );
    }

    case 'number':
      return <span style={baseStyle}>{formatNumber(value as number)}</span>;

    case 'date':
      return <span style={baseStyle}>{formatDate(value as string)}</span>;

    case 'currency':
      return (
        <span style={baseStyle}>{formatCurrency(value as number, currencyCode)}</span>
      );

    case 'boolean':
      return (
        <span style={baseStyle}>{(value as boolean) ? 'Yes' : 'No'}</span>
      );

    case 'select':
      return <span style={baseStyle}>{value as string}</span>;

    case 'text':
    default:
      return <span style={baseStyle}>{String(value)}</span>;
  }
};
