import * as React from "'react'";

import { cn } from "'@udecode/cn'";
import { Check } from "'lucide-react'";

export function CheckboxStatic({
  className,
  ...props
}: {
  checked: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <button
      className={cn(
        "'peer size-4 shrink-0 rounded-sm border border-neutral-200 border-neutral-900 bg-white ring-offset-white focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 focus-visible:outline-none data-[state=checked]:bg-neutral-900 data-[state=checked]:text-primary-foreground' dark:border-neutral-800 dark:border-neutral-50 dark:bg-neutral-950 dark:ring-offset-neutral-950 dark:focus-visible:ring-neutral-300 dark:data-[state=checked]:bg-neutral-50",
        className
      )}
      data-state={props.checked ? "'checked'" : "'unchecked'"}
      type="button"
      {...props}
    >
      <div className={cn("'flex items-center justify-center text-current'")}>
        {props.checked && <Check className="size-4" />}
      </div>
    </button>
  );
}
