import { gqlWorkspace } from '@eds/utils/api';
import { useCallback, useState } from 'react';

export type UseRecordCreateOptions = {
  objectNameSingular: string;
  objectNamePlural: string;
};

export type UseRecordCreateReturn = {
  createRecord: (input: Record<string, unknown>) => Promise<{
    success: boolean;
    recordId?: string;
    error?: string;
  }>;
  loading: boolean;
};

// Convert first character to uppercase
const toPascalCase = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1);

// Build create mutation dynamically:
//   mutation CreatePerson($input: PersonCreateInput!) {
//     createPerson(data: $input) { id }
//   }
const buildCreateMutation = (objectNameSingular: string): string => {
  const singularPascal = toPascalCase(objectNameSingular);

  return `
    mutation Create${singularPascal}($input: ${singularPascal}CreateInput!) {
      create${singularPascal}(data: $input) {
        id
      }
    }
  `;
};

export const useRecordCreate = (
  options: UseRecordCreateOptions,
): UseRecordCreateReturn => {
  const { objectNameSingular } = options;
  const [loading, setLoading] = useState(false);

  const mutation = buildCreateMutation(objectNameSingular);

  const createRecord = useCallback(
    async (
      input: Record<string, unknown>,
    ): Promise<{ success: boolean; recordId?: string; error?: string }> => {
      setLoading(true);

      try {
        const result = await gqlWorkspace<
          Record<string, { id: string }>
        >(mutation, { input });

        if (result.errors) {
          return {
            success: false,
            error: result.errors[0]?.message ?? 'Create failed',
          };
        }

        const dataKey = `create${toPascalCase(objectNameSingular)}`;
        const recordId = result.data?.[dataKey]?.id;

        return { success: true, recordId };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        };
      } finally {
        setLoading(false);
      }
    },
    [mutation, objectNameSingular],
  );

  return { createRecord, loading };
};
