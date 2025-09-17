"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { GripVertical, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EnhancedTableView } from "@/components/enhanced-table-view"
import { ExportDropdown } from "@/components/export-dropdown"
import { mockSubmissions, mockForms } from "@/lib/mock-data"
import type { Table, TimeRange } from "@/lib/types"
import type { ExportData } from "@/lib/export-utils"

interface MultiTableViewProps {
  tables: Table[]
  timeRange: TimeRange
  workspace?: any
  onUpdateTable: (id: string, updates: Partial<Table>) => void
  onTableSelect: (tableId: string) => void
  onRemoveTable?: (tableId: string) => void
  onReorderTables?: (tableIds: string[]) => void
}

export function MultiTableView({
  tables,
  timeRange,
  workspace,
  onUpdateTable,
  onTableSelect,
  onRemoveTable,
  onReorderTables,
}: MultiTableViewProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const exportData = useMemo((): ExportData[] => {
    return tables.map((table) => {
      const form = mockForms.find((f) => f.id === table.formId)
      if (!form) return { tableName: table.name, headers: [], rows: [] }

      const selectedFields = form.fields.filter((field) => table.selectedFieldIds.includes(field.id))

      const headers = selectedFields.map((field) => field.name)

      // Filter submissions by time range and form
      const submissions = mockSubmissions
        .filter((sub) => sub.formId === table.formId)
        .filter((sub) => {
          const subTime = new Date(sub.timestamp)
          return subTime >= timeRange.start && subTime <= timeRange.end
        })

      const rows = submissions.map((submission) => selectedFields.map((field) => submission.values[field.id] || null))

      return {
        tableName: table.name,
        headers,
        rows,
      }
    })
  }, [tables, timeRange])

  if (tables.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-muted-foreground">No tables selected for MultiView</h2>
          <p className="text-muted-foreground">
            Enable MultiView mode and select tables from the navigation bar to view them here.
          </p>
        </div>
      </div>
    )
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/html", "")
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverIndex(index)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }

    const newTables = [...tables]
    const draggedTable = newTables[draggedIndex]

    // Remove dragged item
    newTables.splice(draggedIndex, 1)

    // Insert at new position
    const insertIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex
    newTables.splice(insertIndex, 0, draggedTable)

    // Update order
    if (onReorderTables) {
      onReorderTables(newTables.map((t) => t.id))
    }

    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-8 p-6" id="multiview-print-container">
        {/* MultiView Header */}
        <div className="flex items-center justify-between sticky top-0 bg-background z-10 pb-4">
          <div>
            <h2 className="text-xl font-semibold">MultiView</h2>
            <p className="text-sm text-muted-foreground">
              Viewing {tables.length} table{tables.length !== 1 ? "s" : ""} • Drag to reorder
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ExportDropdown
              data={exportData}
              filename={`multiview-${new Date().toISOString().split("T")[0]}`}
              printContainerId="multiview-print-container"
            />
            <Badge variant="secondary" className="flex items-center gap-1">
              {tables.length} Tables
            </Badge>
          </div>
        </div>

        {/* Tables Stack */}
        {tables.map((table, index) => (
          <div
            key={table.id}
            className={`
              border rounded-lg overflow-hidden transition-all duration-200 mb-8
              ${draggedIndex === index ? "opacity-50 scale-95" : ""}
              ${dragOverIndex === index ? "border-primary shadow-lg" : ""}
            `}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
          >
            {/* Table Header with Drag Handle */}
            <div className="bg-muted/50 px-4 py-3 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="cursor-grab active:cursor-grabbing p-1 hover:bg-accent rounded"
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold">{table.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    Table {index + 1} of {tables.length}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => onTableSelect(table.id)} className="text-xs">
                  View Solo
                </Button>
                {onRemoveTable && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveTable(table.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Table Content */}
            <div className="min-h-[400px]">
              <EnhancedTableView
                table={table}
                timeRange={timeRange}
                workspace={workspace}
                onUpdateTable={(updates) => onUpdateTable(table.id, updates)}
                compact={true}
              />
            </div>
          </div>
        ))}

        {/* Drop Zone Indicator */}
        {draggedIndex !== null && (
          <div className="border-2 border-dashed border-primary/50 rounded-lg p-8 text-center text-muted-foreground">
            Drop here to reorder tables
          </div>
        )}
      </div>
    </div>
  )
}
