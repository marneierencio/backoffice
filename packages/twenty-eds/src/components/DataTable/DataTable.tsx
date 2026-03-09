import { Checkbox } from '@eds/components/Checkbox';
import { EmptyState } from '@eds/components/EmptyState';
import { Icon } from '@eds/components/Icon';
import { Spinner } from '@eds/components/Spinner';
import { tokens } from '@eds/tokens';
import React, { useCallback, useMemo } from 'react';

// --- Types ---

export type SortDirection = 'asc' | 'desc' | null;

export type ColumnDefinition<TRecord> = {
  key: string;
  label: string;
  accessor: keyof TRecord | ((record: TRecord) => React.ReactNode);
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  renderCell?: (value: unknown, record: TRecord) => React.ReactNode;
};

export type DataTableProps<TRecord extends { id: string }> = {
  columns: ColumnDefinition<TRecord>[];
  data: TRecord[];
  loading?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;

  // Selection
  selectable?: boolean;
  selectedIds?: Set<string>;
  onSelectionChange?: (selected: Set<string>) => void;

  // Sorting
  sortColumn?: string;
  sortDirection?: SortDirection;
  onSort?: (column: string, direction: SortDirection) => void;

  // Row click
  onRowClick?: (record: TRecord) => void;

  // Style variants
  striped?: boolean;
  bordered?: boolean;
};

// --- Helpers ---

const getCellValue = <TRecord,>(record: TRecord, accessor: ColumnDefinition<TRecord>['accessor']): unknown => {
  if (typeof accessor === 'function') {
    return accessor(record);
  }
  return record[accessor];
};

const nextSortDirection = (current: SortDirection): SortDirection => {
  if (current === null) return 'asc';
  if (current === 'asc') return 'desc';
  return null;
};

const ariaSortValue = (
  columnKey: string,
  sortColumn: string | undefined,
  sortDirection: SortDirection,
): 'ascending' | 'descending' | 'none' | undefined => {
  if (columnKey !== sortColumn) return 'none';
  if (sortDirection === 'asc') return 'ascending';
  if (sortDirection === 'desc') return 'descending';
  return 'none';
};

// --- Styles ---

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'separate',
  borderSpacing: 0,
  fontFamily: tokens.typography.fontFamilyBase,
  fontSize: tokens.typography.fontSizeMedium,
  color: tokens.color.textDefault,
};

const tableWithBorderStyle: React.CSSProperties = {
  border: `1px solid ${tokens.color.borderDefault}`,
  borderRadius: tokens.radius.radiusLarge,
  overflow: 'hidden',
};

const headerRowStyle: React.CSSProperties = {
  backgroundColor: tokens.color.neutral1,
};

const headerCellBaseStyle: React.CSSProperties = {
  padding: `${tokens.spacing.spacingXSmall} ${tokens.spacing.spacingMedium}`,
  fontSize: tokens.typography.fontSizeSmall,
  fontWeight: tokens.typography.fontWeightBold,
  color: tokens.color.textLabel,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  lineHeight: tokens.typography.lineHeightHeading,
  whiteSpace: 'nowrap',
  borderBottom: `2px solid ${tokens.color.neutral3}`,
  textAlign: 'left',
  verticalAlign: 'middle',
  userSelect: 'none',
};

const bodyCellBaseStyle: React.CSSProperties = {
  padding: `${tokens.spacing.spacingXSmall} ${tokens.spacing.spacingMedium}`,
  fontSize: tokens.typography.fontSizeMedium,
  color: tokens.color.textDefault,
  verticalAlign: 'middle',
  borderBottom: `1px solid ${tokens.color.neutral2}`,
  lineHeight: tokens.typography.lineHeightText,
};

const sortButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: tokens.spacing.spacingXXXSmall,
  background: 'none',
  border: 'none',
  padding: 0,
  margin: 0,
  cursor: 'pointer',
  font: 'inherit',
  color: 'inherit',
  fontSize: 'inherit',
  fontWeight: 'inherit',
  textTransform: 'inherit' as React.CSSProperties['textTransform'],
  letterSpacing: 'inherit',
};

const checkboxCellWidth = '40px';

// --- Component ---

