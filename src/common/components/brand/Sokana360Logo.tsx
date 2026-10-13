import { Building2 } from 'lucide-react';

type Sokana360LogoProps = {
  variant?: 'full' | 'mark';
  className?: string;
  alt?: string;
};

export function Sokana360Logo({
  variant = 'full',
  className,
  alt = 'Sokana360',
}: Sokana360LogoProps) {
  const src =
    variant === 'mark' ? '/sokana360-mark.png' : '/sokana360-logo.png';
  return <img src={src} alt={alt} className={className} />;
}

/** Shared sign-in mark. Organization logos stay inside the signed-in app. */
export function AuthFormLogo({
  placement = 'card',
}: {
  placement?: 'card' | 'header';
}) {
  const mark = (
    <div
      className={
        placement === 'header'
          ? 'flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-foreground'
          : 'flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-foreground'
      }
      aria-hidden='true'
    >
      <Building2 className={placement === 'header' ? 'h-5 w-5' : 'h-6 w-6'} />
    </div>
  );
  const name = (
    <span className='text-lg font-semibold tracking-tight text-foreground'>
      Cove
    </span>
  );

  if (placement === 'header') {
    return (
      <div className='flex items-center gap-2'>
        {mark}
        {name}
      </div>
    );
  }

  return (
    <div className='mx-auto mb-2 flex flex-col items-center gap-2'>
      {mark}
      {name}
    </div>
  );
}
