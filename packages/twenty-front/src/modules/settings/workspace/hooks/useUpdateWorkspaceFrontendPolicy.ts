import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { t } from '@lingui/core/macro';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';

export type FrontendPolicy = 'ALLOW_USER_CHOICE' | 'FORCE_TWENTY' | 'FORCE_SFDS2';

const UPDATE_WORKSPACE_FRONTEND_POLICY = gql`
  mutation UpdateWorkspaceFrontendPolicy($data: UpdateWorkspaceInput!) {
    updateWorkspace(data: $data) {
      id
      frontendPolicy
    }
  }
`;

export const useUpdateWorkspaceFrontendPolicy = () => {
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const currentWorkspace = useRecoilValueV2(currentWorkspaceState);

  const [updateWorkspace, { loading }] = useMutation<
    { updateWorkspace: { id: string; frontendPolicy: FrontendPolicy } },
    { data: { frontendPolicy: FrontendPolicy } }
  >(UPDATE_WORKSPACE_FRONTEND_POLICY);

  const handleUpdate = async (policy: FrontendPolicy) => {
    if (!currentWorkspace) return;

    try {
      await updateWorkspace({
        variables: { data: { frontendPolicy: policy } },
      });

      enqueueSuccessSnackBar({ message: t`Frontend policy updated.` });
    } catch {
      enqueueErrorSnackBar({ message: t`Failed to update frontend policy. Please try again.` });
    }
  };

  return {
    updateWorkspaceFrontendPolicy: handleUpdate,
    loading,
  };
};
