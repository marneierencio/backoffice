import { useMutation } from '@apollo/client';

import { t } from '@lingui/core/macro';

import { UPDATE_USER_FRONTEND_PREFERENCE } from '@/settings/profile/graphql/mutations/updateUserFrontendPreference';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

export type FrontendPreference = 'TWENTY' | 'SFDS2';

export const useUpdateFrontendPreference = () => {
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();

  const [updateFrontendPreference, { loading }] = useMutation<
    { updateUserFrontendPreference: boolean },
    { frontendPreference: FrontendPreference }
  >(UPDATE_USER_FRONTEND_PREFERENCE);

  const handleUpdate = async (preference: FrontendPreference) => {
    try {
      await updateFrontendPreference({
        variables: { frontendPreference: preference },
      });

      enqueueSuccessSnackBar({ message: t`Frontend preference updated.` });
    } catch {
      enqueueErrorSnackBar({ message: t`Failed to update frontend preference. Please try again.` });
    }
  };

  return {
    updateFrontendPreference: handleUpdate,
    loading,
  };
};
