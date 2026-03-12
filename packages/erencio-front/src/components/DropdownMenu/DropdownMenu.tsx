import { Icon, type IconName } from '@backoffice/components/Icon';
import { Popover, type PopoverPlacement } from '@backoffice/components/Popover';
import { tokens } from '@backoffice/tokens';
import React, { useCallback, useEffect, useRef, useState } from 'react';

export type MenuItemData = {
  id: string;
  label: string;
  icon?: IconName;
  disabled?: boolean;
  destructive?: boolean;
  divider?: boolean;
  onClick?: () => void;
};

export type DropdownMenuProps = {
  open: boolean;
  onClose: () => void;
  items: MenuItemData[];
  anchorRef: React.RefObject<HTMLElement | null>;
  placement?: PopoverPlacement;
  width?: number;
  'aria-label'?: string;
};

export const DropdownMenu = ({
  open,
  onClose,
  items,
  anchorRef,
  placement = 'bottom-start',
  width = 200,
  'aria-label': ariaLabel = 'Menu',
}: DropdownMenuProps) => {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const enabledItems = items.filter((item) => !item.disabled && !item.divider);

  useEffect(() => {
    if (open) {
      setFocusedIndex(0);
    }
  }, [open]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          setFocusedIndex((prev) => (prev + 1) % enabledItems.length);
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          setFocusedIndex((prev) => (prev - 1 + enabledItems.length) % enabledItems.length);
          break;
        }
        case 'Enter':
        case ' ': {
          e.preventDefault();
          const item = enabledItems[focusedIndex];
          if (item?.onClick) {
            item.onClick();
            onClose();
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
    [enabledItems, focusedIndex, onClose],
  );

  const itemStyle = (isActive: boolean, isDestructive: boolean, isDisabled: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.spacingSmall,
    padding: `${tokens.spacing.spacingXSmall} ${tokens.spacing.spacingMedium}`,
    fontSize: tokens.typography.fontSizeMedium,
    color: isDisabled
      ? tokens.color.textDisabled
      : isDestructive
        ? tokens.color.error
        : tokens.color.textDefault,
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    backgroundColor: isActive && !isDisabled ? tokens.color.neutral1 : 'transparent',
    border: 'none',
    width: '100%',
    textAlign: 'left',
    fontFamily: tokens.typography.fontFamilyBase,
    outline: 'none',
  });

  const dividerStyle: React.CSSProperties = {
    height: '1px',
    backgroundColor: tokens.color.neutral2,
    margin: `${tokens.spacing.spacingXXXSmall} 0`,
  };

  let enabledIdx = -1;

  return (
    <Popover
      open={open}
      onClose={onClose}
      anchorRef={anchorRef}
      placement={placement}
      width={width}
      aria-label={ariaLabel}
    >
      <div
        ref={listRef}
        role="menu"
        aria-label={ariaLabel}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
        style={{ padding: `${tokens.spacing.spacingXXXSmall} 0`, outline: 'none' }}
      >
        {items.map((item) => {
          if (item.divider) {
            return <div key={item.id} style={dividerStyle} role="separator" />;
          }

          if (!item.disabled) {
            enabledIdx++;
          }
          const currentEnabledIdx = item.disabled ? -1 : enabledIdx;
          const isActive = currentEnabledIdx === focusedIndex;

          return (
            <button
              key={item.id}
              role="menuitem"
              style={itemStyle(isActive, !!item.destructive, !!item.disabled)}
              disabled={item.disabled}
              tabIndex={isActive ? 0 : -1}
              onClick={() => {
                if (!item.disabled && item.onClick) {
                  item.onClick();
                  onClose();
                }
              }}
              onMouseEnter={() => {
                if (!item.disabled) {
                  setFocusedIndex(currentEnabledIdx);
                }
              }}
              aria-disabled={item.disabled}
            >
              {item.icon && (
                <Icon
                  name={item.icon}
                  size={16}
                  color={item.disabled ? tokens.color.textDisabled : item.destructive ? tokens.color.error : tokens.color.textPlaceholder}
                />
              )}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </Popover>
  );
};
