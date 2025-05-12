import { ContractTemplate } from '@/features/clients/data/schema';
import { cn } from '@/lib/utils';
import { useDraggable } from '@dnd-kit/core';

export const mockTemplates: ContractTemplate[] = [
  { id: '1', title: 'Retainer Agreement' },
  { id: '2', title: 'Design Services' }
]

interface DraggableTemplateProps {
  template: ContractTemplate
  className?: string
}

export function DraggableTemplate({ template, className }: DraggableTemplateProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `template-${template.id}`,
    data: { type: 'template', template },
  })

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      data-slot="draggable-template"
      className={cn(
        'relative flex cursor-grab select-none items-center gap-2 rounded-sm bg-white px-2 py-1.5 text-sm transition-colors hover:bg-accent',
        '[&_svg:not([class*="text-"])]:text-muted-foreground',
        '[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4',
        className
      )}
    >
      {template.title}
    </div>
  )
}