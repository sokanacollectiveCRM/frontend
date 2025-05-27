import { Template } from '@/common/types/template';
import { cn } from '@/lib/utils';
import { useDraggable } from '@dnd-kit/core';
import { File } from 'lucide-react';
import { useState } from 'react';

interface DraggableTemplateProps {
  template: Template;
  className?: string;
}

export function DraggableTemplate({ template, className }: DraggableTemplateProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `template-${template.id}`,
    data: { type: 'template', template },
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  const [isHoveringRow, setIsHoveringRow] = useState(false);
  const [isHoveringActions, setIsHoveringActions] = useState(false);

  const showRowHover = isHoveringRow && !isHoveringActions;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      onMouseEnter={() => setIsHoveringRow(true)}
      onMouseLeave={() => setIsHoveringRow(false)}
      className={cn(
        'relative flex items-center justify-between w-full rounded-md border px-3 text-sm transition-colors h-12 cursor-grab select-none',
        showRowHover ? 'bg-muted' : 'bg-background',
        className
      )}
    >
      <div className="flex items-center gap-2 overflow-hidden">
        <File className="h-4 w-4 flex-shrink-0" />
        <span className="truncate">{template.name}</span>
      </div>
    </div>
  );
}
