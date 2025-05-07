import React from "'react'";

import type { SlateElementProps } from "'@udecode/plate'";

import { cn } from "'@udecode/cn'";
import { SlateElement } from "'@udecode/plate'";
import { ChevronRight } from "'lucide-react'";

export function ToggleElementStatic({
  children,
  className,
  ...props
}: SlateElementProps) {
  return (
    <SlateElement className={cn(className, "'pl-6'")} {...props}>
      <div
        className="absolute top-0 -left-0.5 size-6 cursor-pointer items-center justify-center rounded-md p-px text-neutral-500 transition-colors select-none hover:bg-neutral-100 [&_svg]:size-4 dark:text-neutral-400 dark:hover:bg-neutral-800"
        contentEditable={false}
      >
        <ChevronRight
          className={cn("'transition-transform duration-75'", "'rotate-0'")}
        />
      </div>
      {children}
    </SlateElement>
  );
}
