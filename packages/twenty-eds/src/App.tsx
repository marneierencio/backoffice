import { AuthProvider } from '@eds/hooks/useAuth';
import { AppRouter } from './AppRouter';

export const App = () => (
  <AuthProvider>
    <AppRouter />
  </AuthProvider>
);
