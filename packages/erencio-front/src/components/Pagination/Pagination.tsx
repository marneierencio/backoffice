import { Button } from '@backoffice/components/Button';
import { Select } from '@backoffice/components/Select';
import { tokens } from '@backoffice/tokens';
import React, { useMemo } from 'react';

export type PaginationProps = {
  currentPage: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
};

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
const MAX_VISIBLE_PAGES = 5;

export const Pagination = ({
  currentPage,
  totalCount,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
}: PaginationProps) => {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const startRecord = totalCount === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const endRecord = Math.min(safeCurrentPage * pageSize, totalCount);

  // Calculate visible page numbers
  const visiblePages = useMemo(() => {
    const pages: (number | 'ellipsis-start' | 'ellipsis-end')[] = [];

    if (totalPages <= MAX_VISIBLE_PAGES + 2) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      const start = Math.max(2, safeCurrentPage - 1);
      const end = Math.min(totalPages - 1, safeCurrentPage + 1);

      if (start > 2) {
        pages.push('ellipsis-start');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push('ellipsis-end');
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  }, [totalPages, safeCurrentPage]);

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacing.spacingMedium,
    padding: `${tokens.spacing.spacingSmall} 0`,
    fontFamily: tokens.typography.fontFamilyBase,
    fontSize: tokens.typography.fontSizeSmall,
    color: tokens.color.textLabel,
    flexWrap: 'wrap',
  };

  const summaryStyle: React.CSSProperties = {
    whiteSpace: 'nowrap',
  };

  const pagesStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.spacingXXXSmall,
  };

  const ellipsisStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    fontSize: tokens.typography.fontSizeSmall,
    color: tokens.color.textPlaceholder,
  };

  const pageSizeContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.spacingXXSmall,
    whiteSpace: 'nowrap',
  };

  return (
    <nav aria-label="Pagination" style={containerStyle}>
      <span style={summaryStyle}>
        {totalCount === 0
          ? 'No records'
          : `Showing ${startRecord.toLocaleString()}–${endRecord.toLocaleString()} of ${totalCount.toLocaleString()}`}
      </span>

      <div style={pagesStyle}>
        {/* First page */}
        <Button
          label="«"
          variant="ghost"
          size="small"
          disabled={safeCurrentPage <= 1}
          onClick={() => onPageChange(1)}
          aria-label="First page"
        />
        {/* Previous page */}
        <Button
          label="‹"
          variant="ghost"
          size="small"
          disabled={safeCurrentPage <= 1}
          onClick={() => onPageChange(safeCurrentPage - 1)}
          aria-label="Previous page"
        />

        {/* Page numbers */}
        {visiblePages.map((page, idx) => {
          if (typeof page === 'string') {
            return <span key={page + idx} style={ellipsisStyle}>…</span>;
          }

          const isCurrent = page === safeCurrentPage;

          return (
            <Button
              key={page}
              label={String(page)}
              variant={isCurrent ? 'brand' : 'ghost'}
              size="small"
              onClick={() => onPageChange(page)}
              aria-label={`Page ${page}`}
              aria-current={isCurrent ? 'page' : undefined}
            />
          );
        })}

        {/* Next page */}
        <Button
          label="›"
          variant="ghost"
          size="small"
          disabled={safeCurrentPage >= totalPages}
          onClick={() => onPageChange(safeCurrentPage + 1)}
          aria-label="Next page"
        />
        {/* Last page */}
        <Button
          label="»"
          variant="ghost"
          size="small"
          disabled={safeCurrentPage >= totalPages}
          onClick={() => onPageChange(totalPages)}
          aria-label="Last page"
        />
      </div>

      {onPageSizeChange && (
        <div style={pageSizeContainerStyle}>
          <span>Rows per page:</span>
          <Select
            value={String(pageSize)}
            options={pageSizeOptions.map((size) => ({
              value: String(size),
              label: String(size),
            }))}
            onChange={(val) => onPageSizeChange(Number(val))}
            aria-label="Rows per page"
          />
        </div>
      )}
    </nav>
  );
};
