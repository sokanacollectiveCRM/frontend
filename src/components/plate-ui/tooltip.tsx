'use client';

import React from 'react';

import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { withCn, withProps } from '@udecode/cn';

import { Button } from './button';

export const TooltipProvider = withProps(TooltipPrimitive.Provider, {
  delayDuration: 0,
  disableHoverableContent: true,
  skipDelayDuration: 0,
});

export const Tooltip = TooltipPrimitive.Root;

export const TooltipTrigger = TooltipPrimitive.Trigger;

export const TooltipPortal = TooltipPrimitive.Portal;

export const TooltipContent = withCn(
  withProps(TooltipPrimitive.Content, {
    sideOffset: 4,
  }),
  'z-50 overflow-hidden rounded-md bg-black px-3 py-1.5 text-sm font-semibold text-white shadow-md'
);

type TooltipProps<T extends React.ElementType> = {
  delayDuration?: number;
  disableHoverableContent?: boolean;
  skipDelayDuration?: number;
  tooltip?: React.ReactNode;
  tooltipContentProps?: Omit<
    React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>,
    'children'
  >;
  tooltipProps?: Omit<
    React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Root>,
    'children'
  >;
  tooltipTriggerProps?: React.ComponentPropsWithoutRef<
    typeof TooltipPrimitive.Trigger
  >;
} & React.ComponentProps<T>;

export function withTooltip<T extends React.ElementType>(
  Component: T
) {
  type Props = React.ComponentPropsWithRef<T> & {
    tooltip?: React.ReactNode;
    tooltipContentProps?: Omit<
      React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>,
      'children'
    >;
    tooltipProps?: Omit<
      React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Root>,
      'children'
    >;
    tooltipTriggerProps?: React.ComponentPropsWithoutRef<
      typeof TooltipPrimitive.Trigger
    >;
    delayDuration?: number;
    disableHoverableContent?: boolean;
    skipDelayDuration?: number;
  };

  const Wrapped = React.forwardRef<any, Props>(({
    tooltip,
    tooltipContentProps,
    tooltipProps,
    tooltipTriggerProps,
    delayDuration = 0,
    disableHoverableContent = true,
    skipDelayDuration = 0,
    ...props
  }, ref) => {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
      setMounted(true);
    }, []);

    const component = React.createElement(Component, { ...props, ref });

    if (tooltip && mounted) {
      return (
        <TooltipProvider
          delayDuration={delayDuration}
          disableHoverableContent={disableHoverableContent}
          skipDelayDuration={skipDelayDuration}
        >
          <Tooltip {...tooltipProps}>
            <TooltipTrigger asChild {...tooltipTriggerProps}>
              {component}
            </TooltipTrigger>
            <TooltipPortal>
              <TooltipContent {...tooltipContentProps}>
                {tooltip}
              </TooltipContent>
            </TooltipPortal>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return component;
  });

  const name =
    typeof Component === 'string'
      ? Component
      : Component.displayName || Component.name || 'Component';

  Wrapped.displayName = `WithTooltip(${name})`;

  return Wrapped;
}

export const TooltipButton = withTooltip(Button);
