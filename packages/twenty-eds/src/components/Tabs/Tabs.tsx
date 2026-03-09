import { tokens } from '@eds/tokens';
import React, { useCallback, useRef } from 'react';

export type TabItem = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number;
  disabled?: boolean;
};

export type TabsSize = 'default' | 'medium' | 'large';

export type TabsProps = {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  size?: TabsSize;
  children?: React.ReactNode;
};

const sizePadding: Record<TabsSize, string> = {
  default: `${tokens.spacing.spacingXSmall} ${tokens.spacing.spacingMedium}`,
  medium: `${tokens.spacing.spacingSmall} ${tokens.spacing.spacingMedium}`,
  large: `${tokens.spacing.spacingMedium} ${tokens.spacing.spacingMedium}`,
};

export const Tabs = ({
  tabs,
  activeTab,
  onChange,
  size = 'default',
  children,
}: TabsProps) => {
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const enabledTabs = tabs.filter((t) => !t.disabled);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const currentIndex = enabledTabs.findIndex((t) => t.id === activeTab);
      let nextIndex: number | null = null;

      switch (event.key) {
        case 'ArrowRight':
          nextIndex = (currentIndex + 1) % enabledTabs.length;
          break;
        case 'ArrowLeft':
          nextIndex = (currentIndex - 1 + enabledTabs.length) % enabledTabs.length;
          break;
        case 'Home':
          nextIndex = 0;
          break;
        case 'End':
          nextIndex = enabledTabs.length - 1;
          break;
        default:
          return;
      }

      event.preventDefault();
      const nextTab = enabledTabs[nextIndex];
      if (nextTab) {
        onChange(nextTab.id);
        tabRefs.current.get(nextTab.id)?.focus();
      }
    },
    [activeTab, enabledTabs, onChange],
  );

  const tabListStyle: React.CSSProperties = {
    display: 'flex',
    borderBottom: `2px solid ${tokens.color.neutral2}`,
    fontFamily: tokens.typography.fontFamilyBase,
    gap: 0,
    margin: 0,
    padding: 0,
    listStyle: 'none',
  };

  const panelId = `tabpanel-${activeTab}`;

  return (
    <div>
      <div
        role="tablist"
        style={tabListStyle}
        onKeyDown={handleKeyDown}
        aria-orientation="horizontal"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          const isDisabled = tab.disabled ?? false;

          const tabStyle: React.CSSProperties = {
            display: 'inline-flex',
            alignItems: 'center',
            gap: tokens.spacing.spacingXXSmall,
            padding: sizePadding[size],
            border: 'none',
            borderBottom: isActive
              ? `3px solid ${tokens.color.brandPrimary}`
              : '3px solid transparent',
            marginBottom: '-2px',
            backgroundColor: 'transparent',
            color: isDisabled
              ? tokens.color.textDisabled
              : isActive
                ? tokens.color.brandPrimary
                : tokens.color.textPlaceholder,
            fontFamily: tokens.typography.fontFamilyBase,
            fontSize: tokens.typography.fontSizeMedium,
            fontWeight: isActive
              ? tokens.typography.fontWeightMedium
              : tokens.typography.fontWeightRegular,
            cursor: isDisabled ? 'not-allowed' : 'pointer',
            whiteSpace: 'nowrap',
            transition: `color ${tokens.duration.durationQuickly}, border-color ${tokens.duration.durationQuickly}`,
            outline: 'none',
          };

          return (
            <button
              key={tab.id}
              ref={(el) => {
                if (el) tabRefs.current.set(tab.id, el);
              }}
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={panelId}
              aria-disabled={isDisabled || undefined}
              tabIndex={isActive ? 0 : -1}
              disabled={isDisabled}
              style={tabStyle}
              onClick={() => {
                if (!isDisabled) onChange(tab.id);
              }}
              onMouseEnter={(e) => {
                if (!isActive && !isDisabled) {
                  e.currentTarget.style.color = tokens.color.textDefault;
                  e.currentTarget.style.borderBottomColor = tokens.color.neutral3;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive && !isDisabled) {
                  e.currentTarget.style.color = tokens.color.textPlaceholder;
                  e.currentTarget.style.borderBottomColor = 'transparent';
                }
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge != null && tab.badge > 0 && (
                <span
                  style={{
                    backgroundColor: tokens.color.neutral2,
                    color: tokens.color.textDefault,
                    fontSize: tokens.typography.fontSizeXSmall,
                    fontWeight: tokens.typography.fontWeightMedium,
                    borderRadius: tokens.radius.radiusPill,
                    padding: `0 ${tokens.spacing.spacingXXSmall}`,
                    minWidth: '18px',
                    textAlign: 'center',
                    lineHeight: '18px',
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={panelId}
        aria-labelledby={`tab-${activeTab}`}
        tabIndex={0}
        style={{ outline: 'none' }}
      >
        {children}
      </div>
    </div>
  );
};
