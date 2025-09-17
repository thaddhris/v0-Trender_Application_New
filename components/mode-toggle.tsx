"use client"

import { Button } from "@/components/ui/button"
import { Edit3, Eye } from "lucide-react"

interface ModeToggleProps {
  mode: "edit" | "view"
  onModeChange: (mode: "edit" | "view") => void
}

export function ModeToggle({ mode, onModeChange }: ModeToggleProps) {
  return (
    <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
      <Button
        variant={mode === "edit" ? "default" : "ghost"}
        size="sm"
        onClick={() => onModeChange("edit")}
        className="h-7 px-3 text-xs"
      >
        <Edit3 className="h-3 w-3 mr-1" />
        Edit
      </Button>
      <Button
        variant={mode === "view" ? "default" : "ghost"}
        size="sm"
        onClick={() => onModeChange("view")}
        className="h-7 px-3 text-xs"
      >
        <Eye className="h-3 w-3 mr-1" />
        View
      </Button>
    </div>
  )
}
