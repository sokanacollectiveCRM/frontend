// src/features/dashboard-home/components/CalendarWidget.tsx
import { useState, useMemo } from 'react';
import { useDueDateCalendar, DueDateEvent } from '@/common/hooks/dashboard/useDueDateCalendar';
import { DueDatePopover } from './DueDatePopover';
import { Button } from '@/common/components/ui/button';
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/common/components/ui/alert';
import { cn } from '@/lib/utils';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  format,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
} from 'date-fns';

/**
 * Compact month-view calendar widget for displaying pregnancy due dates
 */
export function CalendarWidget() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  
  const { events, loading, error } = useDueDateCalendar();

  // Group events by date for quick lookup
  const eventsByDate = useMemo(() => {
    const map = new Map<string, DueDateEvent[]>();
    
    events.forEach((event) => {
      const dateKey = event.date; // Already in YYYY-MM-DD format
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(event);
    });
    
    return map;
  }, [events]);

  // Generate calendar grid
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days: Date[] = [];
    let day = startDate;

    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }

    return days;
  }, [currentMonth]);

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleDateClick = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const dayEvents = eventsByDate.get(dateKey) || [];
    
    if (dayEvents.length > 0) {
      setSelectedDate(date);
      setPopoverOpen(true);
    }
  };

  const getDayEvents = (date: Date): DueDateEvent[] => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return eventsByDate.get(dateKey) || [];
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Error state
  if (error) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
          Due Date Calendar
        </h2>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load calendar events. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Due Date Calendar
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevMonth}
            disabled={loading}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[140px] text-center text-sm font-medium text-gray-700 dark:text-gray-300">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNextMonth}
            disabled={loading}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex h-64 items-center justify-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Loading calendar...
          </div>
        </div>
      )}

      {/* Calendar grid */}
      {!loading && (
        <div className="overflow-hidden">
          {/* Week day headers */}
          <div className="mb-2 grid grid-cols-7 gap-1">
            {weekDays.map((day) => (
              <div
                key={day}
                className="py-2 text-center text-xs font-medium text-gray-600 dark:text-gray-400"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              const dayEvents = getDayEvents(day);
              const hasEvents = dayEvents.length > 0;
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isTodayDate = isToday(day);
              const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;

              const dayContent = (
                <button
                  key={index}
                  onClick={() => handleDateClick(day)}
                  disabled={!hasEvents}
                  className={cn(
                    'relative flex h-12 w-full flex-col items-center justify-center rounded-md text-sm transition-colors',
                    // Base styles
                    'hover:bg-gray-100 dark:hover:bg-gray-800',
                    // Current month vs other months
                    isCurrentMonth
                      ? 'text-gray-900 dark:text-gray-100'
                      : 'text-gray-400 dark:text-gray-600',
                    // Today highlight
                    isTodayDate && 'border-2 border-blue-500 font-semibold',
                    // Selected state
                    isSelected && 'bg-blue-50 dark:bg-blue-950',
                    // Has events - make it clickable
                    hasEvents && 'cursor-pointer',
                    !hasEvents && 'cursor-default'
                  )}
                >
                  <span className={cn(isTodayDate && 'text-blue-600 dark:text-blue-400')}>
                    {format(day, 'd')}
                  </span>
                  
                  {/* Event indicator - green dot */}
                  {hasEvents && (
                    <div className="mt-0.5 flex gap-0.5">
                      {dayEvents.length <= 3 ? (
                        // Show individual dots for 1-3 events
                        dayEvents.map((event, idx) => (
                          <div
                            key={idx}
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: event.color || '#34A853' }}
                          />
                        ))
                      ) : (
                        // Show "+N" for more than 3 events
                        <>
                          <div
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: '#34A853' }}
                          />
                          <span className="text-[10px] font-medium text-green-600 dark:text-green-400">
                            +{dayEvents.length - 1}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </button>
              );

              // Wrap in popover if has events
              if (hasEvents && selectedDate && isSameDay(day, selectedDate)) {
                return (
                  <DueDatePopover
                    key={index}
                    date={day}
                    events={dayEvents}
                    open={popoverOpen}
                    onOpenChange={setPopoverOpen}
                  >
                    {dayContent}
                  </DueDatePopover>
                );
              }

              return dayContent;
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-[#34A853]" />
              <span>Due Date</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

