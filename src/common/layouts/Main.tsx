import { cn } from '@/lib/utils';
import React from 'react';

interface MainProps extends React.HTMLAttributes<HTMLElement> {
  fixed?: boolean;
  ref?: React.Ref<HTMLElement>;
}

export const Main = ({ fixed, ...props }: MainProps) => {
  return (
    <main
      className={cn(
        'peer-[.header-fixed]/header:mt-16',
        'w-full max-w-screen h-full max-h-screen overflow-x-hidden px-4 py-6',
        fixed && 'fixed-main flex h-full flex-grow min-h-0 flex-col overflow-hidden'
      )}
      {...props}
    />
  );
};

Main.displayName = 'Main';
