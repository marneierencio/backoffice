import React from 'react';
import { AuthProvider } from '@sfds2/hooks/useAuth';
import { AppRouter } from './AppRouter';

export const App = () => (
  <AuthProvider>
    <AppRouter />
  </AuthProvider>
);
