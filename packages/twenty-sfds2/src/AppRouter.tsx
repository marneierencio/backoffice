import { Shell } from '@sfds2/components/Layout';
import { useAuth } from '@sfds2/hooks/useAuth';
import { DashboardPage } from '@sfds2/pages/DashboardPage';
import { LoginPage } from '@sfds2/pages/LoginPage';
import { ProfileSettingsPage } from '@sfds2/pages/ProfileSettingsPage';
import { tokens } from '@sfds2/tokens';
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
      ],
    },
    {
      label: 'User',
      items: [
        { id: 'profile', label: 'Profile Settings', href: '#/settings/profile', icon: '⚙️' },
      ],
    },
  ];

  const topBarRight = (
    <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.spacingSmall }}>
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
