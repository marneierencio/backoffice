import { gqlWorkspace } from '@backoffice/utils/api';
import { useCallback, useEffect, useRef, useState } from 'react';

export type RelationOption = {
  id: string;
  label: string;
  sublabel?: string;
  avatarUrl?: string;
};

export type UseRelationSearchOptions = {
  objectNameSingular: string;
  objectNamePlural: string;
  searchFields: string[];
  displayField: string;
  fields: string;
  sublabelField?: string;
  avatarField?: string;
};

export type UseRelationSearchReturn = {
  options: RelationOption[];
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
};

// Convert first character to uppercase
const toPascalCase = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1);

const DEBOUNCE_MS = 300;
const MAX_RESULTS = 20;

// Build a search query for relation records
const buildSearchQuery = (
  objectNamePlural: string,
  objectNameSingular: string,
  fields: string,
): string => {
  const singularPascal = toPascalCase(objectNameSingular);
  const pluralPascal = toPascalCase(objectNamePlural);

  return `
    query Search${pluralPascal}($filter: ${singularPascal}FilterInput, $first: Int) {
      ${objectNamePlural}(filter: $filter, first: $first) {
        edges {
          node {
            ${fields}
          }
        }
      }
    }
  `;
};

// Build a search filter for the given query across multiple fields
const buildFilter = (
  query: string,
  searchFields: string[],
): Record<string, unknown> | undefined => {
  if (!query.trim()) return undefined;

  const searchValue = `%${query.trim()}%`;

  const orClauses = searchFields.map((field) => {
    const parts = field.split('.');
    if (parts.length === 1) {
      return { [field]: { like: searchValue } };
    }

    // Nested field: build nested object
    const obj: Record<string, unknown> = {};
    let current = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      current[parts[i]] = {};
      current = current[parts[i]] as Record<string, unknown>;
    }
    current[parts[parts.length - 1]] = { like: searchValue };
    return obj;
  });

  return orClauses.length === 1 ? orClauses[0] : { or: orClauses };
};

// Extract a nested value from a record using dot-separated path
const getNestedValue = (
  record: Record<string, unknown>,
  path: string,
): unknown => {
  const parts = path.split('.');
  let current: unknown = record;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
};

export const useRelationSearch = (
  options: UseRelationSearchOptions,
): UseRelationSearchReturn => {
  const {
    objectNameSingular,
    objectNamePlural,
    searchFields,
    displayField,
    fields,
    sublabelField,
    avatarField,
  } = options;

  const [options_, setOptions] = useState<RelationOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fetchCounterRef = useRef(0);

  const query = buildSearchQuery(objectNamePlural, objectNameSingular, fields);

  const fetchOptions = useCallback(
    async (search: string) => {
      const fetchId = ++fetchCounterRef.current;
      setLoading(true);

      try {
        const filter = buildFilter(search, searchFields);

        type RelayEdge = { node: Record<string, unknown> };
        type RelayResponse = {
          edges: RelayEdge[];
        };

        const result = await gqlWorkspace<Record<string, RelayResponse>>(
          query,
          {
            filter,
            first: MAX_RESULTS,
          },
        );

        // Stale request guard
        if (fetchId !== fetchCounterRef.current) return;

        if (result.errors) {
          setOptions([]);
          return;
        }

        const edges = result.data?.[objectNamePlural]?.edges ?? [];
        const mapped: RelationOption[] = edges.map(
          (edge: RelayEdge) => {
            const node = edge.node;
            const label = String(getNestedValue(node, displayField) ?? '');
            const sublabel = sublabelField
              ? String(getNestedValue(node, sublabelField) ?? '')
              : undefined;
            const avatarUrl = avatarField
              ? (getNestedValue(node, avatarField) as string | undefined)
              : undefined;

            return {
              id: String(node.id),
              label,
              sublabel: sublabel || undefined,
              avatarUrl: avatarUrl || undefined,
            };
          },
        );

        setOptions(mapped);
      } catch {
        if (fetchId === fetchCounterRef.current) {
          setOptions([]);
        }
      } finally {
        if (fetchId === fetchCounterRef.current) {
          setLoading(false);
        }
      }
    },
    [query, objectNamePlural, searchFields, displayField, sublabelField, avatarField],
  );

  // Debounce search queries
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchOptions(searchQuery);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery, fetchOptions]);

  // Fetch initial options on mount
  useEffect(() => {
    fetchOptions('');
  }, [fetchOptions]);

  return {
    options: options_,
    loading,
    searchQuery,
    setSearchQuery,
  };
};
