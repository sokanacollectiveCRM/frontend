import { Button } from '@/common/components/ui/button';
import { Card } from '@/common/components/ui/card';
import { Checkbox } from '@/common/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/common/components/ui/popover';
import { DateTimePicker } from '@/features/hours/components/time-date-pick';
import { Clock, Plus } from 'lucide-react';
import { useState } from 'react';

const mockSessions = [
  {
    date: 'May 2, 2025',
    duration: '1h 30m',
    type: 'Prenatal Visit',
    notes: 'Discussed birth plan and preferences',
  },
  {
    date: 'May 1, 2025',
    duration: '45m',
    type: 'Phone Consultation',
    notes: 'Answered questions about labor positions',
  },
  {
    date: 'Apr 30, 2025',
    duration: '2h',
    type: 'Home Visit',
    notes: 'Practiced breathing techniques and comfort measures',
  },
];

export default function TimeTab() {
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [isBillable, setIsBillable] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = () => {
    setIsOpen(false);
  };

  return (
    <div className='space-y-6'>
      <div className='bg-white p-6 rounded-2xl shadow-md'>
        <div className='flex justify-between items-center mb-6'>
          <h3 className='text-lg font-semibold'>Time Tracking</h3>
          <div className='flex items-center gap-4'>
            <div className='text-sm text-muted-foreground'>
              Total Hours:{' '}
              <span className='font-semibold text-primary'>12h 30m</span>
            </div>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant='outline'
                  className='text-primary border-primary/20 hover:bg-primary/10'
                >
                  <Plus className='w-4 h-4 mr-2' />
                  Add Time
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-auto p-4' align='end'>
                <div className='space-y-4'>
                  <div className='space-y-2'>
                    <label className='text-sm font-medium'>Start Time</label>
                    <DateTimePicker date={startDate} setDate={setStartDate} />
                  </div>
                  <div className='space-y-2'>
                    <label className='text-sm font-medium'>End Time</label>
                    <DateTimePicker date={endDate} setDate={setEndDate} />
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Checkbox
                      id='billable'
                      checked={isBillable}
                      onCheckedChange={(checked) =>
                        setIsBillable(checked as boolean)
                      }
                    />
                    <label htmlFor='billable' className='text-sm font-medium'>
                      Billable
                    </label>
                  </div>
                  <Button onClick={handleSave} className='w-full'>
                    Save Time
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className='space-y-4'>
          <h4 className='text-sm font-medium text-muted-foreground'>
            Recent Sessions
          </h4>
          <div className='space-y-3'>
            {mockSessions.map((session, index) => (
              <Card
                key={index}
                className='p-4 hover:bg-muted/50 transition-colors'
              >
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-4'>
                    <div className='p-2 bg-primary/10 rounded-lg'>
                      <Clock className='w-4 h-4 text-primary' />
                    </div>
                    <div>
                      <p className='font-medium text-sm'>{session.type}</p>
                      <p className='text-xs text-muted-foreground'>
                        {session.date}
                      </p>
                    </div>
                  </div>
                  <div className='text-right'>
                    <p className='font-medium text-sm text-primary'>
                      {session.duration}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      {session.notes}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
