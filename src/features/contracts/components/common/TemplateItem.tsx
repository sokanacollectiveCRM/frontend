import { Template } from "@/common/types/template"
import { cn } from "@/lib/utils"
import { File } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { DeleteTemplateDialog } from "../dialog/DeleteTemplateDialog"
import { EditTemplateDialog } from "../dialog/EditTemplateDialog"

export function TemplateItem({
  template,
  isSelected,
  onSelect,
}: {
  template: Template,
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
          isSelected ? "bg-muted" : "bg-white",
          "absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 transition-opacity duration-150 bg-white",
          (isHoveringRow && !isHoveringActions) ? "bg-muted" :
            isHoveringRow ? "opacity-100" : "opacity-0"
        )}
        onMouseEnter={() => setIsHoveringActions(true)}
        onMouseLeave={() => setIsHoveringActions(false)}
      >
        <EditTemplateDialog
          templateId={template.id}
          templateName={template.name}
          currentDeposit={template.deposit}
          currentFee={template.fee}
          onUpdateSuccess={() => {
            toast.success(`${template.name} was updated successfully`);
          }}
        />
        <DeleteTemplateDialog
          templateName={template.name}
          onDelete={() => {
            toast.success(`${template.name} was deleted successfully`);
          }}
        />
      </div>
    </div>
  )
}