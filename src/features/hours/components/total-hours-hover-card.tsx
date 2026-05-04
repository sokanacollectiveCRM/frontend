import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/common/components/ui/hover-card';
import { Button } from '@/common/components/ui/button';
import { formatDurationHours } from '@/features/hours/data/hour-types';

export function TotalHoursHoverCard({
  totalHours,
  prenatalHours,
  postpartumHours,
}: {
  totalHours: number;
  prenatalHours: number;
  postpartumHours: number;
}) {
  return (
    <div className='py-10'>
      <HoverCard>
        <HoverCardTrigger>
          <Button variant='link'>View total hours</Button>
        </HoverCardTrigger>
        <HoverCardContent className='space-y-2'>
          <p>
            Total number of hours:{' '}
            <span className='font-bold'>{formatDurationHours(totalHours)}</span>
          </p>
          <p>
            Prenatal hours:{' '}
            <span className='font-bold'>{formatDurationHours(prenatalHours)}</span>
          </p>
          <p>
            Postpartum hours:{' '}
            <span className='font-bold'>{formatDurationHours(postpartumHours)}</span>
          </p>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
}
