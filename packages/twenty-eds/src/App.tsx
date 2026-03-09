import { CommandMenu } from '@eds/components/CommandMenu';
import { ToastProvider } from '@eds/components/Toast';
import { AuthProvider } from '@eds/hooks/useAuth';
import { useCommandMenu } from '@eds/hooks/useCommandMenu';
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
