import React from 'react';

import { withVariants } from '@udecode/cn';
import { type VariantProps, cva } from 'class-variance-authority';

export const inputVariants = cva(
  "'flex w-full rounded-md bg-transparent text-base file:border-0 file:bg-white file:text-sm file:font-medium file:text-neutral-950 placeholder:text-neutral-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm' dark:file:bg-neutral-950 dark:file:text-neutral-50 dark:placeholder:text-neutral-400",
  {
    defaultVariants: {
      h: 'md',
      variant: 'default',
    },
    variants: {
      h: {
        md: 'h-10 px-3 py-2',
        sm: 'h-[28px] px-1.5 py-1',
      },
      variant: {
        default:
          "'border border-neutral-200 ring-offset-white focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2' dark:border-neutral-800 dark:ring-offset-neutral-950 dark:focus-visible:ring-neutral-300",
        ghost: 'border-none focus-visible:ring-transparent',
      },
    },
  }
);

export type InputProps = React.ComponentPropsWithoutRef<'input'> &
  VariantProps<typeof inputVariants>;

export const Input = withVariants('input', inputVariants, ['variant', 'h']);

export type FloatingInputProps = InputProps & {
  label: string;
};

export function FloatingInput({
  id,
  className,
  label,
  ...props
}: FloatingInputProps) {
  return (
    <>
      <label
        className="absolute top-1/2 block -translate-y-1/2 cursor-text px-1 text-sm text-neutral-500/70 transition-all group-focus-within:pointer-events-none group-focus-within:top-0 group-focus-within:cursor-default group-focus-within:text-xs group-focus-within:font-medium group-focus-within:text-neutral-950 has-[+input:not(:placeholder-shown)]:pointer-events-none has-[+input:not(:placeholder-shown)]:top-0 has-[+input:not(:placeholder-shown)]:cursor-default has-[+input:not(:placeholder-shown)]:text-xs has-[+input:not(:placeholder-shown)]:font-medium has-[+input:not(:placeholder-shown)]:text-neutral-950 dark:text-neutral-400/70 dark:group-focus-within:text-neutral-50 dark:has-[+input:not(:placeholder-shown)]:text-neutral-50"
        htmlFor={id}
      >
        <span className="inline-flex bg-white px-2 dark:bg-neutral-950">{label}</span>
      </label>
      <Input id={id} className={className} placeholder="" {...props} />
    </>
  );
}
