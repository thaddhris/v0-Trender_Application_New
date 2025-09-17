"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { TableFilter, Field } from "@/lib/types"

interface FilterChipsProps {
  filters: TableFilter[]
  fields: Field[]
  onRemoveFilter: (fieldId: string) => void
  onClearAllFilters: () => void
}

export function FilterChips({ filters, fields, onRemoveFilter, onClearAllFilters }: FilterChipsProps) {
  if (filters.length === 0) return null

  const getFilterLabel = (filter: TableFilter) => {
    const field = fields.find((f) => f.id === filter.fieldId)
    if (!field) return "Unknown filter"

    let valueLabel = ""

    switch (field.type) {
      case "boolean":
        valueLabel = filter.operator === "is_true" ? "is true" : "is false"
        break
      case "enum":
        if (Array.isArray(filter.value)) {
          valueLabel = `${filter.operator === "is_any_of" ? "is" : "is not"} ${filter.value.join(", ")}`
        }
        break
      case "date":
        if (filter.operator === "between" && filter.value?.start && filter.value?.end) {
          valueLabel = `between ${filter.value.start.toLocaleDateString()} and ${filter.value.end.toLocaleDateString()}`
        } else if (filter.value instanceof Date) {
          valueLabel = `${filter.operator} ${filter.value.toLocaleDateString()}`
        }
        break
      case "number":
        if (filter.operator === "between" && filter.value?.start && filter.value?.end) {
          valueLabel = `between ${filter.value.start} and ${filter.value.end}`
        } else {
          const operatorSymbols: Record<string, string> = {
            equals: "=",
            not_equals: "≠",
            greater_than: ">",
            greater_equal: "≥",
            less_than: "<",
            less_equal: "≤",
          }
          valueLabel = `${operatorSymbols[filter.operator] || filter.operator} ${filter.value}`
        }
        break
      default:
        valueLabel = `${filter.operator} "${filter.value}"`
    }

    return `${field.name}: ${valueLabel}`
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-muted-foreground">Filters:</span>
      {filters.map((filter) => (
        <Badge key={filter.fieldId} variant="secondary" className="flex items-center gap-1">
          {getFilterLabel(filter)}
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => onRemoveFilter(filter.fieldId)}
          >
            <X className="w-3 h-3" />
          </Button>
        </Badge>
      ))}
      {filters.length > 1 && (
        <Button variant="outline" size="sm" onClick={onClearAllFilters}>
          Clear All
        </Button>
      )}
    </div>
  )
}
