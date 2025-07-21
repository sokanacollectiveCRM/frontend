import { Button } from '@/common/components/ui/button';
import { useSearch } from '@/common/contexts/SearchContext';
import { cn } from '@/lib/utils';
import { Search as SearchIcon } from 'lucide-react';
import * as React from 'react';

interface Props {
  className?: string;
  type?: React.HTMLInputTypeAttribute;
  placeholder?: string;
}

export function Search({ className = '', placeholder = 'Search' }: Props) {
  const { setOpen } = useSearch();
  return (
    <Button
      variant='outline'
      className={cn(
        'relative h-8 w-32 sm:w-48 md:w-64 justify-start rounded-md bg-muted/25 text-sm font-normal text-muted-foreground shadow-none hover:bg-muted/50',
        className
      )}
      onClick={() => setOpen(true)}
    >
      <SearchIcon
        aria-hidden='true'
        className='absolute left-1.5 top-1/2 -translate-y-1/2'
      />
      <span className='ml-3'>{placeholder}</span>
      <kbd className='pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex'>
        <span className='text-xs'>⌘</span>K
      </kbd>
    </Button>
  );
}
