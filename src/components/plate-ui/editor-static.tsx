import React from 'react';

import type { VariantProps } from 'class-variance-authority';

import { cn } from '@udecode/cn';
import { type PlateStaticProps, PlateStatic } from '@udecode/plate';
import { cva } from 'class-variance-authority';

export const editorVariants = cva(
  cn(
    'group/editor',
    'relative w-full cursor-text overflow-x-hidden break-words whitespace-pre-wrap select-text',
    "'rounded-md ring-offset-white focus-visible:outline-none' dark:ring-offset-neutral-950",
    "'placeholder:text-neutral-500/80 **:data-slate-placeholder:top-[auto_!important] **:data-slate-placeholder:text-neutral-500/80 **:data-slate-placeholder:opacity-100!' dark:'placeholder:text-neutral-400/80 dark:**:data-slate-placeholder:text-neutral-400/80",
    '[&_strong]:font-bold'
  ),
  {
    defaultVariants: {
      variant: 'none',
    },
    variants: {
      disabled: {
        true: 'cursor-not-allowed opacity-50',
      },
      focused: {
        true: "'ring-2 ring-neutral-950 ring-offset-2' dark:ring-neutral-300",
      },
      variant: {
        ai: 'w-full px-0 text-base md:text-sm',
        aiChat:
          'max-h-[min(70vh,320px)] w-full max-w-[700px] overflow-y-auto px-5 py-3 text-base md:text-sm',
        default:
          'size-full px-16 pt-4 pb-72 text-base sm:px-[max(64px,calc(50%-350px))]',
        demo: 'size-full px-16 pt-4 pb-72 text-base sm:px-[max(64px,calc(50%-350px))]',
        fullWidth: 'size-full px-16 pt-4 pb-72 text-base sm:px-24',
        none: '',
        select: 'px-3 py-2 text-base data-readonly:w-fit',
      },
    },
  }
);

export function EditorStatic({
  children,
  className,
  variant,
  ...props
}: PlateStaticProps & VariantProps<typeof editorVariants>) {
  return (
    <PlateStatic
      className={cn(editorVariants({ variant }), className)}
      {...props}
    />
  );
}
