"use client"

import { useState } from "react"
import { Plus, Trash2, Edit } from "lucide-react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { Workspace } from "@/lib/types"

interface WorkspaceManagerProps {
  workspaces: Workspace[]
  onCreateWorkspace: (name: string) => void
  onUpdateWorkspace: (id: string, updates: Partial<Workspace>) => void
  onDeleteWorkspace: (id: string) => void
}

export function WorkspaceManager({
  workspaces,
  onCreateWorkspace,
  onUpdateWorkspace,
  onDeleteWorkspace,
}: WorkspaceManagerProps) {
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [newWorkspaceName, setNewWorkspaceName] = useState("")
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null)
  const [editName, setEditName] = useState("")

  const handleCreate = () => {
    if (newWorkspaceName.trim()) {
      onCreateWorkspace(newWorkspaceName.trim())
      setNewWorkspaceName("")
      setCreateOpen(false)
    }
  }

  const handleEdit = (workspace: Workspace) => {
    setEditingWorkspace(workspace)
    setEditName(workspace.name)
    setEditOpen(true)
  }

  const handleUpdate = () => {
    if (editingWorkspace && editName.trim()) {
      onUpdateWorkspace(editingWorkspace.id, { name: editName.trim() })
      setEditOpen(false)
      setEditingWorkspace(null)
      setEditName("")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Workspaces</h3>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Workspace
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Workspace</DialogTitle>
              <DialogDescription>Create a new workspace to organize your forms and tables.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="workspace-name">Workspace Name</Label>
                <Input
                  id="workspace-name"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  placeholder="Enter workspace name"
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreate} disabled={!newWorkspaceName.trim()}>
                Create Workspace
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {workspaces.map((workspace) => (
          <div
            key={workspace.id}
            className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50"
          >
            <div>
              <h4 className="font-medium">{workspace.name}</h4>
              <p className="text-sm text-muted-foreground">
                Font: {workspace.settings.fontSize} • Align: {workspace.settings.alignment}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => handleEdit(workspace)}>
                <Edit className="w-4 h-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Workspace</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{workspace.name}"? This action cannot be undone and will delete
                      all lists and tables in this workspace.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDeleteWorkspace(workspace.id)}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Workspace</DialogTitle>
            <DialogDescription>Update the workspace name.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Workspace Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Enter workspace name"
                onKeyDown={(e) => e.key === "Enter" && handleUpdate()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdate} disabled={!editName.trim()}>
              Update Workspace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
