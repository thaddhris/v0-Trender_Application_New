"use client"

import type React from "react"

import { useState } from "react"
import { Move } from "lucide-react"
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
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Workspace, Table } from "@/lib/types"
import { mockLists } from "@/lib/mock-data"

interface MoveTableDialogProps {
  table: Table
  workspaces: Workspace[]
  currentWorkspaceId: string
  currentListId: string
  onMoveTable: (tableId: string, newWorkspaceId: string, newListId: string) => void
  trigger?: React.ReactNode
}

export function MoveTableDialog({
  table,
  workspaces,
  currentWorkspaceId,
  currentListId,
  onMoveTable,
  trigger,
}: MoveTableDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(currentWorkspaceId)
  const [selectedListId, setSelectedListId] = useState(currentListId)

  const availableLists = mockLists.filter((l) => l.workspaceId === selectedWorkspaceId)

  const handleMove = () => {
    if (selectedWorkspaceId && selectedListId) {
      onMoveTable(table.id, selectedWorkspaceId, selectedListId)
      setOpen(false)
    }
  }

  const handleWorkspaceChange = (workspaceId: string) => {
    setSelectedWorkspaceId(workspaceId)
    // Reset list selection when workspace changes
    const newWorkspaceLists = mockLists.filter((l) => l.workspaceId === workspaceId)
    if (newWorkspaceLists.length > 0) {
      setSelectedListId(newWorkspaceLists[0].id)
    }
  }

  const canMove = selectedWorkspaceId !== currentWorkspaceId || selectedListId !== currentListId

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Move className="w-4 h-4 mr-2" />
            Move
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Move Table</DialogTitle>
          <DialogDescription>
            Move "{table.name}" to a different workspace or list. This will update the table's location and
            organization.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="workspace">Destination Workspace</Label>
            <Select value={selectedWorkspaceId} onValueChange={handleWorkspaceChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select workspace" />
              </SelectTrigger>
              <SelectContent>
                {workspaces.map((workspace) => (
                  <SelectItem key={workspace.id} value={workspace.id}>
                    {workspace.name}
                    {workspace.id === currentWorkspaceId && " (Current)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="list">Destination List</Label>
            <Select value={selectedListId} onValueChange={setSelectedListId}>
              <SelectTrigger>
                <SelectValue placeholder="Select list" />
              </SelectTrigger>
              <SelectContent>
                {availableLists.map((list) => (
                  <SelectItem key={list.id} value={list.id}>
                    {list.name}
                    {list.id === currentListId && selectedWorkspaceId === currentWorkspaceId && " (Current)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleMove} disabled={!canMove}>
            Move Table
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
