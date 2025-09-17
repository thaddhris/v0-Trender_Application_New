"use client"

import type React from "react"

import { useState } from "react"
import { ArrowLeft, GripVertical, X, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EnhancedTableView } from "./enhanced-table-view"
import type { Table, List, TimeRange } from "@/lib/types"
import { mockForms, mockSubmissions } from "@/lib/mock-data"

interface MultiViewProps {
  list: List
  selectedTables: Table[]
  timeRange: TimeRange
  onBack: () => void
  onRemoveTable: (tableId: string) => void
  onReorderTables: (tableIds: string[]) => void
  onUpdateTable: (tableId: string, updates: Partial<Table>) => void
}

export function MultiView({
  list,
  selectedTables,
  timeRange,
  onBack,
  onRemoveTable,
  onReorderTables,
  onUpdateTable,
}: MultiViewProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOverIndex(index)
  }

  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      const newOrder = [...selectedTables]
      const [draggedItem] = newOrder.splice(draggedIndex, 1)
      newOrder.splice(dragOverIndex, 0, draggedItem)
      onReorderTables(newOrder.map((t) => t.id))
    }
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    handleDragEnd()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to List
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-balance">Multi-View: {list.name}</h1>
            <p className="text-muted-foreground">
              Viewing {selectedTables.length} table{selectedTables.length !== 1 ? "s" : ""} in a single scrolling view
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Eye className="w-3 h-3" />
          Multi-View Active
        </Badge>
      </div>

      <div className="space-y-8">
        {selectedTables.map((table, index) => {
          const form = mockForms.find((f) => f.id === table.formId)
          const submissionCount = mockSubmissions.filter((s) => s.formId === table.formId).length

          return (
            <Card
              key={table.id}
              className={`transition-all duration-200 ${
                draggedIndex === index ? "opacity-50 scale-95" : ""
              } ${dragOverIndex === index ? "border-primary" : ""}`}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              onDrop={handleDrop}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="cursor-grab active:cursor-grabbing">
                      <GripVertical className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{table.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">Form: {form?.name}</Badge>
                        <Badge variant="outline">{submissionCount} rows</Badge>
                        {table.isLocked && <Badge variant="secondary">Locked</Badge>}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveTable(table.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <EnhancedTableView
                  table={table}
                  timeRange={timeRange}
                  onUpdateTable={(updates) => onUpdateTable(table.id, updates)}
                />
              </CardContent>
            </Card>
          )
        })}
      </div>

      {selectedTables.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No tables selected for multi-view.</p>
          <Button variant="outline" onClick={onBack} className="mt-4 bg-transparent">
            Return to List
          </Button>
        </div>
      )}
    </div>
  )
}
