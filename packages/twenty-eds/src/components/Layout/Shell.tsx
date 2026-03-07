import { tokens } from '@eds/tokens';
import React from 'react';

// SLDS 2 App Navigation Bar item
export type NavItem = {
  id: string;
  label: string;
  href?: string;
  onClick?: () => void;
};

export type ShellProps = {
  children: React.ReactNode;
  appName?: string;
  logoUrl?: string;
  // App Navigation Bar items (horizontal tabs below Global Header)
  navItems?: NavItem[];
  // Slot for the search bar in the Global Header center
  headerSearch?: React.ReactNode;
  // Slot for utilities on the right of the Global Header (notifications, avatar, etc.)
  headerRight?: React.ReactNode;
  activeItemId?: string;
};

// SLDS 2 Global Header color — navy blue, distinct from the dark neutral used previously
const GLOBAL_HEADER_BG = '#16325c';

export const Shell = ({
  children,
  appName = 'Backoffice',
  logoUrl,
  navItems = [],
  headerSearch,
  headerRight,
  activeItemId,
}: ShellProps) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      fontFamily: tokens.typography.fontFamilyBase,
    }}
  >
    {/* ── Global Header ──────────────────────────────────────────── */}
    <header
      role="banner"
      style={{
        display: 'flex',
        alignItems: 'center',
        height: '52px',
        padding: `0 ${tokens.spacing.spacingMedium}`,
        backgroundColor: GLOBAL_HEADER_BG,
        color: tokens.color.textInverse,
        boxShadow: tokens.elevation.elevationRaised,
        zIndex: tokens.zIndex.zIndexRaised,
        flexShrink: 0,
        gap: tokens.spacing.spacingMedium,
      }}
    >
      {/* Left: logo + app name */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing.spacingSmall,
          flexShrink: 0,
        }}
      >
        {logoUrl ? (
          <img src={logoUrl} alt={appName} style={{ height: '28px', width: 'auto' }} />
        ) : (
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: tokens.radius.radiusMedium,
              backgroundColor: tokens.color.brandPrimary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: tokens.color.textInverse,
              fontSize: tokens.typography.fontSizeSmall,
              fontWeight: tokens.typography.fontWeightBold,
              flexShrink: 0,
            }}
          >
            {appName.charAt(0).toUpperCase()}
          </div>
        )}
        <span
          style={{
            fontSize: tokens.typography.fontSizeLarge,
            fontWeight: tokens.typography.fontWeightBold,
            color: tokens.color.textInverse,
            whiteSpace: 'nowrap',
          }}
        >
          {appName}
        </span>
      </div>

      {/* Center: search */}
      {headerSearch && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            maxWidth: '560px',
            margin: '0 auto',
          }}
        >
          {headerSearch}
        </div>
      )}

      {/* Right: utilities */}
      {headerRight && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing.spacingSmall,
            flexShrink: 0,
            marginLeft: 'auto',
          }}
        >
          {headerRight}
        </div>
      )}
    </header>

    {/* ── App Navigation Bar ──────────────────────────────────────── */}
    {navItems.length > 0 && (
      <nav
        aria-label="App navigation"
        style={{
          display: 'flex',
          alignItems: 'stretch',
          height: '48px',
          backgroundColor: tokens.color.neutral0,
          borderBottom: `1px solid ${tokens.color.borderDefault}`,
          padding: `0 ${tokens.spacing.spacingXSmall}`,
          flexShrink: 0,
          overflowX: 'auto',
          // Hide scrollbar but keep scrollability for overflow
          scrollbarWidth: 'none',
        }}
      >
        {navItems.map((item) => {
          const isActive = item.id === activeItemId;
          const baseStyle: React.CSSProperties = {
            display: 'flex',
            alignItems: 'center',
            padding: `0 ${tokens.spacing.spacingMedium}`,
            height: '100%',
            fontSize: tokens.typography.fontSizeMedium,
            fontWeight: isActive ? tokens.typography.fontWeightMedium : tokens.typography.fontWeightRegular,
            color: isActive ? tokens.color.brandPrimary : tokens.color.textLabel,
            // Active indicator: thick bottom border flush with the nav bar bottom edge
            borderBottom: isActive
              ? `3px solid ${tokens.color.brandPrimary}`
              : '3px solid transparent',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            transition: `color ${tokens.duration.durationQuickly} ease, border-color ${tokens.duration.durationQuickly} ease`,
            boxSizing: 'border-box',
            background: 'none',
            border: 'none',
            borderRadius: 0,
            fontFamily: 'inherit',
          };

          if (item.href) {
            return (
              <a
                key={item.id}
                href={item.href}
                style={baseStyle}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.label}
              </a>
            );
          }

          return (
            <button
              key={item.id}
              style={baseStyle}
              onClick={item.onClick}
              aria-current={isActive ? 'page' : undefined}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    )}

    {/* ── Page content ────────────────────────────────────────────── */}
    <main
      style={{
        flex: 1,
        overflow: 'auto',
        padding: tokens.spacing.spacingLarge,
        backgroundColor: tokens.color.neutral1,
      }}
    >
      {children}
    </main>
  </div>
);
