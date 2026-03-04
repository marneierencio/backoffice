import { Badge } from '@eds/components/Badge';
import type { ColumnDefinition, SortDirection } from '@eds/components/DataTable';
import { DataTable } from '@eds/components/DataTable';
import { PageHeader } from '@eds/components/PageHeader';
import { Pagination } from '@eds/components/Pagination';
import { SearchBar } from '@eds/components/SearchBar';
import { useRecordList } from '@eds/hooks/useRecordList';
import { tokens } from '@eds/tokens';
import { useCallback, useState } from 'react';

type OpportunityRecord = {
  id: string;
  name: string;
  amount: {
    amountMicros: number;
    currencyCode: string;
  } | null;
  stage: string;
  closeDate: string | null;
  company: {
    name: string;
  } | null;
  createdAt: string;
};

const FIELDS = `
  id
  name
  amount { amountMicros currencyCode }
  stage
  closeDate
  company { name }
  createdAt
`;

// Map stages to badge variants
const stageBadgeVariant = (stage: string): 'default' | 'success' | 'warning' | 'error' | 'info' | 'brand' => {
  const normalized = stage?.toUpperCase() ?? '';
  if (normalized.includes('WON') || normalized.includes('CLOSED_WON')) return 'success';
  if (normalized.includes('LOST') || normalized.includes('CLOSED_LOST')) return 'error';
  if (normalized.includes('NEGOTIAT') || normalized.includes('PROPOSAL')) return 'warning';
  if (normalized.includes('QUALIF')) return 'info';
  return 'default';
};

const formatCurrency = (amountMicros: number, currencyCode: string): string => {
  const amount = amountMicros / 1_000_000;
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currencyCode || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currencyCode || '$'} ${amount.toLocaleString()}`;
  }
};

const columns: ColumnDefinition<OpportunityRecord>[] = [
  {
    key: 'name',
    label: 'Name',
    accessor: 'name',
    sortable: true,
    width: '25%',
    renderCell: (value) => (value as string) || '—',
  },
  {
    key: 'amount',
    label: 'Amount',
    accessor: (record) => {
      if (!record.amount) return '—';
      return formatCurrency(record.amount.amountMicros, record.amount.currencyCode);
    },
    sortable: true,
    width: '15%',
    align: 'right',
  },
  {
    key: 'stage',
    label: 'Stage',
    accessor: 'stage',
    sortable: true,
    width: '15%',
    renderCell: (value) => {
      const stage = value as string;
      if (!stage) return '—';
      // Display in title case
      const displayLabel = stage.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      return <Badge label={displayLabel} variant={stageBadgeVariant(stage)} size="small" />;
    },
  },
  {
    key: 'closeDate',
    label: 'Close Date',
    accessor: 'closeDate',
    sortable: true,
    width: '15%',
    renderCell: (value) => {
      if (!value) return '—';
      return new Date(value as string).toLocaleDateString();
    },
  },
  {
    key: 'company',
    label: 'Company',
    accessor: (record) => record.company?.name || '—',
    sortable: true,
    width: '20%',
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

export const DealsListPage = () => {
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
  } = useRecordList<OpportunityRecord>({
    objectNamePlural: 'opportunities',
    objectNameSingular: 'opportunity',
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
        title="Deals"
        description="Manage your opportunities and deals pipeline"
        icon="💼"
      >
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search deals…"
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
        emptyMessage="No deals found"
        emptyIcon="💼"
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
