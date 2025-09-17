"use client"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { GlobalTimePicker } from "@/components/global-time-picker"
import { ThemeToggle } from "@/components/theme-toggle"
import { ModeToggle } from "@/components/mode-toggle"
import type { Workspace, TimeRange } from "@/lib/types"

type TitleDisplayMode = "config-name" | "device-id" | "device-name" // Updated from table-name to config-name

interface TopHeaderProps {
  workspace: Workspace
  timeRange: TimeRange
  multiViewMode: boolean
  currentTable?: { id: string; name: string; listName?: string; formId?: string } | null // Keeping currentTable for backward compatibility
  appMode: "edit" | "view"
  onAppModeChange: (mode: "edit" | "view") => void
  onTimeRangeChange: (range: TimeRange) => void
  onMultiViewToggle: (enabled: boolean) => void
  onWorkspaceUpdate: (updates: Partial<Workspace>) => void
  onWorkspaceSettingsUpdate?: (workspaceId: string, settings: any) => void
}

export function TopHeader({
  workspace,
  timeRange,
  multiViewMode,
  currentTable, // This represents currentConfig now
  appMode,
  onAppModeChange,
  onTimeRangeChange,
  onMultiViewToggle,
  onWorkspaceUpdate,
  onWorkspaceSettingsUpdate,
}: TopHeaderProps) {
  const getDisplayTitle = () => {
    if (!currentTable) return workspace.name

    return (
      <span>
        {workspace.name}
        {currentTable.listName && (
          <>
            <span className="text-muted-foreground mx-2">/</span>
            <span className="text-muted-foreground">{currentTable.listName}</span>
          </>
        )}
        <span className="text-muted-foreground mx-2">/</span>
        <span>{currentTable.name}</span>
      </span>
    )
  }

  return (
    <header className="border-b bg-background px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">{getDisplayTitle()}</h1>
          <ModeToggle mode={appMode} onModeChange={onAppModeChange} />
        </div>

        <div className="flex items-center gap-6">
          <div className="flex justify-center flex-1">
            <GlobalTimePicker timeRange={timeRange} onTimeRangeChange={onTimeRangeChange} />
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />

            <div className="flex items-center gap-2">
              <Switch id="multi-view" checked={multiViewMode} onCheckedChange={onMultiViewToggle} />
              <Label htmlFor="multi-view" className="text-sm font-medium">
                MultiView {/* This enables multi-config selection for combined charts */}
              </Label>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
