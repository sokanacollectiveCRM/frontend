import { Button } from '@/common/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/common/components/ui/dialog'
import { Input } from '@/common/components/ui/input'
import { Label } from '@/common/components/ui/label'
import { useToast } from '@/common/hooks/toast/use-toast'
import { Loader2, Plus } from 'lucide-react'
import { useRef, useState } from 'react'

type Props = {
  onUploadSuccess: () => void
}

export function NewTemplateDialog({ onUploadSuccess }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const closeRef = useRef<HTMLButtonElement | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const form = e.currentTarget
    const fileInput = form.elements.namedItem('file') as HTMLInputElement
    const nameInput = form.elements.namedItem('name') as HTMLInputElement
    const depositInput = form.elements.namedItem('deposit') as HTMLInputElement
    const feeInput = form.elements.namedItem('fee') as HTMLInputElement

    const file = fileInput?.files?.[0]
    if (!file || !nameInput?.value) return

    const formData = new FormData()
    formData.append('contract', file)
    formData.append('name', nameInput.value)
    formData.append('deposit', depositInput.value)
    formData.append('fee', feeInput.value)

    const token = localStorage.getItem('authToken')

    try {
      const res = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/contracts/templates`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!res.ok) throw new Error('Upload failed.')

      onUploadSuccess()
      closeRef.current?.click()
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="icon" variant="outline">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Upload New Template</DialogTitle>
          <DialogDescription>
            Upload a `.docx` file and provide template info.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Template Name</Label>
            <Input name="name" id="name" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Upload .docx File</Label>
            <Input type="file" name="file" id="file" accept=".docx" required />
          </div>

          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="deposit">Deposit Fee</Label>
              <Input name="deposit" id="deposit" type="number" required />
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="fee">Service Fee</Label>
              <Input name="fee" id="fee" type="number" required />
            </div>
          </div>

          <DialogFooter className="pt-2 flex gap-2">
            <DialogClose asChild>
              <Button
                type="button"
                variant="secondary"
                ref={closeRef}
                className="w-full"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
              ) : (
                'Upload Template'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}