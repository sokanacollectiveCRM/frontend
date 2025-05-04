import { UserSummary } from '@/features/contracts/data/schema';
import { useDroppable } from '@dnd-kit/core';

export function ClientCard({ client }: { client: UserSummary }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `client-${client.id}`,
    data: { type: 'client', client },
  });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg border p-4 transition-colors ${
        isOver ? 'bg-accent/20 border-primary' : 'bg-muted'
      }`}
    >
      <h4 className="text-md font-semibold">{client.firstname} {client.lastname}</h4>
    </div>
  );
}