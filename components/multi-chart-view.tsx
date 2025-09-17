"use client"

import { useRef } from "react"
import Highcharts from "highcharts"
import HighchartsReact from "highcharts-react-official"
import type { Config, TimeRange } from "@/lib/types"

interface MultiChartViewProps {
  configs: Config[]
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

const colors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4", "#f97316", "#84cc16"]

export function MultiChartView({ configs, timeRange, className }: MultiChartViewProps) {
  const chartRef = useRef<HighchartsReact.RefObject>(null)

  const series = configs.map((config, index) => ({
    type: "line" as const,
    name: `${config.deviceName} - ${config.sensorName}`,
    data: generateMockData(config, timeRange),
    color: colors[index % colors.length],
    lineWidth: 2,
    marker: {
      enabled: false,
      states: {
        hover: {
          enabled: true,
        },
      },
    },
  }))

  const options: Highcharts.Options = {
    chart: {
      type: "line",
      backgroundColor: "transparent",
      height: 500,
    },
    title: {
      text: "Combined Chart View",
      style: {
        fontSize: "18px",
        fontWeight: "600",
      },
    },
    subtitle: {
      text: `${configs.length} configurations`,
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
    },
    yAxis: {
      title: {
        text: "Values",
      },
    },
    series: series,
    tooltip: {
      shared: true,
      crosshairs: true,
      formatter: function () {
        let tooltip = `<b>${Highcharts.dateFormat("%Y-%m-%d %H:%M:%S", this.x as number)}</b><br/>`

        this.points?.forEach((point) => {
          const config = configs.find((c) => `${c.deviceName} - ${c.sensorName}` === point.series.name)
          tooltip += `<span style="color:${point.color}">${point.series.name}</span>: ${point.y} ${config?.unit || ""}<br/>`
        })

        return tooltip
      },
    },
    legend: {
      enabled: true,
      layout: "horizontal",
      align: "center",
      verticalAlign: "bottom",
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
      <HighchartsReact highcharts={Highcharts} options={options} ref={chartRef} />
    </div>
  )
}
