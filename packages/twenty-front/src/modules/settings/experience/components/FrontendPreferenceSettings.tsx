import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useUpdateFrontendPreference } from '@/settings/profile/hooks/useUpdateFrontendPreference';
import { Select } from '@/ui/input/components/Select';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Info } from 'twenty-ui/display';

export const FrontendPreferenceSettings = () => {
  const { t } = useLingui();
  const currentUser = useRecoilValueV2(currentUserState);
  const currentWorkspace = useRecoilValueV2(currentWorkspaceState);
  const { updateFrontendPreference, loading } = useUpdateFrontendPreference();

  if (!isDefined(currentUser)) return null;

  const workspacePolicy = currentWorkspace?.frontendPolicy;
  const isForcedByWorkspace =
    workspacePolicy === 'FORCE_TWENTY' || workspacePolicy === 'FORCE_EDS';

  const currentValue: 'TWENTY' | 'EDS' = isForcedByWorkspace
    ? workspacePolicy === 'FORCE_EDS'
      ? 'EDS'
      : 'TWENTY'
    : (currentUser.frontendPreference === 'EDS' ? 'EDS' : 'TWENTY');

  const options = [
    {
      value: 'TWENTY' as const,
      label: t`Standard (Twenty)`,
    },
    {
      value: 'EDS' as const,
      label: t`EDS — Erencio Design System`,
    },
  ];

  const handleChange = async (value: 'TWENTY' | 'EDS') => {
    if (isForcedByWorkspace) return;

    await updateFrontendPreference(value);

    if (value === 'EDS') {
      window.location.href = '/eds';
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
