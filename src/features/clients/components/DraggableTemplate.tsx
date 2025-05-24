import { Button } from '@/common/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/common/components/ui/dialog';
import { Template } from '@/common/types/template';
import { cn } from '@/lib/utils';
import { useDraggable } from '@dnd-kit/core';
import { Eye, File } from 'lucide-react';
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

      <div
        className={cn(
          "absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 transition-opacity duration-150 bg-white",
          (isHoveringRow && !isHoveringActions) ? "bg-muted" :
            isHoveringRow ? "opacity-100" : "opacity-0"
        )}
        onMouseEnter={() => setIsHoveringActions(true)}
        onMouseLeave={() => setIsHoveringActions(false)}
      >
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
              <Eye className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>View Template</DialogTitle>
            </DialogHeader>
            <div className="text-muted-foreground">This is a placeholder for the view dialog.</div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
