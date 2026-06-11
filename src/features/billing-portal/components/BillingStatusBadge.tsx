import { Badge } from '@/common/components/ui/badge';

const STATUS_CLASSNAMES: Record<string, string> = {
  paid: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  succeeded: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  successful: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  processing: 'bg-amber-100 text-amber-800 border-amber-200',
  overdue: 'bg-orange-100 text-orange-800 border-orange-200',
  failed: 'bg-rose-100 text-rose-800 border-rose-200',
  cancelled: 'bg-rose-100 text-rose-800 border-rose-200',
  active: 'bg-sky-100 text-sky-800 border-sky-200',
  signed: 'bg-sky-100 text-sky-800 border-sky-200',
  sent: 'bg-violet-100 text-violet-800 border-violet-200',
  completed: 'bg-slate-100 text-slate-800 border-slate-200',
};

export function BillingStatusBadge({ value }: { value?: string | null }) {
  const normalized = (value || 'unknown').toLowerCase();
  const className = STATUS_CLASSNAMES[normalized] || 'bg-muted text-foreground';

  return (
    <Badge variant='outline' className={className}>
      {(value || 'Unavailable').replace(/_/g, ' ')}
    </Badge>
  );
}
