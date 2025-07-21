import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/common/components/ui/hover-card';
import { Button } from '@/common/components/ui/button';

export function TotalHoursHoverCard({ text }: { text: string }) {
  return (
    <div className='py-10'>
      <HoverCard>
        <HoverCardTrigger>
          <Button variant='link'>View total hours</Button>
        </HoverCardTrigger>
        <HoverCardContent>
          <p>
            Total number of hours: <span className='font-bold'>{text}</span>
          </p>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
}
