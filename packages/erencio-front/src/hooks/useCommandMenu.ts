import type { CommandGroup, CommandItem } from '@backoffice/components/CommandMenu';
import { gqlWorkspace } from '@backoffice/utils/api';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useKeyboardShortcut } from './useKeyboardShortcut';

export type UseCommandMenuReturn = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  groups: CommandGroup[];
  activeIndex: number;
  setActiveIndex: (i: number) => void;
  selectActive: () => void;
  loading: boolean;
};

const STATIC_NAVIGATION: CommandItem[] = [
  { id: 'nav-dashboard', label: 'Dashboard', icon: 'home', type: 'navigate', onClick: () => { window.location.hash = '#/'; } },
  { id: 'nav-contacts', label: 'Contacts', icon: 'user', type: 'navigate', onClick: () => { window.location.hash = '#/contacts'; } },
  { id: 'nav-companies', label: 'Companies', icon: 'building', type: 'navigate', onClick: () => { window.location.hash = '#/companies'; } },
  { id: 'nav-deals', label: 'Deals', icon: 'currency', type: 'navigate', onClick: () => { window.location.hash = '#/deals'; } },
  { id: 'nav-calendar', label: 'Calendar', icon: 'calendar-view', type: 'navigate', onClick: () => { window.location.hash = '#/calendar'; } },
  { id: 'nav-settings', label: 'Settings', icon: 'settings', type: 'navigate', onClick: () => { window.location.hash = '#/settings'; } },
];

const STATIC_ACTIONS: CommandItem[] = [
  { id: 'act-new-contact', label: 'New Contact', icon: 'plus', type: 'create', onClick: () => { window.location.hash = '#/contacts/new'; } },
  { id: 'act-new-company', label: 'New Company', icon: 'plus', type: 'create', onClick: () => { window.location.hash = '#/companies/new'; } },
  { id: 'act-new-deal', label: 'New Deal', icon: 'plus', type: 'create', onClick: () => { window.location.hash = '#/deals/new'; } },
];

const SEARCH_PEOPLE_QUERY = `
  query SearchPeople($filter: PersonFilterInput) {
    people(filter: $filter, first: 3) {
      edges {
        node {
          id
          name { firstName lastName }
        }
      }
    }
  }
`;

const SEARCH_COMPANIES_QUERY = `
  query SearchCompanies($filter: CompanyFilterInput) {
    companies(filter: $filter, first: 3) {
      edges {
        node {
          id
          name
        }
      }
    }
  }
`;

const SEARCH_OPPORTUNITIES_QUERY = `
  query SearchOpportunities($filter: OpportunityFilterInput) {
    opportunities(filter: $filter, first: 3) {
      edges {
        node {
          id
          name
        }
      }
    }
  }
`;

export const useCommandMenu = (): UseCommandMenuReturn => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<CommandGroup[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const open = useCallback(() => {
    setIsOpen(true);
    setSearchQuery('');
    setActiveIndex(0);
    setSearchResults([]);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setSearchQuery('');
    setActiveIndex(0);
  }, []);

  const toggle = useCallback(() => {
    if (isOpen) close();
    else open();
  }, [isOpen, open, close]);

  useKeyboardShortcut({ key: 'k', ctrlKey: true }, toggle);

  const handleSearchQuery = useCallback((q: string) => {
    setSearchQuery(q);
    setActiveIndex(0);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (q.length < 3) {
      setSearchResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const likeFilter = `%${q}%`;
        const [peopleRes, companiesRes, oppsRes] = await Promise.all([
          gqlWorkspace<{ people: { edges: { node: { id: string; name: { firstName: string; lastName: string } } }[] } }>(
            SEARCH_PEOPLE_QUERY,
            { filter: { or: [{ name: { firstName: { like: likeFilter } } }, { name: { lastName: { like: likeFilter } } }] } },
          ),
          gqlWorkspace<{ companies: { edges: { node: { id: string; name: string } }[] } }>(
            SEARCH_COMPANIES_QUERY,
            { filter: { name: { like: likeFilter } } },
          ),
          gqlWorkspace<{ opportunities: { edges: { node: { id: string; name: string } }[] } }>(
            SEARCH_OPPORTUNITIES_QUERY,
            { filter: { name: { like: likeFilter } } },
          ),
        ]);

        const groups: CommandGroup[] = [];

        const people = peopleRes.data?.people?.edges ?? [];
        if (people.length > 0) {
          groups.push({
            id: 'search-people',
            label: 'People',
            items: people.map(({ node }) => ({
              id: `person-${node.id}`,
              label: `${node.name.firstName} ${node.name.lastName}`.trim(),
              icon: 'user' as const,
              type: 'record' as const,
              onClick: () => { window.location.hash = `#/contacts/${node.id}`; },
            })),
          });
        }

        const companies = companiesRes.data?.companies?.edges ?? [];
        if (companies.length > 0) {
          groups.push({
            id: 'search-companies',
            label: 'Companies',
            items: companies.map(({ node }) => ({
              id: `company-${node.id}`,
              label: node.name,
              icon: 'building' as const,
              type: 'record' as const,
              onClick: () => { window.location.hash = `#/companies/${node.id}`; },
            })),
          });
        }

        const opps = oppsRes.data?.opportunities?.edges ?? [];
        if (opps.length > 0) {
          groups.push({
            id: 'search-deals',
            label: 'Deals',
            items: opps.map(({ node }) => ({
              id: `opp-${node.id}`,
              label: node.name,
              icon: 'currency' as const,
              type: 'record' as const,
              onClick: () => { window.location.hash = `#/deals/${node.id}`; },
            })),
          });
        }

        setSearchResults(groups);
      } catch {
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  const groups = useMemo<CommandGroup[]>(() => {
    const staticGroups: CommandGroup[] = [];
    const lowerQ = searchQuery.toLowerCase();

    const filteredNav = STATIC_NAVIGATION.filter((item) =>
      item.label.toLowerCase().includes(lowerQ),
    );
    if (filteredNav.length > 0) {
      staticGroups.push({ id: 'navigation', label: 'Navigation', items: filteredNav });
    }

    const filteredActions = STATIC_ACTIONS.filter((item) =>
      item.label.toLowerCase().includes(lowerQ),
    );
    if (filteredActions.length > 0) {
      staticGroups.push({ id: 'actions', label: 'Actions', items: filteredActions });
    }

    return [...staticGroups, ...searchResults];
  }, [searchQuery, searchResults]);

  const selectActive = useCallback(() => {
    let idx = 0;
    for (const group of groups) {
      for (const item of group.items) {
        if (idx === activeIndex) {
          item.onClick?.();
          close();
          return;
        }
        idx++;
      }
    }
  }, [groups, activeIndex, close]);

  return {
    isOpen,
    open,
    close,
    toggle,
    searchQuery,
    setSearchQuery: handleSearchQuery,
    groups,
    activeIndex,
    setActiveIndex,
    selectActive,
    loading,
  };
};
