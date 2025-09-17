"use client"

import { ChevronLeft, ChevronRight, Database, Table, Folder, Edit, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AddTableDialog } from "./add-table-dialog"
import { mockLists, mockTables } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import type { Workspace, Form, Table as TableType } from "@/lib/types"

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  workspaces: Workspace[]
  forms: Form[]
  currentWorkspaceId: string
  currentListId: string | null
  currentTableId: string | null
  onNavigate: (type: "workspace" | "list" | "table", id: string) => void
  onCreateTable: (table: Omit<TableType, "id" | "createdAt">) => void
}

export function Sidebar({
  collapsed,
  onToggle,
  workspaces,
  forms,
  currentWorkspaceId,
  currentListId,
  currentTableId,
  onNavigate,
  onCreateTable,
}: SidebarProps) {
  const workspaceLists = mockLists.filter((l) => l.workspaceId === currentWorkspaceId)

  return (
    <div
      className={cn(
        "bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col h-full",
        collapsed ? "w-12" : "w-64",
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border flex-shrink-0">
        {!collapsed && currentListId && (
          <AddTableDialog forms={forms} currentListId={currentListId} onCreateTable={onCreateTable} />
        )}
        {!collapsed && !currentListId && (
          <Button disabled variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Select List First
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {!collapsed && (
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-sidebar-foreground mb-2">Workspaces</h3>
            {workspaces.map((workspace) => (
              <div key={workspace.id}>
                <Button
                  variant={currentWorkspaceId === workspace.id ? "secondary" : "ghost"}
                  className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent text-left"
                  onClick={() => onNavigate("workspace", workspace.id)}
                >
                  <Database className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{workspace.name}</span>
                </Button>

                {currentWorkspaceId === workspace.id && (
                  <div className="ml-6 mt-2 space-y-1">
                    {workspaceLists.map((list) => (
                      <div key={list.id}>
                        <div className="flex items-center gap-1">
                          <Button
                            variant={currentListId === list.id ? "secondary" : "ghost"}
                            size="sm"
                            className="flex-1 justify-start text-sidebar-foreground hover:bg-sidebar-accent text-left min-w-0"
                            onClick={() => onNavigate("list", list.id)}
                          >
                            <Folder className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span className="truncate">{list.name}</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-8 h-8 p-0 text-sidebar-foreground hover:bg-sidebar-accent flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              // TODO: Add edit list functionality
                              console.log("[v0] Edit list:", list.name)
                            }}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                        </div>

                        {currentListId === list.id && (
                          <div className="ml-6 mt-1 space-y-1">
                            {mockTables
                              .filter((t) => t.listId === list.id)
                              .map((table) => (
                                <Button
                                  key={table.id}
                                  variant={currentTableId === table.id ? "secondary" : "ghost"}
                                  size="sm"
                                  className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent text-left min-w-0"
                                  onClick={() => onNavigate("table", table.id)}
                                >
                                  <Table className="w-4 h-4 mr-2 flex-shrink-0" />
                                  <span className="truncate">{table.name}</span>
                                </Button>
                              ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
