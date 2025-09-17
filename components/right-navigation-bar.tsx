"use client"

import type React from "react"

import { useState } from "react"
import { Plus, Settings, ChevronDown, ChevronRight, Folder, Table, Monitor, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { WorkspaceSettingsDrawer } from "./workspace-settings-drawer"
import { mockLists, mockTables } from "@/lib/mock-data"
import type { Workspace } from "@/lib/types"

interface RightNavigationBarProps {
  workspaces: Workspace[]
  currentWorkspaceId: string
  currentTableId: string | null
  multiViewMode: boolean
  selectedTableIds: string[]
  onWorkspaceSelect: (workspaceId: string) => void
  onTableSelect: (tableId: string) => void
  onMultiViewTableToggle: (tableId: string, selected: boolean) => void
  onCreateWorkspace: (name: string) => void
  onCreateTable: (listId: string, name?: string) => string
  onUpdateWorkspace: (id: string, updates: Partial<Workspace>) => void
  onMoveTable?: (tableId: string, newListId: string) => void
  onMoveList?: (listId: string, newWorkspaceId: string) => void
}

export function RightNavigationBar({
  workspaces,
  currentWorkspaceId,
  currentTableId,
  multiViewMode,
  selectedTableIds,
  onWorkspaceSelect,
  onTableSelect,
  onMultiViewTableToggle,
  onCreateWorkspace,
  onCreateTable,
  onUpdateWorkspace,
  onMoveTable,
  onMoveList,
}: RightNavigationBarProps) {
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<Set<string>>(new Set([currentWorkspaceId]))
  const [expandedLists, setExpandedLists] = useState<Set<string>>(new Set())
  const [creatingWorkspace, setCreatingWorkspace] = useState(false)
  const [creatingList, setCreatingList] = useState<string | null>(null)
  const [creatingTable, setCreatingTable] = useState<string | null>(null)
  const [newItemName, setNewItemName] = useState("")
  const [workspaceSettingsOpen, setWorkspaceSettingsOpen] = useState(false)
  const [draggedItem, setDraggedItem] = useState<{ type: "table" | "list"; id: string } | null>(null)
  const [dragOverTarget, setDragOverTarget] = useState<{ type: "list" | "workspace"; id: string } | null>(null)

  const currentWorkspace = workspaces.find((w) => w.id === currentWorkspaceId)
  const workspaceLists = mockLists.filter((l) => l.workspaceId === currentWorkspaceId)

  const toggleWorkspace = (workspaceId: string) => {
    const newExpanded = new Set(expandedWorkspaces)
    if (newExpanded.has(workspaceId)) {
      newExpanded.delete(workspaceId)
    } else {
      newExpanded.add(workspaceId)
    }
    setExpandedWorkspaces(newExpanded)
  }

  const toggleList = (listId: string) => {
    const newExpanded = new Set(expandedLists)
    if (newExpanded.has(listId)) {
      newExpanded.delete(listId)
    } else {
      newExpanded.add(listId)
    }
    setExpandedLists(newExpanded)
  }

  const handleCreateWorkspace = () => {
    if (newItemName.trim()) {
      onCreateWorkspace(newItemName.trim())
      setNewItemName("")
      setCreatingWorkspace(false)
    }
  }

  const handleCreateTable = (listId: string) => {
    const tableName = newItemName.trim() || "New Table"
    onCreateTable(listId, tableName)
    setNewItemName("")
    setCreatingTable(null)
  }

  const handleDragStart = (e: React.DragEvent, type: "table" | "list", id: string) => {
    setDraggedItem({ type, id })
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", JSON.stringify({ type, id }))
  }

  const handleDragOver = (e: React.DragEvent, targetType: "list" | "workspace", targetId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverTarget({ type: targetType, id: targetId })
  }

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if we're leaving the entire drop zone
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverTarget(null)
    }
  }

  const handleDrop = (e: React.DragEvent, targetType: "list" | "workspace", targetId: string) => {
    e.preventDefault()

    if (!draggedItem) return

    if (draggedItem.type === "table" && targetType === "list" && onMoveTable) {
      // Moving table to a different list
      onMoveTable(draggedItem.id, targetId)
    } else if (draggedItem.type === "list" && targetType === "workspace" && onMoveList) {
      // Moving list to a different workspace
      onMoveList(draggedItem.id, targetId)
    }

    setDraggedItem(null)
    setDragOverTarget(null)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
    setDragOverTarget(null)
  }

  const isDropTarget = (type: "list" | "workspace", id: string) => {
    return dragOverTarget?.type === type && dragOverTarget?.id === id
  }

  const isDragging = (type: "table" | "list", id: string) => {
    return draggedItem?.type === type && draggedItem?.id === id
  }

  return (
    <>
      <nav className="w-80 border-l bg-background flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold">{currentWorkspace?.name}</h2>
              <Button variant="ghost" size="sm" onClick={() => setWorkspaceSettingsOpen(true)}>
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Primary Actions */}
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start bg-transparent"
              onClick={() => setCreatingWorkspace(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Workspace
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start bg-transparent"
              onClick={() => setCreatingList(currentWorkspaceId)}
            >
              <Plus className="h-4 w-4 mr-2" />
              List
            </Button>
          </div>
        </div>

        {/* Navigation Tree */}
        <div className="flex-1 overflow-auto p-4">
          <div className="space-y-2">
            {/* Create Workspace Inline */}
            {creatingWorkspace && (
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Workspace name"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateWorkspace()
                    if (e.key === "Escape") setCreatingWorkspace(false)
                  }}
                  autoFocus
                />
                <Button size="sm" onClick={handleCreateWorkspace}>
                  Add
                </Button>
              </div>
            )}

            {/* Workspaces */}
            {workspaces.map((workspace) => (
              <div key={workspace.id}>
                <div
                  className={`
                    flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-accent transition-colors
                    ${workspace.id === currentWorkspaceId ? "bg-accent" : ""}
                    ${isDropTarget("workspace", workspace.id) ? "bg-primary/10 border-2 border-primary border-dashed" : ""}
                  `}
                  onClick={() => {
                    onWorkspaceSelect(workspace.id)
                    toggleWorkspace(workspace.id)
                  }}
                  onDragOver={(e) => handleDragOver(e, "workspace", workspace.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, "workspace", workspace.id)}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleWorkspace(workspace.id)
                    }}
                  >
                    {expandedWorkspaces.has(workspace.id) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                  <Monitor className="h-4 w-4" />
                  <span className="text-sm font-medium">{workspace.name}</span>
                </div>

                {/* Lists under workspace */}
                {expandedWorkspaces.has(workspace.id) && (
                  <div className="ml-6 space-y-1">
                    {workspaceLists
                      .filter((list) => list.workspaceId === workspace.id)
                      .map((list) => {
                        const listTables = mockTables.filter((t) => t.listId === list.id)
                        return (
                          <div key={list.id}>
                            <div
                              className={`
                                flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-accent transition-colors
                                ${isDragging("list", list.id) ? "opacity-50" : ""}
                                ${isDropTarget("list", list.id) ? "bg-primary/10 border-2 border-primary border-dashed" : ""}
                              `}
                              draggable
                              onDragStart={(e) => handleDragStart(e, "list", list.id)}
                              onDragEnd={handleDragEnd}
                              onDragOver={(e) => handleDragOver(e, "list", list.id)}
                              onDragLeave={handleDragLeave}
                              onDrop={(e) => handleDrop(e, "list", list.id)}
                              onClick={() => toggleList(list.id)}
                            >
                              <GripVertical className="h-3 w-3 text-muted-foreground cursor-grab active:cursor-grabbing" />
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                {expandedLists.has(list.id) ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </Button>
                              <Folder className="h-4 w-4" />
                              <span className="text-sm">{list.name}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 ml-auto"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setCreatingTable(list.id)
                                }}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>

                            {/* Create Table Inline */}
                            {creatingTable === list.id && (
                              <div className="ml-8 flex gap-2 mb-2">
                                <Input
                                  placeholder="Table name"
                                  value={newItemName}
                                  onChange={(e) => setNewItemName(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") handleCreateTable(list.id)
                                    if (e.key === "Escape") setCreatingTable(null)
                                  }}
                                  autoFocus
                                />
                                <Button size="sm" onClick={() => handleCreateTable(list.id)}>
                                  Add
                                </Button>
                              </div>
                            )}

                            {/* Tables under list */}
                            {expandedLists.has(list.id) && (
                              <div className="ml-6 space-y-1">
                                {listTables.map((table) => (
                                  <div
                                    key={table.id}
                                    className={`
                                      flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-accent transition-colors
                                      ${table.id === currentTableId ? "bg-accent" : ""}
                                      ${isDragging("table", table.id) ? "opacity-50" : ""}
                                    `}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, "table", table.id)}
                                    onDragEnd={handleDragEnd}
                                    onClick={() => onTableSelect(table.id)}
                                  >
                                    <GripVertical className="h-3 w-3 text-muted-foreground cursor-grab active:cursor-grabbing" />
                                    {multiViewMode && (
                                      <Checkbox
                                        checked={selectedTableIds.includes(table.id)}
                                        onCheckedChange={(checked) =>
                                          onMultiViewTableToggle(table.id, checked as boolean)
                                        }
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                    )}
                                    <Table className="h-4 w-4" />
                                    <span className="text-sm">{table.name}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })}
                  </div>
                )}
              </div>
            ))}

            {/* Drop Zone Indicator */}
            {draggedItem && (
              <div className="mt-4 p-4 border-2 border-dashed border-muted-foreground/50 rounded-lg text-center text-sm text-muted-foreground">
                {draggedItem.type === "table"
                  ? "Drop on a list to move this table"
                  : "Drop on a workspace to move this list"}
              </div>
            )}
          </div>
        </div>
      </nav>

      {currentWorkspace && (
        <WorkspaceSettingsDrawer
          workspace={currentWorkspace}
          isOpen={workspaceSettingsOpen}
          onClose={() => setWorkspaceSettingsOpen(false)}
          onUpdateWorkspace={onUpdateWorkspace}
        />
      )}
    </>
  )
}
