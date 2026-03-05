import { Button } from '@eds/components/Button';
import { Checkbox } from '@eds/components/Checkbox';
import type { ComboboxOption } from '@eds/components/Combobox';
import { Combobox } from '@eds/components/Combobox';
import { FileSelector } from '@eds/components/FileSelector';
import { FormElement } from '@eds/components/FormElement';
import type { InputProps } from '@eds/components/Input';
import { Input } from '@eds/components/Input';
import { Select } from '@eds/components/Select';
import { Textarea } from '@eds/components/Textarea';
import { tokens } from '@eds/tokens';
import React, { useCallback } from 'react';

export type FormFieldType =
  | 'text'
  | 'email'
  | 'phone'
  | 'url'
  | 'number'
  | 'currency'
  | 'date'
  | 'datetime'
  | 'boolean'
  | 'select'
  | 'textarea'
  | 'relation'
  | 'file';

export type FormFieldDefinition = {
  key: string;
  label: string;
  type: FormFieldType;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  options?: Array<{ value: string; label: string }>;
  // Relation-specific (for inline Combobox rendering)
  relationOptions?: ComboboxOption[];
  relationLoading?: boolean;
  relationSearchQuery?: string;
  onRelationSearchChange?: (query: string) => void;
  // Relation-specific (for hook-based search — used by pages)
  relationObjectNameSingular?: string;
  relationObjectNamePlural?: string;
  relationSearchFields?: string[];
  relationDisplayField?: string;
  // File-specific
  accept?: string;
  maxSizeMB?: number;
  multiple?: boolean;
  // Layout
  colSpan?: 1 | 2;
};

export type FormSection = {
  title?: string;
  columns?: 1 | 2;
  fields: FormFieldDefinition[];
};

export type RecordFormProps = {
  title: string;
  sections: FormSection[];
  values: Record<string, unknown>;
  errors: Record<string, string>;
  saving: boolean;
  onChange: (field: string, value: unknown) => void;
  onSubmit: () => void;
  onCancel: () => void;
  submitLabel?: string;
  cancelLabel?: string;
};

const getInputType = (fieldType: FormFieldType): InputProps['type'] => {
  switch (fieldType) {
    case 'email': return 'email';
    case 'phone': return 'tel';
    case 'url': return 'url';
    case 'number':
    case 'currency': return 'number';
    default: return 'text';
  }
};

