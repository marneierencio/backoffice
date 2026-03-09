import { gql } from '@apollo/client';

export const UPDATE_USER_FRONTEND_PREFERENCE = gql`
  mutation UpdateUserFrontendPreference($frontendPreference: FrontendPreference!) {
    updateUserFrontendPreference(frontendPreference: $frontendPreference)
  }
`;
