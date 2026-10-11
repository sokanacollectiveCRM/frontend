import { Pencil, Trash2 } from 'lucide-react';

import type { DoulaAvailabilityRecord } from '@/api/doulas/doulaService';
import { Button } from '@/common/components/ui/button';
import { Checkbox } from '@/common/components/ui/checkbox';
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import { formatTimeRangeWithZone } from '@/features/scheduling/schedulingTime';
import {
  TIME_OFF_TYPES,
  emptyTimeOffForm,
  type TimeOffCoverage,
  type TimeOffFormValues,
  type TimeOffType,
  type UsHoliday,
} from '@/features/scheduling/timeOff';

interface TimeOffItem extends DoulaAvailabilityRecord {
  type: TimeOffType;
  label: string;
}

interface TimeOffPanelProps {
  form: TimeOffFormValues;
  onChange: (values: TimeOffFormValues) => void;
  onSave: () => void;
  isSaving: boolean;
  editingId: string | null;
  onCancelEdit: () => void;
  items: TimeOffItem[];
  holidays: UsHoliday[];
  selectedHolidayDates: string[];
  onToggleHoliday: (holiday: UsHoliday, selected: boolean) => void;
  onAddHolidays: () => void;
  onEdit: (item: TimeOffItem) => void;
  onDelete: (item: TimeOffItem) => void;
  timeZone: string;
}

