/** Shared Sokana360 mark for public auth screens. */
export function AuthFormLogo({ className }: { className?: string }) {
  return (
    <img
      src='/sokana360-logo.png'
      alt='Sokana360'
      className={className ?? 'mx-auto mb-2 h-12 w-auto'}
    />
  );
}

export default AuthFormLogo;