export const DataTable = <TRecord extends { id: string }>({
  columns,
  data,
  loading = false,
  emptyMessage = 'No records found',
  emptyIcon,
  selectable = false,
  selectedIds,
  onSelectionChange,
  sortColumn,
  sortDirection,
  onSort,
  onRowClick,
  striped = false,
  bordered = false,
}: DataTableProps<TRecord>) => {
  const totalColumns = columns.length + (selectable ? 1 : 0);

  // Selection helpers
  const allSelected = useMemo(
    () => data.length > 0 && data.every((row) => selectedIds?.has(row.id)),
    [data, selectedIds],
  );

  const someSelected = useMemo(
    () => data.some((row) => selectedIds?.has(row.id)) && !allSelected,
    [data, selectedIds, allSelected],
  );

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (!onSelectionChange) return;
      if (checked) {
        const newSet = new Set(selectedIds);
        data.forEach((row) => newSet.add(row.id));
        onSelectionChange(newSet);
      } else {
        const newSet = new Set(selectedIds);
        data.forEach((row) => newSet.delete(row.id));
        onSelectionChange(newSet);
      }
    },
    [data, selectedIds, onSelectionChange],
  );

  const handleSelectRow = useCallback(
    (rowId: string, checked: boolean) => {
      if (!onSelectionChange) return;
      const newSet = new Set(selectedIds);
      if (checked) {
        newSet.add(rowId);
      } else {
        newSet.delete(rowId);
      }
      onSelectionChange(newSet);
    },
    [selectedIds, onSelectionChange],
  );

  const handleSort = useCallback(
    (columnKey: string) => {
      if (!onSort) return;
      const direction = columnKey === sortColumn
        ? nextSortDirection(sortDirection ?? null)
        : 'asc';
      onSort(columnKey, direction);
    },
    [onSort, sortColumn, sortDirection],
  );

  const wrapperStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    overflowX: 'auto',
  };

  const mergedTableStyle: React.CSSProperties = {
    ...tableStyle,
    ...(bordered ? tableWithBorderStyle : {}),
  };

  return (
    <div style={wrapperStyle}>
      <table
        style={mergedTableStyle}
        role="grid"
        aria-busy={loading}
        aria-rowcount={data.length}
      >
        {/* Header */}
        <thead>
          <tr style={headerRowStyle}>
            {selectable && (
              <th
                style={{ ...headerCellBaseStyle, width: checkboxCellWidth, textAlign: 'center' }}
                scope="col"
              >
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={handleSelectAll}
                  aria-label="Select all rows"
                />
              </th>
            )}
            {columns.map((col) => {
              const isCurrentSort = sortColumn === col.key;
              const thStyle: React.CSSProperties = {
                ...headerCellBaseStyle,
                width: col.width,
                textAlign: col.align ?? 'left',
              };

              return (
                <th
                  key={col.key}
                  style={thStyle}
                  scope="col"
                  aria-sort={col.sortable ? ariaSortValue(col.key, sortColumn, sortDirection ?? null) : undefined}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      style={sortButtonStyle}
                      onClick={() => handleSort(col.key)}
                      aria-label={`Sort by ${col.label}`}
                    >
                      {col.label}
                      <SortIcon
                        active={isCurrentSort}
                        direction={isCurrentSort ? (sortDirection ?? null) : null}
                      />
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              );
            })}
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {data.length === 0 && !loading && (
            <tr>
              <td colSpan={totalColumns} style={{ padding: 0 }}>
                <EmptyState
                  title={emptyMessage}
                  icon={emptyIcon ?? '📋'}
                />
              </td>
            </tr>
          )}
          {data.map((record, rowIndex) => {
            const isSelected = selectedIds?.has(record.id) ?? false;

            const rowStyle: React.CSSProperties = {
              backgroundColor: isSelected
                ? tokens.color.brandPrimaryLight
                : striped && rowIndex % 2 === 1
                  ? tokens.color.neutral1
                  : 'transparent',
              cursor: onRowClick ? 'pointer' : 'default',
              transition: `background-color ${tokens.duration.durationQuickly}`,
            };

            return (
              <tr
                key={record.id}
                style={rowStyle}
                onClick={() => onRowClick?.(record)}
                aria-selected={selectable ? isSelected : undefined}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = tokens.color.brandPrimaryLight;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    (e.currentTarget as HTMLElement).style.backgroundColor =
                      striped && rowIndex % 2 === 1 ? tokens.color.neutral1 : 'transparent';
                  }
                }}
              >
                {selectable && (
                  <td
                    style={{ ...bodyCellBaseStyle, width: checkboxCellWidth, textAlign: 'center' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Checkbox
                      checked={isSelected}
                      onChange={(checked) => handleSelectRow(record.id, checked)}
                      aria-label={`Select row ${rowIndex + 1}`}
                    />
                  </td>
                )}
                {columns.map((col) => {
                  const rawValue = getCellValue(record, col.accessor);
                  const cellContent = col.renderCell
                    ? col.renderCell(rawValue, record)
                    : (rawValue as React.ReactNode);

                  const cellStyle: React.CSSProperties = {
                    ...bodyCellBaseStyle,
                    textAlign: col.align ?? 'left',
                    width: col.width,
                  };

                  return (
                    <td key={col.key} style={cellStyle}>
                      {cellContent}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Loading overlay */}
      {loading && <Spinner size="medium" label="Loading records" />}
    </div>
  );
};

// --- Sort indicator sub-component ---

type SortIconProps = {
  active: boolean;
  direction: SortDirection;
};

const SortIcon = ({ active, direction }: SortIconProps) => {
  const color = active ? tokens.color.brandPrimary : tokens.color.neutral4;

  if (!active || direction === null) {
    return (
      <span style={{ display: 'inline-flex', opacity: 0.4, transition: `opacity ${tokens.duration.durationQuickly}` }}>
        <Icon name="chevron-down" size={12} color={color} />
      </span>
    );
  }

  return (
    <Icon
      name={direction === 'asc' ? 'sort-ascending' : 'sort-descending'}
      size={12}
      color={color}
    />
  );
};
