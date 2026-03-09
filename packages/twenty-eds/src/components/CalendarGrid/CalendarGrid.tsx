import { Button } from '@eds/components/Button';
import { Icon } from '@eds/components/Icon';
import { tokens } from '@eds/tokens';
import React, { useCallback, useMemo, useState } from 'react';
import { CalendarEvent, type CalendarEventVariant } from './CalendarEvent';

export type CalendarEventData = {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  color?: string;
  variant?: CalendarEventVariant;
  onClick?: () => void;
};

export type CalendarGridProps = {
  year: number;
  month: number;
  events: CalendarEventData[];
  onMonthChange: (year: number, month: number) => void;
  onDateClick?: (date: string) => void;
  onEventClick?: (event: CalendarEventData) => void;
  loading?: boolean;
  todayLabel?: string;
  locale?: string;
};

const MAX_VISIBLE_EVENTS = 3;

const getDaysInMonth = (year: number, month: number): number =>
  new Date(year, month + 1, 0).getDate();

const getFirstDayOfWeek = (year: number, month: number): number =>
  new Date(year, month, 1).getDay();

const formatISODate = (year: number, month: number, day: number): string => {
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
};

type DayCellData = {
  date: number;
  month: number;
  year: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isoDate: string;
  events: CalendarEventData[];
};

const buildCalendarGrid = (
  year: number,
  month: number,
  events: CalendarEventData[],
): DayCellData[] => {
  const today = new Date();
  const todayISO = formatISODate(today.getFullYear(), today.getMonth(), today.getDate());

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfWeek = getFirstDayOfWeek(year, month);

  // Build event lookup by date
  const eventsByDate = new Map<string, CalendarEventData[]>();
  for (const ev of events) {
    const dateKey = ev.date.slice(0, 10);
    if (!eventsByDate.has(dateKey)) eventsByDate.set(dateKey, []);
    eventsByDate.get(dateKey)!.push(ev);
  }

  const cells: DayCellData[] = [];

  // Previous month fill
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const iso = formatISODate(prevYear, prevMonth, day);
    cells.push({
      date: day,
      month: prevMonth,
      year: prevYear,
      isCurrentMonth: false,
      isToday: iso === todayISO,
      isoDate: iso,
      events: eventsByDate.get(iso) ?? [],
    });
  }

  // Current month
  for (let day = 1; day <= daysInMonth; day++) {
    const iso = formatISODate(year, month, day);
    cells.push({
      date: day,
      month,
      year,
      isCurrentMonth: true,
      isToday: iso === todayISO,
      isoDate: iso,
      events: eventsByDate.get(iso) ?? [],
    });
  }

  // Next month fill (to complete 6 rows × 7 cols = 42 cells)
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;
  const remaining = 42 - cells.length;
  for (let day = 1; day <= remaining; day++) {
    const iso = formatISODate(nextYear, nextMonth, day);
    cells.push({
      date: day,
      month: nextMonth,
      year: nextYear,
      isCurrentMonth: false,
      isToday: iso === todayISO,
      isoDate: iso,
      events: eventsByDate.get(iso) ?? [],
    });
  }

  return cells;
};