export function TimeOffPanel({
  form,
  onChange,
  onSave,
  isSaving,
  editingId,
  onCancelEdit,
  items,
  holidays,
  selectedHolidayDates,
  onToggleHoliday,
  onAddHolidays,
  onEdit,
  onDelete,
  timeZone,
}: TimeOffPanelProps) {
  return (
    <div className='space-y-6' data-testid='time-off-panel'>
      <form
        className='space-y-4'
        data-testid='time-off-form'
        onSubmit={(event) => {
          event.preventDefault();
          onSave();
        }}
      >
        <div className='grid gap-3 sm:grid-cols-2'>
          <div className='space-y-2'>
            <Label htmlFor='time-off-type'>Type</Label>
            <select
              id='time-off-type'
              className='border-input h-9 w-full rounded-md border bg-transparent px-3 text-sm'
              value={form.type}
              onChange={(event) =>
                onChange({
                  ...form,
                  type: event.target.value as TimeOffType,
                })
              }
            >
              {TIME_OFF_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className='space-y-2'>
            <Label htmlFor='time-off-coverage'>Covers</Label>
            <select
              id='time-off-coverage'
              className='border-input h-9 w-full rounded-md border bg-transparent px-3 text-sm'
              value={form.coverage}
              onChange={(event) =>
                onChange({
                  ...form,
                  coverage: event.target.value as TimeOffCoverage,
                })
              }
            >
              <option value='single_day'>A single day</option>
              <option value='date_range'>A date range</option>
              <option value='part_of_day'>Part of a day</option>
            </select>
          </div>
        </div>
        <div className='grid gap-3 sm:grid-cols-2'>
          <div className='space-y-2'>
            <Label htmlFor='time-off-from'>
              {form.coverage === 'date_range' ? 'From date' : 'Date'}
            </Label>
            <Input
              id='time-off-from'
              type='date'
              value={form.fromDate}
              onChange={(event) =>
                onChange({ ...form, fromDate: event.target.value })
              }
            />
          </div>
          {form.coverage === 'date_range' ? (
            <div className='space-y-2'>
              <Label htmlFor='time-off-to'>To date</Label>
              <Input
                id='time-off-to'
                type='date'
                value={form.toDate}
                onChange={(event) =>
                  onChange({ ...form, toDate: event.target.value })
                }
              />
            </div>
          ) : null}
        </div>
        {form.coverage === 'part_of_day' ? (
          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-2'>
              <Label htmlFor='time-off-start'>Start time</Label>
              <Input
                id='time-off-start'
                type='time'
                value={form.startTime}
                onChange={(event) =>
                  onChange({ ...form, startTime: event.target.value })
                }
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='time-off-end'>End time</Label>
              <Input
                id='time-off-end'
                type='time'
                value={form.endTime}
                onChange={(event) =>
                  onChange({ ...form, endTime: event.target.value })
                }
              />
            </div>
          </div>
        ) : null}
        {form.type !== 'Vacation' || form.reason || editingId ? (
          <div className='space-y-2'>
            <Label htmlFor='time-off-reason'>
              {form.type === 'Holiday' ? 'Holiday name' : 'Reason'}
              {form.type === 'Vacation' ? ' (optional)' : ''}
            </Label>
            <Input
              id='time-off-reason'
              value={form.reason}
              onChange={(event) =>
                onChange({ ...form, reason: event.target.value })
              }
              placeholder={
                form.type === 'Holiday' ? 'Thanksgiving' : 'Short note'
              }
            />
          </div>
        ) : null}
        <div className='flex flex-wrap gap-2'>
          <Button type='submit' disabled={isSaving} data-testid='save-time-off'>
            {editingId ? 'Save time off' : 'Add time off'}
          </Button>
          {editingId ? (
            <Button type='button' variant='outline' onClick={onCancelEdit}>
              Cancel edit
            </Button>
          ) : null}
        </div>
      </form>

      <div>
        <h3 className='text-sm font-medium'>Quick-add US holidays</h3>
        <p className='mb-3 mt-1 text-xs text-muted-foreground'>
          Next 12 months. Pick the ones that apply to you.
        </p>
        <ul className='max-h-48 space-y-2 overflow-auto rounded-lg border p-3'>
          {holidays.length === 0 ? (
            <li className='text-sm text-muted-foreground'>
              No upcoming holidays in this window.
            </li>
          ) : (
            holidays.map((holiday) => (
              <li key={`${holiday.date}-${holiday.name}`}>
                <label className='flex items-center gap-2 text-sm'>
                  <Checkbox
                    checked={selectedHolidayDates.includes(holiday.date)}
                    onCheckedChange={(checked) =>
                      onToggleHoliday(holiday, checked === true)
                    }
                    data-testid={`holiday-${holiday.name.replace(/\s+/g, '-').toLowerCase()}`}
                  />
                  <span>
                    {holiday.name}{' '}
                    <span className='text-muted-foreground'>
                      {holiday.date}
                    </span>
                  </span>
                </label>
              </li>
            ))
          )}
        </ul>
        <Button
          type='button'
          variant='secondary'
          className='mt-3'
          onClick={onAddHolidays}
          disabled={selectedHolidayDates.length === 0 || isSaving}
          data-testid='add-selected-holidays'
        >
          Add selected holidays
        </Button>
      </div>

      <div>
        <h3 className='text-sm font-medium'>Upcoming time off</h3>
        {items.length === 0 ? (
          <p className='mt-2 text-sm text-muted-foreground'>
            No upcoming time off.
          </p>
        ) : (
          <ul className='mt-2 space-y-3' data-testid='time-off-list'>
            {items.map((item) => (
              <li
                key={item.id}
                className='flex items-start justify-between gap-3 rounded-lg border p-3'
              >
                <div>
                  <p className='text-sm font-medium'>
                    {item.type}
                    {item.label && item.label !== item.type
                      ? ` · ${item.label}`
                      : ''}
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    {formatTimeRangeWithZone(
                      item.startAt,
                      item.endAt,
                      timeZone
                    )}
                  </p>
                </div>
                <div className='flex gap-1'>
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    aria-label={`Edit time off ${item.id}`}
                    onClick={() => onEdit(item)}
                  >
                    <Pencil className='h-4 w-4' />
                  </Button>
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    aria-label={`Delete time off ${item.id}`}
                    onClick={() => onDelete(item)}
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export function timeOffFormFromRecord(item: TimeOffItem): TimeOffFormValues {
  const start = new Date(item.startAt);
  const end = new Date(item.endAt);
  const sameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate();
  const startsMidnight =
    start.getHours() === 0 && start.getMinutes() === 0 && end.getHours() === 23;
  const pad = (value: number) => String(value).padStart(2, '0');
  const dateOf = (date: Date) =>
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

  if (sameDay && !startsMidnight) {
    return {
      ...emptyTimeOffForm(),
      type: item.type,
      coverage: 'part_of_day',
      fromDate: dateOf(start),
      toDate: dateOf(start),
      startTime: `${pad(start.getHours())}:${pad(start.getMinutes())}`,
      endTime: `${pad(end.getHours())}:${pad(end.getMinutes())}`,
      reason:
        item.type === 'Vacation' && item.label === 'Vacation' ? '' : item.label,
    };
  }
  return {
    ...emptyTimeOffForm(),
    type: item.type,
    coverage: sameDay ? 'single_day' : 'date_range',
    fromDate: dateOf(start),
    toDate: dateOf(end),
    reason:
      item.type === 'Vacation' && item.label === 'Vacation' ? '' : item.label,
  };
}
