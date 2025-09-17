"use client"

import type React from "react"

import { useState } from "react"
import { Filter, X } from "lucide-react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import type { Field, TableFilter } from "@/lib/types"

interface ColumnFilterDialogProps {
  field: Field
  currentFilter?: TableFilter
  onApplyFilter: (filter: TableFilter | null) => void
  trigger?: React.ReactNode
}

export function ColumnFilterDialog({ field, currentFilter, onApplyFilter, trigger }: ColumnFilterDialogProps) {
  const [open, setOpen] = useState(false)
  const [operator, setOperator] = useState(currentFilter?.operator || getDefaultOperator(field.type))
  const [value, setValue] = useState(currentFilter?.value || "")
  const [secondValue, setSecondValue] = useState("")
  const [selectedOptions, setSelectedOptions] = useState<string[]>(
    currentFilter?.value && Array.isArray(currentFilter.value) ? currentFilter.value : [],
  )
  const [dateValue, setDateValue] = useState<Date | undefined>(
    currentFilter?.value instanceof Date ? currentFilter.value : undefined,
  )
  const [secondDateValue, setSecondDateValue] = useState<Date | undefined>()

  const getOperatorOptions = (fieldType: string) => {
    switch (fieldType) {
      case "text":
        return [
          { value: "contains", label: "Contains" },
          { value: "equals", label: "Equals" },
          { value: "starts_with", label: "Starts with" },
          { value: "ends_with", label: "Ends with" },
          { value: "not_equals", label: "Not equals" },
        ]
      case "number":
        return [
          { value: "equals", label: "Equals (=)" },
          { value: "not_equals", label: "Not equals (≠)" },
          { value: "greater_than", label: "Greater than (>)" },
          { value: "greater_equal", label: "Greater or equal (≥)" },
          { value: "less_than", label: "Less than (<)" },
          { value: "less_equal", label: "Less or equal (≤)" },
          { value: "between", label: "Between" },
        ]
      case "date":
        return [
          { value: "on", label: "On" },
          { value: "before", label: "Before" },
          { value: "after", label: "After" },
          { value: "between", label: "Between" },
        ]
      case "boolean":
        return [
          { value: "is_true", label: "Is true" },
          { value: "is_false", label: "Is false" },
        ]
      case "enum":
        return [
          { value: "is_any_of", label: "Is any of" },
          { value: "is_none_of", label: "Is none of" },
        ]
      default:
        return []
    }
  }

  function getDefaultOperator(fieldType: string): string {
    switch (fieldType) {
      case "text":
        return "contains"
      case "number":
        return "equals"
      case "date":
        return "on"
      case "boolean":
        return "is_true"
      case "enum":
        return "is_any_of"
      default:
        return "equals"
    }
  }

  const handleApply = () => {
    let filterValue: any = value

    if (field.type === "boolean") {
      filterValue = operator === "is_true"
    } else if (field.type === "enum") {
      filterValue = selectedOptions
    } else if (field.type === "date") {
      if (operator === "between") {
        filterValue = { start: dateValue, end: secondDateValue }
      } else {
        filterValue = dateValue
      }
    } else if (field.type === "number" && operator === "between") {
      filterValue = { start: Number.parseFloat(value), end: Number.parseFloat(secondValue) }
    } else if (field.type === "number") {
      filterValue = Number.parseFloat(value)
    }

    onApplyFilter({
      fieldId: field.id,
      operator,
      value: filterValue,
    })
    setOpen(false)
  }

  const handleClear = () => {
    onApplyFilter(null)
    setOpen(false)
  }

  const renderFilterInput = () => {
    switch (field.type) {
      case "text":
        return <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Enter text..." />

      case "number":
        return (
          <div className="space-y-2">
            <Input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter number..."
            />
            {operator === "between" && (
              <Input
                type="number"
                value={secondValue}
                onChange={(e) => setSecondValue(e.target.value)}
                placeholder="Enter second number..."
              />
            )}
          </div>
        )

      case "date":
        return (
          <div className="space-y-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left bg-transparent">
                  {dateValue ? format(dateValue, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent mode="single" selected={dateValue} onSelect={setDateValue} />
              </PopoverContent>
            </Popover>
            {operator === "between" && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left bg-transparent">
                    {secondDateValue ? format(secondDateValue, "PPP") : "Pick end date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent mode="single" selected={secondDateValue} onSelect={setSecondDateValue} />
                </PopoverContent>
              </Popover>
            )}
          </div>
        )

      case "boolean":
        return (
          <div className="text-sm text-muted-foreground">
            Filter will show rows where {field.name} is {operator === "is_true" ? "true" : "false"}.
          </div>
        )

      case "enum":
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={option}
                  checked={selectedOptions.includes(option)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedOptions([...selectedOptions, option])
                    } else {
                      setSelectedOptions(selectedOptions.filter((o) => o !== option))
                    }
                  }}
                />
                <Label htmlFor={option}>{option}</Label>
              </div>
            ))}
          </div>
        )

      default:
        return null
    }
  }

  const canApply = () => {
    if (field.type === "boolean") return true
    if (field.type === "enum") return selectedOptions.length > 0
    if (field.type === "date") {
      if (operator === "between") return dateValue && secondDateValue
      return dateValue
    }
    if (field.type === "number" && operator === "between") {
      return value && secondValue
    }
    return value.toString().trim() !== ""
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm">
            <Filter className="w-4 h-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Filter: {field.name}</DialogTitle>
          <DialogDescription>Set up a filter for this column based on its data type.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Filter Type</Label>
            <Select value={operator} onValueChange={setOperator}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getOperatorOptions(field.type).map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Value</Label>
            {renderFilterInput()}
          </div>
        </div>
        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={handleClear}>
            <X className="w-4 h-4 mr-2" />
            Clear Filter
          </Button>
          <Button onClick={handleApply} disabled={!canApply()}>
            Apply Filter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
