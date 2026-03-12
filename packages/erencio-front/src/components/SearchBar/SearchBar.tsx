import { Icon } from '@backoffice/components/Icon';
import { tokens } from '@backoffice/tokens';
import React, { useCallback, useEffect, useRef, useState } from 'react';

export type SearchBarProps = {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  debounceMs?: number;
  disabled?: boolean;
  'aria-label'?: string;
};

export const SearchBar = ({
  value,
  placeholder = 'Search…',
  onChange,
  onClear,
  debounceMs = 300,
  disabled = false,
  'aria-label': ariaLabel = 'Search',
}: SearchBarProps) => {
  const [internalValue, setInternalValue] = useState(value);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync external value changes
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const debouncedOnChange = useCallback(
    (newValue: string) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        onChange(newValue);
      }, debounceMs);
    },
    [onChange, debounceMs],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setInternalValue(newValue);
    debouncedOnChange(newValue);
  };

  const handleClear = () => {
    setInternalValue('');
    onChange('');
    onClear?.();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      handleClear();
    }
  };

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    maxWidth: '400px',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: '36px',
    paddingLeft: tokens.spacing.spacingXLarge,
    paddingRight: internalValue ? tokens.spacing.spacingXLarge : tokens.spacing.spacingSmall,
    border: `1px solid ${tokens.color.borderInput}`,
    borderRadius: tokens.radius.radiusMedium,
    fontSize: tokens.typography.fontSizeMedium,
    fontFamily: tokens.typography.fontFamilyBase,
    color: disabled ? tokens.color.textDisabled : tokens.color.textDefault,
    backgroundColor: disabled ? tokens.color.neutral1 : tokens.color.neutral0,
    outline: 'none',
    transition: `border-color ${tokens.duration.durationQuickly}`,
    cursor: disabled ? 'not-allowed' : 'text',
  };

  const iconLeftStyle: React.CSSProperties = {
    position: 'absolute',
    left: tokens.spacing.spacingXSmall,
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    color: tokens.color.textPlaceholder,
  };

  const clearButtonStyle: React.CSSProperties = {
    position: 'absolute',
    right: tokens.spacing.spacingXXSmall,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    background: 'none',
    border: 'none',
    borderRadius: tokens.radius.radiusSmall,
    cursor: 'pointer',
    color: tokens.color.textPlaceholder,
    padding: 0,
  };

  return (
    <div style={containerStyle}>
      <span style={iconLeftStyle}>
        <Icon name="search" size={16} />
      </span>
      <input
        type="search"
        role="searchbox"
        value={internalValue}
        placeholder={placeholder}
        disabled={disabled}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        style={inputStyle}
        aria-label={ariaLabel}
      />
      {internalValue && !disabled && (
        <button
          type="button"
          onClick={handleClear}
          style={clearButtonStyle}
          aria-label="Clear search"
        >
          <Icon name="close" size={14} />
        </button>
      )}
    </div>
  );
};
