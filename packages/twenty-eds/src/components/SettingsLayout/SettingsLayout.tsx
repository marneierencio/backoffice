// SettingsLayout — 2-column layout for all settings pages
// Left: vertical nav list; Right: content area
// Follows SLDS 2 Navigation Vertical pattern
// https://www.lightningdesignsystem.com/components/navigation-vertical/
import { type IconName, Icon } from '@eds/components/Icon';
import { tokens } from '@eds/tokens';

export type SettingsNavItem = {
  id: string;
  label: string;
  href: string;
  icon?: IconName;
};

export type SettingsNavGroup = {
  label?: string;
  items: SettingsNavItem[];
};

export type SettingsLayoutProps = {
  children: React.ReactNode;
  navGroups?: SettingsNavGroup[];
  title?: string;
};

const DEFAULT_NAV_GROUPS: SettingsNavGroup[] = [
  {
    label: 'Workspace',
    items: [
      { id: 'workspace', label: 'General', href: '#/settings/workspace', icon: 'workspace' },
      { id: 'members', label: 'Members', href: '#/settings/members', icon: 'members' },
      { id: 'roles', label: 'Roles', href: '#/settings/roles', icon: 'shield' },
      { id: 'data-model', label: 'Data Model', href: '#/settings/data-model', icon: 'database' },
    ],
  },
  {
    label: 'Developers',
    items: [
      { id: 'api-keys', label: 'API Keys', href: '#/settings/api-keys', icon: 'key' },
    ],
  },
  {
    label: 'Account',
    items: [
      { id: 'billing', label: 'Billing', href: '#/settings/billing', icon: 'credit-card' },
    ],
  },
];

export const SettingsLayout = ({
  children,
  navGroups = DEFAULT_NAV_GROUPS,
  title = 'Settings',
}: SettingsLayoutProps) => {
  const currentHash = window.location.hash;

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    minHeight: '100%',
    fontFamily: tokens.typography.fontFamilyBase,
    gap: tokens.spacing.spacingXXLarge,
  };

  const navStyle: React.CSSProperties = {
    width: '200px',
    flexShrink: 0,
    paddingTop: tokens.spacing.spacingMedium,
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    maxWidth: '720px',
    paddingTop: tokens.spacing.spacingMedium,
    paddingBottom: tokens.spacing.spacingXXLarge,
  };

  const pageTitleStyle: React.CSSProperties = {
    fontSize: tokens.typography.fontSizeXXLarge,
    fontWeight: tokens.typography.fontWeightBold,
    color: tokens.color.textDefault,
    marginBottom: tokens.spacing.spacingXLarge,
    marginTop: 0,
    lineHeight: tokens.typography.lineHeightHeading,
  };

  const groupLabelStyle: React.CSSProperties = {
    fontSize: tokens.typography.fontSizeXSmall,
    fontWeight: tokens.typography.fontWeightMedium,
    color: tokens.color.textPlaceholder,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: tokens.spacing.spacingXXSmall,
    marginTop: tokens.spacing.spacingSmall,
    paddingLeft: tokens.spacing.spacingSmall,
    display: 'block',
  };

  const getNavItemStyle = (isActive: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.spacingXSmall,
    padding: `${tokens.spacing.spacingXSmall} ${tokens.spacing.spacingSmall}`,
    borderRadius: tokens.radius.radiusMedium,
    cursor: 'pointer',
    fontSize: tokens.typography.fontSizeMedium,
    color: isActive ? tokens.color.brandPrimary : tokens.color.textLabel,
    backgroundColor: isActive ? tokens.color.brandPrimaryLight : 'transparent',
    fontWeight: isActive ? tokens.typography.fontWeightMedium : tokens.typography.fontWeightRegular,
    textDecoration: 'none',
    transition: 'background-color 0.1s ease, color 0.1s ease',
    width: '100%',
    boxSizing: 'border-box',
  });

  return (
    <div style={containerStyle}>
      {/* Left nav */}
      <nav aria-label="Settings navigation" style={navStyle}>
        {navGroups.map((group, gIdx) => (
          <div key={gIdx}>
            {group.label && (
              <span style={groupLabelStyle}>{group.label}</span>
            )}
            <ul role="list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {group.items.map((item) => {
                const isActive = currentHash === item.href;
                return (
                  <li key={item.id}>
                    <a
                      href={item.href}
                      style={getNavItemStyle(isActive)}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {item.icon && (
                        <Icon
                          name={item.icon}
                          size={14}
                          color="currentColor"
                          aria-hidden
                        />
                      )}
                      {item.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Main content */}
      <main style={contentStyle}>
        {title && <h1 style={pageTitleStyle}>{title}</h1>}
        {children}
      </main>
    </div>
  );
};
