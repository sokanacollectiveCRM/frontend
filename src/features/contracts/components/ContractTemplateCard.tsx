import { ContractTemplate } from '@/features/contracts/data/schema';
import { useDraggable } from '@dnd-kit/core';

export function ContractTemplateCard({ template }: { template: ContractTemplate }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `template-${template.id}`,
    data: { type: 'template', template },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className="cursor-grab rounded-lg border bg-white p-4 shadow-md hover:shadow-lg transition"
    >
      <h4 className="text-md font-semibold">{template.title}</h4>
    </div>
  );
}
