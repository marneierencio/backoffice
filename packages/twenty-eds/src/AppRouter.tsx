import { GlobalSearch } from '@eds/components/GlobalSearch';
import { Shell } from '@eds/components/Layout';
import { NotificationPanel } from '@eds/components/NotificationPanel';
import { useAuth } from '@eds/hooks/useAuth';
import { useNotifications } from '@eds/hooks/useNotifications';
import { CalendarPage } from '@eds/pages/CalendarPage';
import { CompaniesListPage } from '@eds/pages/CompaniesListPage';
import { CompanyDetailPage } from '@eds/pages/CompanyDetailPage';
import { ContactDetailPage } from '@eds/pages/ContactDetailPage';
import { ContactsListPage } from '@eds/pages/ContactsListPage';
import { CreateCompanyPage } from '@eds/pages/CreateCompanyPage';
import { CreateContactPage } from '@eds/pages/CreateContactPage';
import { CreateDealPage } from '@eds/pages/CreateDealPage';
import { DashboardPage } from '@eds/pages/DashboardPage';
import { DealDetailPage } from '@eds/pages/DealDetailPage';
import { DealsListPage } from '@eds/pages/DealsListPage';
import { KanbanDealsPage } from '@eds/pages/KanbanDealsPage';
import { LoginPage } from '@eds/pages/LoginPage';
import { ProfileSettingsPage } from '@eds/pages/ProfileSettingsPage';
import { tokens } from '@eds/tokens';
import React from 'react';
import { createHashRouter, Navigate, RouterProvider } from 'react-router-dom';

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading, logout } = useAuth();

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

  const sidebarSections = [
    {
      label: 'Main',
      items: [
        { id: 'dashboard', label: 'Dashboard', href: '#/', icon: '⊞' },
        { id: 'contacts', label: 'Contacts', href: '#/contacts', icon: '👥' },
        { id: 'companies', label: 'Companies', href: '#/companies', icon: '🏢' },
        { id: 'deals', label: 'Deals', href: '#/deals', icon: '💼' },
        { id: 'deals-kanban', label: 'Deals Pipeline', href: '#/deals/kanban', icon: '📊' },
        { id: 'calendar', label: 'Calendar', href: '#/calendar', icon: '📅' },
      ],
    },
    {
      label: 'User',
      items: [
        { id: 'profile', label: 'Profile Settings', href: '#/settings/profile', icon: '⚙️' },
      ],
    },
  ];

  const { notifications, markAsRead, markAllAsRead } = useNotifications();

  const topBarRight = (
    <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.spacingSmall }}>
      <GlobalSearch
        onResultClick={(result) => { window.location.hash = result.href; }}
        onOpenCommandMenu={() => {}}
      />
      <NotificationPanel
        notifications={notifications}
        onNotificationClick={(n) => { if (n.href) window.location.hash = n.href; }}
        onMarkAsRead={(id) => markAsRead(id)}
        onMarkAllAsRead={markAllAsRead}
      />
      <span style={{ color: tokens.color.neutral3, fontSize: tokens.typography.fontSizeSmall }}>
        {user.firstName || user.email}
      </span>
      <button
        onClick={logout}
        style={{
          background: 'none',
          border: `1px solid ${tokens.color.neutral3}`,
          color: tokens.color.neutral3,
          borderRadius: tokens.radius.radiusMedium,
          padding: `${tokens.spacing.spacingXXXSmall} ${tokens.spacing.spacingXSmall}`,
          cursor: 'pointer',
          fontSize: tokens.typography.fontSizeSmall,
          fontFamily: tokens.typography.fontFamilyBase,
        }}
      >
        Sign out
      </button>
    </div>
  );

  return (
    <Shell
      appName="Erencio Backoffice"
      sidebarSections={sidebarSections}
      topBarRight={topBarRight}
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
    path: '*',
    element: (
      <ProtectedLayout>
        <DashboardPage />
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
