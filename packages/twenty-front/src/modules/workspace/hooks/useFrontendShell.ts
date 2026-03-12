import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';

// Frontend shells available in this application
export type FrontendShell = 'TWENTY' | 'BACKOFFICE';

// URL path prefix for the Erencio.com Backoffice frontend
const BACKOFFICE_PATH = '/backoffice';

// Resolve the effective frontend shell based on:
// 1. Workspace policy (if forced, overrides user preference)
// 2. User preference
// 3. System default (TWENTY)
export const useFrontendShell = (): {
  effectiveFrontend: FrontendShell;
  isForcedByWorkspace: boolean;
  userPreference: FrontendShell;
  workspacePolicy: string | null;
} => {
  const currentUser = useRecoilValueV2(currentUserState);
  const currentWorkspace = useRecoilValueV2(currentWorkspaceState);

  const workspacePolicy = currentWorkspace?.frontendPolicy ?? null;
  const userPreference =
    (currentUser?.frontendPreference as FrontendShell | undefined) ?? 'TWENTY';

  if (workspacePolicy === 'FORCE_BACKOFFICE') {
    return {
      effectiveFrontend: 'BACKOFFICE',
      isForcedByWorkspace: true,
      userPreference,
      workspacePolicy,
    };
  }

  if (workspacePolicy === 'FORCE_TWENTY') {
    return {
      effectiveFrontend: 'TWENTY',
      isForcedByWorkspace: true,
      userPreference,
      workspacePolicy,
    };
  }

  // ALLOW_USER_CHOICE or no policy set — use user preference
  return {
    effectiveFrontend: userPreference,
    isForcedByWorkspace: false,
    userPreference,
    workspacePolicy,
  };
};

// Redirect to Erencio.com Backoffice frontend if needed.
// Returns true if a redirect was triggered (caller should stop rendering).
export const redirectToBackofficeIfNeeded = (
  effectiveFrontend: FrontendShell,
): boolean => {
  if (
    effectiveFrontend === 'BACKOFFICE' &&
    !window.location.pathname.startsWith(BACKOFFICE_PATH)
  ) {
    window.location.href = BACKOFFICE_PATH;
    return true;
  }

  return false;
};
