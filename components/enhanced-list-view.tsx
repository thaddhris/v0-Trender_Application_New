"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ChevronDown, Settings, Move, Eye, GripVertical, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { MoveTableDialog } from "./move-table-dialog"
import { mockTables, mockForms, mockSubmissions } from "@/lib/mock-data"
import type { List, Workspace } from "@/lib/types"

interface EnhancedListViewProps {
  list: List
  workspaces: Workspace[]
  currentWorkspaceId: string
  savedSelections?: string[]
  onTableSelect: (tableId: string) => void
  onMultiView: (tableIds: string[]) => void
  onMoveTable: (tableId: string, newWorkspaceId: string, newListId: string) => void
  onReorderTables: (tableIds: string[]) => void
}

export function EnhancedListView({
  list,
  workspaces,
  currentWorkspaceId,
  savedSelections = [],
  onTableSelect,
  onMultiView,
  onMoveTable,
  onReorderTables,
}: EnhancedListViewProps) {
  const [selectedTableIds, setSelectedTableIds] = useState<string[]>(savedSelections)
  const [expandedCards, setExpandedCards] = useState<string[]>([])
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  useEffect(() => {
    setSelectedTableIds(savedSelections)
  }, [savedSelections])

  const listTables = mockTables.filter((t) => t.listId === list.id)

  const handleTableSelection = (tableId: string, checked: boolean) => {
    let newSelection: string[]
    if (checked) {
      newSelection = [...selectedTableIds, tableId]
    } else {
      newSelection = selectedTableIds.filter((id) => id !== tableId)
    }
    setSelectedTableIds(newSelection)

    if (newSelection.length > 1) {
      setTimeout(() => onMultiView(newSelection), 100)
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTableIds(listTables.map((t) => t.id))
    } else {
      setSelectedTableIds([])
    }
  }

  const handleMultiView = () => {
    if (selectedTableIds.length > 0) {
      onMultiView(selectedTableIds)
    }
  }

  const toggleCardExpansion = (tableId: string) => {
    if (expandedCards.includes(tableId)) {
      setExpandedCards(expandedCards.filter((id) => id !== tableId))
    } else {
      setExpandedCards([...expandedCards, tableId])
    }
  }

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
      const newOrder = [...listTables]
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

  const allSelected = listTables.length > 0 && selectedTableIds.length === listTables.length
  const someSelected = selectedTableIds.length > 0 && selectedTableIds.length < listTables.length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-balance">{list.name}</h1>
          <p className="text-muted-foreground mt-1">
            {listTables.length} monitoring table{listTables.length !== 1 ? "s" : ""} • IoT Device Data
          </p>
          {selectedTableIds.length > 1 && (
            <p className="text-xs text-primary mt-1">✓ Auto Multi-View active with {selectedTableIds.length} tables</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {selectedTableIds.length > 0 && (
            <Badge variant="secondary" className="px-3 py-1">
              <Users className="w-3 h-3 mr-1" />
              {selectedTableIds.length} selected
            </Badge>
          )}
          <Button
            onClick={handleMultiView}
            disabled={selectedTableIds.length === 0}
            size="lg"
            className={selectedTableIds.length > 0 ? "bg-primary hover:bg-primary/90" : ""}
          >
            <Eye className="w-4 h-4 mr-2" />
            {selectedTableIds.length > 0 ? `Multi-View (${selectedTableIds.length})` : "Multi-View"}
          </Button>
        </div>
      </div>

      {listTables.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg border">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={allSelected}
              ref={(el) => {
                if (el) el.indeterminate = someSelected
              }}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm font-medium">
              {allSelected
                ? "Deselect all tables"
                : someSelected
                  ? "Select remaining tables"
                  : "Select tables for automatic multi-view"}
            </span>
            {selectedTableIds.length > 0 && (
              <Badge variant="outline" className="ml-2">
                {selectedTableIds.length} of {listTables.length}
              </Badge>
            )}
          </div>

          {selectedTableIds.length > 1 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Eye className="w-4 h-4" />
              <span>Auto Multi-View Ready</span>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {listTables.map((table, index) => {
          const form = mockForms.find((f) => f.id === table.formId)
          const submissionCount = mockSubmissions.filter((s) => s.formId === table.formId).length
          const isExpanded = expandedCards.includes(table.id)
          const isSelected = selectedTableIds.includes(table.id)

          return (
            <Card
              key={table.id}
              className={`hover:shadow-md transition-all duration-200 ${
                isSelected ? "ring-2 ring-primary bg-primary/5" : ""
              } ${draggedIndex === index ? "opacity-50 scale-95" : ""} ${
                dragOverIndex === index ? "border-primary" : ""
              }`}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              onDrop={handleDrop}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => handleTableSelection(table.id, checked as boolean)}
                    />
                    <div className="cursor-grab active:cursor-grabbing">
                      <GripVertical className="w-4 h-4 text-muted-foreground mt-1" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{table.name}</CardTitle>
                      {isSelected && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          <Eye className="w-3 h-3 mr-1" />
                          Selected for Multi-View
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => toggleCardExpansion(table.id)}>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  <p>Device: {form?.name}</p>
                  <p>Sensor Fields: {table.selectedFieldIds.length}</p>
                  <p>Data Entries: {submissionCount}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    PK: {form?.fields.find((f) => f.id === table.primaryKeyFieldId)?.name}
                  </Badge>
                  {table.isLocked && <Badge variant="secondary">Locked</Badge>}
                </div>

                {isExpanded && (
                  <div className="pt-3 border-t space-y-3">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Selected Sensor Fields</h4>
                      <div className="flex flex-wrap gap-1">
                        {form?.fields
                          .filter((f) => table.selectedFieldIds.includes(f.id))
                          .map((field) => (
                            <Badge key={field.id} variant="outline" className="text-xs">
                              {field.name}
                            </Badge>
                          ))}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">Created: {table.createdAt.toLocaleDateString()}</div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button size="sm" onClick={() => onTableSelect(table.id)} className="flex-1">
                    <Eye className="w-4 h-4 mr-2" />
                    Open Table
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                  <MoveTableDialog
                    table={table}
                    workspaces={workspaces}
                    currentWorkspaceId={currentWorkspaceId}
                    currentListId={list.id}
                    onMoveTable={onMoveTable}
                    trigger={
                      <Button variant="outline" size="sm">
                        <Move className="w-4 h-4" />
                      </Button>
                    }
                  />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {listTables.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No tables in this list yet.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Create a table using the "Add Table" button in the sidebar when you select this list.
          </p>
        </div>
      )}
    </div>
  )
}
