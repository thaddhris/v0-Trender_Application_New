"use client"

import { useState } from "react"
import { Settings } from "lucide-react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Workspace } from "@/lib/types"

interface WorkspaceSettingsDialogProps {
  workspace: Workspace
  onUpdate: (updates: Partial<Workspace>) => void
}

export function WorkspaceSettingsDialog({ workspace, onUpdate }: WorkspaceSettingsDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(workspace.name)
  const [fontSize, setFontSize] = useState(workspace.settings.fontSize)
  const [alignment, setAlignment] = useState(workspace.settings.alignment)

  const handleSave = () => {
    onUpdate({
      name,
      settings: {
        fontSize,
        alignment,
      },
    })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Workspace Settings</DialogTitle>
          <DialogDescription>Configure your workspace name and default table display settings.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Workspace Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter workspace name"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="fontSize">Default Font Size</Label>
            <Select value={fontSize} onValueChange={(value: any) => setFontSize(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select font size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="alignment">Default Text Alignment</Label>
            <Select value={alignment} onValueChange={(value: any) => setAlignment(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select alignment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
