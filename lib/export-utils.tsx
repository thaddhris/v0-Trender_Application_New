import type { Config, TimeRange } from "@/lib/types"

export interface ExportData {
  configName: string // renamed from tableName to configName
  headers: string[]
  rows: (string | number | boolean | null)[][]
}

export function getWorkspaceExportData(
  workspaceId: string,
  configs: Config[], // renamed from tables to configs
  lists: any[],
  timeRange: TimeRange,
  mockSubmissions: any[],
  mockForms: any[],
): ExportData[] {
  if (!lists || !Array.isArray(lists)) {
    return []
  }

  const workspaceLists = lists.filter((l) => l.workspaceId === workspaceId)
  const workspaceListIds = workspaceLists.map((l) => l.id)
  const workspaceConfigs = configs.filter((c) => workspaceListIds.includes(c.listId)) // renamed to configs

  return getConfigsExportData(workspaceConfigs, timeRange, mockSubmissions, mockForms) // renamed function call
}

export function getListExportData(
  listId: string,
  configs: Config[], // renamed from tables to configs
  timeRange: TimeRange,
  mockSubmissions: any[],
  mockForms: any[],
): ExportData[] {
  const listConfigs = configs.filter((c) => c.listId === listId) // renamed to configs
  return getConfigsExportData(listConfigs, timeRange, mockSubmissions, mockForms) // renamed function call
}

function getConfigsExportData(
  // renamed from getTablesExportData
  configs: Config[], // renamed from tables to configs
  timeRange: TimeRange,
  mockSubmissions: any[],
  mockForms: any[],
): ExportData[] {
  return configs.map((config) => {
    // renamed to config
    // Generate sample chart data based on device-sensor pair
    const headers = ["Timestamp", "Value", "Device", "Sensor"]

    // Generate sample time series data for the config
    const rows: (string | number | boolean | null)[][] = []
    const startTime = timeRange.start.getTime()
    const endTime = timeRange.end.getTime()
    const interval = (endTime - startTime) / 100 // 100 data points

    for (let i = 0; i < 100; i++) {
      const timestamp = new Date(startTime + i * interval).toISOString()
      const value = Math.random() * 100 + Math.sin(i * 0.1) * 20 // Sample sensor data
      rows.push([timestamp, value, config.deviceId, config.sensorId])
    }

    return {
      configName: config.name, // renamed from tableName
      headers,
      rows,
    }
  })
}

export function exportToCSV(data: ExportData[], filename = "multiview-export") {
  let csvContent = ""

  data.forEach((configData, index) => {
    // renamed from tableData
    if (index > 0) csvContent += "\n\n"

    // Add config name as header
    csvContent += `"${configData.configName}"\n` // renamed from tableName

    // Add headers
    csvContent += configData.headers.map((header) => `"${header}"`).join(",") + "\n"

    // Add rows
    configData.rows.forEach((row) => {
      csvContent +=
        row
          .map((cell) => {
            if (cell === null || cell === undefined) return '""'
            if (typeof cell === "string") return `"${cell.replace(/"/g, '""')}"`
            return `"${cell}"`
          })
          .join(",") + "\n"
    })
  })

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", `${filename}.csv`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function exportToJSON(data: ExportData[], filename = "multiview-export") {
  const jsonData = {
    exportDate: new Date().toISOString(),
    configs: data.map((configData) => ({
      // renamed from tables to configs
      name: configData.configName, // renamed from tableName
      headers: configData.headers,
      data: configData.rows.map((row) => {
        const obj: Record<string, any> = {}
        configData.headers.forEach((header, index) => {
          obj[header] = row[index]
        })
        return obj
      }),
    })),
  }

  const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: "application/json" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", `${filename}.json`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function printMultiView(containerId: string) {
  const printContent = document.getElementById(containerId)
  if (!printContent) return

  const printWindow = window.open("", "_blank")
  if (!printWindow) return

  printWindow.document.write(`
    <html>
      <head>
        <title>MultiView Export</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .table-section { margin-bottom: 40px; page-break-inside: avoid; }
          .table-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f5f5f5; font-weight: bold; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
      </body>
    </html>
  `)

  printWindow.document.close()
  printWindow.focus()
  setTimeout(() => {
    printWindow.print()
    printWindow.close()
  }, 250)
}
