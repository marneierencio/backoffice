import { Badge } from '@eds/components/Badge';
import { Icon } from '@eds/components/Icon';
import { tokens } from '@eds/tokens';
import React, { useCallback, useRef, useState } from 'react';

export type KanbanColumnData<TRecord extends { id: string }> = {
  id: string;
  title: string;
  color?: string;
  records: TRecord[];
  aggregateValue?: string;
  aggregateLabel?: string;
};

export type KanbanBoardProps<TRecord extends { id: string }> = {
  columns: KanbanColumnData<TRecord>[];
  onCardMove: (recordId: string, fromColumnId: string, toColumnId: string, position: number) => void;
  onCardClick?: (record: TRecord) => void;
  onAddClick?: (columnId: string) => void;
  renderCard: (record: TRecord) => React.ReactNode;
  loading?: boolean;
  emptyMessage?: string;
};

export const KanbanBoard = <TRecord extends { id: string }>({
  columns,
  onCardMove,
  onCardClick,
  onAddClick,
  renderCard,
  loading = false,
  emptyMessage = 'No records found',
}: KanbanBoardProps<TRecord>) => {
  const [dragState, setDragState] = useState<{
    recordId: string;
    fromColumnId: string;
  } | null>(null);
  const [dropTarget, setDropTarget] = useState<{
    columnId: string;
    position: number;
  } | null>(null);

  const boardStyle: React.CSSProperties = {
    display: 'flex',
    gap: tokens.spacing.spacingSmall,
    overflowX: 'auto',
    padding: tokens.spacing.spacingSmall,
    height: '100%',
    alignItems: 'flex-start',
    fontFamily: tokens.typography.fontFamilyBase,
  };

  const loadingOverlay: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacing.spacingXXLarge,
    color: tokens.color.textPlaceholder,
    fontSize: tokens.typography.fontSizeMedium,
    width: '100%',
  };

  if (loading) {
    return <div style={loadingOverlay}>Loading…</div>;
  }

  if (columns.length === 0) {
    return <div style={loadingOverlay}>{emptyMessage}</div>;
  }

  return (
    <div style={boardStyle}>
      {columns.map((column) => (
        <KanbanColumn
          key={column.id}
          column={column}
          renderCard={renderCard}
          onCardClick={onCardClick}
          onAddClick={onAddClick}
          dragState={dragState}
          dropTarget={dropTarget}
          onDragStart={(recordId) =>
            setDragState({ recordId, fromColumnId: column.id })
          }
          onDragEnd={() => {
            if (dragState && dropTarget) {
              onCardMove(
                dragState.recordId,
                dragState.fromColumnId,
                dropTarget.columnId,
                dropTarget.position,
              );
            }
            setDragState(null);
            setDropTarget(null);
          }}
          onDragCancel={() => {
            setDragState(null);
            setDropTarget(null);
          }}
          onDropTargetChange={(columnId, position) =>
            setDropTarget({ columnId, position })
          }
        />
      ))}
    </div>
  );
};

// ─── KanbanColumn (internal) ───

type KanbanColumnProps<TRecord extends { id: string }> = {
  column: KanbanColumnData<TRecord>;
  renderCard: (record: TRecord) => React.ReactNode;
  onCardClick?: (record: TRecord) => void;
  onAddClick?: (columnId: string) => void;
  dragState: { recordId: string; fromColumnId: string } | null;
  dropTarget: { columnId: string; position: number } | null;
  onDragStart: (recordId: string) => void;
  onDragEnd: () => void;
  onDragCancel: () => void;
  onDropTargetChange: (columnId: string, position: number) => void;
};

