import type { FieldType } from '@eds/components/FieldRenderer';
import { InlineEdit } from '@eds/components/InlineEdit';
import { tokens } from '@eds/tokens';
import React from 'react';

export type PropertyItem = {
  key: string;
  label: string;
  value: string | number | boolean | null;
  fieldType?: FieldType;
  readOnly?: boolean;
  options?: Array<{ value: string; label: string }>;
  currencyCode?: string;
  placeholder?: string;
};

export type PropertyBoxProps = {
  fields: PropertyItem[];
  onFieldSave?: (fieldKey: string, newValue: string | number | boolean | null) => void;
  saving?: Record<string, boolean>;
  errors?: Record<string, string>;
  compact?: boolean;
};

export const PropertyBox = ({
  fields,
  onFieldSave,
  saving = {},
  errors = {},
  compact = false,
}: PropertyBoxProps) => {
  const containerStyle: React.CSSProperties = {
    fontFamily: tokens.typography.fontFamilyBase,
  };

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    minHeight: compact ? 28 : 36,
    padding: compact
      ? `${tokens.spacing.spacingXXSmall} 0`
      : `${tokens.spacing.spacingXSmall} 0`,
  };

  const labelStyle: React.CSSProperties = {
    width: 140,
    flexShrink: 0,
    fontSize: tokens.typography.fontSizeSmall,
    fontWeight: tokens.typography.fontWeightMedium,
    color: tokens.color.textLabel,
    textAlign: 'right',
    paddingRight: tokens.spacing.spacingMedium,
    paddingTop: tokens.spacing.spacingXXSmall,
    lineHeight: tokens.typography.lineHeightText,
  };

  const valueStyle: React.CSSProperties = {
    flex: 1,
    maxWidth: 300,
    minWidth: 0,
  };

  return (
    <div style={containerStyle}>
      {fields.map((field, index) => (
        <div key={field.key}>
          <div style={rowStyle}>
            <div style={labelStyle}>{field.label}</div>
            <div style={valueStyle}>
              <InlineEdit
                value={field.value}
                fieldType={field.fieldType ?? 'text'}
                label={field.label}
                placeholder={field.placeholder}
                readOnly={field.readOnly ?? !onFieldSave}
                saving={saving[field.key] ?? false}
                error={errors[field.key]}
                options={field.options}
                currencyCode={field.currencyCode}
                onSave={(newValue) => onFieldSave?.(field.key, newValue)}
              />
            </div>
          </div>
          {!compact && index < fields.length - 1 && (
            <div
              style={{
                borderBottom: `1px solid ${tokens.color.neutral2}`,
                marginLeft: 140,
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
};
