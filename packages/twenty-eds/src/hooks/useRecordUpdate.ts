import { gqlWorkspace } from '@eds/utils/api';
import { useCallback, useState } from 'react';

export type UseRecordUpdateOptions = {
  objectNameSingular: string;
  objectNamePlural: string;
};

export type UseRecordUpdateReturn = {
  updateField: (
    recordId: string,
    fieldName: string,
    value: unknown,
  ) => Promise<{ success: boolean; error?: string }>;
  loading: boolean;
};

// Convert first character to uppercase
const toPascalCase = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1);

// Build mutation dynamically:
//   mutation UpdatePerson($idToUpdate: ID!, $input: PersonUpdateInput!) {
//     updatePerson(id: $idToUpdate, data: $input) { id }
//   }
const buildUpdateMutation = (objectNameSingular: string): string => {
  const singularPascal = toPascalCase(objectNameSingular);

  return `
    mutation Update${singularPascal}($idToUpdate: ID!, $input: ${singularPascal}UpdateInput!) {
      update${singularPascal}(id: $idToUpdate, data: $input) {
        id
      }
    }
  `;
};

// Build nested input from a dot-separated path.
// Example: buildNestedInput('name.firstName', 'John')
//   → { name: { firstName: 'John' } }
// Example: buildNestedInput('city', 'Paris')
//   → { city: 'Paris' }
const buildNestedInput = (fieldPath: string, value: unknown): Record<string, unknown> => {
  const parts = fieldPath.split('.');
  if (parts.length === 1) {
    return { [fieldPath]: value };
  }

  const result: Record<string, unknown> = {};
  let current = result;
  for (let i = 0; i < parts.length - 1; i++) {
    current[parts[i]] = {};
    current = current[parts[i]] as Record<string, unknown>;
  }
  current[parts[parts.length - 1]] = value;
  return result;
};

export const useRecordUpdate = (options: UseRecordUpdateOptions): UseRecordUpdateReturn => {
  const { objectNameSingular } = options;
  const [loading, setLoading] = useState(false);

  const mutation = buildUpdateMutation(objectNameSingular);

  const updateField = useCallback(
    async (
      recordId: string,
      fieldName: string,
      value: unknown,
    ): Promise<{ success: boolean; error?: string }> => {
      setLoading(true);

      try {
        const input = buildNestedInput(fieldName, value);

        const result = await gqlWorkspace<Record<string, { id: string }>>(mutation, {
          idToUpdate: recordId,
          input,
        });

        if (result.errors) {
          return { success: false, error: result.errors[0]?.message ?? 'Update failed' };
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

  return { updateField, loading };
};
