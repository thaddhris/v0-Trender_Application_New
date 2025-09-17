"use client"

import { Clock } from "lucide-react"
import { WorkspaceSettingsDialog } from "./workspace-settings-dialog"
import { GlobalTimePicker } from "./global-time-picker"
import { Badge } from "@/components/ui/badge"
import type { Workspace, TimeRange } from "@/lib/types"

interface WorkspaceHeaderProps {
  workspace: Workspace
  timeRange: TimeRange
  onTimeRangeChange: (range: TimeRange) => void
  onWorkspaceUpdate: (updates: Partial<Workspace>) => void
}

export function WorkspaceHeader({ workspace, timeRange, onTimeRangeChange, onWorkspaceUpdate }: WorkspaceHeaderProps) {
  return (
    <div className="border-b bg-card px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-semibold">{workspace.name}</h1>
            <p className="text-sm text-muted-foreground">IoT Device Data Platform</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Time Filter
            </Badge>
            <GlobalTimePicker timeRange={timeRange} onChange={onTimeRangeChange} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <WorkspaceSettingsDialog workspace={workspace} onUpdate={onWorkspaceUpdate} />
        </div>
      </div>
    </div>
  )
}
