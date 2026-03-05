import { ToastProvider } from '@eds/components/Toast';
import { AuthProvider } from '@eds/hooks/useAuth';
import { AppRouter } from './AppRouter';

export const App = () => (
  <AuthProvider>
    <ToastProvider>
      <AppRouter />
    </ToastProvider>
  </AuthProvider>
);
