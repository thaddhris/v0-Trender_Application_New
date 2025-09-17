// Core data types for the Device Sensor Configuration → Charts Trending App

export interface Workspace {
  id: string
  name: string
  settings: {
    fontSize: "small" | "medium" | "large"
    alignment: "left" | "center" | "right"
  }
  createdAt: Date
}

export interface List {
  id: string
  workspaceId: string
  name: string
  order: number
  createdAt: Date
}

export interface Config {
  id: string
  listId: string
  name: string
  deviceId: string
  sensorId: string
  isLocked: boolean
  createdAt: Date
}

export interface Device {
  id: string
  name: string
  type: string
  location?: string
}

export interface Sensor {
  id: string
  deviceId: string
  name: string
  type: "temperature" | "humidity" | "pressure" | "voltage" | "current" | "power" | "flow" | "level"
  unit: string
}

export interface TimeRange {
  start: Date
  end: Date
  preset?: string
}

export interface ChartFilter {
  sensorId: string
  operator: string
  value: any
}

export interface SensorData {
  timestamp: Date
  value: number
  sensorId: string
  deviceId: string
}

export interface ChartConfig {
  type: "line" | "area" | "column" | "spline"
  colors: string[]
  yAxis: {
    title: string
    min?: number
    max?: number
  }
}

export interface ChartComment {
  id: string
  workspaceId: string
  configId: string
  timestamp: Date // The time point on the chart where comment was added
  chartX: number // X coordinate on chart
  chartY: number // Y coordinate on chart
  value: number // The data value at that point
  sensorId: string
  deviceId: string
  comment: string
  author?: string
  createdAt: Date
  isVisible: boolean
}

export interface PlotLine {
  id: string
  configId: string
  axis: "x" | "y" // x for time-based, y for value-based
  value: number // timestamp for x-axis, numeric value for y-axis
  color: string
  width: number
  dashStyle: "Solid" | "Dash" | "Dot" | "DashDot"
  label: {
    text: string
    align: "left" | "center" | "right"
    verticalAlign: "top" | "middle" | "bottom"
  }
  isVisible: boolean
  createdAt: Date
}

export interface CommentHighlight {
  commentId: string
  startTime: Date
  endTime: Date
  configId: string
}
