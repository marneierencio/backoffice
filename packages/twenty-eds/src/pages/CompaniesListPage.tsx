import type { ColumnDefinition, SortDirection } from '@eds/components/DataTable';
import { DataTable } from '@eds/components/DataTable';
import { PageHeader } from '@eds/components/PageHeader';
import { Pagination } from '@eds/components/Pagination';
import { SearchBar } from '@eds/components/SearchBar';
import { useRecordList } from '@eds/hooks/useRecordList';
import { tokens } from '@eds/tokens';
import { useCallback, useState } from 'react';

type CompanyRecord = {
  id: string;
  name: string;
  domainName: {
    primaryLinkUrl: string;
  };
  employees: number | null;
  address: {
    addressCity: string;
  };
  createdAt: string;
};

const FIELDS = `
  id
  name
  domainName { primaryLinkUrl }
  employees
  address { addressCity }
  createdAt
`;

const columns: ColumnDefinition<CompanyRecord>[] = [
  {
    key: 'name',
    label: 'Name',
    accessor: 'name',
    sortable: true,
    width: '25%',
    renderCell: (value) => (value as string) || '—',
  },
  {
    key: 'domainName',
    label: 'Domain',
    accessor: (record) => record.domainName?.primaryLinkUrl || '—',
    width: '20%',
    renderCell: (_, record) => {
      const url = record.domainName?.primaryLinkUrl;
      if (!url) return '—';
      return (
        <a
          href={url.startsWith('http') ? url : `https://${url}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: tokens.color.textLink }}
          onClick={(e) => e.stopPropagation()}
        >
          {url}
        </a>
      );
    },
  },
  {
    key: 'employees',
    label: 'Employees',
    accessor: 'employees',
    sortable: true,
    width: '10%',
    align: 'right',
    renderCell: (value) =>
      value != null ? (value as number).toLocaleString() : '—',
  },
  {
    key: 'address',
    label: 'City',
    accessor: (record) => record.address?.addressCity || '—',
    sortable: true,
    width: '15%',
  },
  {
    key: 'createdAt',
    label: 'Created',
    accessor: 'createdAt',
    sortable: true,
    width: '15%',
    renderCell: (value) => {
      if (!value) return '—';
      return new Date(value as string).toLocaleDateString();
    },
  },
];

export const CompaniesListPage = () => {
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
  } = useRecordList<CompanyRecord>({
    objectNamePlural: 'companies',
    objectNameSingular: 'company',
    fields: FIELDS,
    searchFields: ['name'],
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
        title="Companies"
        description="Manage your company records"
        icon="🏢"
      >
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search companies…"
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
        emptyMessage="No companies found"
        emptyIcon="🏢"
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
