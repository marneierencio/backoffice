import { CalendarGrid } from '@eds/components/CalendarGrid';
import { PageHeader } from '@eds/components/PageHeader';
import { useCalendarEvents } from '@eds/hooks/useCalendarEvents';
import { tokens } from '@eds/tokens';
import { useCallback, useState } from 'react';

export const CalendarPage = () => {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const { events, loading } = useCalendarEvents(year, month);

  const handleMonthChange = useCallback((y: number, m: number) => {
    setYear(y);
    setMonth(m);
  }, []);

  const handleEventClick = useCallback((event: { id: string }) => {
    window.location.hash = `#/deals/${event.id}`;
  }, []);

  const handleDateClick = useCallback((date: string) => {
    window.location.hash = `#/deals/new?closeDate=${date}`;
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.spacingMedium }}>
      <PageHeader
        title="Calendar"
        description="View deal close dates and events"
        icon="📅"
      />
      <CalendarGrid
        year={year}
        month={month}
        events={events}
        onMonthChange={handleMonthChange}
        onEventClick={handleEventClick}
        onDateClick={handleDateClick}
        loading={loading}
      />
    </div>
  );
};
