"use client"

import { useState } from "react"
import { Settings, Lock, Unlock, Plus, MoreHorizontal, Filter, SortAsc, SortDesc, X, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import type { Table as TableType, TimeRange, Workspace } from "@/lib/types"
import { mockForms, mockSubmissions } from "@/lib/mock-data"

interface TableViewProps {
  table: TableType & { workspace?: Workspace }
  timeRange: TimeRange
  appMode?: "edit" | "view" // Added appMode prop to control configuration visibility
}

interface ColumnFilter {
  fieldId: string
  type: "text" | "number" | "date" | "boolean" | "enum"
  operator: string
  value: any
}

interface ColumnSort {
  fieldId: string
  direction: "asc" | "desc"
}

export function TableView({ table, timeRange, appMode = "edit" }: TableViewProps) {
  const [filters, setFilters] = useState<ColumnFilter[]>([])
  const [sorts, setSorts] = useState<ColumnSort[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [globalSearch, setGlobalSearch] = useState("")

  const form = mockForms.find((f) => f.id === table.formId)
  const selectedFields = form?.fields.filter((f) => table.selectedFieldIds.includes(f.id)) || []
  const primaryKeyField = selectedFields.find((f) => f.id === table.primaryKeyFieldId)

  // Filter submissions by time range
  let filteredSubmissions = mockSubmissions.filter(
    (s) => s.formId === table.formId && s.timestamp >= timeRange.start && s.timestamp <= timeRange.end,
  )

  // Apply global search
  if (globalSearch.trim()) {
    filteredSubmissions = filteredSubmissions.filter((submission) => {
      return selectedFields.some((field) => {
        const value = submission.values[field.id]
        return String(value || "")
          .toLowerCase()
          .includes(globalSearch.toLowerCase())
      })
    })
  }

  // Apply column filters
  filteredSubmissions = filteredSubmissions.filter((submission) => {
    return filters.every((filter) => {
      const value = submission.values[filter.fieldId]
      if (value === null || value === undefined) return false

      switch (filter.type) {
        case "text":
          const textValue = String(value).toLowerCase()
          const filterValue = String(filter.value).toLowerCase()
          switch (filter.operator) {
            case "contains":
              return textValue.includes(filterValue)
            case "equals":
              return textValue === filterValue
            case "starts":
              return textValue.startsWith(filterValue)
            case "ends":
              return textValue.endsWith(filterValue)
            default:
              return true
          }
        case "number":
          const numValue = Number(value)
          const numFilter = Number(filter.value)
          switch (filter.operator) {
            case "equals":
              return numValue === numFilter
            case "greater":
              return numValue > numFilter
            case "less":
              return numValue < numFilter
            case "greaterEqual":
              return numValue >= numFilter
            case "lessEqual":
              return numValue <= numFilter
            default:
              return true
          }
        case "boolean":
          return Boolean(value) === Boolean(filter.value)
        default:
          return true
      }
    })
  })

  // Apply sorting
  if (sorts.length > 0) {
    filteredSubmissions.sort((a, b) => {
      for (const sort of sorts) {
        const aValue = a.values[sort.fieldId]
        const bValue = b.values[sort.fieldId]

        let comparison = 0
        if (aValue < bValue) comparison = -1
        else if (aValue > bValue) comparison = 1

        if (comparison !== 0) {
          return sort.direction === "desc" ? -comparison : comparison
        }
      }
      return 0
    })
  }

  // Pagination
  const totalPages = Math.ceil(filteredSubmissions.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const paginatedSubmissions = filteredSubmissions.slice(startIndex, startIndex + pageSize)

  // Reorder fields to put primary key first
  const orderedFields = primaryKeyField
    ? [primaryKeyField, ...selectedFields.filter((f) => f.id !== table.primaryKeyFieldId)]
    : selectedFields

  const addFilter = (fieldId: string, type: string) => {
    const newFilter: ColumnFilter = {
      fieldId,
      type: type as any,
      operator: type === "text" ? "contains" : type === "number" ? "equals" : "equals",
      value: type === "boolean" ? false : "",
    }
    setFilters([...filters, newFilter])
  }

  const updateFilter = (index: number, updates: Partial<ColumnFilter>) => {
    const newFilters = [...filters]
    newFilters[index] = { ...newFilters[index], ...updates }
    setFilters(newFilters)
  }

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index))
  }

  const toggleSort = (fieldId: string) => {
    const existingSort = sorts.find((s) => s.fieldId === fieldId)
    if (existingSort) {
      if (existingSort.direction === "asc") {
        setSorts(sorts.map((s) => (s.fieldId === fieldId ? { ...s, direction: "desc" } : s)))
      } else {
        setSorts(sorts.filter((s) => s.fieldId !== fieldId))
      }
    } else {
      setSorts([...sorts, { fieldId, direction: "asc" }])
    }
  }

  const clearAllFilters = () => {
    setFilters([])
    setGlobalSearch("")
  }

  const getTableStyles = () => {
    const settings = table.workspace?.settings
    if (!settings) return {}

    return {
      fontSize: settings.fontSize === "small" ? "12px" : settings.fontSize === "large" ? "16px" : "14px",
      textAlign: settings.alignment || "left",
      fontWeight: settings.fontWeight || "normal",
      lineHeight: settings.lineHeight || 1.5,
      letterSpacing: `${settings.letterSpacing || 0}px`,
    }
  }

  const getTableClasses = () => {
    const settings = table.workspace?.settings
    if (!settings) return ""

    let classes = ""

    if (settings.tableBorderStyle === "none") classes += " border-none"
    else if (settings.tableBorderStyle === "dashed") classes += " border-dashed"
    else if (settings.tableBorderStyle === "minimal") classes += " border-t-0 border-l-0 border-r-0"

    return classes
  }

  const getRowHeight = () => {
    const settings = table.workspace?.settings
    if (!settings?.tableRowHeight) return "40px"

    switch (settings.tableRowHeight) {
      case "compact":
        return "32px"
      case "comfortable":
        return "48px"
      default:
        return "40px"
    }
  }

  const getCellPadding = () => {
    const settings = table.workspace?.settings
    if (!settings?.tableCellPadding) return "12px"

    switch (settings.tableCellPadding) {
      case "tight":
        return "8px"
      case "spacious":
        return "16px"
      default:
        return "12px"
    }
  }

  const getHeaderStyles = () => {
    const settings = table.workspace?.settings
    if (!settings?.tableHeaderStyle) return {}

    const baseStyles = {
      padding: getCellPadding(),
    }

    switch (settings.tableHeaderStyle) {
      case "bold":
        return {
          ...baseStyles,
          fontWeight: "700",
        }
      case "colored":
        return {
          ...baseStyles,
          backgroundColor: "hsl(var(--muted))",
          fontWeight: "600",
        }
      case "minimal":
        return {
          ...baseStyles,
          borderBottom: "1px solid hsl(var(--border))",
          backgroundColor: "transparent",
          fontWeight: "500",
        }
      default:
        return {
          ...baseStyles,
          fontWeight: "500",
        }
    }
  }

  const getHeaderClasses = () => {
    const settings = table.workspace?.settings
    if (!settings?.tableHeaderStyle) return "bg-muted/50"

    switch (settings.tableHeaderStyle) {
      case "colored":
        return "bg-primary/10 border-primary/20"
      case "minimal":
        return "bg-transparent"
      case "bold":
        return "bg-muted/30"
      default:
        return "bg-muted/50"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-balance">{table.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">Form: {form?.name}</Badge>
            <Badge variant="outline">{filteredSubmissions.length} rows</Badge>
            {table.isLocked && <Badge variant="secondary">Locked</Badge>}
          </div>
        </div>

        {appMode === "edit" && (
          <div className="flex items-center gap-2">
            {!table.isLocked && (
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Column
              </Button>
            )}
            <Button variant="outline" size="sm">
              {table.isLocked ? <Lock className="w-4 h-4 mr-2" /> : <Unlock className="w-4 h-4 mr-2" />}
              {table.isLocked ? "Locked" : "Unlocked"}
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg border">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search across all columns..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        {(filters.length > 0 || globalSearch) && (
          <Button variant="outline" size="sm" onClick={clearAllFilters}>
            <X className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>

      {filters.length > 0 && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {filters.map((filter, index) => {
              const field = selectedFields.find((f) => f.id === filter.fieldId)
              return (
                <Badge key={index} variant="secondary" className="flex items-center gap-2 px-3 py-1">
                  <span className="font-medium">{field?.name}</span>
                  <span className="text-muted-foreground">{filter.operator}</span>
                  <span>"{String(filter.value)}"</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground ml-1"
                    onClick={() => removeFilter(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )
            })}
          </div>

          <div className="space-y-2">
            {filters.map((filter, index) => {
              const field = selectedFields.find((f) => f.id === filter.fieldId)
              return (
                <div key={index} className="flex items-center gap-3 p-3 bg-background rounded-md border">
                  <span className="text-sm font-medium min-w-[100px]">{field?.name}:</span>
                  <Select value={filter.operator} onValueChange={(value) => updateFilter(index, { operator: value })}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {filter.type === "text" && (
                        <>
                          <SelectItem value="contains">Contains</SelectItem>
                          <SelectItem value="equals">Equals</SelectItem>
                          <SelectItem value="starts">Starts with</SelectItem>
                          <SelectItem value="ends">Ends with</SelectItem>
                        </>
                      )}
                      {filter.type === "number" && (
                        <>
                          <SelectItem value="equals">Equals</SelectItem>
                          <SelectItem value="greater">Greater than</SelectItem>
                          <SelectItem value="less">Less than</SelectItem>
                          <SelectItem value="greaterEqual">Greater or equal</SelectItem>
                          <SelectItem value="lessEqual">Less or equal</SelectItem>
                        </>
                      )}
                      {filter.type === "boolean" && (
                        <>
                          <SelectItem value="equals">Is</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  {filter.type === "boolean" ? (
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`filter-${index}`}
                        checked={Boolean(filter.value)}
                        onCheckedChange={(checked) => updateFilter(index, { value: Boolean(checked) })}
                      />
                      <label htmlFor={`filter-${index}`} className="text-sm">
                        {filter.value ? "True" : "False"}
                      </label>
                    </div>
                  ) : (
                    <Input
                      placeholder="Filter value"
                      value={filter.value}
                      onChange={(e) => updateFilter(index, { value: e.target.value })}
                      className="w-48"
                    />
                  )}
                  <Button variant="ghost" size="sm" onClick={() => removeFilter(index)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="border rounded-lg overflow-hidden" style={getTableStyles()}>
        <div className="overflow-x-auto max-w-full">
          <table className={`w-full min-w-full ${getTableClasses()}`} style={{ minWidth: "100%" }}>
            <thead className={`bg-muted/50 sticky top-0 z-10 ${getHeaderClasses()}`}>
              <tr style={{ height: getRowHeight() }}>
                {orderedFields.map((field, fieldIndex) => {
                  const currentSort = sorts.find((s) => s.fieldId === field.id)
                  return (
                    <th
                      key={field.id}
                      className={`text-left font-medium border-b ${fieldIndex === 0 ? "sticky left-0 z-20" : ""}`}
                      style={{
                        ...getHeaderStyles(),
                        minWidth: fieldIndex === 0 ? "150px" : "120px",
                        maxWidth: "200px",
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="cursor-pointer truncate" onClick={() => toggleSort(field.id)}>
                          {field.name}
                        </span>
                        {field.id === table.primaryKeyFieldId && (
                          <Badge variant="outline" className="text-xs">
                            PK
                          </Badge>
                        )}
                        <div className="flex items-center gap-1">
                          {currentSort && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0"
                              onClick={() => toggleSort(field.id)}
                            >
                              {currentSort.direction === "asc" ? (
                                <SortAsc className="w-3 h-3" />
                              ) : (
                                <SortDesc className="w-3 h-3" />
                              )}
                            </Button>
                          )}
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                                <MoreHorizontal className="w-3 h-3" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-48" align="start">
                              <div className="space-y-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full justify-start"
                                  onClick={() => toggleSort(field.id)}
                                >
                                  <SortAsc className="w-4 h-4 mr-2" />
                                  Sort A-Z
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full justify-start"
                                  onClick={() => addFilter(field.id, field.type)}
                                >
                                  <Filter className="w-4 h-4 mr-2" />
                                  Add Filter
                                </Button>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {paginatedSubmissions.map((submission) => (
                <tr key={submission.id} className="border-t hover:bg-muted/25" style={{ height: getRowHeight() }}>
                  {orderedFields.map((field, fieldIndex) => (
                    <td
                      key={field.id}
                      className={`border-b ${fieldIndex === 0 ? "sticky left-0 bg-background z-10" : ""}`}
                      style={{
                        padding: getCellPadding(),
                        minWidth: fieldIndex === 0 ? "150px" : "120px",
                        maxWidth: "200px",
                      }}
                    >
                      <div className="truncate" title={String(submission.values[field.id] || "")}>
                        {formatCellValue(submission.values[field.id], field.type)}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + pageSize, filteredSubmissions.length)} of{" "}
            {filteredSubmissions.length} rows
          </span>
          <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </Button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

function formatCellValue(value: any, type: string): string {
  if (value === null || value === undefined) return ""

  switch (type) {
    case "boolean":
      return value ? "Yes" : "No"
    case "date":
      return value instanceof Date ? value.toLocaleDateString() : String(value)
    case "number":
      return typeof value === "number" ? value.toString() : String(value)
    default:
      return String(value)
  }
}
