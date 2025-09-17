"use client"

import { useRef, useState } from "react"
import Highcharts from "highcharts"
import HighchartsReact from "highcharts-react-official"
import type { Config, TimeRange, PlotLine } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Minus } from "lucide-react"

interface ChartViewProps {
  config: Config
  timeRange: TimeRange
  className?: string
}

// Generate mock time series data for a config
function generateMockData(config: Config, timeRange: TimeRange) {
  const startTime = new Date(timeRange.start).getTime()
  const endTime = new Date(timeRange.end).getTime()
  const interval = (endTime - startTime) / 100 // 100 data points

  const data: [number, number][] = []

  for (let i = 0; i <= 100; i++) {
    const timestamp = startTime + i * interval
    let value: number

    // Generate realistic data based on sensor type
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

export function ChartView({ config, timeRange, className }: ChartViewProps) {
  const chartRef = useRef<HighchartsReact.RefObject>(null)
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

  const data = generateMockData(config, timeRange)

  const handleAddPlotLine = () => {
    if (!newPlotLine.value || !newPlotLine.label?.text) return

    const plotLine: PlotLine = {
      id: Date.now().toString(),
      configId: config.id,
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
    chart: {
      type: "line",
      backgroundColor: "transparent",
      height: 400,
    },
    title: {
      text: `${config.deviceName} - ${config.sensorName}`,
      style: {
        fontSize: "16px",
        fontWeight: "600",
      },
    },
    subtitle: {
      text: `${config.sensorType} (${config.unit})`,
      style: {
        fontSize: "12px",
        color: "#666",
      },
    },
    xAxis: {
      type: "datetime",
      title: {
        text: "Time",
      },
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
    yAxis: {
      title: {
        text: `${config.sensorType} (${config.unit})`,
      },
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
    },
    series: [
      {
        type: "line",
        name: config.sensorName,
        data: data,
        color: "#3b82f6",
        lineWidth: 2,
        marker: {
          enabled: false,
          states: {
            hover: {
              enabled: true,
            },
          },
        },
      },
    ],
    tooltip: {
      shared: true,
      crosshairs: true,
      formatter: function () {
        return `<b>${this.series?.name}</b><br/>
                ${Highcharts.dateFormat("%Y-%m-%d %H:%M:%S", this.x as number)}<br/>
                ${this.y} ${config.unit}`
      },
    },
    legend: {
      enabled: false,
    },
    credits: {
      enabled: false,
    },
    plotOptions: {
      line: {
        animation: {
          duration: 1000,
        },
      },
    },
  }

  return (
    <div className={className}>
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

      <HighchartsReact highcharts={Highcharts} options={options} ref={chartRef} />
    </div>
  )
}
