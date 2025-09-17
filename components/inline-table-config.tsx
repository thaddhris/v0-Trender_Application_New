"use client"

import { useState } from "react"
import { Search, Star, Clock, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { mockForms } from "@/lib/mock-data"
import type { Table as TableType } from "@/lib/types"

interface InlineTableConfigProps {
  table: TableType
  onUpdateTable: (updates: Partial<TableType>) => void
}

export function InlineTableConfig({ table, onUpdateTable }: InlineTableConfigProps) {
  const [deviceSearchOpen, setDeviceSearchOpen] = useState(false)
  const [fieldsOpen, setFieldsOpen] = useState(false)
  const [deviceSearch, setDeviceSearch] = useState("")

  const selectedForm = mockForms.find((f) => f.id === table.formId)
  const availableFields = selectedForm?.fields || []
  const selectedFields = availableFields.filter((f) => table.selectedFieldIds.includes(f.id))
  const dateTimeFields = availableFields.filter((f) => f.type === "date")

  const filteredForms = mockForms.filter((form) => form.name.toLowerCase().includes(deviceSearch.toLowerCase()))

  const handleDeviceSelect = (formId: string) => {
    const form = mockForms.find((f) => f.id === formId)
    if (form) {
      onUpdateTable({
        formId,
        selectedFieldIds: [],
        primaryKeyFieldId: "",
        timeMapping: { startFieldId: "", endFieldId: "" },
      })
    }
    setDeviceSearchOpen(false)
  }

  const handleFieldToggle = (fieldId: string, checked: boolean) => {
    let newSelectedFieldIds: string[]

    if (checked) {
      newSelectedFieldIds = [...table.selectedFieldIds, fieldId]
    } else {
      newSelectedFieldIds = table.selectedFieldIds.filter((id) => id !== fieldId)
      // If removing the primary key field, clear it
      if (fieldId === table.primaryKeyFieldId) {
        onUpdateTable({
          selectedFieldIds: newSelectedFieldIds,
          primaryKeyFieldId: "",
        })
        return
      }
    }

    onUpdateTable({ selectedFieldIds: newSelectedFieldIds })
  }

  const handleSelectAllFields = () => {
    const allFieldIds = availableFields.map((f) => f.id)
    onUpdateTable({ selectedFieldIds: allFieldIds })
  }

  const handleDeselectAllFields = () => {
    onUpdateTable({
      selectedFieldIds: [],
      primaryKeyFieldId: "",
      timeMapping: { startFieldId: "", endFieldId: "" },
    })
  }

  const handlePrimaryKeySelect = (fieldId: string) => {
    onUpdateTable({ primaryKeyFieldId: fieldId })
  }

  const handleTimeFieldSelect = (type: "start" | "end", fieldId: string) => {
    const newTimeMapping = { ...table.timeMapping }
    if (type === "start") {
      newTimeMapping.startFieldId = fieldId
    } else {
      newTimeMapping.endFieldId = fieldId
    }
    onUpdateTable({ timeMapping: newTimeMapping })
  }

  const getFieldIcon = (type: string) => {
    switch (type) {
      case "text":
        return "T"
      case "number":
        return "#"
      case "date":
        return "📅"
      case "boolean":
        return "✓"
      case "enum":
        return "⚬"
      default:
        return "?"
    }
  }

  return (
    <div className="sticky top-0 z-10 bg-background border-b p-4 space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        {/* Device Selection */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium whitespace-nowrap">Device:</span>
          <Popover open={deviceSearchOpen} onOpenChange={setDeviceSearchOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="min-w-[200px] justify-start bg-transparent">
                {selectedForm ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">IoT</span>
                    {selectedForm.name}
                  </div>
                ) : (
                  <span className="text-muted-foreground">Select Device...</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start">
              <div className="p-3 border-b">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search devices..."
                    value={deviceSearch}
                    onChange={(e) => setDeviceSearch(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="max-h-60 overflow-auto">
                {filteredForms.map((form) => (
                  <button
                    key={form.id}
                    className="w-full p-3 text-left hover:bg-accent flex items-center gap-3"
                    onClick={() => handleDeviceSelect(form.id)}
                  >
                    <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">IoT</span>
                    <div>
                      <div className="font-medium">{form.name}</div>
                      <div className="text-xs text-muted-foreground">{form.fields.length} fields</div>
                    </div>
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Fields Selection */}
        {selectedForm && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium whitespace-nowrap">Fields:</span>
            <Popover open={fieldsOpen} onOpenChange={setFieldsOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="min-w-[200px] justify-start bg-transparent">
                  {selectedFields.length > 0 ? (
                    <span>
                      {selectedFields.length} field{selectedFields.length !== 1 ? "s" : ""} selected
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Select Fields...</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="start">
                <div className="p-3 border-b">
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={handleSelectAllFields}>
                      Select All
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleDeselectAllFields}>
                      Clear All
                    </Button>
                  </div>
                </div>
                <div className="max-h-60 overflow-auto p-2">
                  {availableFields.map((field) => (
                    <div key={field.id} className="flex items-center space-x-2 p-2 hover:bg-accent rounded">
                      <Checkbox
                        id={field.id}
                        checked={table.selectedFieldIds.includes(field.id)}
                        onCheckedChange={(checked) => handleFieldToggle(field.id, checked as boolean)}
                      />
                      <label htmlFor={field.id} className="flex items-center gap-2 flex-1 cursor-pointer">
                        <span className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                          {getFieldIcon(field.type)}
                        </span>
                        <span className="font-medium">{field.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {field.type}
                        </Badge>
                      </label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}

        {/* Primary Key Selection */}
        {selectedFields.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium whitespace-nowrap">Primary Key:</span>
            <Select value={table.primaryKeyFieldId} onValueChange={handlePrimaryKeySelect}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select PK..." />
              </SelectTrigger>
              <SelectContent>
                {selectedFields.map((field) => (
                  <SelectItem key={field.id} value={field.id}>
                    <div className="flex items-center gap-2">
                      <Star className="h-3 w-3" />
                      {field.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Time Field Mapping */}
        {dateTimeFields.length > 0 && (
          <>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium whitespace-nowrap">Start Time:</span>
              <Select
                value={table.timeMapping?.startFieldId || ""}
                onValueChange={(value) => handleTimeFieldSelect("start", value)}
              >
                <SelectTrigger className="w-[150px]">
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

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium whitespace-nowrap">End Time:</span>
              <Select
                value={table.timeMapping?.endFieldId || ""}
                onValueChange={(value) => handleTimeFieldSelect("end", value)}
              >
                <SelectTrigger className="w-[150px]">
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
          </>
        )}

        {/* Add Column (when unlocked) */}
        {!table.isLocked && selectedForm && selectedFields.length > 0 && (
          <Button variant="outline" size="sm" onClick={() => setFieldsOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Column
          </Button>
        )}
      </div>

      {/* Configuration Status */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {!selectedForm && <span>• Choose a device to get started</span>}
        {selectedForm && selectedFields.length === 0 && <span>• Select fields to display data</span>}
        {selectedFields.length > 0 && !table.primaryKeyFieldId && <span>• Set a primary key field</span>}
        {selectedFields.length > 0 && table.primaryKeyFieldId && (
          <span>
            • Configuration complete - {selectedFields.length} fields, PK:{" "}
            {selectedFields.find((f) => f.id === table.primaryKeyFieldId)?.name}
          </span>
        )}
      </div>
    </div>
  )
}
