import type { CalendarEventData, CalendarEventVariant } from '@backoffice/components/CalendarGrid';
import { gqlWorkspace } from '@backoffice/utils/api';
import { useCallback, useEffect, useState } from 'react';

export type UseCalendarEventsReturn = {
  events: CalendarEventData[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

const STAGE_VARIANT_MAP: Record<string, CalendarEventVariant> = {
  LEAD: 'default',
  QUALIFICATION: 'brand',
  MEETING: 'brand',
  PROPOSAL: 'warning',
  CLOSED_WON: 'success',
  CLOSED_LOST: 'error',
};

const OPPORTUNITIES_QUERY = `
  query OpportunitiesByCloseDate($filter: OpportunityFilterInput) {
    opportunities(filter: $filter, first: 200) {
      edges {
        node {
          id
          name
          closeDate
          stage
          amount
        }
      }
    }
  }
`;

export const useCalendarEvents = (
  year: number,
  month: number,
): UseCalendarEventsReturn => {
  const [events, setEvents] = useState<CalendarEventData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);

    const startDate = new Date(year, month, 1).toISOString().slice(0, 10);
    const endDate = new Date(year, month + 1, 0).toISOString().slice(0, 10);

    try {
      const res = await gqlWorkspace<{
        opportunities: {
          edges: {
            node: {
              id: string;
              name: string;
              closeDate: string;
              stage: string;
              amount?: number;
            };
          }[];
        };
      }>(OPPORTUNITIES_QUERY, {
        filter: {
          closeDate: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      const opps = res.data?.opportunities?.edges ?? [];
      const mapped: CalendarEventData[] = opps.map(({ node }) => ({
        id: node.id,
        title: node.name,
        date: node.closeDate,
        variant: STAGE_VARIANT_MAP[node.stage] ?? ('default' as CalendarEventVariant),
      }));

      setEvents(mapped);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load events';
      setError(message);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return { events, loading, error, refresh: fetchEvents };
};
