import { Button } from '@/common/components/ui/button';
import { Textarea } from '@/common/components/ui/textarea';
import { SquarePlus } from 'lucide-react';
import * as React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/common/components/ui/sheet';
import { DateTimePicker } from './time-date-pick';
import { ClientsPicker } from './clients-picker';
import addWorkSession from '@/common/utils/addWorkSession';
import { useUser } from '@/common/hooks/user/useUser';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/common/components/ui/select';
import { hourTypeOptions } from '@/features/hours/data/hour-types';

export function UsersPrimaryButtons() {
  const [startDate, setStartDate] = React.useState<Date>(new Date());
  const [endDate, setEndDate] = React.useState<Date>(new Date());
  const [hoursWorked, setHoursWorked] = React.useState<number>(0);
  const [client, setClient] = React.useState<any>();
  const [error, setError] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(false);
  const [note, setNote] = React.useState<string>('');
  const [type, setType] = React.useState<'prenatal' | 'postpartum' | ''>('');
  const { user } = useUser();

  async function handleSave() {
    setError(null);

    if (!startDate) {
      setError('Please select a start time');
      return;
    }

    if (!endDate) {
      setError('Please select an end time');
      return;
    }

    if (!client) {
      setError('Please select a client');
      return;
    }

    if (!type) {
      setError('Please select an hour type');
      return;
    }

    if (endDate.getTime() - startDate.getTime() <= 0) {
      setError('End time must be after start time');
      return;
    }
    try {
      await addWorkSession(
        user?.id,
        client.user.id,
        startDate,
        endDate,
        note,
        type
      );
      setOpen(false);
      setType('');
    } catch (error) {
      console.error(error);
    }
  }

  React.useEffect(() => {
    if (startDate && endDate) {
      const oneHour = 60 * 60 * 1000; // milliseconds in one hour
      const diffInMilliseconds = endDate?.getTime() - startDate.getTime();
      const hoursWorked =
        Math.round((diffInMilliseconds / oneHour) * 100) / 100;
      setHoursWorked(hoursWorked);
    } else {
      setHoursWorked(0);
    }
  }, [startDate, endDate]);

  return (
    <div className='flex gap-2'>
      <Sheet
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) {
            setType('');
          }
        }}
      >
        <SheetTrigger asChild>
          <Button className='space-x-1'>
            <span>Add Hours</span> <SquarePlus size={18} />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle className='text-2xl font-bold'>Add Hours</SheetTitle>
            <SheetDescription>
              Please enter your start and end time
            </SheetDescription>
          </SheetHeader>
          {error && (
            <div
              className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4'
              role='alert'
            >
              <p>{error}</p>
            </div>
          )}
          <div className='flex flex-col gap-10 justify-center items-center mt-10'>
            <div className='items-center flex items-center justify-center'>
              <div className='flex flex-col gap-10'>
                <div className='flex flex-col items-center'>
                  <h1 className='text-lg'>
                    Who is your <span className='font-bold'>client</span>?
                  </h1>
                  <ClientsPicker client={client} setClient={setClient} />
                </div>
                <div className='flex flex-col items-center'>
                  <h1 className='text-lg'>
                    Hours worked:{' '}
                    <span className='font-bold'>{hoursWorked}</span> hours
                  </h1>
                </div>
                <div className='flex flex-col items-center'>
                  <h1 className='text-lg'>
                    Hour type <span className='font-bold text-red-600'>*</span>
                  </h1>
                  <Select
                    value={type || undefined}
                    onValueChange={(value) =>
                      setType(value as 'prenatal' | 'postpartum')
                    }
                  >
                    <SelectTrigger className='w-full min-w-56'>
                      <SelectValue placeholder='Select hour type' />
                    </SelectTrigger>
                    <SelectContent>
                      {hourTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className='flex flex-col items-center'>
                  <h1 className='text-lg'>
                    When did you <span className='font-bold'>start</span> work?
                  </h1>
                  <DateTimePicker date={startDate} setDate={setStartDate} />
                </div>
                <div className='flex flex-col items-center'>
                  <h1 className='text-lg'>
                    When did you <span className='font-bold'>end</span> work?
                  </h1>
                  <DateTimePicker date={endDate} setDate={setEndDate} />
                </div>
                <div className='flex flex-col items-center'>
                  <h1 className='text-lg'>Add notes?</h1>
                  <Textarea
                    placeholder='Type your notes here.'
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
          <SheetFooter>
            <Button type='submit' onClick={handleSave}>
              Add Hours
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
