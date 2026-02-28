import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useUpdateWorkspaceFrontendPolicy, type FrontendPolicy } from '@/settings/workspace/hooks/useUpdateWorkspaceFrontendPolicy';
import { Select } from '@/ui/input/components/Select';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Info } from 'twenty-ui/display';

export const WorkspaceFrontendPolicySettings = () => {
  const { t } = useLingui();
  const currentWorkspace = useRecoilValueV2(currentWorkspaceState);
  const { updateWorkspaceFrontendPolicy, loading } =
    useUpdateWorkspaceFrontendPolicy();

  if (!isDefined(currentWorkspace)) return null;

  const currentPolicy: FrontendPolicy =
    (currentWorkspace.frontendPolicy as FrontendPolicy | undefined) ??
    'ALLOW_USER_CHOICE';

  const options = [
    {
      value: 'ALLOW_USER_CHOICE' as const,
      label: t`Allow users to choose their interface`,
    },
    {
      value: 'FORCE_TWENTY' as const,
      label: t`Force Standard interface (Twenty) for all members`,
    },
    {
      value: 'FORCE_SFDS2' as const,
      label: t`Force SFDS2 interface for all members`,
    },
  ];

  return (
    <div>
      <Select
        label={t`Frontend Interface Policy`}
        dropdownId="workspace-frontend-policy-select"
        value={currentPolicy}
        options={options}
        onChange={(value) => updateWorkspaceFrontendPolicy(value as FrontendPolicy)}
        disabled={loading}
      />
      <Info
        text={t`When set to Force, workspace members cannot override this setting from their personal preferences.`}
      />
    </div>
  );
};