export const RecordForm = ({
  title,
  sections,
  values,
  errors,
  saving,
  onChange,
  onSubmit,
  onCancel,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
}: RecordFormProps) => {
  const handleSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      if (!saving) onSubmit();
    },
    [saving, onSubmit],
  );

  const renderField = (field: FormFieldDefinition) => {
    const fieldValue = values[field.key];
    const fieldError = errors[field.key];
    const fieldId = `form-field-${field.key}`;

    const renderControl = () => {
      switch (field.type) {
        case 'boolean':
          return (
            <div style={{ paddingTop: tokens.spacing.spacingXXSmall }}>
              <Checkbox
                id={fieldId}
                checked={fieldValue === true}
                onChange={(checked) => onChange(field.key, checked)}
                label={field.label}
              />
            </div>
          );

        case 'select':
          return (
            <Select
              id={fieldId}
              value={(fieldValue as string) ?? ''}
              options={field.options ?? []}
              onChange={(val) => onChange(field.key, val)}
              error={fieldError}
            />
          );

        case 'textarea':
          return (
            <Textarea
              id={fieldId}
              value={(fieldValue as string) ?? ''}
              placeholder={field.placeholder}
              onChange={(e) => onChange(field.key, e.target.value)}
              error={!!fieldError}
              rows={4}
            />
          );

        case 'relation':
          return (
            <Combobox
              id={fieldId}
              value={fieldValue as ComboboxOption | null}
              options={field.relationOptions ?? []}
              loading={field.relationLoading ?? false}
              searchQuery={field.relationSearchQuery ?? ''}
              onSearchChange={field.onRelationSearchChange ?? (() => {})}
              onSelect={(option) => onChange(field.key, option)}
              placeholder={field.placeholder ?? 'Search...'}
              error={fieldError}
            />
          );

        case 'file':
          return (
            <FileSelector
              files={(fieldValue as File[]) ?? []}
              onChange={(files) => onChange(field.key, files)}
              onRemove={(index) => {
                const current = (fieldValue as File[]) ?? [];
                onChange(
                  field.key,
                  current.filter((_, i) => i !== index),
                );
              }}
              accept={field.accept}
              maxSizeMB={field.maxSizeMB}
              multiple={field.multiple}
              error={fieldError}
            />
          );

        case 'date':
        case 'datetime':
          return (
            <input
              id={fieldId}
              type={field.type === 'datetime' ? 'datetime-local' : 'date'}
              value={(fieldValue as string) ?? ''}
              onChange={(e) => onChange(field.key, e.target.value)}
              aria-invalid={!!fieldError}
              style={{
                width: '100%',
                height: '36px',
                padding: `0 ${tokens.spacing.spacingSmall}`,
                border: `1px solid ${fieldError ? tokens.color.borderError : tokens.color.borderInput}`,
                borderRadius: tokens.radius.radiusMedium,
                fontSize: tokens.typography.fontSizeMedium,
                fontFamily: tokens.typography.fontFamilyBase,
                color: tokens.color.textDefault,
                backgroundColor: tokens.color.neutral0,
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
          );

        default:
          return (
            <Input
              id={fieldId}
              type={getInputType(field.type)}
              value={(fieldValue as string) ?? ''}
              placeholder={field.placeholder}
              onChange={(e) => onChange(field.key, e.target.value)}
              error={fieldError}
            />
          );
      }
    };

    // Boolean fields render their own label via Checkbox
    if (field.type === 'boolean') {
      return (
        <div key={field.key} style={{ marginBottom: tokens.spacing.spacingMedium }}>
          {renderControl()}
          {fieldError && (
            <div
              role="alert"
              style={{
                fontSize: tokens.typography.fontSizeSmall,
                color: tokens.color.error,
                marginTop: tokens.spacing.spacingXXSmall,
              }}
            >
              {fieldError}
            </div>
          )}
        </div>
      );
    }

    // Relation and file fields handle their own error display
    if (field.type === 'relation' || field.type === 'file') {
      return (
        <FormElement
          key={field.key}
          id={fieldId}
          label={field.label}
          required={field.required}
          helpText={field.helpText}
          error={fieldError}
        >
          {renderControl()}
        </FormElement>
      );
    }

    return (
      <FormElement
        key={field.key}
        id={fieldId}
        label={field.label}
        required={field.required}
        helpText={field.helpText}
        error={fieldError}
      >
        {renderControl()}
      </FormElement>
    );
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing.spacingXLarge,
    paddingBottom: tokens.spacing.spacingMedium,
    borderBottom: `1px solid ${tokens.color.borderDefault}`,
  };

  const titleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: tokens.typography.fontSizeXXLarge,
    fontWeight: tokens.typography.fontWeightBold,
    color: tokens.color.textDefault,
    fontFamily: tokens.typography.fontFamilyBase,
    lineHeight: tokens.typography.lineHeightHeading,
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: tokens.typography.fontSizeLarge,
    fontWeight: tokens.typography.fontWeightMedium,
    color: tokens.color.textDefault,
    borderBottom: `1px solid ${tokens.color.borderDefault}`,
    paddingBottom: tokens.spacing.spacingXSmall,
    marginBottom: tokens.spacing.spacingMedium,
    marginTop: tokens.spacing.spacingLarge,
    fontFamily: tokens.typography.fontFamilyBase,
  };

  const footerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: tokens.spacing.spacingXSmall,
    paddingTop: tokens.spacing.spacingLarge,
    borderTop: `1px solid ${tokens.color.borderDefault}`,
    marginTop: tokens.spacing.spacingXLarge,
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-busy={saving}
      style={{
        fontFamily: tokens.typography.fontFamilyBase,
        maxWidth: 960,
        margin: '0 auto',
        padding: tokens.spacing.spacingLarge,
      }}
    >
      {/* Header */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>{title}</h1>
        <div style={{ display: 'flex', gap: tokens.spacing.spacingXSmall }}>
          <Button
            label={cancelLabel}
            variant="ghost"
            onClick={onCancel}
            type="button"
            disabled={saving}
          />
          <Button
            label={submitLabel}
            variant="brand"
            type="submit"
            loading={saving}
            disabled={saving}
          />
        </div>
      </div>

      {/* Sections */}
      {sections.map((section, sectionIndex) => {
        const cols = section.columns ?? 2;

        const gridStyle: React.CSSProperties = {
          display: 'grid',
          gridTemplateColumns: cols === 2 ? '1fr 1fr' : '1fr',
          gap: `${tokens.spacing.spacingSmall} ${tokens.spacing.spacingLarge}`,
        };

        return (
          <div key={sectionIndex}>
            {section.title && <h2 style={sectionTitleStyle}>{section.title}</h2>}
            <div style={gridStyle}>
              {section.fields.map((field) => {
                const span = field.colSpan ?? 1;
                return (
                  <div
                    key={field.key}
                    style={{
                      gridColumn: span === 2 && cols === 2 ? '1 / -1' : undefined,
                    }}
                  >
                    {renderField(field)}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Footer */}
      <div style={footerStyle}>
        <Button
          label={cancelLabel}
          variant="ghost"
          onClick={onCancel}
          type="button"
          disabled={saving}
        />
        <Button
          label={submitLabel}
          variant="brand"
          type="submit"
          loading={saving}
          disabled={saving}
        />
      </div>
    </form>
  );
};
