import { ContractTemplate } from '@/features/clients/data/schema';
import { useDraggable } from '@dnd-kit/core';

export const mockTemplates: ContractTemplate[] = [
  { id: '1', title: 'Retainer Agreement' },
  { id: '2', title: 'Design Services' }
]

export function TemplateSidebar({ isVisible }: { isVisible: boolean }) {
  if (!isVisible) return null;

  return (
    <div className="w-[240px] shrink-0 border-r bg-muted/50 p-4 overflow-y-auto">
      <h3 className="text-sm font-medium text-muted-foreground mb-2">Templates</h3>
      <div className="space-y-1">
        {mockTemplates.map((template) => (
          <DraggableTemplate key={template.id} template={template} />
        ))}
      </div>
    </div>
  );
}

export function DraggableTemplate({ template }: { template: ContractTemplate }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `template-${template.id}`,
    data: { type: 'template', template },
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className="cursor-grab select-none z-[0] rounded px-2 py-1 text-sm bg-white border hover:bg-accent"
    >
      📄 {template.title}
    </div>
  );
}