import { Button } from "@/common/components/ui/button"
import { cn } from "@/lib/utils"
import { File, Pencil, Trash2 } from "lucide-react"
import { useState } from "react"

export function TemplateItem({
  template,
  isSelected,
  onSelect,
}: {
  template: { id: number; name: string }
  isSelected: boolean
  onSelect: () => void
}) {
  const [isHoveringRow, setIsHoveringRow] = useState(false)
  const [isHoveringActions, setIsHoveringActions] = useState(false)

  const showRowHover = isHoveringRow && !isHoveringActions

  return (
    <div
      onMouseEnter={() => setIsHoveringRow(true)}
      onMouseLeave={() => setIsHoveringRow(false)}
      className={cn(
        "relative flex items-center w-full rounded-md border px-3 text-sm transition-colors h-12",
        isSelected
          ? "bg-secondary"
          : showRowHover
            ? "bg-muted"
            : "bg-background",
        "cursor-pointer"
      )}
      onClick={() => {
        if (!isHoveringActions) onSelect()
      }}
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
        <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </div>
    </div>
  )
}