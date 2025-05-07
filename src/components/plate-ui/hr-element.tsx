"'use client'";

import React from "'react'";

import { cn, withRef } from "'@udecode/cn'";
import {
  PlateElement,
  useFocused,
  useReadOnly,
  useSelected,
} from "'@udecode/plate/react'";

export const HrElement = withRef<typeof PlateElement>(
  ({ className, ...props }, ref) => {
    const { children } = props;

    const readOnly = useReadOnly();
    const selected = useSelected();
    const focused = useFocused();

    return (
      <PlateElement ref={ref} className={className} {...props}>
        <div className="py-6" contentEditable={false}>
          <hr
            className={cn(
              "'h-0.5 rounded-sm border-none bg-neutral-100 bg-clip-content' dark:bg-neutral-800",
              selected && focused && "'ring-2 ring-neutral-950 ring-offset-2' dark:ring-neutral-300",
              !readOnly && "'cursor-pointer'"
            )}
          />
        </div>
        {children}
      </PlateElement>
    );
  }
);
