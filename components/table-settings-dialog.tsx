"use client"

import type React from "react"

import { useState } from "react"
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
import { Switch } from "@/components/ui/switch"
import type { Table as TableType } from "@/lib/types"

interface TableSettingsDialogProps {
  table: TableType
  onUpdateTable: (updates: Partial<TableType>) => void
  trigger: React.ReactNode
}

export function TableSettingsDialog({ table, onUpdateTable, trigger }: TableSettingsDialogProps) {
  const [open, setOpen] = useState(false)
  const [tableName, setTableName] = useState(table.name)
  const [isLocked, setIsLocked] = useState(table.isLocked)

  const handleSave = () => {
    onUpdateTable({
      name: tableName,
      isLocked: isLocked,
    })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Table Settings</DialogTitle>
          <DialogDescription>Configure your table settings and column permissions.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="table-name" className="text-right">
              Name
            </Label>
            <Input
              id="table-name"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="lock-columns" className="text-right">
              Lock Columns
            </Label>
            <div className="col-span-3 flex items-center space-x-2">
              <Switch id="lock-columns" checked={isLocked} onCheckedChange={setIsLocked} />
              <Label htmlFor="lock-columns" className="text-sm text-muted-foreground">
                {isLocked ? "Columns are locked" : "Columns can be added"}
              </Label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
