import type { ColumnDefinition, SortDirection } from '@eds/components/DataTable';
import { DataTable } from '@eds/components/DataTable';
import { PageHeader } from '@eds/components/PageHeader';
import { Pagination } from '@eds/components/Pagination';
import { SearchBar } from '@eds/components/SearchBar';
import { useRecordList } from '@eds/hooks/useRecordList';
import { tokens } from '@eds/tokens';
import { useCallback, useState } from 'react';

type PersonRecord = {
  id: string;
  name: {
    firstName: string;
    lastName: string;
  };
  emails: {
    primaryEmail: string;
  };
  phones: {
    primaryPhoneNumber: string;
  };
  company: {
    name: string;
  } | null;
  city: string;
  createdAt: string;
};

const FIELDS = `
  id
  name { firstName lastName }
  emails { primaryEmail }
  phones { primaryPhoneNumber }
  company { name }
  city
  createdAt
`;

const columns: ColumnDefinition<PersonRecord>[] = [
  {
    key: 'name',
    label: 'Name',
    accessor: (record) => `${record.name.firstName ?? ''} ${record.name.lastName ?? ''}`.trim() || '—',
    sortable: true,
    width: '25%',
  },
  {
    key: 'emails',
    label: 'Email',
    accessor: (record) => record.emails?.primaryEmail || '—',
    sortable: true,
    width: '20%',
    renderCell: (_, record) => {
      const email = record.emails?.primaryEmail;
      if (!email) return '—';
      return (
        <a
          href={`mailto:${email}`}
          style={{ color: tokens.color.textLink }}
          onClick={(e) => e.stopPropagation()}
        >
          {email}
        </a>
      );
    },
  },
  {
    key: 'phones',
    label: 'Phone',
    accessor: (record) => record.phones?.primaryPhoneNumber || '—',
    width: '15%',
  },
  {
    key: 'company',
    label: 'Company',
    accessor: (record) => record.company?.name || '—',
    sortable: true,
    width: '20%',
  },
  {
    key: 'city',
    label: 'City',
    accessor: 'city',
    sortable: true,
    width: '10%',
    renderCell: (value) => (value as string) || '—',
  },
  {
    key: 'createdAt',
    label: 'Created',
    accessor: 'createdAt',
    sortable: true,
    width: '10%',
    renderCell: (value) => {
      if (!value) return '—';
      return new Date(value as string).toLocaleDateString();
    },
  },
];

export const ContactsListPage = () => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const {
    data,
    totalCount,
    loading,
    error,
    currentPage,
    pageSize,
    setPage,
    setPageSize,
    sortColumn,
    sortDirection,
    setSort,
    searchQuery,
    setSearchQuery,
  } = useRecordList<PersonRecord>({
    objectNamePlural: 'people',
    objectNameSingular: 'person',
    fields: FIELDS,
    searchFields: ['name.firstName', 'name.lastName'],
    initialSortColumn: 'createdAt',
    initialSortDirection: 'desc',
  });

  const handleSort = useCallback(
    (column: string, direction: SortDirection) => {
      setSort(column, direction);
    },
    [setSort],
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.spacingMedium }}>
      <PageHeader
        title="Contacts"
        description="Manage your contacts and people records"
        icon="👥"
      >
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search contacts…"
        />
      </PageHeader>

      {error && (
        <div
          style={{
            padding: tokens.spacing.spacingSmall,
            backgroundColor: tokens.color.errorLight,
            color: tokens.color.error,
            borderRadius: tokens.radius.radiusMedium,
            fontSize: tokens.typography.fontSizeSmall,
          }}
          role="alert"
        >
          {error}
        </div>
      )}

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        sortColumn={sortColumn ?? undefined}
        sortDirection={sortDirection}
        onSort={handleSort}
        bordered
        emptyMessage="No contacts found"
        emptyIcon="👥"
      />

      <Pagination
        currentPage={currentPage}
        totalCount={totalCount}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
};
