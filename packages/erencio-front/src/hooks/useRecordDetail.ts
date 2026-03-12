import { gqlWorkspace } from '@backoffice/utils/api';
import { useCallback, useEffect, useRef, useState } from 'react';

export type UseRecordDetailOptions = {
  objectNameSingular: string;
  objectNamePlural: string;
  recordId: string;
  fields: string;
};

export type UseRecordDetailReturn<TRecord> = {
  record: TRecord | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

// Convert first character to uppercase
const toPascalCase = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1);

// Twenty's workspace GraphQL singular endpoint uses a filter-based approach:
//   query FindOnePerson($filter: PersonFilterInput!) {
//     person(filter: { id: { eq: $recordId } }) { ...fields }
//   }
// The singular endpoint returns the object directly (no edges/relay wrapper).
const buildFindOneQuery = (
  objectNameSingular: string,
  fields: string,
): string => {
  const singularPascal = toPascalCase(objectNameSingular);

  return `
    query FindOne${singularPascal}($filter: ${singularPascal}FilterInput!) {
      ${objectNameSingular}(filter: $filter) {
        ${fields}
      }
    }
  `;
};

export const useRecordDetail = <TRecord extends { id: string }>(
  options: UseRecordDetailOptions,
): UseRecordDetailReturn<TRecord> => {
  const { objectNameSingular, fields, recordId } = options;

  const [record, setRecord] = useState<TRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCounterRef = useRef(0);
  const query = buildFindOneQuery(objectNameSingular, fields);

  const fetchRecord = useCallback(async () => {
    if (!recordId) {
      setRecord(null);
      setLoading(false);
      return;
    }

    const fetchId = ++fetchCounterRef.current;
    setLoading(true);
    setError(null);

    try {
      const variables = {
        filter: { id: { eq: recordId } },
      };

      const result = await gqlWorkspace<Record<string, TRecord>>(query, variables);

      // Stale request guard
      if (fetchId !== fetchCounterRef.current) return;

      if (result.errors) {
        setError(result.errors[0]?.message ?? 'Failed to load record');
        setRecord(null);
        return;
      }

      const data = result.data?.[objectNameSingular] ?? null;

      if (!data) {
        setError('Record not found');
        setRecord(null);
        return;
      }

      setRecord(data);
    } catch (err) {
      if (fetchId !== fetchCounterRef.current) return;
      setError(err instanceof Error ? err.message : 'Unknown error');
      setRecord(null);
    } finally {
      if (fetchId === fetchCounterRef.current) {
        setLoading(false);
      }
    }
  }, [query, objectNameSingular, recordId]);

  useEffect(() => {
    fetchRecord();
  }, [fetchRecord]);

  const refresh = useCallback(() => {
    fetchRecord();
  }, [fetchRecord]);

  return { record, loading, error, refresh };
};
