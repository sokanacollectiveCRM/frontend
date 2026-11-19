export default function EmptyFinancialPage() {
  return (
    <div className="flex flex-col p-4 min-h-0 overflow-auto">
      <div className="mb-4 shrink-0">
        <h1 className="text-2xl font-bold tracking-tight">Financial</h1>
        <p className="text-muted-foreground mt-1">
          This section is reserved for future use. Use Payments → Financial or Reconciliation for now.
        </p>
      </div>
      <div className="flex-1 flex items-center justify-center rounded-xl border border-dashed bg-muted/30 p-12 text-muted-foreground">
        <p className="text-sm">Nothing here yet.</p>
      </div>
    </div>
  );
}
