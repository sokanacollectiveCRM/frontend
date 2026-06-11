export function AccessDenied({
  title = 'Access denied',
  description = 'You do not have permission to view this page.',
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className='flex min-h-[40vh] items-center justify-center p-6'>
      <div className='max-w-lg rounded-xl border bg-card p-8 text-center shadow-sm'>
        <h1 className='text-2xl font-semibold tracking-tight'>{title}</h1>
        <p className='mt-3 text-sm text-muted-foreground'>{description}</p>
      </div>
    </div>
  );
}
