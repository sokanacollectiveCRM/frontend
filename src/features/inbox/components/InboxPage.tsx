import { Button } from '@/common/components/ui/button';
import { ScrollArea } from '@/common/components/ui/scroll-area';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const messagesMock = Array.from({ length: 42 }, (_, i) => ({
  id: i + 1,
  from: `user${i + 1}@example.com`,
  subject: `Notification ${i + 1}`,
  body: `This is the content of notification ${i + 1}.`,
}));

const PAGE_SIZE = 10;

export default function InboxPage() {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(messagesMock.length / PAGE_SIZE);
  const paginatedMessages = messagesMock.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  return (
    <div className='p-6'>
      <ScrollArea className='h-[70vh] border rounded-md'>
        <div className='divide-y'>
          {paginatedMessages.map((msg) => (
            <div
              key={msg.id}
              className='px-4 py-3 hover:bg-muted cursor-pointer'
            >
              <div className='font-medium text-sm'>{msg.subject}</div>
              <div className='text-xs text-muted-foreground truncate'>
                {msg.body}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className='flex justify-between items-center mt-4'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          <ChevronLeft className='w-4 h-4 mr-1' /> Previous
        </Button>
        <div className='text-sm text-muted-foreground'>
          Page {page} of {totalPages}
        </div>
        <Button
          variant='outline'
          size='sm'
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
        >
          Next <ChevronRight className='w-4 h-4 ml-1' />
        </Button>
      </div>
    </div>
  );
}
