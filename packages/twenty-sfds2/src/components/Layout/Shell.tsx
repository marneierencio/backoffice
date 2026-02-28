import { tokens } from '@sfds2/tokens';
import React, { useState } from 'react';

export type SidebarItem = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  badge?: string;
};

export type SidebarSection = {
  label?: string;
  items: SidebarItem[];
};

export type ShellProps = {
  children: React.ReactNode;
  appName?: string;
  logoUrl?: string;
  sidebarSections?: SidebarSection[];
  topBarRight?: React.ReactNode;
  activeItemId?: string;
};

export const Shell = ({
  children,
  appName = 'Backoffice',
  logoUrl,
  sidebarSections = [],
  topBarRight,
  activeItemId,
}: ShellProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const shellStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    fontFamily: tokens.typography.fontFamilyBase,
    backgroundColor: tokens.color.neutral1,
  };

  const topBarStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '52px',
    padding: `0 ${tokens.spacing.spacingLarge}`,
    backgroundColor: tokens.color.neutral9,
    color: tokens.color.textInverse,
    boxShadow: tokens.elevation.elevationRaised,
    zIndex: tokens.zIndex.zIndexRaised,
    flexShrink: 0,
  };

  const logoAreaStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.spacingSmall,
  };

  const appNameStyle: React.CSSProperties = {
    fontSize: tokens.typography.fontSizeLarge,
    fontWeight: tokens.typography.fontWeightBold,
    color: tokens.color.textInverse,
  };

  const mainAreaStyle: React.CSSProperties = {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  };

  const sidebarStyle: React.CSSProperties = {
    width: sidebarCollapsed ? '52px' : '220px',
    backgroundColor: tokens.color.neutral0,
    borderRight: `1px solid ${tokens.color.borderDefault}`,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    transition: 'width 0.2s ease',
    flexShrink: 0,
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    overflow: 'auto',
    padding: tokens.spacing.spacingLarge,
  };

  return (
    <div style={shellStyle}>
      <header style={topBarStyle} aria-label={appName}>
        <div style={logoAreaStyle}>
          {logoUrl && (
            <img
              src={logoUrl}
              alt={appName}
              style={{ height: '28px', width: 'auto' }}
            />
          )}
          {!sidebarCollapsed && <span style={appNameStyle}>{appName}</span>}
          {sidebarCollapsed && (
            <span className="sr-only" style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
              {appName}
            </span>
          )}
        </div>
        {topBarRight}
      </header>
      <div style={mainAreaStyle}>
        {sidebarSections.length > 0 && (
          <aside style={sidebarStyle}>
            <button
              style={{
                background: 'none',
                border: 'none',
                padding: tokens.spacing.spacingSmall,
                textAlign: 'right',
                cursor: 'pointer',
                fontSize: '1.2rem',
                color: tokens.color.textLabel,
                alignSelf: 'flex-end',
              }}
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={sidebarCollapsed ? 'Expand' : 'Collapse'}
            >
              {sidebarCollapsed ? '›' : '‹'}
            </button>
            <nav style={{ flex: 1, overflowY: 'auto' }}>
              {sidebarSections.map((section, sectionIdx) => (
                <div key={sectionIdx}>
                  {section.label && !sidebarCollapsed && (
                    <div
                      style={{
                        padding: `${tokens.spacing.spacingXSmall} ${tokens.spacing.spacingMedium}`,
                        fontSize: tokens.typography.fontSizeXSmall,
                        fontWeight: tokens.typography.fontWeightBold,
                        color: tokens.color.textPlaceholder,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                      }}
                    >
                      {section.label}
                    </div>
                  )}
                  {section.items.map((item) => {
                    const isActive = item.id === activeItemId;
                    const itemStyle: React.CSSProperties = {
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing.spacingXSmall,
                      padding: `${tokens.spacing.spacingXSmall} ${tokens.spacing.spacingMedium}`,
                      cursor: 'pointer',
                      color: isActive ? tokens.color.brandPrimary : tokens.color.textLabel,
                      backgroundColor: isActive ? tokens.color.brandPrimaryLight : 'transparent',
                      borderLeft: isActive ? `3px solid ${tokens.color.brandPrimary}` : '3px solid transparent',
                      fontSize: tokens.typography.fontSizeMedium,
                      fontWeight: isActive ? tokens.typography.fontWeightBold : tokens.typography.fontWeightRegular,
                      textDecoration: 'none',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                    };

                    const content = (
                      <>
                        {item.icon && <span style={{ flexShrink: 0 }}>{item.icon}</span>}
                        {!sidebarCollapsed && <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>}
                        {!sidebarCollapsed && item.badge && (
                          <span
                            style={{
                              padding: `0 ${tokens.spacing.spacingXXSmall}`,
                              borderRadius: tokens.radius.radiusPill,
                              backgroundColor: tokens.color.brandPrimary,
                              color: tokens.color.textInverse,
                              fontSize: tokens.typography.fontSizeXSmall,
                              flexShrink: 0,
                            }}
                          >
                            {item.badge}
                          </span>
                        )}
                      </>
                    );

                    if (item.href) {
                      return (
                        <a
                          key={item.id}
                          href={item.href}
                          style={itemStyle}
                        >
                          {content}
                        </a>
                      );
                    }

                    return (
                      <div
                        key={item.id}
                        style={itemStyle}
                        onClick={item.onClick}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && item.onClick?.()}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        {content}
                      </div>
                    );
                  })}
                </div>
              ))}
            </nav>
          </aside>
        )}
        <main style={contentStyle}>{children}</main>
      </div>
    </div>
  );
};
