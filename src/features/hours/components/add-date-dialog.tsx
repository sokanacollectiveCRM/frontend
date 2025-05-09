"use client"
import { Button } from "@/common/components/ui/button"
import { Calendar } from "@/common/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/common/components/ui/dialog"
import * as React from "react"
import { useState } from "react"

export default function ChooseDate({ trigger_text, dialog_title, date, setDate }: { trigger_text: string, dialog_title: string, date: Date | undefined, setDate: React.Dispatch<React.SetStateAction<Date | undefined>> }) {
  const [open, setOpen] = useState(false)

  const handleSave = () => {
    // Add any save logic here if needed
    setOpen(false) // Close the dialog
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">{trigger_text}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{dialog_title}</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center w-full py-10">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
          />
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleSave}>Save and exit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}