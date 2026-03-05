import { Avatar } from '@eds/components/Avatar';
import { Icon } from '@eds/components/Icon';
import { Spinner } from '@eds/components/Spinner';
import { tokens } from '@eds/tokens';
import React, { useCallback, useEffect, useId, useRef, useState } from 'react';

export type ComboboxOption = {
  id: string;
  label: string;
  sublabel?: string;
  avatarUrl?: string;
};

export type ComboboxProps = {
  id?: string;
  label?: string;
  placeholder?: string;
  value: ComboboxOption | null;
  options: ComboboxOption[];
  loading?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  error?: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelect: (option: ComboboxOption | null) => void;
  onClear?: () => void;
  emptyMessage?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-required'?: boolean;
  'aria-invalid'?: boolean;
};

export const Combobox = ({
  id,
  label,
  placeholder = 'Search...',
  value,
  options,
  loading = false,
  disabled = false,
  readOnly = false,
  error,
  searchQuery,
  onSearchChange,
  onSelect,
  onClear,
  emptyMessage = 'No results found',
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'aria-required': ariaRequired,
  'aria-invalid': ariaInvalid,
}: ComboboxProps) => {
  const autoId = useId();
  const comboId = id ?? autoId;
  const listboxId = `${comboId}-listbox`;
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset active index when options change
  useEffect(() => {
    setActiveIndex(-1);
  }, [options]);

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onSearchChange(event.target.value);
      if (!isOpen) setIsOpen(true);
    },
    [isOpen, onSearchChange],
  );

  const handleInputFocus = useCallback(() => {
    if (!readOnly && !disabled && !value) {
      setIsOpen(true);
    }
  }, [disabled, readOnly, value]);

  const handleSelect = useCallback(
    (option: ComboboxOption) => {
      onSelect(option);
      setIsOpen(false);
      setActiveIndex(-1);
      onSearchChange('');
    },
    [onSelect, onSearchChange],
  );

  const handleClear = useCallback(() => {
    onSelect(null);
    onClear?.();
    onSearchChange('');
    setIsOpen(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [onSelect, onClear, onSearchChange]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!isOpen && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
        event.preventDefault();
        setIsOpen(true);
        return;
      }

      if (!isOpen) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setActiveIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
          break;
        case 'ArrowUp':
          event.preventDefault();
          setActiveIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
          break;
        case 'Enter':
          event.preventDefault();
          if (activeIndex >= 0 && activeIndex < options.length) {
            handleSelect(options[activeIndex]);
          }
          break;
        case 'Escape':
          event.preventDefault();
          setIsOpen(false);
          setActiveIndex(-1);
          break;
        case 'Tab':
          setIsOpen(false);
          setActiveIndex(-1);
          break;
      }
    },
    [isOpen, options, activeIndex, handleSelect],
  );

  const activeDescendantId =
    activeIndex >= 0 && activeIndex < options.length
      ? `${comboId}-option-${options[activeIndex].id}`
      : undefined;

  const inputContainerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    height: 36,
    border: `1px solid ${error || ariaInvalid ? tokens.color.borderError : tokens.color.borderInput}`,
    borderRadius: tokens.radius.radiusMedium,
    backgroundColor: disabled ? tokens.color.neutral1 : tokens.color.neutral0,
    fontFamily: tokens.typography.fontFamilyBase,
    fontSize: tokens.typography.fontSizeMedium,
    transition: `border-color ${tokens.duration.durationQuickly}`,
    cursor: disabled ? 'not-allowed' : 'text',
    opacity: disabled ? 0.6 : 1,
  };

  const inputStyle: React.CSSProperties = {
    flex: 1,
    height: '100%',
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    color: tokens.color.textDefault,
    padding: `0 ${tokens.spacing.spacingSmall}`,
    cursor: 'inherit',
  };

  const dropdownStyle: React.CSSProperties = {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: tokens.spacing.spacingXXSmall,
    backgroundColor: tokens.color.neutral0,
    border: `1px solid ${tokens.color.borderDefault}`,
    borderRadius: tokens.radius.radiusMedium,
    boxShadow: tokens.elevation.elevationDropdown,
    maxHeight: 240,
    overflowY: 'auto',
    zIndex: tokens.zIndex.zIndexDropdown,
  };

  const optionStyle = (isActive: boolean, isSelected: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.spacingXSmall,
    padding: `${tokens.spacing.spacingXSmall} ${tokens.spacing.spacingSmall}`,
    cursor: 'pointer',
    backgroundColor: isActive
      ? tokens.color.brandPrimaryLight
      : 'transparent',
    fontWeight: isSelected ? tokens.typography.fontWeightMedium : tokens.typography.fontWeightRegular,
    fontSize: tokens.typography.fontSizeMedium,
    color: tokens.color.textDefault,
    transition: `background-color ${tokens.duration.durationQuickly}`,
  });

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', fontFamily: tokens.typography.fontFamilyBase }}
    >
      {label && (
        <label
          htmlFor={comboId}
          style={{
            display: 'block',
            marginBottom: tokens.spacing.spacingXXSmall,
            fontSize: tokens.typography.fontSizeMedium,
            fontWeight: tokens.typography.fontWeightMedium,
            color: tokens.color.textLabel,
          }}
        >
          {label}
        </label>
      )}

      <div
        style={inputContainerStyle}
        onFocus={(e) => {
          if (!readOnly && !disabled) {
            e.currentTarget.style.borderColor = error
              ? tokens.color.borderError
              : tokens.color.borderFocus;
          }
        }}
        onBlur={(e) => {
          if (!containerRef.current?.contains(e.relatedTarget as Node)) {
            e.currentTarget.style.borderColor = error
              ? tokens.color.borderError
              : tokens.color.borderInput;
          }
        }}
      >
        {value ? (
          <>
            <span
              style={{
                flex: 1,
                padding: `0 ${tokens.spacing.spacingSmall}`,
                color: tokens.color.textDefault,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {value.label}
            </span>
            {!readOnly && !disabled && (
              <button
                type="button"
                aria-label="Clear selection"
                onClick={handleClear}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'none',
                  border: 'none',
                  padding: tokens.spacing.spacingXXSmall,
                  cursor: 'pointer',
                  color: tokens.color.textPlaceholder,
                  marginRight: tokens.spacing.spacingXXSmall,
                }}
              >
                <Icon name="close" size={12} />
              </button>
            )}
          </>
        ) : (
          <input
            ref={inputRef}
            id={comboId}
            type="text"
            role="combobox"
            value={searchQuery}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            aria-label={ariaLabel ?? label}
            aria-describedby={ariaDescribedBy}
            aria-required={ariaRequired}
            aria-invalid={ariaInvalid}
            aria-expanded={isOpen}
            aria-controls={isOpen ? listboxId : undefined}
            aria-activedescendant={activeDescendantId}
            aria-autocomplete="list"
            autoComplete="off"
            style={inputStyle}
          />
        )}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            paddingRight: tokens.spacing.spacingXSmall,
            color: tokens.color.textPlaceholder,
          }}
        >
          <Icon name="chevron-down" size={14} />
        </span>
      </div>

      {/* Dropdown */}
      {isOpen && !value && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label={ariaLabel ?? label ?? 'Options'}
          style={dropdownStyle}
        >
          {loading ? (
            <li
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: tokens.spacing.spacingXSmall,
                padding: tokens.spacing.spacingMedium,
                color: tokens.color.textPlaceholder,
                fontSize: tokens.typography.fontSizeMedium,
              }}
            >
              <Spinner size="x-small" label="Searching" inline />
              <span>Searching...</span>
            </li>
          ) : options.length === 0 ? (
            <li
              style={{
                padding: tokens.spacing.spacingMedium,
                textAlign: 'center',
                color: tokens.color.textPlaceholder,
                fontSize: tokens.typography.fontSizeMedium,
              }}
            >
              {emptyMessage}
            </li>
          ) : (
            options.map((option, index) => (
              <li
                key={option.id}
                id={`${comboId}-option-${option.id}`}
                role="option"
                aria-selected={index === activeIndex}
                onClick={() => handleSelect(option)}
                onMouseEnter={() => setActiveIndex(index)}
                style={optionStyle(index === activeIndex, false)}
              >
                {option.avatarUrl !== undefined && (
                  <Avatar
                    name={option.label}
                    src={option.avatarUrl || undefined}
                    size="x-small"
                    type="entity"
                  />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {option.label}
                  </div>
                  {option.sublabel && (
                    <div
                      style={{
                        fontSize: tokens.typography.fontSizeSmall,
                        color: tokens.color.textPlaceholder,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {option.sublabel}
                    </div>
                  )}
                </div>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};
