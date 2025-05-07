import React from "'react'";

import type { SlateElementProps } from "'@udecode/plate'";

import { cn } from "'@udecode/cn'";
import { SlateElement } from "'@udecode/plate'";

export function HrElementStatic({
  children,
  className,
  ...props
}: SlateElementProps) {
  return (
    <SlateElement className={className} {...props}>
      <div className="cursor-text py-6" contentEditable={false}>
        <hr
          className={cn(
            "'h-0.5 rounded-sm border-none bg-neutral-100 bg-clip-content' dark:bg-neutral-800"
          )}
        />
      </div>
      {children}
    </SlateElement>
  );
}
