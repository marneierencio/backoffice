import { gqlWorkspace } from '@eds/utils/api';
import { useCallback, useEffect, useRef, useState } from 'react';

// Twenty's workspace GraphQL uses relay-style cursor pagination.
// The API shape: objectNamePlural(filter, orderBy, first, after) {
//   edges { node { ...fields } cursor }
//   pageInfo { hasNextPage hasPreviousPage startCursor endCursor }
//   totalCount
// }

export type UseRecordListOptions = {
  objectNamePlural: string;
  fields: string;
  pageSize?: number;
  // Optional initial sort
  initialSortColumn?: string;
  initialSortDirection?: 'asc' | 'desc';
};

export type UseRecordListReturn<TRecord> = {
  data: TRecord[];
  totalCount: number;
  loading: boolean;
  error: string | null;

  // Pagination
  currentPage: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;

  // Sorting
  sortColumn: string | null;
  sortDirection: 'asc' | 'desc' | null;
  setSort: (column: string | null, direction: 'asc' | 'desc' | null) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Refresh
  refresh: () => void;
};

type PageCursorMap = Record<number, string | null>;

type RelayResponse<TRecord> = {
  edges: Array<{ node: TRecord; cursor: string }>;
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string | null;
    endCursor: string | null;
  };
  totalCount: number;
};

// Build a dynamic GraphQL query for fetching records
const buildQuery = (objectNamePlural: string, fields: string): string => {
  // Capitalize first letter for the type name in filter/orderBy input types
  const capitalized = objectNamePlural.charAt(0).toUpperCase() + objectNamePlural.slice(1);
  // Most Twenty objects use singular for filter type: PersonFilterInput, CompanyFilterInput, etc.
  // But the pattern might vary. Use a generic approach with no explicit types for now.

  return `
    query FindMany${capitalized}(
      $filter: ${capitalized}FilterInput
      $orderBy: [${capitalized}OrderByInput!]
      $first: Int
      $after: String
      $last: Int
      $before: String
    ) {
      ${objectNamePlural}(
        filter: $filter
        orderBy: $orderBy
        first: $first
        after: $after
        last: $last
        before: $before
      ) {
        edges {
          node {
            ${fields}
          }
          cursor
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
        totalCount
      }
    }
  `;
};

// Build filter for search query (basic text search across common fields)
const buildSearchFilter = (
  searchQuery: string,
): Record<string, unknown> | undefined => {
  if (!searchQuery.trim()) return undefined;

  const searchValue = `%${searchQuery.trim()}%`;

  // Twenty's filter system uses nested field filters
  // We build an OR filter that checks common text fields
  // This is a simplified approach — specific pages can override via custom filters
  return {
    or: [
      { name: { firstName: { like: searchValue } } },
      { name: { lastName: { like: searchValue } } },
      { name: { like: searchValue } },
    ],
  };
};

// Build orderBy from sort column and direction
const buildOrderBy = (
  sortColumn: string | null,
  sortDirection: 'asc' | 'desc' | null,
): Array<Record<string, string>> | undefined => {
  if (!sortColumn || !sortDirection) return undefined;

  // Handle nested fields like "name.firstName" → { name: { firstName: "AscNullsLast" } }
  const directionValue = sortDirection === 'asc' ? 'AscNullsLast' : 'DescNullsLast';

  const parts = sortColumn.split('.');
  if (parts.length === 1) {
    return [{ [sortColumn]: directionValue }];
  }

  // Build nested object for compound fields
  let obj: Record<string, unknown> = {};
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    current[parts[i]] = {};
    current = current[parts[i]] as Record<string, unknown>;
  }
  current[parts[parts.length - 1]] = directionValue;

  return [obj as Record<string, string>];
};

export const useRecordList = <TRecord extends { id: string }>(
  options: UseRecordListOptions,
): UseRecordListReturn<TRecord> => {
  const {
    objectNamePlural,
    fields,
    pageSize: initialPageSize = 25,
    initialSortColumn = null,
    initialSortDirection = null,
  } = options;

  const [data, setData] = useState<TRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [sortColumn, setSortColumn] = useState<string | null>(initialSortColumn);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(initialSortDirection);
  const [searchQuery, setSearchQuery] = useState('');

  // Track cursors per page for back-navigation
  const cursorMapRef = useRef<PageCursorMap>({ 1: null });
  const fetchCounterRef = useRef(0);

  const query = buildQuery(objectNamePlural, fields);

  const fetchData = useCallback(async () => {
    const fetchId = ++fetchCounterRef.current;
    setLoading(true);
    setError(null);

    try {
      const variables: Record<string, unknown> = {
        first: pageSize,
        after: cursorMapRef.current[currentPage] ?? undefined,
        filter: buildSearchFilter(searchQuery),
        orderBy: buildOrderBy(sortColumn, sortDirection),
      };

      const result = await gqlWorkspace<Record<string, RelayResponse<TRecord>>>(
        query,
        variables,
      );

      // Stale request check
      if (fetchId !== fetchCounterRef.current) return;

      if (result.errors) {
        setError(result.errors[0]?.message ?? 'Failed to load records');
        setData([]);
        setTotalCount(0);
        return;
      }

      const responseData = result.data?.[objectNamePlural];

      if (!responseData) {
        setError(`No data returned for ${objectNamePlural}`);
        setData([]);
        setTotalCount(0);
        return;
      }

      const records = responseData.edges.map((edge) => edge.node);
      setData(records);
      setTotalCount(responseData.totalCount);

      // Store cursor for next page
      if (responseData.pageInfo.endCursor) {
        cursorMapRef.current[currentPage + 1] = responseData.pageInfo.endCursor;
      }
    } catch (err) {
      if (fetchId !== fetchCounterRef.current) return;
      setError(err instanceof Error ? err.message : 'Unknown error');
      setData([]);
      setTotalCount(0);
    } finally {
      if (fetchId === fetchCounterRef.current) {
        setLoading(false);
      }
    }
  }, [query, objectNamePlural, currentPage, pageSize, sortColumn, sortDirection, searchQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const setPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleSetPageSize = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
    cursorMapRef.current = { 1: null };
  }, []);

  const setSort = useCallback((column: string | null, direction: 'asc' | 'desc' | null) => {
    setSortColumn(column);
    setSortDirection(direction);
    setCurrentPage(1);
    cursorMapRef.current = { 1: null };
  }, []);

  const handleSetSearchQuery = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    cursorMapRef.current = { 1: null };
  }, []);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    totalCount,
    loading,
    error,
    currentPage,
    pageSize,
    setPage,
    setPageSize: handleSetPageSize,
    sortColumn,
    sortDirection,
    setSort,
    searchQuery,
    setSearchQuery: handleSetSearchQuery,
    refresh,
  };
};
