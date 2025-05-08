'use client';

import { cn } from '@udecode/cn';
import { AIChatPlugin } from '@udecode/plate-ai/react';
import { useEditorPlugin, usePluginOption } from '@udecode/plate/react';
import { Pause } from 'lucide-react';

import { Button } from './button';

export const AILoadingBar = () => {
  const chat = usePluginOption(AIChatPlugin, 'chat');
  const mode = usePluginOption(AIChatPlugin, 'mode');

  const { status } = chat;

  const { api } = useEditorPlugin(AIChatPlugin);

  const isLoading = status === 'streaming' || status === 'submitted';

  const visible = isLoading && mode === 'insert';

  if (!visible) return null;

  return (
    <div
      className={cn(
        "'absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3 rounded-md border border-neutral-200 bg-neutral-100 px-3 py-1.5 text-sm text-neutral-500 shadow-md transition-all duration-300' dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-400"
      )}
    >
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-500 border-t-transparent dark:border-neutral-400" />
      <span>{status === 'submitted' ? 'Thinking...' : 'Writing...'}</span>
      <Button
        size="sm"
        variant="ghost"
        className="flex items-center gap-1 text-xs"
        onClick={() => api.aiChat.stop()}
      >
        <Pause className="h-4 w-4" />
        Stop
        <kbd className="ml-1 rounded bg-neutral-200 px-1 font-mono text-[10px] text-neutral-500 shadow-sm dark:bg-neutral-800 dark:text-neutral-400">
          Esc
        </kbd>
      </Button>
    </div>
  );
};
