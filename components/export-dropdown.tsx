"use client"

import { useState } from "react"
import { Download, FileText, Printer, FileJson } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { exportToCSV, exportToJSON, printMultiView, type ExportData } from "@/lib/export-utils"

interface ExportDropdownProps {
  data: ExportData[]
  filename?: string
  printContainerId?: string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
  iconOnly?: boolean
  className?: string
}

export function ExportDropdown({
  data,
  filename = "export",
  printContainerId,
  variant = "outline",
  size = "sm",
  iconOnly = false,
  className,
}: ExportDropdownProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async (type: "csv" | "json" | "print") => {
    setIsExporting(true)

    try {
      switch (type) {
        case "csv":
          exportToCSV(data, filename)
          break
        case "json":
          exportToJSON(data, filename)
          break
        case "print":
          if (printContainerId) {
            printMultiView(printContainerId)
          }
          break
      }
    } catch (error) {
      console.error("Export failed:", error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} disabled={isExporting} className={className}>
          <Download className="h-4 w-4" />
          {!iconOnly && <span className="ml-2">Export</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport("csv")}>
          <FileText className="h-4 w-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("json")}>
          <FileJson className="h-4 w-4 mr-2" />
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleExport("print")}>
          <Printer className="h-4 w-4 mr-2" />
          Print View
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
