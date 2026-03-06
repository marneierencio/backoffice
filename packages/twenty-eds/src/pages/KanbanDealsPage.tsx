import { Button } from '@eds/components/Button';
import { Icon } from '@eds/components/Icon';
import { KanbanBoard } from '@eds/components/KanbanBoard';
import { KanbanCard } from '@eds/components/KanbanBoard/KanbanCard';
import { PageHeader } from '@eds/components/PageHeader';
import { useKanbanBoard, type OpportunityRecord } from '@eds/hooks/useKanbanBoard';
import { tokens } from '@eds/tokens';
import { useCallback } from 'react';

const stageBadgeVariant = (stage: string): 'default' | 'success' | 'warning' | 'error' | 'info' | 'brand' => {
  const normalized = stage?.toUpperCase() ?? '';
  if (normalized.includes('WON')) return 'success';
  if (normalized.includes('LOST')) return 'error';
  if (normalized.includes('PROPOSAL')) return 'warning';
  if (normalized.includes('QUALIF') || normalized.includes('MEETING')) return 'info';
  return 'default';
};

const formatCurrency = (amount?: number): string => {
  if (amount == null) return '';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (date?: string): string => {
  if (!date) return '';
  return new Date(date).toLocaleDateString();
};

export const KanbanDealsPage = () => {
  const { columns, loading, moveCard } = useKanbanBoard();

  const handleCardClick = useCallback((record: OpportunityRecord) => {
    window.location.hash = `#/deals/${record.id}`;
  }, []);

  const handleAddClick = useCallback((columnId: string) => {
    window.location.hash = `#/deals/new?stage=${columnId}`;
  }, []);

  const renderCard = useCallback((record: OpportunityRecord) => {
    const stage = record.stage?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) ?? '';
    return (
      <KanbanCard
        title={record.name}
        subtitle={record.company?.name}
        amount={formatCurrency(record.amount)}
        date={formatDate(record.closeDate)}
        tags={[{ label: stage, variant: stageBadgeVariant(record.stage) }]}
      />
    );
  }, []);

  const viewSwitcher = (
    <div style={{ display: 'flex', gap: tokens.spacing.spacingXXXSmall }}>
      <Button
        label=""
        variant="ghost"
        size="small"
        aria-label="List view"
        iconLeft={<Icon name="list-view" size={16} />}
        onClick={() => { window.location.hash = '#/deals'; }}
      />
      <Button
        label=""
        variant="neutral"
        size="small"
        aria-label="Kanban view"
        aria-current="page"
        iconLeft={<Icon name="kanban" size={16} />}
        onClick={() => {}}
      />
      <Button
        label=""
        variant="ghost"
        size="small"
        aria-label="Calendar view"
        iconLeft={<Icon name="calendar-view" size={16} />}
        onClick={() => { window.location.hash = '#/calendar'; }}
      />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.spacingMedium, height: '100%' }}>
      <PageHeader
        title="Deals Pipeline"
        description="Drag and drop deals between stages"
        icon="💼"
        actions={
          <div style={{ display: 'flex', gap: tokens.spacing.spacingSmall, alignItems: 'center' }}>
            {viewSwitcher}
            <Button
              label="New Deal"
              variant="brand"
              size="small"
              iconLeft={<Icon name="plus" size={14} />}
              onClick={() => { window.location.hash = '#/deals/new'; }}
            />
          </div>
        }
      />
      <div style={{ flex: 1, minHeight: 0 }}>
        <KanbanBoard
          columns={columns}
          onCardMove={moveCard}
          onCardClick={handleCardClick}
          onAddClick={handleAddClick}
          renderCard={renderCard}
          loading={loading}
        />
      </div>
    </div>
  );
};
