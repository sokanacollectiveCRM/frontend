// src/common/components/form/SubmitButton.tsx
import { Button } from '@/common/components/ui/button'
import { ButtonHTMLAttributes, ReactNode } from 'react'

export interface SubmitButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  loading?: boolean            // optional spinner flag
}

export default function SubmitButton({
  children,
  loading,
  ...rest                       // includes onClick, type, disabled, etc.
}: SubmitButtonProps) {
  return (
    <Button
      {...rest}
      disabled={rest.disabled || loading}   // auto-disable while loading
    >
      {loading ? 'Loading…' : children}
    </Button>
  )
}
