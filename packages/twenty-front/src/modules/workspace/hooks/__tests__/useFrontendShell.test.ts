import { act, renderHook } from '@testing-library/react';
import { createElement } from 'react';
import { Provider as JotaiProvider } from 'jotai';
import { RecoilRoot } from 'recoil';

import {
  type CurrentWorkspace,
  currentWorkspaceState,
} from '@/auth/states/currentWorkspaceState';
import {
  type CurrentUser,
  currentUserState,
} from '@/auth/states/currentUserState';
import { useSetRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilStateV2';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { useFrontendShell } from '@/workspace/hooks/useFrontendShell';
import { WorkspaceActivationStatus } from '~/generated-metadata/graphql';

const baseWorkspace = {
  id: 'ws-1',
  activationStatus: WorkspaceActivationStatus.ACTIVE,
  allowImpersonation: false,
} as unknown as CurrentWorkspace;

const baseUser = {
  id: 'user-1',
  email: 'test@example.com',
  frontendPreference: 'TWENTY',
} as unknown as CurrentUser;

const Wrapper = ({ children }: { children: React.ReactNode }) =>
  createElement(
    JotaiProvider,
    { store: jotaiStore },
    createElement(RecoilRoot, null, children),
  );

const renderHooks = () => {
  const { result } = renderHook(
    () => {
      const frontendShell = useFrontendShell();
      const setCurrentWorkspace = useSetRecoilStateV2(currentWorkspaceState);
      const setCurrentUser = useSetRecoilStateV2(currentUserState);

      return {
        frontendShell,
        setCurrentWorkspace,
        setCurrentUser,
      };
    },
    { wrapper: Wrapper },
  );

  return { result };
};

describe('useFrontendShell', () => {
  it('should default to TWENTY when no preferences are set', () => {
    const { result } = renderHooks();

    expect(result.current.frontendShell.effectiveFrontend).toBe('TWENTY');
    expect(result.current.frontendShell.isForcedByWorkspace).toBe(false);
  });

  it('should return SFDS2 when user preference is SFDS2 and policy allows choice', () => {
    const { result } = renderHooks();

    act(() => {
      result.current.setCurrentWorkspace({
        ...baseWorkspace,
        frontendPolicy: 'ALLOW_USER_CHOICE',
      });
      result.current.setCurrentUser({
        ...baseUser,
        frontendPreference: 'SFDS2',
      });
    });

    expect(result.current.frontendShell.effectiveFrontend).toBe('SFDS2');
    expect(result.current.frontendShell.isForcedByWorkspace).toBe(false);
  });

  it('should force TWENTY when workspace policy is FORCE_TWENTY regardless of user preference', () => {
    const { result } = renderHooks();

    act(() => {
      result.current.setCurrentWorkspace({
        ...baseWorkspace,
        frontendPolicy: 'FORCE_TWENTY',
      });
      result.current.setCurrentUser({
        ...baseUser,
        frontendPreference: 'SFDS2',
      });
    });

    expect(result.current.frontendShell.effectiveFrontend).toBe('TWENTY');
    expect(result.current.frontendShell.isForcedByWorkspace).toBe(true);
  });

  it('should force SFDS2 when workspace policy is FORCE_SFDS2 regardless of user preference', () => {
    const { result } = renderHooks();

    act(() => {
      result.current.setCurrentWorkspace({
        ...baseWorkspace,
        frontendPolicy: 'FORCE_SFDS2',
      });
      result.current.setCurrentUser({
        ...baseUser,
        frontendPreference: 'TWENTY',
      });
    });

    expect(result.current.frontendShell.effectiveFrontend).toBe('SFDS2');
    expect(result.current.frontendShell.isForcedByWorkspace).toBe(true);
  });

  it('should use user preference when policy is ALLOW_USER_CHOICE', () => {
    const { result } = renderHooks();

    act(() => {
      result.current.setCurrentWorkspace({
        ...baseWorkspace,
        frontendPolicy: 'ALLOW_USER_CHOICE',
      });
      result.current.setCurrentUser({
        ...baseUser,
        frontendPreference: 'TWENTY',
      });
    });

    expect(result.current.frontendShell.effectiveFrontend).toBe('TWENTY');
    expect(result.current.frontendShell.isForcedByWorkspace).toBe(false);
  });

  it('workspace policy takes precedence over user preference', () => {
    const { result } = renderHooks();

    act(() => {
      result.current.setCurrentWorkspace({
        ...baseWorkspace,
        frontendPolicy: 'FORCE_SFDS2',
      });
      result.current.setCurrentUser({
        ...baseUser,
        frontendPreference: 'TWENTY',
      });
    });

    const { effectiveFrontend, isForcedByWorkspace, userPreference } =
      result.current.frontendShell;

    // Workspace forces SFDS2 but user wants TWENTY
    expect(effectiveFrontend).toBe('SFDS2');
    expect(isForcedByWorkspace).toBe(true);
    expect(userPreference).toBe('TWENTY');
  });
});
