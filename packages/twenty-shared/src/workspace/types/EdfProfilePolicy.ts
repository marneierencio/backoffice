export enum EdfProfilePolicy {
  // Users can pick their own EDF profile, overriding the workspace default
  ALLOW_USER_CHOICE = 'ALLOW_USER_CHOICE',
  // All users in the workspace must use the workspace-defined EDF profile
  FORCE_WORKSPACE = 'FORCE_WORKSPACE',
}
