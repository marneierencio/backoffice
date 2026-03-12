import { GlobalSearch } from '@backoffice/components/GlobalSearch';
import { Shell } from '@backoffice/components/Layout';
import { NotificationPanel } from '@backoffice/components/NotificationPanel';
import { useAuth } from '@backoffice/hooks/useAuth';
import { useNotifications } from '@backoffice/hooks/useNotifications';
import { ActivitiesPage } from '@backoffice/pages/ActivitiesPage';
import { CalendarPage } from '@backoffice/pages/CalendarPage';
import { CompaniesListPage } from '@backoffice/pages/CompaniesListPage';
import { CompanyDetailPage } from '@backoffice/pages/CompanyDetailPage';
import { ContactDetailPage } from '@backoffice/pages/ContactDetailPage';
import { ContactsListPage } from '@backoffice/pages/ContactsListPage';
import { CreateCompanyPage } from '@backoffice/pages/CreateCompanyPage';
import { CreateContactPage } from '@backoffice/pages/CreateContactPage';
import { CreateDealPage } from '@backoffice/pages/CreateDealPage';
import { DashboardPage } from '@backoffice/pages/DashboardPage';
import { DealDetailPage } from '@backoffice/pages/DealDetailPage';
import { DealsListPage } from '@backoffice/pages/DealsListPage';
import { KanbanDealsPage } from '@backoffice/pages/KanbanDealsPage';
import { LoginPage } from '@backoffice/pages/LoginPage';
import { NotFoundPage } from '@backoffice/pages/NotFoundPage';
import { ProfileSettingsPage } from '@backoffice/pages/ProfileSettingsPage';
import { SettingsAccountsPage } from '@backoffice/pages/settings/SettingsAccountsPage';
import { SettingsApiKeysPage } from '@backoffice/pages/settings/SettingsApiKeysPage';
import { SettingsBillingPage } from '@backoffice/pages/settings/SettingsBillingPage';
import { SettingsDataModelPage } from '@backoffice/pages/settings/SettingsDataModelPage';
import { SettingsDevelopersPage } from '@backoffice/pages/settings/SettingsDevelopersPage';
import { SettingsMemberDetailPage } from '@backoffice/pages/settings/SettingsMemberDetailPage';
import { SettingsMembersPage } from '@backoffice/pages/settings/SettingsMembersPage';
import { SettingsRolesPage } from '@backoffice/pages/settings/SettingsRolesPage';
import { SettingsSecurityPage } from '@backoffice/pages/settings/SettingsSecurityPage';
import { SettingsWorkspacePage } from '@backoffice/pages/settings/SettingsWorkspacePage';
import { tokens } from '@backoffice/tokens';
import React, { useEffect, useRef, useState } from 'react';
import { createHashRouter, Navigate, RouterProvider, useLocation } from 'react-router-dom';

// ── Setup Dropdown ────────────────────────────────────────────────────────────
const DROPDOWN_MENU_STYLE: React.CSSProperties = {
  position: 'absolute',
  top: 'calc(100% + 4px)',
  right: 0,
  backgroundColor: tokens.color.neutral0,
  borderRadius: tokens.radius.radiusMedium,
  boxShadow: tokens.elevation.elevationDropdown,
  border: `1px solid ${tokens.color.borderDefault}`,
  zIndex: tokens.zIndex.zIndexDropdown,
  overflow: 'hidden',
};

const HEADER_BTN_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: tokens.spacing.spacingXXSmall,
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: tokens.color.textInverse,
  padding: `${tokens.spacing.spacingXXSmall} ${tokens.spacing.spacingXSmall}`,
  borderRadius: tokens.radius.radiusMedium,
  fontSize: tokens.typography.fontSizeMedium,
  fontFamily: 'inherit',
};

const MENU_ITEM_STYLE: React.CSSProperties = {
  display: 'block',
  width: '100%',
  textAlign: 'left',
  padding: `${tokens.spacing.spacingXSmall} ${tokens.spacing.spacingMedium}`,
  fontSize: tokens.typography.fontSizeMedium,
  color: tokens.color.textDefault,
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontFamily: 'inherit',
  textDecoration: 'none',
};

const MENU_DIVIDER_STYLE: React.CSSProperties = {
  height: '1px',
  backgroundColor: tokens.color.borderDefault,
  margin: `${tokens.spacing.spacingXXSmall} 0`,
};

function useClickOutside(ref: React.RefObject<HTMLDivElement | null>, open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [ref, open, onClose]);
}

