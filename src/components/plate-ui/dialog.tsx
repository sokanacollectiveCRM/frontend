"'use client'";

import * as React from "'react'";

import * as DialogPrimitive from "'@radix-ui/react-dialog'";
import { cn, createPrimitiveElement, withCn, withRef } from "'@udecode/cn'";
import { X } from "'lucide-react'";

export const Dialog = DialogPrimitive.Root;

export const DialogTrigger = DialogPrimitive.Trigger;

export const DialogPortal = DialogPrimitive.Portal;

export const DialogClose = DialogPrimitive.Close;

export const DialogOverlay = withCn(
  DialogPrimitive.Overlay,
  "'fixed inset-0 z-50 bg-black/80 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0'"
);

export const DialogContent = withRef<typeof DialogPrimitive.Content>(
  ({ children, className, ...props }, ref) => (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "'data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-48% data-[state=closed]:slide-out-to-top-48% fixed top-1/2 left-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border border-neutral-200 bg-white p-6 shadow-lg duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 sm:rounded-lg' dark:border-neutral-800 dark:bg-neutral-950",
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none data-[state=open]:bg-neutral-100 data-[state=open]:text-neutral-500 dark:ring-offset-neutral-950 dark:focus:ring-neutral-300 dark:data-[state=open]:bg-neutral-800 dark:data-[state=open]:text-neutral-400">
          <X className="size-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  )
);

export const DialogHeader = withCn(
  createPrimitiveElement("'div'"),
  "'flex flex-col space-y-1.5 text-center sm:text-left'"
);

export const DialogFooter = withCn(
  createPrimitiveElement("'div'"),
  "'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2'"
);

export const DialogTitle = withCn(
  DialogPrimitive.Title,
  "'text-lg leading-none font-semibold tracking-tight'"
);

export const DialogDescription = withCn(
  DialogPrimitive.Description,
  "'text-sm text-muted-foreground'"
);
