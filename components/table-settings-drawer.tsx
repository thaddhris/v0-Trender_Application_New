"use client"

import { useState } from "react"
import { X, Lock, Unlock, Clock, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { mockForms } from "@/lib/mock-data"
import type { Table as TableType } from "@/lib/types"

interface TableSettingsDrawerProps {
  table: TableType
  isOpen: boolean
  onClose: () => void
  onUpdateTable: (updates: Partial<TableType>) => void
}

export function TableSettingsDrawer({ table, isOpen, onClose, onUpdateTable }: TableSettingsDrawerProps) {
  const [tableName, setTableName] = useState(table.name)
  const [isLocked, setIsLocked] = useState(table.isLocked)

  const form = mockForms.find((f) => f.id === table.formId)
  const selectedFields = form?.fields.filter((f) => table.selectedFieldIds.includes(f.id)) || []
  const dateTimeFields = form?.fields.filter((f) => f.type === "date") || []
  const primaryKeyField = selectedFields.find((f) => f.id === table.primaryKeyFieldId)
  const startTimeField = dateTimeFields.find((f) => f.id === table.timeMapping?.startFieldId)
  const endTimeField = dateTimeFields.find((f) => f.id === table.timeMapping?.endFieldId)

  const handleApply = () => {
    onUpdateTable({
      name: tableName,
      isLocked,
    })
    onClose()
  }

  const handleLockToggle = (locked: boolean) => {
    setIsLocked(locked)
    onUpdateTable({ isLocked: locked })
  }

  const handleTimeFieldUpdate = (type: "start" | "end", fieldId: string) => {
    const newTimeMapping = { ...table.timeMapping }
    if (type === "start") {
      newTimeMapping.startFieldId = fieldId
    } else {
      newTimeMapping.endFieldId = fieldId
    }
    onUpdateTable({ timeMapping: newTimeMapping })
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-80 bg-background border-l shadow-lg z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Table Settings</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 space-y-6">
          {/* Table Name */}
          <div className="space-y-3">
            <Label htmlFor="table-name" className="text-sm font-medium">
              Table Name
            </Label>
            <Input
              id="table-name"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              placeholder="Enter table name"
            />
          </div>

          <Separator />

          {/* Column Lock Settings */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Lock Columns</Label>
              <Switch checked={isLocked} onCheckedChange={handleLockToggle} />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
              {isLocked ? "Adding columns is disabled" : "Users can add new columns"}
            </div>
          </div>

          <Separator />

          {/* Configuration Review */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Configuration Review</Label>

            {/* Device */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">Device</div>
              {form ? (
                <div className="flex items-center gap-2">
                  <Badge variant="outline">IoT</Badge>
                  <span className="text-sm">{form.name}</span>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">No device selected</span>
              )}
            </div>

            {/* Selected Fields */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">Selected Fields ({selectedFields.length})</div>
              <div className="space-y-1 max-h-32 overflow-auto">
                {selectedFields.map((field) => (
                  <div key={field.id} className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="text-xs">
                      {field.type}
                    </Badge>
                    <span>{field.name}</span>
                    {field.id === table.primaryKeyFieldId && <Star className="h-3 w-3 text-yellow-500" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Primary Key */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">Primary Key</div>
              {primaryKeyField ? (
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">{primaryKeyField.name}</span>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">No primary key set</span>
              )}
            </div>

            {/* Time Field Mapping */}
            {dateTimeFields.length > 0 && (
              <div className="space-y-3">
                <div className="text-xs font-medium text-muted-foreground">Time Field Mapping</div>

                <div className="space-y-2">
                  <Label className="text-xs">Start Time Field</Label>
                  <Select
                    value={table.timeMapping?.startFieldId || ""}
                    onValueChange={(value) => handleTimeFieldUpdate("start", value)}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {dateTimeFields.map((field) => (
                        <SelectItem key={field.id} value={field.id}>
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            {field.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">End Time Field</Label>
                  <Select
                    value={table.timeMapping?.endFieldId || ""}
                    onValueChange={(value) => handleTimeFieldUpdate("end", value)}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {dateTimeFields.map((field) => (
                        <SelectItem key={field.id} value={field.id}>
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            {field.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {startTimeField && endTimeField && (
                  <div className="text-xs text-muted-foreground">
                    Time filtering will use overlap between {startTimeField.name} and {endTimeField.name}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button onClick={handleApply} className="flex-1">
              Apply
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