export const CalendarGrid = ({
  year,
  month,
  events,
  onMonthChange,
  onDateClick,
  onEventClick,
  loading = false,
  todayLabel = 'Today',
  locale = 'en-US',
}: CalendarGridProps) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const monthName = useMemo(
    () =>
      new Date(year, month, 1).toLocaleDateString(locale, {
        month: 'long',
        year: 'numeric',
      }),
    [year, month, locale],
  );

  const weekdays = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(locale, { weekday: 'short' });
    // Generate weekday names starting from Sunday
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(2024, 0, i);
      void d; // weekdays start Sunday; used for documentation
      // Jan 7, 2024 is a Sunday
      const date = new Date(2024, 0, 7 + i);
      return formatter.format(date);
    });
  }, [locale]);

  const cells = useMemo(() => buildCalendarGrid(year, month, events), [year, month, events]);

  const handlePrev = useCallback(() => {
    if (month === 0) onMonthChange(year - 1, 11);
    else onMonthChange(year, month - 1);
  }, [year, month, onMonthChange]);

  const handleNext = useCallback(() => {
    if (month === 11) onMonthChange(year + 1, 0);
    else onMonthChange(year, month + 1);
  }, [year, month, onMonthChange]);

  const handleToday = useCallback(() => {
    const now = new Date();
    onMonthChange(now.getFullYear(), now.getMonth());
  }, [onMonthChange]);

  const handleDateClick = useCallback(
    (cell: DayCellData) => {
      setSelectedDate(cell.isoDate);
      onDateClick?.(cell.isoDate);
    },
    [onDateClick],
  );

  // Styles
  const containerStyle: React.CSSProperties = {
    fontFamily: tokens.typography.fontFamilyBase,
    backgroundColor: tokens.color.neutral0,
    borderRadius: tokens.radius.radiusMedium,
    border: `1px solid ${tokens.color.neutral2}`,
    overflow: 'hidden',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${tokens.spacing.spacingSmall} ${tokens.spacing.spacingMedium}`,
    marginBottom: tokens.spacing.spacingXXXSmall,
  };

  const monthTitleStyle: React.CSSProperties = {
    fontSize: tokens.typography.fontSizeXLarge,
    fontWeight: tokens.typography.fontWeightBold as React.CSSProperties['fontWeight'],
    color: tokens.color.textDefault,
  };

  const navGroupStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.spacingXXSmall,
  };

  const weekdayRowStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    textAlign: 'center',
    padding: `${tokens.spacing.spacingXXSmall} 0`,
    fontSize: tokens.typography.fontSizeSmall,
    fontWeight: tokens.typography.fontWeightMedium as React.CSSProperties['fontWeight'],
    color: tokens.color.textPlaceholder,
    borderBottom: `1px solid ${tokens.color.neutral2}`,
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: 0,
  };

  const loadingOverlayStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    zIndex: 1,
    fontSize: tokens.typography.fontSizeMedium,
    color: tokens.color.textPlaceholder,
  };

  return (
    <div style={containerStyle} role="grid" aria-label="Calendar">
      <div style={headerStyle}>
        <span style={monthTitleStyle}>{monthName}</span>
        <div style={navGroupStyle}>
          <Button
            label={todayLabel}
            variant="outline"
            size="small"
            onClick={handleToday}
          />
          <Button
            label=""
            variant="ghost"
            size="small"
            aria-label="Previous month"
            iconLeft={<Icon name="chevron-left" size={16} />}
            onClick={handlePrev}
          />
          <Button
            label=""
            variant="ghost"
            size="small"
            aria-label="Next month"
            iconLeft={<Icon name="chevron-right" size={16} />}
            onClick={handleNext}
          />
        </div>
      </div>

      <div style={weekdayRowStyle} role="row">
        {weekdays.map((day) => (
          <div key={day} role="columnheader">
            {day}
          </div>
        ))}
      </div>

      <div style={{ position: 'relative' }}>
        {loading && <div style={loadingOverlayStyle}>Loading…</div>}
        <div style={gridStyle}>
          {cells.map((cell) => (
            <DayCell
              key={cell.isoDate}
              cell={cell}
              isSelected={cell.isoDate === selectedDate}
              onClick={() => handleDateClick(cell)}
              onEventClick={onEventClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── DayCell (internal) ───

type DayCellProps = {
  cell: DayCellData;
  isSelected: boolean;
  onClick: () => void;
  onEventClick?: (event: CalendarEventData) => void;
};

const DayCell = ({ cell, isSelected, onClick, onEventClick }: DayCellProps) => {
  const visibleEvents = cell.events.slice(0, MAX_VISIBLE_EVENTS);
  const overflowCount = cell.events.length - MAX_VISIBLE_EVENTS;

  const cellStyle: React.CSSProperties = {
    padding: tokens.spacing.spacingXXSmall,
    borderRight: `1px solid ${tokens.color.neutral1}`,
    borderBottom: `1px solid ${tokens.color.neutral1}`,
    cursor: 'pointer',
    minHeight: '100px',
    position: 'relative',
    opacity: cell.isCurrentMonth ? 1 : 0.5,
    backgroundColor: cell.isCurrentMonth ? 'transparent' : tokens.color.neutral1,
    outline: isSelected ? `2px solid ${tokens.color.brandPrimary}` : 'none',
    outlineOffset: '-2px',
  };

  const dateNumberStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    fontSize: tokens.typography.fontSizeSmall,
    fontWeight: tokens.typography.fontWeightRegular as React.CSSProperties['fontWeight'],
    fontFamily: tokens.typography.fontFamilyBase,
    color: cell.isToday ? tokens.color.textInverse : tokens.color.textDefault,
    backgroundColor: cell.isToday ? tokens.color.brandPrimary : 'transparent',
    borderRadius: tokens.radius.radiusCircle,
    lineHeight: '24px',
    marginBottom: tokens.spacing.spacingXXXSmall,
  };

  const eventsContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
  };

  const overflowStyle: React.CSSProperties = {
    fontSize: tokens.typography.fontSizeXSmall,
    color: tokens.color.textLink,
    cursor: 'pointer',
    fontFamily: tokens.typography.fontFamilyBase,
    padding: '0 4px',
  };

  const dateLabel = new Date(cell.year, cell.month, cell.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div
      style={cellStyle}
      role="gridcell"
      aria-label={dateLabel}
      tabIndex={cell.isToday ? 0 : -1}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (!isSelected) (e.currentTarget as HTMLElement).style.backgroundColor = tokens.color.neutral1;
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          (e.currentTarget as HTMLElement).style.backgroundColor =
            cell.isCurrentMonth ? 'transparent' : tokens.color.neutral1;
        }
      }}
    >
      <div style={dateNumberStyle}>{cell.date}</div>
      <div style={eventsContainerStyle}>
        {visibleEvents.map((ev) => (
          <CalendarEvent
            key={ev.id}
            title={ev.title}
            variant={ev.variant}
            compact={cell.events.length > 3}
            onClick={() => onEventClick?.(ev)}
          />
        ))}
        {overflowCount > 0 && (
          <span style={overflowStyle}>+{overflowCount} more</span>
        )}
      </div>
    </div>
  );
};