const SetupDropdown = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, open, () => setOpen(false));

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Setup"
        style={HEADER_BTN_STYLE}
      >
        {/* Gear icon */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
        <span>Setup</span>
        {/* Chevron */}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div role="menu" style={{ ...DROPDOWN_MENU_STYLE, minWidth: '200px' }}>
          <a
            href="#/settings/workspace"
            target="_blank"
            rel="noreferrer"
            role="menuitem"
            onClick={() => setOpen(false)}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = tokens.color.neutral1; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = ''; }}
            style={MENU_ITEM_STYLE}
          >
            Setup
          </a>
          <div style={MENU_DIVIDER_STYLE} />
          <div role="menuitem" aria-disabled="true" style={{ ...MENU_ITEM_STYLE, color: tokens.color.textDisabled, cursor: 'not-allowed' }}>Object Manager</div>
          <div role="menuitem" aria-disabled="true" style={{ ...MENU_ITEM_STYLE, color: tokens.color.textDisabled, cursor: 'not-allowed' }}>Sandboxes</div>
        </div>
      )}
    </div>
  );
};

// ── User Profile Dropdown ─────────────────────────────────────────────────────
type UserProfileDropdownProps = {
  user: { firstName: string; lastName: string; email: string };
  logout: () => void;
};

const UserProfileDropdown = ({ user, logout }: UserProfileDropdownProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, open, () => setOpen(false));

  const displayName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;
  const initials = displayName.slice(0, 2).toUpperCase();

  const avatarStyle = (size: number): React.CSSProperties => ({
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '50%',
    backgroundColor: tokens.color.brandPrimary,
    color: tokens.color.textInverse,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: size >= 40 ? tokens.typography.fontSizeMedium : tokens.typography.fontSizeSmall,
    fontWeight: tokens.typography.fontWeightBold,
    flexShrink: 0,
  });

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="View profile menu"
        style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.spacingXXSmall, background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: tokens.radius.radiusPill, fontFamily: 'inherit' }}
      >
        <div style={avatarStyle(32)}>{initials}</div>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={tokens.color.textInverse} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div role="menu" style={{ ...DROPDOWN_MENU_STYLE, minWidth: '260px' }}>
          {/* Identity header */}
          <div style={{ padding: tokens.spacing.spacingMedium, borderBottom: `1px solid ${tokens.color.borderDefault}`, display: 'flex', alignItems: 'center', gap: tokens.spacing.spacingSmall }}>
            <div style={avatarStyle(40)}>{initials}</div>
            <div style={{ overflow: 'hidden' }}>
              <a
                href="#/settings/profile"
                onClick={() => setOpen(false)}
                style={{ display: 'block', fontSize: tokens.typography.fontSizeMedium, fontWeight: tokens.typography.fontWeightMedium, color: tokens.color.brandPrimary, textDecoration: 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
              >
                {displayName}
              </a>
              <span style={{ display: 'block', fontSize: tokens.typography.fontSizeSmall, color: tokens.color.textPlaceholder, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.email}
              </span>
            </div>
          </div>
          {/* Switch Account — inactive */}
          <div style={{ padding: `${tokens.spacing.spacingXSmall} ${tokens.spacing.spacingMedium}`, borderBottom: `1px solid ${tokens.color.borderDefault}` }}>
            <div style={{ fontSize: tokens.typography.fontSizeXSmall, fontWeight: tokens.typography.fontWeightMedium, color: tokens.color.textPlaceholder, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: tokens.spacing.spacingXXSmall }}>
              Switch Account
            </div>
            <div aria-disabled="true" style={{ fontSize: tokens.typography.fontSizeMedium, color: tokens.color.textDisabled, cursor: 'not-allowed', padding: '2px 0' }}>
              No other accounts
            </div>
          </div>
          {/* Display Density — coming soon */}
          <div
            aria-disabled="true"
            style={{ padding: `${tokens.spacing.spacingXSmall} ${tokens.spacing.spacingMedium}`, borderBottom: `1px solid ${tokens.color.borderDefault}`, fontSize: tokens.typography.fontSizeMedium, color: tokens.color.textDisabled, cursor: 'not-allowed' }}
          >
            Display Density{' '}
            <span style={{ fontSize: tokens.typography.fontSizeXSmall }}>(coming soon)</span>
          </div>
          {/* Log Out */}
          <button
            role="menuitem"
            onClick={() => { setOpen(false); logout(); }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = tokens.color.neutral1; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = ''; }}
            style={MENU_ITEM_STYLE}
          >
            Log Out
          </button>
        </div>
      )}
    </div>
  );
};

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading, logout } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          fontFamily: tokens.typography.fontFamilyBase,
          color: tokens.color.textPlaceholder,
        }}
      >
        Loading…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Derive active nav item from current route
  const activeItemId = (() => {
    const p = location.pathname;
    if (p === '/') return 'home';
    if (p.startsWith('/contacts')) return 'contacts';
    if (p.startsWith('/companies')) return 'companies';
    if (p.startsWith('/deals/kanban')) return 'deals-pipeline';
    if (p.startsWith('/deals')) return 'deals';
    if (p.startsWith('/activities')) return 'activities';
    if (p.startsWith('/calendar')) return 'calendar';
    return undefined;
  })();

  // App Navigation Bar items — module-level tabs, no icons (SLDS 2 style)
  const navItems = [
    { id: 'home', label: 'Home', href: '#/' },
    { id: 'contacts', label: 'Contacts', href: '#/contacts' },
    { id: 'companies', label: 'Companies', href: '#/companies' },
    { id: 'deals', label: 'Deals', href: '#/deals' },
    { id: 'deals-pipeline', label: 'Deals Pipeline', href: '#/deals/kanban' },
    { id: 'activities', label: 'Activities', href: '#/activities' },
    { id: 'calendar', label: 'Calendar', href: '#/calendar' },
  ];

  const { notifications, markAsRead, markAllAsRead } = useNotifications();

  const headerSearch = (
    <GlobalSearch
      onResultClick={(result) => { window.location.hash = result.href; }}
      onOpenCommandMenu={() => {}}
    />
  );

  const headerRight = (
    <>
      <SetupDropdown />
      <NotificationPanel
        notifications={notifications}
        onNotificationClick={(n) => { if (n.href) window.location.hash = n.href; }}
        onMarkAsRead={(id) => markAsRead(id)}
        onMarkAllAsRead={markAllAsRead}
      />
      <UserProfileDropdown user={user} logout={logout} />
    </>
  );

  return (
    <Shell
      appName="Erencio Backoffice"
      navItems={navItems}
      activeItemId={activeItemId}
      headerSearch={headerSearch}
      headerRight={headerRight}
    >
      {children}
    </Shell>
  );
};

