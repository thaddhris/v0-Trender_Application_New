"use client"

import { useState } from "react"
import { Search, Download, Eye, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import type { Field } from "@/lib/types"

interface TableToolbarProps {
  fields: Field[]
  visibleFieldIds: string[]
  onToggleFieldVisibility: (fieldId: string) => void
  onGlobalSearch: (query: string) => void
  onExport?: () => void
  onResetView?: () => void
  totalRows: number
  filteredRows: number
}

export function TableToolbar({
  fields,
  visibleFieldIds,
  onToggleFieldVisibility,
  onGlobalSearch,
  onExport,
  onResetView,
  totalRows,
  filteredRows,
}: TableToolbarProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    onGlobalSearch(value)
  }

  const visibleFieldsCount = visibleFieldIds.length
  const hiddenFieldsCount = fields.length - visibleFieldsCount

  return (
    <div className="flex items-center justify-between gap-4 p-4 border-b">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search all columns..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {filteredRows} of {totalRows} rows
          </Badge>
          {filteredRows !== totalRows && <Badge variant="secondary">Filtered</Badge>}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              Columns ({visibleFieldsCount})
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              Toggle Columns
              {hiddenFieldsCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {hiddenFieldsCount} hidden
                </Badge>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {fields.map((field) => (
              <DropdownMenuCheckboxItem
                key={field.id}
                checked={visibleFieldIds.includes(field.id)}
                onCheckedChange={() => onToggleFieldVisibility(field.id)}
              >
                <div className="flex items-center justify-between w-full">
                  <span>{field.name}</span>
                  <Badge variant="outline" className="text-xs ml-2">
                    {field.type}
                  </Badge>
                </div>
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {onResetView && (
          <Button variant="outline" size="sm" onClick={onResetView}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        )}

        {onExport && (
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
