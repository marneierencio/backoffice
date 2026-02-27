import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useUpdateFrontendPreference } from '@/settings/profile/hooks/useUpdateFrontendPreference';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Select } from '@/ui/input/components/Select';
import { Info } from 'twenty-ui/display';

export const FrontendPreferenceSettings = () => {
  const { t } = useLingui();
  const currentUser = useRecoilValueV2(currentUserState);
  const currentWorkspace = useRecoilValueV2(currentWorkspaceState);
  const { updateFrontendPreference, loading } = useUpdateFrontendPreference();

  if (!isDefined(currentUser)) return null;

  const workspacePolicy = currentWorkspace?.frontendPolicy;
  const isForcedByWorkspace =
    workspacePolicy === 'FORCE_TWENTY' || workspacePolicy === 'FORCE_SFDS2';

  const currentValue: 'TWENTY' | 'SFDS2' = isForcedByWorkspace
    ? workspacePolicy === 'FORCE_SFDS2'
      ? 'SFDS2'
      : 'TWENTY'
    : (currentUser.frontendPreference === 'SFDS2' ? 'SFDS2' : 'TWENTY');

  const options = [
    {
      value: 'TWENTY' as const,
      label: t`Standard (Twenty)`,
    },
    {
      value: 'SFDS2' as const,
      label: t`SFDS2 — Salesforce Design System 2`,
    },
  ];

  const handleChange = async (value: 'TWENTY' | 'SFDS2') => {
    if (isForcedByWorkspace) return;

    await updateFrontendPreference(value);

    if (value === 'SFDS2') {
      window.location.href = '/sfds2';
    }
  };

  return (
    <div>
      <Select
        label={t`Frontend Interface`}
        dropdownId="frontend-preference-select"
        value={currentValue}
        options={options}
        onChange={handleChange}
        disabled={isForcedByWorkspace || loading}
      />
      {isForcedByWorkspace && (
        <Info
          text={t`Your workspace administrator has set a fixed frontend for all members. You cannot change this setting.`}
        />
      )}
    </div>
  );
};
