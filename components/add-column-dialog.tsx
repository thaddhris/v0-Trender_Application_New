"use client"

import { Label } from "@/components/ui/label"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Table as TableType } from "@/lib/types"
import { mockForms } from "@/lib/mock-data"

interface AddColumnDialogProps {
  table: TableType
  onUpdateTable: (updates: Partial<TableType>) => void
  trigger: React.ReactNode
}

export function AddColumnDialog({ table, onUpdateTable, trigger }: AddColumnDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedFieldIds, setSelectedFieldIds] = useState<string[]>([])

  const form = mockForms.find((f) => f.id === table.formId)
  const availableFields = form?.fields.filter((f) => !table.selectedFieldIds.includes(f.id)) || []

  const handleFieldToggle = (fieldId: string) => {
    setSelectedFieldIds((prev) => (prev.includes(fieldId) ? prev.filter((id) => id !== fieldId) : [...prev, fieldId]))
  }

  const handleSelectAll = () => {
    if (selectedFieldIds.length === availableFields.length) {
      setSelectedFieldIds([])
    } else {
      setSelectedFieldIds(availableFields.map((f) => f.id))
    }
  }

  const handleAddColumns = () => {
    if (selectedFieldIds.length > 0) {
      onUpdateTable({
        selectedFieldIds: [...table.selectedFieldIds, ...selectedFieldIds],
      })
      setSelectedFieldIds([])
      setOpen(false)
    }
  }

  const getFieldTypeIcon = (type: string) => {
    switch (type) {
      case "text":
        return "📝"
      case "number":
        return "🔢"
      case "date":
        return "📅"
      case "boolean":
        return "☑️"
      case "enum":
        return "📋"
      default:
        return "📄"
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Columns</DialogTitle>
          <DialogDescription>Select fields from {form?.name} to add as new columns to your table.</DialogDescription>
        </DialogHeader>

        {availableFields.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            All available fields are already added to this table.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                {selectedFieldIds.length === availableFields.length ? "Deselect All" : "Select All"}
              </Button>
              <Badge variant="outline">
                {selectedFieldIds.length} of {availableFields.length} selected
              </Badge>
            </div>

            <ScrollArea className="h-[300px] border rounded-md p-4">
              <div className="space-y-3">
                {availableFields.map((field) => (
                  <div key={field.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50">
                    <Checkbox
                      id={field.id}
                      checked={selectedFieldIds.includes(field.id)}
                      onCheckedChange={() => handleFieldToggle(field.id)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getFieldTypeIcon(field.type)}</span>
                        <Label htmlFor={field.id} className="font-medium">
                          {field.name}
                        </Label>
                        <Badge variant="secondary" className="text-xs">
                          {field.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddColumns} disabled={selectedFieldIds.length === 0}>
            Add {selectedFieldIds.length} Column{selectedFieldIds.length !== 1 ? "s" : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
