"use client"

import { useState, useEffect } from "react"
import { MoreHorizontal, ArrowUpDown, ArrowUp, ArrowDown, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { InlineTableConfig } from "./inline-table-config"
import { TableToolbar } from "./table-toolbar"
import { EnhancedPagination } from "./enhanced-pagination"
import { AdvancedColumnFilter } from "./advanced-column-filter"
import { FilterChips } from "./filter-chips"
import type { Table as TableType, TimeRange, TableFilter } from "@/lib/types"
import { mockForms, mockSubmissions } from "@/lib/mock-data"

interface EnhancedTableViewProps {
  table: TableType
  timeRange: TimeRange
  onUpdateTable: (updates: Partial<TableType>) => void
  compact?: boolean
  appMode?: "edit" | "view" // Added appMode prop to control device config visibility
}

export function EnhancedTableView({
  table,
  timeRange,
  onUpdateTable,
  compact = false,
  appMode = "edit",
}: EnhancedTableViewProps) {
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [filters, setFilters] = useState<TableFilter[]>([])
  const [globalSearch, setGlobalSearch] = useState("")
  const [visibleFieldIds, setVisibleFieldIds] = useState(table.selectedFieldIds)
  const [isLoading, setIsLoading] = useState(false)
  const [tableSettingsOpen, setTableSettingsOpen] = useState(false)
  const [activeFilterField, setActiveFilterField] = useState<string | null>(null)

  const workspace = table.workspace || {
    settings: { fontSize: "medium", alignment: "left", fontWeight: "normal", lineHeight: 1.5, letterSpacing: 0 },
  }

  const getWorkspaceStyles = () => {
    const settings = workspace.settings
    return {
      fontSize: settings.fontSize === "small" ? "12px" : settings.fontSize === "large" ? "16px" : "14px",
      textAlign: settings.alignment as "left" | "center" | "right",
      fontWeight:
        settings.fontWeight === "light"
          ? 300
          : settings.fontWeight === "medium"
            ? 500
            : settings.fontWeight === "semibold"
              ? 600
              : settings.fontWeight === "bold"
                ? 700
                : 400,
      lineHeight: settings.lineHeight || 1.5,
      letterSpacing: `${settings.letterSpacing || 0}px`,
    }
  }

  const workspaceStyles = getWorkspaceStyles()

  const form = mockForms.find((f) => f.id === table.formId)
  const allFields = form?.fields.filter((f) => table.selectedFieldIds.includes(f.id)) || []
  const visibleFields = allFields.filter((f) => visibleFieldIds.includes(f.id))
  const primaryKeyField = visibleFields.find((f) => f.id === table.primaryKeyFieldId)

  const startTimeField = allFields.find((f) => f.id === table.timeMapping?.startFieldId)
  const endTimeField = allFields.find((f) => f.id === table.timeMapping?.endFieldId)
  const hasTimeMapping = startTimeField || endTimeField

  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [timeRange])

  useEffect(() => {
    setVisibleFieldIds(table.selectedFieldIds)
    setCurrentPage(1)
  }, [table.selectedFieldIds, table.primaryKeyFieldId])

  const timeFilteredSubmissions = mockSubmissions.filter((submission) => {
    if (submission.formId !== table.formId) return false

    if (!hasTimeMapping) {
      return submission.timestamp >= timeRange.start && submission.timestamp <= timeRange.end
    }

    const startFieldId = table.timeMapping?.startFieldId
    const endFieldId = table.timeMapping?.endFieldId

    if (startFieldId && endFieldId && startFieldId !== endFieldId) {
      const rowStart = new Date(submission.values[startFieldId])
      const rowEnd = new Date(submission.values[endFieldId])
      return rowEnd >= timeRange.start && rowStart <= timeRange.end
    } else if (startFieldId || endFieldId) {
      const timeFieldId = startFieldId || endFieldId
      const rowTime = new Date(submission.values[timeFieldId])
      return rowTime >= timeRange.start && rowTime <= timeRange.end
    }

    return submission.timestamp >= timeRange.start && submission.timestamp <= timeRange.end
  })

  const searchFilteredSubmissions = timeFilteredSubmissions.filter((submission) => {
    if (!globalSearch) return true

    const searchLower = globalSearch.toLowerCase()
    return allFields.some((field) => {
      const value = submission.values[field.id]
      return String(value || "")
        .toLowerCase()
        .includes(searchLower)
    })
  })

  const columnFilteredSubmissions = searchFilteredSubmissions.filter((submission) => {
    return filters.every((filter) => {
      const fieldValue = submission.values[filter.fieldId]
      const field = allFields.find((f) => f.id === filter.fieldId)

      if (!field) return true

      switch (field.type) {
        case "text":
          const textValue = String(fieldValue || "").toLowerCase()
          const filterText = String(filter.value || "").toLowerCase()

          switch (filter.operator) {
            case "contains":
              return textValue.includes(filterText)
            case "equals":
              return textValue === filterText
            case "starts_with":
              return textValue.startsWith(filterText)
            case "ends_with":
              return textValue.endsWith(filterText)
            case "not_equals":
              return textValue !== filterText
            default:
              return true
          }

        case "number":
          const numValue = Number(fieldValue)
          const filterNum = Number(filter.value)

          switch (filter.operator) {
            case "equals":
              return numValue === filterNum
            case "not_equals":
              return numValue !== filterNum
            case "greater_than":
              return numValue > filterNum
            case "greater_equal":
              return numValue >= filterNum
            case "less_than":
              return numValue < filterNum
            case "less_equal":
              return numValue <= filterNum
            case "between":
              return numValue >= filter.value.start && numValue <= filter.value.end
            default:
              return true
          }

        case "boolean":
          const boolValue = Boolean(fieldValue)
          return filter.operator === "is_true" ? boolValue : !boolValue

        case "enum":
          const enumValue = String(fieldValue || "")
          const selectedOptions = Array.isArray(filter.value) ? filter.value : []
          return filter.operator === "is_any_of"
            ? selectedOptions.includes(enumValue)
            : !selectedOptions.includes(enumValue)

        case "date":
          const dateValue = new Date(fieldValue)
          const filterDate = filter.value instanceof Date ? filter.value : new Date(filter.value)

          switch (filter.operator) {
            case "on":
              return dateValue.toDateString() === filterDate.toDateString()
            case "before":
              return dateValue < filterDate
            case "after":
              return dateValue > filterDate
            case "between":
              return dateValue >= filter.value.start && dateValue <= filter.value.end
            default:
              return true
          }

        default:
          return true
      }
    })
  })

  const sortedSubmissions = [...columnFilteredSubmissions].sort((a, b) => {
    if (!sortField) return 0

    const aValue = a.values[sortField]
    const bValue = b.values[sortField]

    if (aValue === bValue) return 0

    const comparison = aValue < bValue ? -1 : 1
    return sortDirection === "asc" ? comparison : -comparison
  })

  const startIndex = (currentPage - 1) * pageSize
  const paginatedSubmissions = sortedSubmissions.slice(startIndex, startIndex + pageSize)
  const totalPages = Math.ceil(sortedSubmissions.length / pageSize)

  const orderedFields = primaryKeyField
    ? [primaryKeyField, ...visibleFields.filter((f) => f.id !== table.primaryKeyFieldId)]
    : visibleFields

  const handleSort = (fieldId: string) => {
    if (sortField === fieldId) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(fieldId)
      setSortDirection("asc")
    }
    setCurrentPage(1)
  }

  const handleAddColumn = () => {
    // This will be handled by the AddColumnDialog component
  }

  const handleToggleLock = () => {
    onUpdateTable({ isLocked: !table.isLocked })
  }

  const handleApplyFilter = (fieldId: string, filter: TableFilter | null) => {
    if (filter) {
      setFilters((prev) => [...prev.filter((f) => f.fieldId !== fieldId), filter])
    } else {
      setFilters((prev) => prev.filter((f) => f.fieldId !== fieldId))
    }
    setCurrentPage(1)
  }

  const getFieldValues = (fieldId: string) => {
    const uniqueValues = new Set()
    const valueCounts = new Map()

    timeFilteredSubmissions.forEach((submission) => {
      const value = submission.values[fieldId]
      const displayValue = value === null || value === undefined ? "(Blanks)" : String(value)
      uniqueValues.add(displayValue)
      valueCounts.set(displayValue, (valueCounts.get(displayValue) || 0) + 1)
    })

    return Array.from(uniqueValues).map((value) => ({
      value: value === "(Blanks)" ? "" : String(value),
      label: String(value),
      count: valueCounts.get(value),
    }))
  }

  const handleRemoveFilter = (fieldId: string) => {
    setFilters((prev) => prev.filter((f) => f.fieldId !== fieldId))
  }

  const handleClearAllFilters = () => {
    setFilters([])
    setGlobalSearch("")
    setSortField(null)
    setSortDirection("asc")
    setVisibleFieldIds(table.selectedFieldIds)
    setCurrentPage(1)
  }

  const handleToggleFieldVisibility = (fieldId: string) => {
    if (visibleFieldIds.includes(fieldId)) {
      if (fieldId === table.primaryKeyFieldId) return
      setVisibleFieldIds(visibleFieldIds.filter((id) => id !== fieldId))
    } else {
      setVisibleFieldIds([...visibleFieldIds, fieldId])
    }
  }

  const handleResetView = () => {
    setFilters([])
    setGlobalSearch("")
    setSortField(null)
    setSortDirection("asc")
    setVisibleFieldIds(table.selectedFieldIds)
    setCurrentPage(1)
  }

  const handleExport = () => {
    const headers = orderedFields.map((f) => f.name).join(",")
    const rows = sortedSubmissions
      .map((submission) =>
        orderedFields
          .map((field) => {
            const value = submission.values[field.id]
            return `"${formatCellValue(value, field.type)}"`
          })
          .join(","),
      )
      .join("\n")

    const csv = `${headers}\n${rows}`
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${table.name}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getSortIcon = (fieldId: string) => {
    if (sortField !== fieldId) return <ArrowUpDown className="w-3 h-3 text-muted-foreground" />
    return sortDirection === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
  }

  const hasActiveFilters = filters.length > 0 || globalSearch
  const isFiltered = hasActiveFilters || timeRange.preset !== "All time"

  const showEmptyState = !table.formId || table.selectedFieldIds.length === 0
  const showNoDataState = !showEmptyState && paginatedSubmissions.length === 0

  const getTimeMappingStatus = () => {
    if (!hasTimeMapping) {
      return "Using default timestamp filtering"
    }

    const startFieldName = startTimeField?.name
    const endFieldName = endTimeField?.name

    if (startFieldName && endFieldName && startFieldName !== endFieldName) {
      return `Time overlap: ${startFieldName} ↔ ${endFieldName}`
    } else if (startFieldName || endFieldName) {
      return `Time range: ${startFieldName || endFieldName}`
    }

    return "Time mapping configured"
  }

  return (
    <>
      <div className="flex flex-col h-full">
        {!compact && appMode === "edit" && <InlineTableConfig table={table} onUpdateTable={onUpdateTable} />}

        <div className="flex-1 overflow-hidden">
          <div className="space-y-6 p-6 h-full overflow-y-auto">
            {!compact && (
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-balance">{table.name}</h1>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {form && <Badge variant="outline">Device: {form.name}</Badge>}
                    <Badge variant="outline">{columnFilteredSubmissions.length} rows</Badge>
                    {table.isLocked && <Badge variant="secondary">Locked</Badge>}
                    {hasTimeMapping && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {getTimeMappingStatus()}
                      </Badge>
                    )}
                    {sortField && (
                      <Badge variant="outline">
                        Sorted by {allFields.find((f) => f.id === sortField)?.name} ({sortDirection})
                      </Badge>
                    )}
                    {isFiltered && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Filtered
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">{/* Removed settings and lock buttons */}</div>
              </div>
            )}

            {showEmptyState ? (
              <Card>
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center space-y-4">
                    <h3 className="text-lg font-semibold text-muted-foreground">
                      {!table.formId ? "Choose a Device (Form) to get data" : "Select fields to display data"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {!table.formId
                        ? "Use the configuration bar above to select an IoT device and configure your table."
                        : "Select one or more fields from the device to start viewing data."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <FilterChips
                  filters={filters}
                  fields={allFields}
                  onRemoveFilter={handleRemoveFilter}
                  onClearAllFilters={handleClearAllFilters}
                />

                <Card className="shadow-sm">
                  <TableToolbar
                    fields={allFields}
                    visibleFieldIds={visibleFieldIds}
                    onToggleFieldVisibility={handleToggleFieldVisibility}
                    onGlobalSearch={setGlobalSearch}
                    onExport={handleExport}
                    onResetView={handleResetView}
                    totalRows={timeFilteredSubmissions.length}
                    filteredRows={sortedSubmissions.length}
                  />

                  <CardContent className="p-0">
                    {isLoading ? (
                      <div className="flex items-center justify-center h-64">
                        <div className="text-muted-foreground">Loading table data...</div>
                      </div>
                    ) : showNoDataState ? (
                      <div className="flex items-center justify-center h-64">
                        <div className="text-center space-y-4">
                          <h3 className="text-lg font-semibold text-muted-foreground">No data in this time range</h3>
                          <p className="text-sm text-muted-foreground">
                            {hasTimeMapping
                              ? `No data found using ${getTimeMappingStatus().toLowerCase()}. Try widening the Global Time Picker.`
                              : "Try widening the Global Time Picker or check if the device has submitted data recently."}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <div
                          className="overflow-x-auto overflow-y-hidden border rounded-md"
                          style={{
                            width: "100%",
                            maxHeight: "70vh",
                            scrollbarWidth: "thin",
                            scrollbarColor: "var(--muted-foreground) var(--muted)",
                          }}
                        >
                          <table className="border-collapse" style={{ ...workspaceStyles, minWidth: "100%" }}>
                            <thead className="bg-muted/30 border-b sticky top-0 z-10">
                              <tr>
                                {orderedFields.map((field, index) => (
                                  <th
                                    key={field.id}
                                    className={`px-4 py-3 text-left font-medium border-r border-border/50 whitespace-nowrap ${
                                      index === 0 ? "sticky left-0 bg-muted/30 z-20" : ""
                                    }`}
                                    style={{
                                      ...workspaceStyles,
                                      minWidth: "150px",
                                      width: index === 0 ? "200px" : "auto",
                                      fontWeight:
                                        workspace.settings.tableHeaderStyle === "bold"
                                          ? 700
                                          : workspaceStyles.fontWeight,
                                      backgroundColor:
                                        index === 0
                                          ? "var(--muted)"
                                          : workspace.settings.tableHeaderStyle === "colored"
                                            ? "var(--muted)"
                                            : undefined,
                                      padding:
                                        workspace.settings.tableCellPadding === "tight"
                                          ? "8px"
                                          : workspace.settings.tableCellPadding === "spacious"
                                            ? "16px"
                                            : "12px",
                                      boxShadow: index === 0 ? "2px 0 4px rgba(0,0,0,0.1)" : undefined,
                                    }}
                                  >
                                    <div className="flex items-center gap-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-auto p-0 font-medium hover:bg-transparent"
                                        onClick={() => handleSort(field.id)}
                                      >
                                        <span>{field.name}</span>
                                        {getSortIcon(field.id)}
                                      </Button>
                                      {field.id === table.primaryKeyFieldId && (
                                        <Badge variant="outline" className="text-xs">
                                          PK
                                        </Badge>
                                      )}
                                      {field.id === table.timeMapping?.startFieldId && (
                                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                          Start
                                        </Badge>
                                      )}
                                      {field.id === table.timeMapping?.endFieldId && (
                                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                                          End
                                        </Badge>
                                      )}
                                      <Popover
                                        open={activeFilterField === field.id}
                                        onOpenChange={(open) => setActiveFilterField(open ? field.id : null)}
                                      >
                                        <PopoverTrigger asChild>
                                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-accent">
                                            <MoreHorizontal className="w-3 h-3" />
                                          </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="p-0 w-auto" align="start">
                                          <AdvancedColumnFilter
                                            fieldName={field.name}
                                            fieldType={field.type}
                                            values={getFieldValues(field.id)}
                                            selectedValues={
                                              filters.find((f) => f.fieldId === field.id)?.value
                                                ? [filters.find((f) => f.fieldId === field.id)?.value]
                                                : []
                                            }
                                            onSelectionChange={(values) => {
                                              if (values.length > 0) {
                                                handleApplyFilter(field.id, {
                                                  fieldId: field.id,
                                                  operator: "is_any_of",
                                                  value: values,
                                                })
                                              } else {
                                                handleApplyFilter(field.id, null)
                                              }
                                            }}
                                            onClose={() => setActiveFilterField(null)}
                                          />
                                        </PopoverContent>
                                      </Popover>
                                    </div>
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {paginatedSubmissions.map((submission, rowIndex) => (
                                <tr
                                  key={submission.id}
                                  className={`border-t hover:bg-muted/20 transition-colors ${rowIndex % 2 === 0 ? "bg-background" : "bg-muted/10"}`}
                                  style={{
                                    height:
                                      workspace.settings.tableRowHeight === "compact"
                                        ? "32px"
                                        : workspace.settings.tableRowHeight === "comfortable"
                                          ? "48px"
                                          : "40px",
                                  }}
                                >
                                  {orderedFields.map((field, colIndex) => (
                                    <td
                                      key={field.id}
                                      className={`border-r border-border/50 whitespace-nowrap overflow-hidden text-ellipsis ${
                                        colIndex === 0 ? "sticky left-0 bg-inherit z-10" : ""
                                      }`}
                                      style={{
                                        ...workspaceStyles,
                                        minWidth: "150px",
                                        width: colIndex === 0 ? "200px" : "auto",
                                        maxWidth: colIndex === 0 ? "200px" : "300px",
                                        padding:
                                          workspace.settings.tableCellPadding === "tight"
                                            ? "8px"
                                            : workspace.settings.tableCellPadding === "spacious"
                                              ? "16px"
                                              : "12px",
                                        borderStyle:
                                          workspace.settings.tableBorderStyle === "none"
                                            ? "none"
                                            : workspace.settings.tableBorderStyle === "dashed"
                                              ? "dashed"
                                              : workspace.settings.tableBorderStyle === "minimal"
                                                ? colIndex === 0
                                                  ? "solid"
                                                  : "none"
                                                : "solid",
                                        boxShadow: colIndex === 0 ? "2px 0 4px rgba(0,0,0,0.1)" : undefined,
                                      }}
                                    >
                                      {formatCellValue(submission.values[field.id], field.type)}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <EnhancedPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  pageSize={pageSize}
                  totalItems={sortedSubmissions.length}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={(newPageSize) => {
                    setPageSize(newPageSize)
                    setCurrentPage(1)
                  }}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </>
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
      return typeof value === "number" ? value.toLocaleString() : String(value)
    default:
      return String(value)
  }
}
