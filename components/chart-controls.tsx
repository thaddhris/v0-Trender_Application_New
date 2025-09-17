"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ZoomIn, ZoomOut, LineChart, SplitSquareHorizontal, Download } from "lucide-react"

export type ChartMode = "single-axis-on" | "split"
export type ChartSize = "M" | "L" | "XL"
export type ExportFormat = "png" | "jpg" | "pdf" | "svg"

interface ChartControlsProps {
  mode: ChartMode
  size: ChartSize
  onModeChange: (mode: ChartMode) => void
  onSizeChange: (size: ChartSize) => void
  onZoomIn: () => void
  onZoomOut: () => void
  onResetZoom: () => void
  onExportChart?: (format: ExportFormat) => void
}

export function ChartControls({
  mode,
  size,
  onModeChange,
  onSizeChange,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onExportChart,
}: ChartControlsProps) {
  return (
    <div className="flex items-center gap-4 p-4 border-b bg-background/50">
      {/* Chart Mode */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Mode:</span>
        <ToggleGroup type="single" value={mode} onValueChange={onModeChange}>
          <ToggleGroupItem value="single-axis-on" aria-label="Single with Axis">
            <LineChart className="h-4 w-4" />
            <span className="ml-1 text-xs">Single (Axis ON)</span>
          </ToggleGroupItem>
          <ToggleGroupItem value="split" aria-label="Split Chart">
            <SplitSquareHorizontal className="h-4 w-4" />
            <span className="ml-1 text-xs">Split</span>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Chart Size */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Size:</span>
        <Select value={size} onValueChange={onSizeChange}>
          <SelectTrigger className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="M">M</SelectItem>
            <SelectItem value="L">L</SelectItem>
            <SelectItem value="XL">XL</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Zoom Controls */}
      <div className="flex items-center gap-1">
        <Button variant="outline" size="sm" onClick={onZoomIn}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={onZoomOut}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={onResetZoom}>
          Reset
        </Button>
      </div>

      {onExportChart && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Export:</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4" />
                <span className="ml-1">Export</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onExportChart("png")}>Export Chart as PNG</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExportChart("jpg")}>Export Chart as JPG</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExportChart("pdf")}>Export Chart as PDF</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExportChart("svg")}>Export Chart as SVG</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  )
}
