import type { FieldType } from '@eds/components/FieldRenderer';
import { FieldRenderer } from '@eds/components/FieldRenderer';
import { Icon } from '@eds/components/Icon';
import { Spinner } from '@eds/components/Spinner';
import { tokens } from '@eds/tokens';
import React, { useCallback, useEffect, useRef, useState } from 'react';

export type InlineEditProps = {
  value: string | number | boolean | null;
  fieldType?: FieldType;
  label: string;
  placeholder?: string;
  readOnly?: boolean;
  saving?: boolean;
  error?: string;
  options?: Array<{ value: string; label: string }>;
  currencyCode?: string;
  onSave: (newValue: string | number | boolean | null) => void;
  onCancel?: () => void;
};

export const InlineEdit = ({
  value,
  fieldType = 'text',
  label,
  placeholder,
  readOnly = false,
  saving = false,
  error,
  options,
  currencyCode,
  onSave,
  onCancel,
}: InlineEditProps) => {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState<string>(value != null ? String(value) : '');
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);

  useEffect(() => {
    if (editing) {
      setEditValue(value != null ? String(value) : '');
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [editing, value]);

  const handleStartEdit = useCallback(() => {
    if (readOnly || saving) return;
    setEditing(true);
  }, [readOnly, saving]);

  const handleSave = useCallback(() => {
    let parsed: string | number | boolean | null = editValue;

    if (fieldType === 'number' || fieldType === 'currency') {
      const num = Number(editValue);
      parsed = isNaN(num) ? null : num;
    } else if (fieldType === 'boolean') {
      parsed = editValue === 'true';
    } else if (editValue === '') {
      parsed = null;
    }

    onSave(parsed);
    setEditing(false);
  }, [editValue, fieldType, onSave]);

  const handleCancel = useCallback(() => {
    setEditing(false);
    setEditValue(value != null ? String(value) : '');
    onCancel?.();
  }, [value, onCancel]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        handleSave();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        handleCancel();
      }
    },
    [handleSave, handleCancel],
  );

  // Read-mode styles
  const readContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.spacingXXSmall,
    minHeight: 32,
    padding: `${tokens.spacing.spacingXXSmall} ${tokens.spacing.spacingXSmall}`,
    borderRadius: tokens.radius.radiusMedium,
    cursor: readOnly ? 'default' : 'pointer',
    transition: `background-color ${tokens.duration.durationQuickly}`,
    position: 'relative',
  };

  // Edit-mode styles
  const editContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.spacingXXSmall,
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: 36,
    padding: `0 ${tokens.spacing.spacingSmall}`,
    border: `1px solid ${error ? tokens.color.borderError : tokens.color.borderFocus}`,
    borderRadius: tokens.radius.radiusMedium,
    fontSize: tokens.typography.fontSizeMedium,
    fontFamily: tokens.typography.fontFamilyBase,
    color: tokens.color.textDefault,
    backgroundColor: tokens.color.neutral0,
    outline: 'none',
    boxSizing: 'border-box',
  };

  if (editing) {
    const inputType =
      fieldType === 'email'
        ? 'email'
        : fieldType === 'phone'
          ? 'tel'
          : fieldType === 'number' || fieldType === 'currency'
            ? 'number'
            : fieldType === 'date'
              ? 'date'
              : fieldType === 'url'
                ? 'url'
                : 'text';

    return (
      <div style={editContainerStyle}>
        {fieldType === 'select' && options ? (
          <select
            ref={inputRef as React.RefObject<HTMLSelectElement>}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label={label}
            style={inputStyle}
          >
            <option value="">— Select —</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : fieldType === 'boolean' ? (
          <select
            ref={inputRef as React.RefObject<HTMLSelectElement>}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label={label}
            style={inputStyle}
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type={inputType}
            value={editValue}
            placeholder={placeholder}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label={label}
            aria-describedby={error ? `${label}-error` : undefined}
            style={inputStyle}
          />
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.spacingXXSmall }}>
          <button
            onClick={handleSave}
            aria-label={`Save ${label}`}
            disabled={saving}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 28,
              height: 28,
              border: 'none',
              borderRadius: tokens.radius.radiusMedium,
              backgroundColor: tokens.color.brandPrimary,
              color: tokens.color.textInverse,
              cursor: saving ? 'wait' : 'pointer',
            }}
          >
            {saving ? (
              <Spinner size="x-small" label="Saving" inline />
            ) : (
              <Icon name="check" size={14} color={tokens.color.textInverse} />
            )}
          </button>
          <button
            onClick={handleCancel}
            aria-label={`Cancel editing ${label}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 28,
              height: 28,
              border: `1px solid ${tokens.color.borderDefault}`,
              borderRadius: tokens.radius.radiusMedium,
              backgroundColor: tokens.color.neutral0,
              color: tokens.color.textPlaceholder,
              cursor: 'pointer',
            }}
          >
            <Icon name="close" size={14} />
          </button>
        </div>

        {error && (
          <div
            id={`${label}-error`}
            style={{
              fontSize: tokens.typography.fontSizeSmall,
              color: tokens.color.error,
              marginTop: tokens.spacing.spacingXXSmall,
            }}
          >
            {error}
          </div>
        )}
      </div>
    );
  }

  // Read mode
  return (
    <div
      role={readOnly ? undefined : 'button'}
      tabIndex={readOnly ? undefined : 0}
      aria-label={readOnly ? undefined : `Edit ${label}`}
      onClick={handleStartEdit}
      onKeyDown={(e) => {
        if (!readOnly && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleStartEdit();
        }
      }}
      style={readContainerStyle}
      onMouseEnter={(e) => {
        if (!readOnly) {
          e.currentTarget.style.backgroundColor = tokens.color.neutral1;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      <FieldRenderer
        value={value}
        fieldType={fieldType}
        currencyCode={currencyCode}
        emptyText={placeholder ?? '—'}
      />
      {!readOnly && (
        <span
          className="eds-inline-edit-pencil"
          style={{
            opacity: 0,
            transition: `opacity ${tokens.duration.durationQuickly}`,
            flexShrink: 0,
          }}
        >
          <Icon name="edit" size={12} color={tokens.color.textPlaceholder} />
        </span>
      )}
    </div>
  );
};
