export default function DemographicsPage() {
  return (
    <div className="flex flex-col p-4 min-h-0 overflow-auto">
      <div className="mb-4 shrink-0">
        <h1 className="text-2xl font-bold tracking-tight">Demographics</h1>
        <p className="text-muted-foreground mt-1">
          Demographics analytics and reporting.
        </p>
      </div>
      <div className="flex-1 flex items-center justify-center rounded-xl border border-dashed bg-muted/30 p-12 text-muted-foreground">
        <p className="text-sm">No demographics data available yet.</p>
      </div>
    </div>
  );
}
