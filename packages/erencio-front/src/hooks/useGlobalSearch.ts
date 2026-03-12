import { gqlWorkspace } from '@backoffice/utils/api';
import { useCallback, useRef, useState } from 'react';

export type SearchResult = {
  id: string;
  label: string;
  type: 'person' | 'company' | 'opportunity';
  icon: string;
  href: string;
};

export type UseGlobalSearchReturn = {
  query: string;
  setQuery: (q: string) => void;
  results: SearchResult[];
  loading: boolean;
  hasResults: boolean;
};

const SEARCH_QUERY = `
  query GlobalSearch($peopleFilt: PersonFilterInput, $compFilt: CompanyFilterInput, $oppFilt: OpportunityFilterInput) {
    people(filter: $peopleFilt, first: 3) {
      edges { node { id name { firstName lastName } } }
    }
    companies(filter: $compFilt, first: 3) {
      edges { node { id name } }
    }
    opportunities(filter: $oppFilt, first: 3) {
      edges { node { id name } }
    }
  }
`;

type SearchData = {
  people: { edges: { node: { id: string; name: { firstName: string; lastName: string } } }[] };
  companies: { edges: { node: { id: string; name: string } }[] };
  opportunities: { edges: { node: { id: string; name: string } }[] };
};

export const useGlobalSearch = (): UseGlobalSearchReturn => {
  const [query, setQueryState] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setQuery = useCallback((q: string) => {
    setQueryState(q);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (q.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const likeFilter = `%${q}%`;
        const res = await gqlWorkspace<SearchData>(SEARCH_QUERY, {
          peopleFilt: { or: [{ name: { firstName: { like: likeFilter } } }, { name: { lastName: { like: likeFilter } } }] },
          compFilt: { name: { like: likeFilter } },
          oppFilt: { name: { like: likeFilter } },
        });

        const items: SearchResult[] = [];

        for (const edge of res.data?.people?.edges ?? []) {
          items.push({
            id: edge.node.id,
            label: `${edge.node.name.firstName} ${edge.node.name.lastName}`.trim(),
            type: 'person',
            icon: 'user',
            href: `#/contacts/${edge.node.id}`,
          });
        }

        for (const edge of res.data?.companies?.edges ?? []) {
          items.push({
            id: edge.node.id,
            label: edge.node.name,
            type: 'company',
            icon: 'building',
            href: `#/companies/${edge.node.id}`,
          });
        }

        for (const edge of res.data?.opportunities?.edges ?? []) {
          items.push({
            id: edge.node.id,
            label: edge.node.name,
            type: 'opportunity',
            icon: 'currency',
            href: `#/deals/${edge.node.id}`,
          });
        }

        setResults(items);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  return {
    query,
    setQuery,
    results,
    loading,
    hasResults: results.length > 0,
  };
};
