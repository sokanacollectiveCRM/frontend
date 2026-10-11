import { useState } from 'react';
import { Copy, Plus, Trash2 } from 'lucide-react';

import { Button } from '@/common/components/ui/button';
import { Checkbox } from '@/common/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/common/components/ui/dialog';
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import {
  WEEKDAY_LABELS,
  WEEKDAY_ORDER,
  WEEKDAYS,
  WEEKLY_HOURS_HORIZON_WEEKS,
  copyDayToDays,
  emptyTimeRange,
  weekdaySlug,
  type TimeRange,
  type WeekdayHours,
} from '@/features/scheduling/weeklyHours';

interface WeeklyHoursEditorProps {
  hours: WeekdayHours[];
  onChange: (hours: WeekdayHours[]) => void;
  onSave: () => void;
  isSaving: boolean;
}

export function WeeklyHoursEditor({
  hours,
  onChange,
  onSave,
  isSaving,
}: WeeklyHoursEditorProps) {
  const [copySource, setCopySource] = useState<number | null>(null);
  const [copyTargets, setCopyTargets] = useState<number[]>([]);

  const updateDay = (weekday: number, next: Partial<WeekdayHours>) => {
    onChange(
      hours.map((day) => (day.weekday === weekday ? { ...day, ...next } : day))
    );
  };

  const updateRange = (
    weekday: number,
    index: number,
    next: Partial<TimeRange>
  ) => {
    onChange(
      hours.map((day) => {
        if (day.weekday !== weekday) return day;
        return {
          ...day,
          ranges: day.ranges.map((range, rangeIndex) =>
            rangeIndex === index ? { ...range, ...next } : range
          ),
        };
      })
    );
  };

  const openCopy = (weekday: number) => {
    setCopySource(weekday);
    setCopyTargets([]);
  };

  const applyCopy = () => {
    if (copySource === null) return;
    onChange(copyDayToDays(hours, copySource, copyTargets));
    setCopySource(null);
  };

  return (
    <div className='space-y-4' data-testid='weekly-hours-editor'>
      <p className='text-sm text-muted-foreground'>
        Set the hours you usually work. Saving posts the next{' '}
        {WEEKLY_HOURS_HORIZON_WEEKS} weeks and replaces older open windows. Time
        off and booked visits stay put.
      </p>
      <div className='space-y-3'>
        {WEEKDAY_ORDER.map((weekday) => {
          const day = hours.find((entry) => entry.weekday === weekday);
          if (!day) return null;
          const slug = weekdaySlug(weekday);
          return (
            <div
              key={weekday}
              className='rounded-lg border p-3'
              data-testid={`weekday-row-${slug}`}
            >
              <div className='flex flex-wrap items-center justify-between gap-3'>
                <label className='flex items-center gap-2 text-sm font-medium'>
                  <Checkbox
                    checked={day.enabled}
                    onCheckedChange={(checked) =>
                      updateDay(weekday, {
                        enabled: checked === true,
                        ranges:
                          day.ranges.length > 0
                            ? day.ranges
                            : [emptyTimeRange()],
                      })
                    }
                    data-testid={`weekday-enabled-${slug}`}
                    aria-label={`${WEEKDAY_LABELS[weekday]} available`}
                  />
                  {WEEKDAY_LABELS[weekday]}
                </label>
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  disabled={!day.enabled}
                  onClick={() => openCopy(weekday)}
                  data-testid={`copy-${slug}`}
                  aria-label={`Copy ${WEEKDAY_LABELS[weekday]} to other days`}
                >
                  <Copy className='mr-1 h-4 w-4' />
                  Copy
                </Button>
              </div>
              {day.enabled ? (
                <div className='mt-3 space-y-2'>
                  {day.ranges.map((range, index) => (
                    <div
                      key={`${weekday}-${index}`}
                      className='flex flex-wrap items-end gap-2'
                    >
                      <div className='space-y-1'>
                        <Label
                          htmlFor={`range-start-${slug}-${index}`}
                          className='text-xs'
                        >
                          From
                        </Label>
                        <Input
                          id={`range-start-${slug}-${index}`}
                          type='time'
                          value={range.start}
                          onChange={(event) =>
                            updateRange(weekday, index, {
                              start: event.target.value,
                            })
                          }
                          data-testid={`range-start-${slug}-${index}`}
                        />
                      </div>
                      <div className='space-y-1'>
                        <Label
                          htmlFor={`range-end-${slug}-${index}`}
                          className='text-xs'
                        >
                          To
                        </Label>
                        <Input
                          id={`range-end-${slug}-${index}`}
                          type='time'
                          value={range.end}
                          onChange={(event) =>
                            updateRange(weekday, index, {
                              end: event.target.value,
                            })
                          }
                          data-testid={`range-end-${slug}-${index}`}
                        />
                      </div>
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        aria-label={`Remove ${WEEKDAY_LABELS[weekday]} range ${index + 1}`}
                        disabled={day.ranges.length === 1}
                        onClick={() =>
                          updateDay(weekday, {
                            ranges: day.ranges.filter(
                              (_, rangeIndex) => rangeIndex !== index
                            ),
                          })
                        }
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      updateDay(weekday, {
                        ranges: [...day.ranges, emptyTimeRange()],
                      })
                    }
                  >
                    <Plus className='mr-1 h-4 w-4' />
                    Add range
                  </Button>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      <Button
        type='button'
        onClick={onSave}
        disabled={isSaving}
        data-testid='save-weekly-hours'
      >
        {isSaving ? 'Saving weekly hours...' : 'Save weekly hours'}
      </Button>

      <Dialog
        open={copySource !== null}
        onOpenChange={(open) => {
          if (!open) setCopySource(null);
        }}
      >
        <DialogContent data-testid='copy-days-dialog'>
          <DialogHeader>
            <DialogTitle>Copy to other days</DialogTitle>
            <DialogDescription>
              Apply {copySource !== null ? WEEKDAY_LABELS[copySource] : 'these'}{' '}
              hours to the days you select.
            </DialogDescription>
          </DialogHeader>
          <button
            type='button'
            className='text-left text-sm font-medium text-primary'
            data-testid='copy-all-weekdays'
            onClick={() =>
              setCopyTargets(
                WEEKDAYS.filter((day) => day !== copySource).map(Number)
              )
            }
          >
            Select all weekdays
          </button>
          <div className='grid gap-2'>
            {WEEKDAY_ORDER.filter((day) => day !== copySource).map((day) => (
              <label key={day} className='flex items-center gap-2 text-sm'>
                <Checkbox
                  checked={copyTargets.includes(day)}
                  onCheckedChange={(checked) =>
                    setCopyTargets((current) =>
                      checked === true
                        ? [...current, day]
                        : current.filter((value) => value !== day)
                    )
                  }
                  data-testid={`copy-target-${weekdaySlug(day)}`}
                />
                {WEEKDAY_LABELS[day]}
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button
              type='button'
              onClick={applyCopy}
              data-testid='apply-copy-days'
            >
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
