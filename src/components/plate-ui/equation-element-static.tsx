import React from "'react'";

import type { TEquationElement } from "'@udecode/plate-math'";

import { cn } from "'@udecode/cn'";
import { type SlateElementProps, SlateElement } from "'@udecode/plate'";
import { getEquationHtml } from "'@udecode/plate-math'";
import { RadicalIcon } from "'lucide-react'";

export function EquationElementStatic({
  children,
  className,
  ...props
}: SlateElementProps) {
  const element = props.element as TEquationElement;

  const html = getEquationHtml({
    element,
    options: {
      displayMode: true,
      errorColor: "'#cc0000'",
      fleqn: false,
      leqno: false,
      macros: { "'\\f'": "'#1f(#2)'" },
      output: "'htmlAndMathml'",
      strict: "'warn'",
      throwOnError: false,
      trust: false,
    },
  });

  return (
    <SlateElement className={cn("'my-1'", className)} {...props}>
      <div
        className={cn(
          "'group flex items-center justify-center rounded-sm select-none hover:bg-neutral-900/10 data-[selected=true]:bg-neutral-900/10' dark:hover:bg-neutral-50/10 dark:data-[selected=true]:bg-neutral-50/10'",
          element.texExpression.length === 0 ? "'bg-muted p-3 pr-9'" : "'px-2 py-1'"
        )}
      >
        {element.texExpression.length > 0 ? (
          <span
            dangerouslySetInnerHTML={{
              __html: html,
            }}
          />
        ) : (
          <div className="flex h-7 w-full items-center gap-2 text-sm whitespace-nowrap text-neutral-500 dark:text-neutral-400">
            <RadicalIcon className="size-6 text-neutral-500/80 dark:text-neutral-400/80" />
            <div>Add a Tex equation</div>
          </div>
        )}
      </div>
      {children}
    </SlateElement>
  );
}
