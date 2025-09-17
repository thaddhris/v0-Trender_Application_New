"use client"

import { useState } from "react"
import { X, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import type { Workspace } from "@/lib/types"

interface WorkspaceSettingsDrawerProps {
  workspace: Workspace
  isOpen: boolean
  onClose: () => void
  onUpdateWorkspace: (updates: Partial<Workspace>) => void
  onWorkspaceSettingsUpdate?: (workspaceId: string, settings: any) => void
  onRenameWorkspace?: (name: string) => void
}

export function WorkspaceSettingsDrawer({
  workspace,
  isOpen,
  onClose,
  onUpdateWorkspace,
  onWorkspaceSettingsUpdate,
  onRenameWorkspace,
}: WorkspaceSettingsDrawerProps) {
  const [fontSize, setFontSize] = useState(workspace.settings.fontSize)
  const [alignment, setAlignment] = useState(workspace.settings.alignment)
  const [fontWeight, setFontWeight] = useState(workspace.settings.fontWeight || "normal")
  const [lineHeight, setLineHeight] = useState(workspace.settings.lineHeight || 1.5)
  const [letterSpacing, setLetterSpacing] = useState(workspace.settings.letterSpacing || 0)
  const [tableBorderStyle, setTableBorderStyle] = useState(workspace.settings.tableBorderStyle || "solid")
  const [tableRowHeight, setTableRowHeight] = useState(workspace.settings.tableRowHeight || "medium")
  const [tableCellPadding, setTableCellPadding] = useState(workspace.settings.tableCellPadding || "normal")
  const [tableHeaderStyle, setTableHeaderStyle] = useState(workspace.settings.tableHeaderStyle || "default")

  const handleApply = () => {
    console.log("[v0] Applying workspace settings:", {
      fontSize,
      alignment,
      fontWeight,
      lineHeight,
      letterSpacing,
      tableBorderStyle,
      tableRowHeight,
      tableCellPadding,
      tableHeaderStyle,
    })

    const newSettings = {
      fontSize,
      alignment,
      fontWeight,
      lineHeight,
      letterSpacing,
      tableBorderStyle,
      tableRowHeight,
      tableCellPadding,
      tableHeaderStyle,
    }

    onUpdateWorkspace({
      settings: {
        ...workspace.settings,
        ...newSettings,
      },
    })

    if (onWorkspaceSettingsUpdate) {
      onWorkspaceSettingsUpdate(workspace.id, newSettings)
    }

    onClose()
  }

  const handleFontSizeChange = (value: string) => {
    setFontSize(value as "small" | "medium" | "large")
  }

  const handleAlignmentChange = (value: string) => {
    setAlignment(value as "left" | "center" | "right")
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-96 bg-background border-l shadow-lg z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Workspace Settings</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 space-y-6">
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Workspace</h4>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Workspace Name</Label>
              <div className="flex gap-2">
                <Input value={workspace.name} readOnly className="flex-1" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onRenameWorkspace?.(workspace.name)
                  }}
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  Rename
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Click rename to change the workspace name.</p>
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-xs text-muted-foreground mb-4">
              These settings apply to all tables in this workspace by default.
            </p>
          </div>

          {/* Font Settings */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Font Settings</h4>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Font Size</Label>
              <Select value={fontSize} onValueChange={handleFontSizeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small (12px)</SelectItem>
                  <SelectItem value="medium">Medium (14px)</SelectItem>
                  <SelectItem value="large">Large (16px)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Font Weight</Label>
              <Select value={fontWeight} onValueChange={setFontWeight}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light (300)</SelectItem>
                  <SelectItem value="normal">Normal (400)</SelectItem>
                  <SelectItem value="medium">Medium (500)</SelectItem>
                  <SelectItem value="semibold">Semi Bold (600)</SelectItem>
                  <SelectItem value="bold">Bold (700)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Text Alignment</Label>
              <Select value={alignment} onValueChange={handleAlignmentChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Line Height: {lineHeight}</Label>
              <Slider
                value={[lineHeight]}
                onValueChange={(value) => setLineHeight(value[0])}
                min={1.0}
                max={2.0}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Tight (1.0)</span>
                <span>Loose (2.0)</span>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Letter Spacing: {letterSpacing}px</Label>
              <Slider
                value={[letterSpacing]}
                onValueChange={(value) => setLetterSpacing(value[0])}
                min={-2}
                max={4}
                step={0.5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Tight (-2px)</span>
                <span>Wide (4px)</span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Table Formatting</h4>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Table Border Style</Label>
              <Select value={tableBorderStyle} onValueChange={setTableBorderStyle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Borders</SelectItem>
                  <SelectItem value="solid">Solid Lines</SelectItem>
                  <SelectItem value="dashed">Dashed Lines</SelectItem>
                  <SelectItem value="minimal">Minimal (Header Only)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Row Height</Label>
              <Select value={tableRowHeight} onValueChange={setTableRowHeight}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compact">Compact (32px)</SelectItem>
                  <SelectItem value="medium">Medium (40px)</SelectItem>
                  <SelectItem value="comfortable">Comfortable (48px)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Cell Padding</Label>
              <Select value={tableCellPadding} onValueChange={setTableCellPadding}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tight">Tight (8px)</SelectItem>
                  <SelectItem value="normal">Normal (12px)</SelectItem>
                  <SelectItem value="spacious">Spacious (16px)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Header Style</Label>
              <Select value={tableHeaderStyle} onValueChange={setTableHeaderStyle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="bold">Bold Headers</SelectItem>
                  <SelectItem value="colored">Colored Background</SelectItem>
                  <SelectItem value="minimal">Minimal Style</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Enhanced Preview */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Preview</Label>
            <div className="border rounded p-4 bg-muted/20 space-y-3">
              {/* Table Header Preview */}
              <div
                className={`
                  ${fontSize === "small" ? "text-sm" : fontSize === "large" ? "text-lg" : "text-base"}
                  ${alignment === "center" ? "text-center" : alignment === "right" ? "text-right" : "text-left"}
                  ${tableHeaderStyle === "bold" ? "font-bold" : "font-medium"}
                  ${tableHeaderStyle === "colored" ? "bg-muted px-2 py-1 rounded" : ""}
                  border-b pb-2
                `}
                style={{
                  fontWeight:
                    tableHeaderStyle === "bold"
                      ? 700
                      : fontWeight === "light"
                        ? 300
                        : fontWeight === "medium"
                          ? 500
                          : fontWeight === "semibold"
                            ? 600
                            : fontWeight === "bold"
                              ? 700
                              : 400,
                  lineHeight: lineHeight,
                  letterSpacing: `${letterSpacing}px`,
                  padding: tableCellPadding === "tight" ? "8px" : tableCellPadding === "spacious" ? "16px" : "12px",
                }}
              >
                Device Name | Temperature | Status
              </div>

              {/* Table Cell Preview */}
              <div
                className={`
                  ${fontSize === "small" ? "text-xs" : fontSize === "large" ? "text-base" : "text-sm"}
                  ${alignment === "center" ? "text-center" : alignment === "right" ? "text-right" : "text-left"}
                  text-muted-foreground
                  ${tableBorderStyle === "solid" ? "border-b" : tableBorderStyle === "dashed" ? "border-b border-dashed" : ""}
                `}
                style={{
                  fontWeight:
                    fontWeight === "light"
                      ? 300
                      : fontWeight === "medium"
                        ? 500
                        : fontWeight === "semibold"
                          ? 600
                          : fontWeight === "bold"
                            ? 700
                            : 400,
                  lineHeight: lineHeight,
                  letterSpacing: `${letterSpacing}px`,
                  padding: tableCellPadding === "tight" ? "8px" : tableCellPadding === "spacious" ? "16px" : "12px",
                  height: tableRowHeight === "compact" ? "32px" : tableRowHeight === "comfortable" ? "48px" : "40px",
                }}
              >
                Sensor-001 | 23.5°C | Active
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button onClick={handleApply} className="flex-1">
              Apply Settings
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
