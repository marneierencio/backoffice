import { gqlWorkspace } from '@eds/utils/api';
import { useCallback, useState } from 'react';

export type UseRecordDeleteOptions = {
  objectNameSingular: string;
  objectNamePlural: string;
};

export type UseRecordDeleteReturn = {
  deleteRecord: (recordId: string) => Promise<{
    success: boolean;
    error?: string;
  }>;
  loading: boolean;
};

// Convert first character to uppercase
const toPascalCase = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1);

// Build delete mutation dynamically:
//   mutation DeletePerson($id: ID!) {
//     deletePerson(id: $id) { id }
//   }
const buildDeleteMutation = (objectNameSingular: string): string => {
  const singularPascal = toPascalCase(objectNameSingular);

  return `
    mutation Delete${singularPascal}($id: ID!) {
      delete${singularPascal}(id: $id) {
        id
      }
    }
  `;
};

export const useRecordDelete = (
  options: UseRecordDeleteOptions,
): UseRecordDeleteReturn => {
  const { objectNameSingular } = options;
  const [loading, setLoading] = useState(false);

  const mutation = buildDeleteMutation(objectNameSingular);

  const deleteRecord = useCallback(
    async (
      recordId: string,
    ): Promise<{ success: boolean; error?: string }> => {
      setLoading(true);

      try {
        const result = await gqlWorkspace<Record<string, { id: string }>>(
          mutation,
          { id: recordId },
        );

        if (result.errors) {
          return {
            success: false,
            error: result.errors[0]?.message ?? 'Delete failed',
          };
        }

        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        };
      } finally {
        setLoading(false);
      }
    },
    [mutation],
  );

  return { deleteRecord, loading };
};
