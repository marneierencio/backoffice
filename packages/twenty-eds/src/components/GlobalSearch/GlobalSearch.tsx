import { Icon, type IconName } from '@eds/components/Icon';
import { Popover } from '@eds/components/Popover';
import { tokens } from '@eds/tokens';
import React, { useCallback, useEffect, useRef, useState } from 'react';

export type SearchResult = {
  id: string;
  label: string;
  objectType: string;
  icon: IconName;
  href: string;
};

export type GlobalSearchProps = {
  onOpenCommandMenu: () => void;
  results?: SearchResult[];
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onResultClick?: (result: SearchResult) => void;
  loading?: boolean;
  placeholder?: string;
};

const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
const shortcutLabel = isMac ? '⌘K' : 'Ctrl+K';

export const GlobalSearch = ({
  onOpenCommandMenu,
  results = [],
  searchQuery = '',
  onSearchChange,
  onResultClick,
  loading = false,
  placeholder = 'Search…',
}: GlobalSearchProps) => {
  const [focused, setFocused] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDropdownOpen(focused && results.length > 0 && searchQuery.length > 0);
  }, [focused, results, searchQuery]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onOpenCommandMenu();
      }
      if (e.key === 'Escape') {
        inputRef.current?.blur();
        setDropdownOpen(false);
      }
    },
    [onOpenCommandMenu],
  );

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: focused ? '360px' : '280px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: focused ? tokens.color.neutral0 : 'rgba(255,255,255,0.1)',
    borderRadius: tokens.radius.radiusMedium,
    padding: `0 ${tokens.spacing.spacingSmall}`,
    border: focused ? `1px solid ${tokens.color.borderFocus}` : '1px solid transparent',
    transition: `all ${tokens.duration.durationPromptly}`,
    gap: tokens.spacing.spacingXXXSmall,
  };

  const inputStyle: React.CSSProperties = {
    flex: 1,
    background: 'none',
    border: 'none',
    outline: 'none',
    color: focused ? tokens.color.textDefault : tokens.color.textInverse,
    fontSize: tokens.typography.fontSizeSmall,
    fontFamily: tokens.typography.fontFamilyBase,
    minWidth: 0,
  };

  const shortcutStyle: React.CSSProperties = {
    padding: '1px 6px',
    backgroundColor: focused ? tokens.color.neutral1 : 'rgba(255,255,255,0.15)',
    border: `1px solid ${focused ? tokens.color.neutral2 : 'rgba(255,255,255,0.2)'}`,
    borderRadius: tokens.radius.radiusSmall,
    fontSize: tokens.typography.fontSizeXSmall,
    color: focused ? tokens.color.textLabel : tokens.color.neutral3,
    lineHeight: '1.4',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  };

  const objectBadgeStyle: React.CSSProperties = {
    fontSize: tokens.typography.fontSizeXSmall,
    color: tokens.color.textPlaceholder,
    backgroundColor: tokens.color.neutral1,
    padding: `0 ${tokens.spacing.spacingXXSmall}`,
    borderRadius: tokens.radius.radiusSmall,
    flexShrink: 0,
  };

  return (
    <div ref={containerRef} style={containerStyle}>
      <Icon
        name="search"
        size={14}
        color={focused ? tokens.color.textPlaceholder : tokens.color.neutral4}
      />
      <input
        ref={inputRef}
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange?.(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          // Delay to allow result click
          setTimeout(() => {
            setFocused(false);
            setDropdownOpen(false);
          }, 200);
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        style={inputStyle}
        role="combobox"
        aria-expanded={dropdownOpen}
        aria-label="Global search"
        autoComplete="off"
      />
      {!searchQuery && <span style={shortcutStyle}>{shortcutLabel}</span>}
      {loading && (
        <span
          style={{
            width: '14px',
            height: '14px',
            border: `2px solid ${tokens.color.neutral3}`,
            borderTopColor: tokens.color.brandPrimary,
            borderRadius: '50%',
            animation: 'eds-spin 0.8s linear infinite',
            flexShrink: 0,
          }}
        />
      )}

      <Popover
        open={dropdownOpen}
        onClose={() => setDropdownOpen(false)}
        anchorRef={containerRef}
        placement="bottom-start"
        width={containerRef.current?.offsetWidth ?? 360}
        maxHeight={320}
        closeOnOutsideClick={false}
        closeOnEscape={false}
      >
        <div role="listbox" aria-label="Search results" style={{ padding: `${tokens.spacing.spacingXXXSmall} 0` }}>
          {results.map((result) => (
            <div
              key={result.id}
              role="option"
              aria-selected={false}
              onClick={() => {
                onResultClick?.(result);
                setDropdownOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing.spacingSmall,
                padding: `${tokens.spacing.spacingXSmall} ${tokens.spacing.spacingMedium}`,
                cursor: 'pointer',
                fontSize: tokens.typography.fontSizeMedium,
                color: tokens.color.textDefault,
                fontFamily: tokens.typography.fontFamilyBase,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = tokens.color.neutral1;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
              }}
            >
              <Icon name={result.icon} size={16} color={tokens.color.textPlaceholder} />
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {result.label}
              </span>
              <span style={objectBadgeStyle}>{result.objectType}</span>
            </div>
          ))}
        </div>
      </Popover>
    </div>
  );
};
