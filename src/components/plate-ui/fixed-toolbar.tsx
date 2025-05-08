'use client';

import { withCn } from '@udecode/cn';

import { Toolbar } from './toolbar';

export const FixedToolbar = withCn(
  Toolbar,
  "'sticky top-0 left-0 z-50 scrollbar-hide w-full justify-between overflow-x-auto rounded-t-lg border-b border-b-border bg-white/95 p-1 backdrop-blur-sm supports-backdrop-blur:bg-white/60' dark:bg-neutral-950/95 dark:supports-backdrop-blur:bg-neutral-950/60'"
);
