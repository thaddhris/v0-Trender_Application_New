"use client"

import { useRef, useState } from "react"
import Highcharts from "highcharts"
import HighchartsReact from "highcharts-react-official"
import type { Config, TimeRange, ChartComment, ExportFormat, PlotLine } from "@/lib/types"
import { ChartControls, type ChartMode, type ChartSize } from "./chart-controls"
import { ChartCommentModal } from "./chart-comment-modal"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Download, Plus, Minus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AdvancedChartViewProps {
  configs: Config[]
  timeRange: TimeRange
  comments: ChartComment[]
  highlightedComment?: ChartComment | null
  onAddComment: (comment: Omit<ChartComment, "id" | "createdAt">) => void
  className?: string
}

function generateMockData(config: Config, timeRange: TimeRange) {
  const startTime = new Date(timeRange.start).getTime()
  const endTime = new Date(timeRange.end).getTime()
  const interval = (endTime - startTime) / 100

  const data: [number, number][] = []

  for (let i = 0; i <= 100; i++) {
    const timestamp = startTime + i * interval
    let value: number

    switch (config.sensorType) {
      case "temperature":
        value = 20 + Math.sin(i * 0.1) * 5 + Math.random() * 2
        break
      case "humidity":
        value = 50 + Math.sin(i * 0.15) * 20 + Math.random() * 5
        break
      case "pressure":
        value = 1013 + Math.sin(i * 0.05) * 10 + Math.random() * 3
        break
      case "flow":
        value = Math.max(0, 10 + Math.sin(i * 0.2) * 8 + Math.random() * 2)
        break
      default:
        value = Math.random() * 100
    }

    data.push([timestamp, Math.round(value * 100) / 100])
  }

  return data
}

function createAxisConfiguration(configs: Config[]) {
  const uniqueUnits = [...new Set(configs.map((c) => c.unit))]

  if (uniqueUnits.length === 1) {
    return [
      {
        title: { text: `Values (${uniqueUnits[0]})` },
        opposite: false,
      },
    ]
  } else if (uniqueUnits.length <= 4) {
    return uniqueUnits.map((unit, index) => ({
      title: { text: `${unit}` },
      opposite: index % 2 === 1,
      offset: index > 1 ? (index - 1) * 60 : 0,
    }))
  } else {
    return [
      {
        title: { text: "Values" },
        opposite: false,
      },
    ]
  }
}

const colors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4", "#f97316", "#84cc16"]

function getConfigName(configId: string, configs: Config[]) {
  const config = configs.find((c) => c.id === configId)
  return config ? config.name : "Unknown"
}

function getDeviceSensorName(comment: ChartComment, configs: Config[]) {
  const config = configs.find((c) => c.id === comment.configId)
  return config ? `${config.deviceId} - ${config.sensorId}` : "Unknown"
}