const KanbanColumn = <TRecord extends { id: string }>({
  column,
  renderCard,
  onCardClick,
  onAddClick,
  dragState,
  dropTarget,
  onDragStart,
  onDragEnd,
  onDragCancel,
  onDropTargetChange,
}: KanbanColumnProps<TRecord>) => {
  const bodyRef = useRef<HTMLDivElement>(null);

  const columnStyle: React.CSSProperties = {
    width: '280px',
    minWidth: '280px',
    flexShrink: 0,
    backgroundColor: tokens.color.neutral1,
    borderRadius: tokens.radius.radiusMedium,
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '100%',
  };

  const headerStyle: React.CSSProperties = {
    padding: `${tokens.spacing.spacingSmall} ${tokens.spacing.spacingMedium}`,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.spacingSmall,
    borderBottom: `2px solid ${column.color ?? tokens.color.neutral3}`,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: tokens.typography.fontSizeMedium,
    fontWeight: tokens.typography.fontWeightMedium as React.CSSProperties['fontWeight'],
    color: tokens.color.textDefault,
    flex: 1,
  };

  const aggregateStyle: React.CSSProperties = {
    fontSize: tokens.typography.fontSizeSmall,
    color: tokens.color.textPlaceholder,
    padding: `0 ${tokens.spacing.spacingMedium} ${tokens.spacing.spacingXXSmall}`,
  };

  const bodyStyle: React.CSSProperties = {
    padding: tokens.spacing.spacingXSmall,
    overflowY: 'auto',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.spacingXSmall,
  };

  const addButtonBaseStyle: React.CSSProperties = {
    width: '100%',
    padding: tokens.spacing.spacingXSmall,
    border: `1px dashed ${tokens.color.neutral3}`,
    borderRadius: tokens.radius.radiusMedium,
    color: tokens.color.textPlaceholder,
    cursor: 'pointer',
    textAlign: 'center',
    fontSize: tokens.typography.fontSizeSmall,
    fontFamily: tokens.typography.fontFamilyBase,
    backgroundColor: 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing.spacingXXXSmall,
  };

  const dropIndicatorStyle: React.CSSProperties = {
    height: '2px',
    backgroundColor: tokens.color.brandPrimary,
    borderRadius: '1px',
    margin: `${tokens.spacing.spacingXXXSmall} 0`,
  };

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';

      const body = bodyRef.current;
      if (!body) return;

      // Calculate insert position based on mouse Y
      const cards = Array.from(body.querySelectorAll('[data-kanban-card]'));
      let position = cards.length;

      for (let i = 0; i < cards.length; i++) {
        const rect = cards[i].getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        if (e.clientY < midY) {
          position = i;
          break;
        }
      }

      onDropTargetChange(column.id, position);
    },
    [column.id, onDropTargetChange],
  );

  const isDropTargetColumn = dropTarget?.columnId === column.id;

  return (
    <div style={columnStyle}>
      <div style={headerStyle}>
        <span style={titleStyle}>{column.title}</span>
        <Badge label={String(column.records.length)} variant="default" size="small" />
      </div>

      {column.aggregateValue && (
        <div style={aggregateStyle}>
          {column.aggregateLabel ?? 'Total'}: {column.aggregateValue}
        </div>
      )}

      <div
        ref={bodyRef}
        style={bodyStyle}
        role="list"
        aria-label={`${column.title} column`}
        onDragOver={handleDragOver}
        onDrop={(e) => {
          e.preventDefault();
          onDragEnd();
        }}
        onDragLeave={() => {
          // Only clear if leaving this column
        }}
      >
        {column.records.map((record, index) => (
          <React.Fragment key={record.id}>
            {isDropTargetColumn && dropTarget.position === index && (
              <div style={dropIndicatorStyle} />
            )}
            <div
              data-kanban-card
              draggable
              style={{
                opacity: dragState?.recordId === record.id ? 0.5 : 1,
                cursor: 'grab',
              }}
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', record.id);
                onDragStart(record.id);
              }}
              onDragEnd={onDragCancel}
              onClick={() => onCardClick?.(record)}
            >
              {renderCard(record)}
            </div>
          </React.Fragment>
        ))}
        {isDropTargetColumn && dropTarget.position >= column.records.length && (
          <div style={dropIndicatorStyle} />
        )}
      </div>

      {onAddClick && (
        <div style={{ padding: tokens.spacing.spacingXSmall }}>
          <button
            type="button"
            style={addButtonBaseStyle}
            onClick={() => onAddClick(column.id)}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.backgroundColor = tokens.color.neutral0;
              el.style.borderColor = tokens.color.brandPrimary;
              el.style.color = tokens.color.brandPrimary;
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.backgroundColor = 'transparent';
              el.style.borderColor = tokens.color.neutral3;
              el.style.color = tokens.color.textPlaceholder;
            }}
          >
            <Icon name="plus" size={14} /> Add
          </button>
        </div>
      )}
    </div>
  );
};
