import type { KanbanColumnData } from '@eds/components/KanbanBoard';
import { gqlWorkspace } from '@eds/utils/api';
import { useCallback, useEffect, useState } from 'react';
import { useToast } from './useToast';

export type OpportunityRecord = {
  id: string;
  name: string;
  amount?: number;
  closeDate?: string;
  stage: string;
  company?: { id: string; name: string };
  contact?: { id: string; name: string };
};

export type UseKanbanBoardReturn = {
  columns: KanbanColumnData<OpportunityRecord>[];
  loading: boolean;
  error: string | null;
  moveCard: (recordId: string, fromColumnId: string, toColumnId: string, position: number) => void;
  refresh: () => void;
};

const STAGE_ORDER = ['LEAD', 'QUALIFICATION', 'MEETING', 'PROPOSAL', 'CLOSED_WON', 'CLOSED_LOST'];

const STAGE_COLORS: Record<string, string> = {
  LEAD: '#706e6b',
  QUALIFICATION: '#0176d3',
  MEETING: '#0176d3',
  PROPOSAL: '#dd7a01',
  CLOSED_WON: '#2e844a',
  CLOSED_LOST: '#ba0517',
};

const STAGE_LABELS: Record<string, string> = {
  LEAD: 'Lead',
  QUALIFICATION: 'Qualification',
  MEETING: 'Meeting',
  PROPOSAL: 'Proposal',
  CLOSED_WON: 'Closed Won',
  CLOSED_LOST: 'Closed Lost',
};

const OPPORTUNITIES_QUERY = `
  query AllOpportunities {
    opportunities(first: 500) {
      edges {
        node {
          id
          name
          amount
          closeDate
          stage
          company { id name }
          pointOfContact { id name { firstName lastName } }
        }
      }
    }
  }
`;

const UPDATE_STAGE_MUTATION = `
  mutation UpdateOpportunityStage($id: ID!, $input: OpportunityUpdateInput!) {
    updateOpportunity(id: $id, data: $input) {
      id
      stage
    }
  }
`;

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);

export const useKanbanBoard = (): UseKanbanBoardReturn => {
  const [records, setRecords] = useState<OpportunityRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showError } = useToast();

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await gqlWorkspace<{
        opportunities: {
          edges: {
            node: {
              id: string;
              name: string;
              amount?: number;
              closeDate?: string;
              stage: string;
              company?: { id: string; name: string };
              pointOfContact?: { id: string; name: { firstName: string; lastName: string } };
            };
          }[];
        };
      }>(OPPORTUNITIES_QUERY);

      const opps: OpportunityRecord[] = (res.data?.opportunities?.edges ?? []).map(({ node }) => ({
        id: node.id,
        name: node.name,
        amount: node.amount,
        closeDate: node.closeDate,
        stage: node.stage,
        company: node.company,
        contact: node.pointOfContact
          ? { id: node.pointOfContact.id, name: `${node.pointOfContact.name.firstName} ${node.pointOfContact.name.lastName}`.trim() }
          : undefined,
      }));

      setRecords(opps);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load opportunities';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const columns = STAGE_ORDER.map<KanbanColumnData<OpportunityRecord>>((stage) => {
    const stageRecords = records.filter((r) => r.stage === stage);
    const total = stageRecords.reduce((sum, r) => sum + (r.amount ?? 0), 0);

    return {
      id: stage,
      title: STAGE_LABELS[stage] ?? stage,
      color: STAGE_COLORS[stage],
      records: stageRecords,
      aggregateValue: total > 0 ? formatCurrency(total) : undefined,
      aggregateLabel: 'Total',
    };
  });

  const moveCard = useCallback(
    (recordId: string, _fromColumnId: string, toColumnId: string, _position: number) => {
      // Optimistic update
      const prevRecords = records;
      setRecords((prev) =>
        prev.map((r) => (r.id === recordId ? { ...r, stage: toColumnId } : r)),
      );

      // Fire mutation
      gqlWorkspace(UPDATE_STAGE_MUTATION, {
        id: recordId,
        input: { stage: toColumnId },
      }).catch(() => {
        // Revert on failure
        setRecords(prevRecords);
        showError('Move failed', 'Could not update deal stage. Please try again.');
      });
    },
    [records, showError],
  );

  return { columns, loading, error, moveCard, refresh: fetchRecords };
};