export function AdvancedChartView({
  configs,
  timeRange,
  comments,
  highlightedComment,
  onAddComment,
  className,
}: AdvancedChartViewProps) {
  const chartRef = useRef<HighchartsReact.RefObject>(null)
  const [mode, setMode] = useState<ChartMode>("single-axis-on")
  const [size, setSize] = useState<ChartSize>("L")
  const [plotLines, setPlotLines] = useState<PlotLine[]>([])
  const [plotLineDialog, setPlotLineDialog] = useState(false)
  const [newPlotLine, setNewPlotLine] = useState<Partial<PlotLine>>({
    axis: "y",
    color: "#ff0000",
    width: 2,
    dashStyle: "Solid",
    label: { text: "", align: "center", verticalAlign: "middle" },
    isVisible: true,
  })
  const [commentModal, setCommentModal] = useState<{
    isOpen: boolean
    chartPoint: {
      timestamp: Date
      value: number
      x: number
      y: number
      sensorId: string
      deviceId: string
      configId: string
    } | null
  }>({
    isOpen: false,
    chartPoint: null,
  })

  const getChartHeight = () => {
    switch (size) {
      case "M":
        return 300
      case "L":
        return 500
      case "XL":
        return 700
      default:
        return 500
    }
  }

  const handleZoomIn = () => {
    const chart = chartRef.current?.chart
    if (chart) {
      const xAxis = chart.xAxis[0]
      const currentMin = xAxis.min || xAxis.dataMin
      const currentMax = xAxis.max || xAxis.dataMax
      const range = currentMax - currentMin
      const newRange = range * 0.7
      const center = (currentMin + currentMax) / 2

      xAxis.setExtremes(center - newRange / 2, center + newRange / 2)
    }
  }

  const handleZoomOut = () => {
    const chart = chartRef.current?.chart
    if (chart) {
      const xAxis = chart.xAxis[0]
      const currentMin = xAxis.min || xAxis.dataMin
      const currentMax = xAxis.max || xAxis.dataMax
      const range = currentMax - currentMin
      const newRange = range * 1.3
      const center = (currentMin + currentMax) / 2

      xAxis.setExtremes(center - newRange / 2, center + newRange / 2)
    }
  }

  const handleResetZoom = () => {
    const chart = chartRef.current?.chart
    if (chart) {
      chart.xAxis[0].setExtremes(null, null)
    }
  }

  const handleChartClick = (event: Highcharts.PointerEventObject) => {
    const chart = chartRef.current?.chart
    if (!chart) return

    const point = chart.series[0]?.searchPoint(event, true)
    if (point && point.x !== undefined && point.y !== undefined) {
      const config = configs[0]
      if (config && config.deviceId && config.sensorId) {
        console.log("[v0] Chart click - point.x:", point.x, "Date:", new Date(point.x))
        setCommentModal({
          isOpen: true,
          chartPoint: {
            timestamp: new Date(point.x),
            value: point.y,
            x: event.chartX,
            y: event.chartY,
            sensorId: config.sensorId,
            deviceId: config.deviceId,
            configId: config.id,
          },
        })
      }
    }
  }

  const handleSaveComment = (commentText: string) => {
    if (commentModal.chartPoint) {
      onAddComment({
        workspaceId: "",
        configId: commentModal.chartPoint.configId,
        timestamp: commentModal.chartPoint.timestamp,
        chartX: commentModal.chartPoint.x,
        chartY: commentModal.chartPoint.y,
        value: commentModal.chartPoint.value,
        sensorId: commentModal.chartPoint.sensorId,
        deviceId: commentModal.chartPoint.deviceId,
        comment: commentText,
        isVisible: true,
      })
    }
  }

  const createSeries = () => {
    if (!configs || configs.length === 0) {
      return []
    }

    const baseSeries =
      mode === "split"
        ? configs.map((config, index) => ({
            type: "line" as const,
            name: `${config.name}`,
            data: generateMockData(config, timeRange),
            color: colors[index % colors.length],
            lineWidth: 2,
            yAxis: index,
            marker: { enabled: false, states: { hover: { enabled: true } } },
            point: {
              events: {
                click: function (this: Highcharts.Point) {
                  const config = configs.find((c) => c.name === this.series.name)
                  if (config && config.deviceId && config.sensorId) {
                    console.log("[v0] Point click - this.x:", this.x, "Date:", new Date(this.x))
                    setCommentModal({
                      isOpen: true,
                      chartPoint: {
                        timestamp: new Date(this.x),
                        value: this.y,
                        x: 0,
                        y: 0,
                        sensorId: config.sensorId,
                        deviceId: config.deviceId,
                        configId: config.id,
                      },
                    })
                  }
                },
              },
            },
          }))
        : configs.map((config, index) => {
            const uniqueUnits = [...new Set(configs.map((c) => c.unit || ""))]
            const axisIndex = uniqueUnits.indexOf(config.unit || "")

            return {
              type: "line" as const,
              name: config.name,
              data: generateMockData(config, timeRange),
              color: colors[index % colors.length],
              lineWidth: 2,
              yAxis: mode === "single-axis-off" ? 0 : axisIndex,
              marker: { enabled: false, states: { hover: { enabled: true } } },
              point: {
                events: {
                  click: function (this: Highcharts.Point) {
                    const config = configs.find((c) => c.name === this.series.name)
                    if (config && config.deviceId && config.sensorId) {
                      console.log("[v0] Point click (single axis) - this.x:", this.x, "Date:", new Date(this.x))
                      setCommentModal({
                        isOpen: true,
                        chartPoint: {
                          timestamp: new Date(this.x),
                          value: this.y,
                          x: 0,
                          y: 0,
                          sensorId: config.sensorId,
                          deviceId: config.deviceId,
                          configId: config.id,
                        },
                      })
                    }
                  },
                },
              },
            }
          })

    const visibleComments = (comments || []).filter(
      (c) => c.isVisible && configs.some((config) => config.id === c.configId),
    )

    if (visibleComments.length > 0) {
      const commentSeries = {
        type: "scatter" as const,
        name: "Comments",
        data: visibleComments.map((comment) => ({
          x: comment.timestamp.getTime(),
          y: comment.value,
          marker: {
            symbol: "circle",
            radius: 6,
            fillColor: highlightedComment?.id === comment.id ? "#ff6b6b" : "#ffd93d",
            lineColor: "#333",
            lineWidth: 2,
          },
          comment: comment,
        })),
        showInLegend: false,
        enableMouseTracking: true,
        point: {
          events: {
            click: function (this: any) {
              console.log("[v0] Comment clicked:", this.options.comment)
            },
          },
        },
      }

      return [...baseSeries, commentSeries]
    }

    return baseSeries
  }

  const createYAxisConfig = () => {
    if (!configs || configs.length === 0) {
      return [{ title: { text: "No Data" } }]
    }

    const baseConfig =
      mode === "split"
        ? configs.map((config, index) => ({
            title: { text: `${config.sensorType} (${config.unit})` },
            top: `${(index / configs.length) * 100}%`,
            height: `${(1 / configs.length) * 100 - 2}%`,
            offset: 0,
            lineWidth: 2,
          }))
        : mode === "single-axis-off"
          ? [
              {
                title: { text: "" },
                labels: { enabled: false },
                gridLineWidth: 0,
                lineWidth: 0,
                tickWidth: 0,
              },
            ]
          : createAxisConfiguration(configs)

    return baseConfig.map((axis, index) => ({
      ...axis,
      plotLines: plotLines
        .filter((pl) => pl.axis === "y" && pl.isVisible)
        .map((pl) => ({
          value: pl.value,
          color: pl.color,
          width: pl.width,
          dashStyle: pl.dashStyle.toLowerCase(),
          label: {
            text: pl.label.text,
            align: pl.label.align,
            verticalAlign: pl.label.verticalAlign,
            style: { color: pl.color, fontWeight: "bold" },
          },
          zIndex: 5,
        })),
    }))
  }

  const handleExportChart = (format: ExportFormat) => {
    const chart = chartRef.current?.chart
    if (!chart) return

    const filename = `chart-${mode}-${new Date().toISOString().split("T")[0]}`

    try {
      if (format === "pdf") {
        const chartContainer = chart.container
        const chartHTML = chartContainer.outerHTML

        const printWindow = window.open("", "_blank")
        if (printWindow) {
          printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>Chart Export</title>
              <style>
                body { margin: 0; padding: 20px; }
                @media print {
                  body { margin: 0; padding: 0; }
                }
              </style>
            </head>
            <body>
              ${chartHTML}
            </body>
            </html>
          `)
          printWindow.document.close()
          printWindow.focus()
          setTimeout(() => {
            printWindow.print()
            printWindow.close()
          }, 500)
        }
        return
      }

      const svgElement = chart.container.querySelector("svg")
      if (!svgElement) {
        console.error("[v0] No SVG element found in chart")
        return
      }

      if (format === "svg") {
        const svgData = new XMLSerializer().serializeToString(svgElement)
        const blob = new Blob([svgData], { type: "image/svg+xml" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${filename}.svg`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        return
      }

      const svgData = new XMLSerializer().serializeToString(svgElement)
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      if (!ctx) {
        console.error("[v0] Could not get canvas context")
        return
      }

      const img = new Image()

      img.onload = () => {
        canvas.width = img.width || 800
        canvas.height = img.height || 400

        if (format === "jpg") {
          ctx.fillStyle = "#ffffff"
          ctx.fillRect(0, 0, canvas.width, canvas.height)
        }

        ctx.drawImage(img, 0, 0)

        const mimeType = format === "jpg" ? "image/jpeg" : "image/png"
        const extension = format === "jpg" ? "jpg" : "png"

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob)
              const a = document.createElement("a")
              a.href = url
              a.download = `${filename}.${extension}`
              document.body.appendChild(a)
              a.click()
              document.body.removeChild(a)
              URL.revokeObjectURL(url)
            }
          },
          mimeType,
          format === "jpg" ? 0.9 : 1.0,
        )
      }

      img.onerror = () => {
        console.error("[v0] Failed to load SVG for canvas conversion")
      }

      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
      const reader = new FileReader()
      reader.onload = () => {
        img.src = reader.result as string
      }
      reader.readAsDataURL(svgBlob)
    } catch (error) {
      console.error("[v0] Export failed:", error)
    }
  }

  const handleExportIndividualChart = (format: ExportFormat, configId: string) => {
    const chart = chartRef.current?.chart
    if (!chart) return

    const config = configs.find((c) => c.id === configId)
    const filename = `${config?.name || "chart"}-${new Date().toISOString().split("T")[0]}`

    try {
      if (format === "pdf") {
        const chartContainer = chart.container
        const chartHTML = chartContainer.outerHTML

        const printWindow = window.open("", "_blank")
        if (printWindow) {
          printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>${config?.name || "Chart"} Export</title>
              <style>
                body { margin: 0; padding: 20px; }
                @media print {
                  body { margin: 0; padding: 0; }
                }
              </style>
            </head>
            <body>
              ${chartHTML}
            </body>
            </html>
          `)
          printWindow.document.close()
          printWindow.focus()
          setTimeout(() => {
            printWindow.print()
            printWindow.close()
          }, 500)
        }
        return
      }

      const svgElement = chart.container.querySelector("svg")
      if (!svgElement) {
        console.error("[v0] No SVG element found in chart")
        return
      }

      if (format === "svg") {
        const svgData = new XMLSerializer().serializeToString(svgElement)
        const blob = new Blob([svgData], { type: "image/svg+xml" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${filename}.svg`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        return
      }

      const svgData = new XMLSerializer().serializeToString(svgElement)
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      if (!ctx) {
        console.error("[v0] Could not get canvas context")
        return
      }

      const img = new Image()

      img.onload = () => {
        canvas.width = img.width || 800
        canvas.height = img.height || 400

        if (format === "jpg") {
          ctx.fillStyle = "#ffffff"
          ctx.fillRect(0, 0, canvas.width, canvas.height)
        }

        ctx.drawImage(img, 0, 0)

        const mimeType = format === "jpg" ? "image/jpeg" : "image/png"
        const extension = format === "jpg" ? "jpg" : "png"

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob)
              const a = document.createElement("a")
              a.href = url
              a.download = `${filename}.${extension}`
              document.body.appendChild(a)
              a.click()
              document.body.removeChild(a)
              URL.revokeObjectURL(url)
            }
          },
          mimeType,
          format === "jpg" ? 0.9 : 1.0,
        )
      }

      img.onerror = () => {
        console.error("[v0] Failed to load SVG for canvas conversion")
      }

      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
      const reader = new FileReader()
      reader.onload = () => {
        img.src = reader.result as string
      }
      reader.readAsDataURL(svgBlob)
    } catch (error) {
      console.error("[v0] Export failed:", error)
    }
  }

  const handleAddPlotLine = () => {
    if (!newPlotLine.value || !newPlotLine.label?.text) return

    const plotLine: PlotLine = {
      id: Date.now().toString(),
      configId: configs[0]?.id || "",
      axis: newPlotLine.axis || "y",
      value: newPlotLine.value,
      color: newPlotLine.color || "#ff0000",
      width: newPlotLine.width || 2,
      dashStyle: newPlotLine.dashStyle || "Solid",
      label: {
        text: newPlotLine.label?.text || "",
        align: newPlotLine.label?.align || "center",
        verticalAlign: newPlotLine.label?.verticalAlign || "middle",
      },
      isVisible: true,
      createdAt: new Date(),
    }

    setPlotLines((prev) => [...prev, plotLine])
    setPlotLineDialog(false)
    setNewPlotLine({
      axis: "y",
      color: "#ff0000",
      width: 2,
      dashStyle: "Solid",
      label: { text: "", align: "center", verticalAlign: "middle" },
      isVisible: true,
    })
  }

  const handleRemovePlotLine = (id: string) => {
    setPlotLines((prev) => prev.filter((pl) => pl.id !== id))
  }

  const togglePlotLineVisibility = (id: string) => {
    setPlotLines((prev) => prev.map((pl) => (pl.id === id ? { ...pl, isVisible: !pl.isVisible } : pl)))
  }

  const options: Highcharts.Options = {
    exporting: {
      enabled: false,
    },
    chart: {
      type: "line",
      backgroundColor: "transparent",
      height: getChartHeight(),
      zoomType: "x",
      panning: { enabled: true, type: "x" },
      panKey: "shift",
      events: {
        click: handleChartClick,
      },
    },
    title: {
      text: configs.length === 1 ? `${configs[0].name}` : "Combined Chart View",
      style: { fontSize: "18px", fontWeight: "600" },
    },
    subtitle: {
      text: `${configs.length} configuration${configs.length > 1 ? "s" : ""} | Mode: ${mode.replace("-", " ").toUpperCase()} | Size: ${size}`,
      style: { fontSize: "12px", color: "#666" },
    },
    xAxis: {
      type: "datetime",
      title: { text: "Time" },
      crosshair: true,
      plotLines: plotLines
        .filter((pl) => pl.axis === "x" && pl.isVisible)
        .map((pl) => ({
          value: pl.value,
          color: pl.color,
          width: pl.width,
          dashStyle: pl.dashStyle.toLowerCase(),
          label: {
            text: pl.label.text,
            align: pl.label.align,
            verticalAlign: pl.label.verticalAlign,
            style: { color: pl.color, fontWeight: "bold" },
          },
          zIndex: 5,
        })),
    },
    yAxis: createYAxisConfig(),
    series: createSeries(),
    tooltip: {
      shared: mode !== "split",
      crosshairs: true,
      formatter: function () {
        if (mode === "split") {
          const config = configs.find((c) => `${c.name}` === this.series?.name)
          return `<b>${this.series?.name}</b><br/>
                  ${Highcharts.dateFormat("%Y-%m-%d %H:%M:%S", this.x as number)}<br/>
                  ${this.y} ${config?.unit || ""}`
        } else {
          let tooltip = `<b>${Highcharts.dateFormat("%Y-%m-%d %H:%M:%S", this.x as number)}</b><br/>`
          this.points?.forEach((point) => {
            const config = configs.find((c) => `${c.name}` === point.series.name)
            tooltip += `<span style="color:${point.color}">${point.series.name}</span>: ${point.y} ${config?.unit || ""}<br/>`
          })
          return tooltip
        }
      },
    },
    legend: {
      enabled: true,
      layout: "horizontal",
      align: "center",
      verticalAlign: "bottom",
    },
    credits: { enabled: false },
    plotOptions: {
      line: {
        animation: { duration: 1000 },
        cursor: "crosshair",
      },
      scatter: {
        cursor: "pointer",
        tooltip: {
          headerFormat: "<b>Comment</b><br>",
          pointFormatter: function (this: any) {
            const comment = this.options.comment
            return `${Highcharts.dateFormat("%Y-%m-%d %H:%M:%S", this.x)}<br/>
                    Value: ${this.y}<br/>
                    <b>${comment?.comment || "No comment"}</b>`
          },
        },
      },
    },
  }

  return (
    <div className={className}>
      <ChartControls
        mode={mode}
        size={size}
        onModeChange={setMode}
        onSizeChange={setSize}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
        onExportChart={handleExportChart}
      />

      <div className="flex items-center gap-2 mb-4">
        <Dialog open={plotLineDialog} onOpenChange={setPlotLineDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Plot Line
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Plot Line</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="axis" className="text-right">
                  Axis
                </Label>
                <Select
                  value={newPlotLine.axis}
                  onValueChange={(value: "x" | "y") => setNewPlotLine((prev) => ({ ...prev, axis: value }))}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="x">X-Axis (Time)</SelectItem>
                    <SelectItem value="y">Y-Axis (Value)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="value" className="text-right">
                  Value
                </Label>
                <Input
                  id="value"
                  type="number"
                  className="col-span-3"
                  value={newPlotLine.value || ""}
                  onChange={(e) => setNewPlotLine((prev) => ({ ...prev, value: Number.parseFloat(e.target.value) }))}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="label" className="text-right">
                  Label
                </Label>
                <Input
                  id="label"
                  className="col-span-3"
                  value={newPlotLine.label?.text || ""}
                  onChange={(e) =>
                    setNewPlotLine((prev) => ({
                      ...prev,
                      label: { ...prev.label, text: e.target.value, align: "center", verticalAlign: "middle" },
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="color" className="text-right">
                  Color
                </Label>
                <Input
                  id="color"
                  type="color"
                  className="col-span-3"
                  value={newPlotLine.color || "#ff0000"}
                  onChange={(e) => setNewPlotLine((prev) => ({ ...prev, color: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="style" className="text-right">
                  Style
                </Label>
                <Select
                  value={newPlotLine.dashStyle}
                  onValueChange={(value: any) => setNewPlotLine((prev) => ({ ...prev, dashStyle: value }))}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Solid">Solid</SelectItem>
                    <SelectItem value="Dash">Dash</SelectItem>
                    <SelectItem value="Dot">Dot</SelectItem>
                    <SelectItem value="DashDot">DashDot</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleAddPlotLine}>Add Plot Line</Button>
            </div>
          </DialogContent>
        </Dialog>

        {plotLines.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Plot Lines:</span>
            {plotLines.map((pl) => (
              <div key={pl.id} className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 bg-transparent"
                  style={{ borderColor: pl.color }}
                  onClick={() => togglePlotLineVisibility(pl.id)}
                >
                  <span className="text-xs" style={{ color: pl.isVisible ? pl.color : "#ccc" }}>
                    {pl.label.text}
                  </span>
                </Button>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleRemovePlotLine(pl.id)}>
                  <Minus className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="relative">
        <HighchartsReact highcharts={Highcharts} options={options} ref={chartRef} />

        {mode === "split" && configs.length > 1 && (
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            {configs.map((config, index) => (
              <div key={config.id} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
                <span className="text-xs font-medium">{config.name}</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-6 w-6 p-0 bg-transparent">
                      <Download className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleExportIndividualChart("png", config.id)}>
                      Export as PNG
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExportIndividualChart("jpg", config.id)}>
                      Export as JPG
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExportIndividualChart("pdf", config.id)}>
                      Export as PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExportIndividualChart("svg", config.id)}>
                      Export as SVG
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        )}
      </div>

      <ChartCommentModal
        isOpen={commentModal.isOpen}
        onClose={() => setCommentModal({ isOpen: false, chartPoint: null })}
        onSave={handleSaveComment}
        chartPoint={commentModal.chartPoint}
      />
    </div>
  )
}
