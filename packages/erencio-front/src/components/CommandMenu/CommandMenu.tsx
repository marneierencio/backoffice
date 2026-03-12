import { Icon, type IconName } from '@backoffice/components/Icon';
import { Spinner } from '@backoffice/components/Spinner';
import { tokens } from '@backoffice/tokens';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type CommandType = 'navigate' | 'create' | 'action' | 'record';

export type CommandItem = {
  id: string;
  label: string;
  description?: string;
  type: CommandType;
  icon?: IconName;
  shortcut?: string[];
  href?: string;
  onClick?: () => void;
  objectType?: string;
  keywords?: string[];
};

export type CommandGroup = {
  id: string;
  label: string;
  items: CommandItem[];
};

export type CommandMenuProps = {
  open: boolean;
  onClose: () => void;
  groups: CommandGroup[];
  onSelect: (item: CommandItem) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  loading?: boolean;
  placeholder?: string;
};

export const CommandMenu = ({
  open,
  onClose,
  groups,
  onSelect,
  searchQuery: _externalSearchQuery,
  onSearchChange,
  loading = false,
  placeholder = 'Type a command or search…',
}: CommandMenuProps) => {
  const [query, setQueryInternal] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const setQuery = useCallback((q: string) => {
    setQueryInternal(q);
    onSearchChange?.(q);
  }, [onSearchChange]);

  // Flatten all visible items for keyboard navigation
  const filteredGroups = useMemo(() => {
    if (!query.trim()) return groups;

    const lowerQuery = query.toLowerCase();
    return groups
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) =>
            item.label.toLowerCase().includes(lowerQuery) ||
            item.description?.toLowerCase().includes(lowerQuery) ||
            item.keywords?.some((k) => k.toLowerCase().includes(lowerQuery)),
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [groups, query]);

  const flatItems = useMemo(
    () => filteredGroups.flatMap((g) => g.items),
    [filteredGroups],
  );

  // Reset state on open/close
  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      // Focus input after render
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return;
    const activeEl = listRef.current.querySelector('[data-active="true"]');
    activeEl?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const handleSelect = useCallback(
    (item: CommandItem) => {
      onSelect(item);
      onClose();
    },
    [onSelect, onClose],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          setActiveIndex((prev) => Math.min(prev + 1, flatItems.length - 1));
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          setActiveIndex((prev) => Math.max(prev - 1, 0));
          break;
        }
        case 'Enter': {
          e.preventDefault();
          if (flatItems[activeIndex]) {
            handleSelect(flatItems[activeIndex]);
          }
          break;
        }
        case 'Escape': {
          e.preventDefault();
          onClose();
          break;
        }
      }
    },
    [flatItems, activeIndex, handleSelect, onClose],
  );

  if (!open) return null;

  const backdropStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'var(--backoffice-g-color-backdrop, rgba(0,0,0,0.5))',
    zIndex: tokens.zIndex.zIndexModal,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingTop: '120px',
  };

  const containerStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '640px',
    maxHeight: '480px',
    backgroundColor: tokens.color.neutral0,
    borderRadius: tokens.radius.radiusLarge,
    boxShadow: tokens.elevation.elevationModal,
    border: `1px solid ${tokens.color.neutral2}`,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    animation: 'backoffice-fade-in 150ms ease-out',
  };

  const searchStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.spacingSmall,
    padding: `0 ${tokens.spacing.spacingMedium}`,
    height: '48px',
    borderBottom: `1px solid ${tokens.color.neutral2}`,
    flexShrink: 0,
  };

  const inputStyle: React.CSSProperties = {
    flex: 1,
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    fontSize: tokens.typography.fontSizeBase,
    fontFamily: tokens.typography.fontFamilyBase,
    color: tokens.color.textDefault,
  };

  const groupHeaderStyle: React.CSSProperties = {
    padding: `${tokens.spacing.spacingXXSmall} ${tokens.spacing.spacingMedium}`,
    fontSize: tokens.typography.fontSizeSmall,
    fontWeight: tokens.typography.fontWeightMedium as React.CSSProperties['fontWeight'],
    color: tokens.color.textPlaceholder,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    backgroundColor: tokens.color.neutral1,
  };

  const footerStyle: React.CSSProperties = {
    padding: `${tokens.spacing.spacingXXSmall} ${tokens.spacing.spacingMedium}`,
    borderTop: `1px solid ${tokens.color.neutral2}`,
    fontSize: tokens.typography.fontSizeXSmall,
    color: tokens.color.textPlaceholder,
    backgroundColor: tokens.color.neutral1,
    flexShrink: 0,
    display: 'flex',
    gap: tokens.spacing.spacingMedium,
  };

  let itemIndex = -1;

  return (
    <div
      style={backdropStyle}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div
        style={containerStyle}
        role="dialog"
        aria-modal="true"
        aria-label="Command menu"
        onKeyDown={handleKeyDown}
      >
        {/* Search Input */}
        <div style={searchStyle}>
          <Icon name="search" size={16} color={tokens.color.textPlaceholder} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            placeholder={placeholder}
            style={inputStyle}
            role="combobox"
            aria-expanded="true"
            aria-controls="command-menu-list"
            aria-activedescendant={flatItems[activeIndex] ? `cmd-item-${flatItems[activeIndex].id}` : undefined}
            autoComplete="off"
          />
          {loading && <Spinner size="x-small" inline />}
        </div>

        {/* Results List */}
        <div
          id="command-menu-list"
          ref={listRef}
          role="listbox"
          style={{ overflowY: 'auto', flex: 1 }}
        >
          {filteredGroups.length === 0 && !loading && (
            <div
              style={{
                padding: tokens.spacing.spacingLarge,
                textAlign: 'center',
                color: tokens.color.textPlaceholder,
                fontSize: tokens.typography.fontSizeMedium,
              }}
            >
              No results found
            </div>
          )}

          {filteredGroups.map((group) => (
            <div key={group.id}>
              <div style={groupHeaderStyle}>{group.label}</div>
              {group.items.map((item) => {
                itemIndex++;
                const isActive = itemIndex === activeIndex;
                const currentIndex = itemIndex;

                return (
                  <CommandMenuItemRow
                    key={item.id}
                    item={item}
                    isActive={isActive}
                    onSelect={() => handleSelect(item)}
                    onHover={() => setActiveIndex(currentIndex)}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={footerStyle}>
          <span>↑↓ navigate</span>
          <span>↵ select</span>
          <span>esc close</span>
        </div>
      </div>
    </div>
  );
};

// Extracted item row for cleaner rendering
type CommandMenuItemRowProps = {
  item: CommandItem;
  isActive: boolean;
  onSelect: () => void;
  onHover: () => void;
};

const CommandMenuItemRow = ({ item, isActive, onSelect, onHover }: CommandMenuItemRowProps) => {
  const rowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.spacingSmall,
    padding: `${tokens.spacing.spacingXSmall} ${tokens.spacing.spacingMedium}`,
    cursor: 'pointer',
    backgroundColor: isActive ? tokens.color.brandPrimaryLight : 'transparent',
    color: tokens.color.textDefault,
    outline: 'none',
    border: 'none',
    width: '100%',
    textAlign: 'left',
    fontFamily: tokens.typography.fontFamilyBase,
  };

  const shortcutBadgeStyle: React.CSSProperties = {
    display: 'inline-flex',
    gap: '2px',
    marginLeft: 'auto',
  };

  const shortcutKeyStyle: React.CSSProperties = {
    padding: '1px 6px',
    backgroundColor: tokens.color.neutral1,
    border: `1px solid ${tokens.color.neutral2}`,
    borderRadius: tokens.radius.radiusSmall,
    fontSize: tokens.typography.fontSizeXSmall,
    fontWeight: tokens.typography.fontWeightMedium as React.CSSProperties['fontWeight'],
    color: tokens.color.textLabel,
    lineHeight: '1.4',
  };

  return (
    <div
      role="option"
      id={`cmd-item-${item.id}`}
      data-active={isActive}
      aria-selected={isActive}
      style={rowStyle}
      onClick={onSelect}
      onMouseEnter={onHover}
      tabIndex={-1}
    >
      {item.icon && (
        <Icon
          name={item.icon}
          size={16}
          color={isActive ? tokens.color.brandPrimary : tokens.color.textPlaceholder}
        />
      )}
      <span style={{ fontSize: tokens.typography.fontSizeMedium }}>{item.label}</span>
      {item.description && (
        <span
          style={{
            fontSize: tokens.typography.fontSizeSmall,
            color: tokens.color.textPlaceholder,
            flex: 1,
            textAlign: 'right',
          }}
        >
          {item.description}
        </span>
      )}
      {item.shortcut && item.shortcut.length > 0 && (
        <span style={shortcutBadgeStyle}>
          {item.shortcut.map((key, i) => (
            <span key={i} style={shortcutKeyStyle}>
              {key}
            </span>
          ))}
        </span>
      )}
    </div>
  );
};
