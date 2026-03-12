import { CommandMenu } from '@backoffice/components/CommandMenu';
import { ToastProvider } from '@backoffice/components/Toast';
import { AuthProvider } from '@backoffice/hooks/useAuth';
import { useCommandMenu } from '@backoffice/hooks/useCommandMenu';
import { AppRouter } from './AppRouter';

const AppContent = () => {
  const cmd = useCommandMenu();

  return (
    <>
      <AppRouter />
      <CommandMenu
        open={cmd.isOpen}
        onClose={cmd.close}
        groups={cmd.groups}
        onSearchChange={cmd.setSearchQuery}
        onSelect={(item) => {
          item.onClick?.();
          cmd.close();
        }}
        loading={cmd.loading}
        placeholder="Search or type a command…"
      />
    </>
  );
};

export const App = () => (
  <AuthProvider>
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  </AuthProvider>
);