const router = createHashRouter([
  {
    path: '/login',
    element: <LoginPageWrapper />,
  },
  {
    path: '/',
    element: (
      <ProtectedLayout>
        <DashboardPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/contacts',
    element: (
      <ProtectedLayout>
        <ContactsListPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/contacts/new',
    element: (
      <ProtectedLayout>
        <CreateContactPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/contacts/:recordId',
    element: (
      <ProtectedLayout>
        <ContactDetailPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/companies',
    element: (
      <ProtectedLayout>
        <CompaniesListPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/companies/new',
    element: (
      <ProtectedLayout>
        <CreateCompanyPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/companies/:recordId',
    element: (
      <ProtectedLayout>
        <CompanyDetailPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/deals',
    element: (
      <ProtectedLayout>
        <DealsListPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/deals/new',
    element: (
      <ProtectedLayout>
        <CreateDealPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/deals/:recordId',
    element: (
      <ProtectedLayout>
        <DealDetailPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/deals/kanban',
    element: (
      <ProtectedLayout>
        <KanbanDealsPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/activities',
    element: (
      <ProtectedLayout>
        <ActivitiesPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/calendar',
    element: (
      <ProtectedLayout>
        <CalendarPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/settings/profile',
    element: (
      <ProtectedLayout>
        <ProfileSettingsPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/settings',
    element: (
      <ProtectedLayout>
        <Navigate to="/settings/workspace" replace />
      </ProtectedLayout>
    ),
  },
  {
    path: '/settings/workspace',
    element: (
      <ProtectedLayout>
        <SettingsWorkspacePage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/settings/members',
    element: (
      <ProtectedLayout>
        <SettingsMembersPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/settings/members/:memberId',
    element: (
      <ProtectedLayout>
        <SettingsMemberDetailPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/settings/roles',
    element: (
      <ProtectedLayout>
        <SettingsRolesPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/settings/data-model',
    element: (
      <ProtectedLayout>
        <SettingsDataModelPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/settings/api-keys',
    element: (
      <ProtectedLayout>
        <SettingsApiKeysPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/settings/accounts',
    element: (
      <ProtectedLayout>
        <SettingsAccountsPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/settings/developers',
    element: (
      <ProtectedLayout>
        <SettingsDevelopersPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/settings/security',
    element: (
      <ProtectedLayout>
        <SettingsSecurityPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/settings/billing',
    element: (
      <ProtectedLayout>
        <SettingsBillingPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '*',
    element: (
      <ProtectedLayout>
        <NotFoundPage />
      </ProtectedLayout>
    ),
  },
]);

function LoginPageWrapper() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (user) return <Navigate to="/" replace />;

  return <LoginPage />;
}

export const AppRouter = () => <RouterProvider router={router} />;
