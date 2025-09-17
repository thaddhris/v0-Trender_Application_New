// Mock data for development without database
import type { Workspace, List, Config, Device, Sensor, SensorData, Form, Submission, ChartComment } from "./types"

export const mockForms: Form[] = [
  {
    id: "form-1",
    name: "Environment Monitoring Device",
    createdAt: new Date("2024-01-01"),
    fields: [
      { id: "field-1", formId: "form-1", name: "Device ID", type: "text" },
      { id: "field-2", formId: "form-1", name: "Temperature", type: "number" },
      { id: "field-3", formId: "form-1", name: "Humidity", type: "number" },
      { id: "field-4", formId: "form-1", name: "Air Quality Index", type: "number" },
      { id: "field-5", formId: "form-1", name: "CO2 Level", type: "number" },
      { id: "field-6", formId: "form-1", name: "Device Online", type: "boolean" },
      { id: "field-7", formId: "form-1", name: "Location", type: "text" },
      { id: "field-8", formId: "form-1", name: "Battery Level", type: "number" },
      { id: "field-9", formId: "form-1", name: "Last Calibration", type: "date" },
      {
        id: "field-10",
        formId: "form-1",
        name: "Alert Status",
        type: "enum",
        options: ["Normal", "Warning", "Critical", "Maintenance"],
      },
    ],
  },
  {
    id: "form-2",
    name: "Weather Reporting Station",
    createdAt: new Date("2024-01-15"),
    fields: [
      { id: "field-11", formId: "form-2", name: "Station ID", type: "text" },
      { id: "field-12", formId: "form-2", name: "Wind Speed", type: "number" },
      { id: "field-13", formId: "form-2", name: "Wind Direction", type: "number" },
      { id: "field-14", formId: "form-2", name: "Rainfall", type: "number" },
      { id: "field-15", formId: "form-2", name: "Atmospheric Pressure", type: "number" },
      { id: "field-16", formId: "form-2", name: "UV Index", type: "number" },
      { id: "field-17", formId: "form-2", name: "Visibility", type: "number" },
      { id: "field-18", formId: "form-2", name: "Storm Warning", type: "boolean" },
      {
        id: "field-19",
        formId: "form-2",
        name: "Weather Condition",
        type: "enum",
        options: ["Clear", "Cloudy", "Rainy", "Stormy", "Foggy"],
      },
    ],
  },
]

export const mockSubmissions: Submission[] = [
  // Environment Monitoring Device submissions (35 entries)
  ...Array.from({ length: 35 }, (_, i) => ({
    id: `sub-env-${i + 1}`,
    formId: "form-1",
    timestamp: new Date(Date.now() - i * 2 * 60 * 60 * 1000),
    values: {
      "field-1": `ENV-${String(i + 1).padStart(3, "0")}`,
      "field-2": Math.round((20 + Math.random() * 15) * 10) / 10,
      "field-3": Math.round((40 + Math.random() * 40) * 10) / 10,
      "field-4": Math.round(50 + Math.random() * 100),
      "field-5": Math.round(400 + Math.random() * 600),
      "field-6": Math.random() > 0.1,
      "field-7": ["Building A", "Building B", "Warehouse", "Office Floor 1", "Office Floor 2"][
        Math.floor(Math.random() * 5)
      ],
      "field-8": Math.round(20 + Math.random() * 80),
      "field-9": new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      "field-10": ["Normal", "Warning", "Critical", "Maintenance"][Math.floor(Math.random() * 4)],
    },
  })),

  // Weather Reporting Station submissions (32 entries)
  ...Array.from({ length: 32 }, (_, i) => ({
    id: `sub-weather-${i + 1}`,
    formId: "form-2",
    timestamp: new Date(Date.now() - i * 3 * 60 * 60 * 1000),
    values: {
      "field-11": `WS-${String(i + 1).padStart(2, "0")}`,
      "field-12": Math.round(Math.random() * 25 * 10) / 10,
      "field-13": Math.round(Math.random() * 360),
      "field-14": Math.round(Math.random() * 50 * 10) / 10,
      "field-15": Math.round((980 + Math.random() * 60) * 10) / 10,
      "field-16": Math.round(Math.random() * 11),
      "field-17": Math.round((1 + Math.random() * 19) * 10) / 10,
      "field-18": Math.random() > 0.8,
      "field-19": ["Clear", "Cloudy", "Rainy", "Stormy", "Foggy"][Math.floor(Math.random() * 5)],
    },
  })),
]

export const mockDevices: Device[] = [
  { id: "dev-1", name: "Environment Monitor A1", type: "Environmental", location: "Building A - Floor 1" },
  { id: "dev-2", name: "Environment Monitor A2", type: "Environmental", location: "Building A - Floor 2" },
  { id: "dev-3", name: "Weather Station WS01", type: "Weather", location: "Rooftop North" },
  { id: "dev-4", name: "Weather Station WS02", type: "Weather", location: "Rooftop South" },
  { id: "dev-5", name: "Plant Machine M1", type: "Industrial", location: "Workshop Zone A" },
  { id: "dev-6", name: "Plant Machine M2", type: "Industrial", location: "Workshop Zone B" },
  { id: "dev-7", name: "Conveyor Belt CB01", type: "Industrial", location: "Production Line 1" },
  { id: "dev-8", name: "Conveyor Belt CB02", type: "Industrial", location: "Production Line 2" },
  { id: "dev-9", name: "Energy Meter EM01", type: "Energy", location: "Main Distribution Panel" },
  { id: "dev-10", name: "Energy Meter EM02", type: "Energy", location: "Secondary Panel" },
  { id: "dev-11", name: "HVAC Unit H1", type: "HVAC", location: "Zone A" },
  { id: "dev-12", name: "HVAC Unit H2", type: "HVAC", location: "Zone B" },
]

export const mockSensors: Sensor[] = [
  // Environment Monitor A1 sensors
  { id: "sen-1", deviceId: "dev-1", name: "Temperature", type: "temperature", unit: "°C" },
  { id: "sen-2", deviceId: "dev-1", name: "Humidity", type: "humidity", unit: "%" },
  { id: "sen-3", deviceId: "dev-1", name: "Air Quality Index", type: "pressure", unit: "AQI" },
  { id: "sen-4", deviceId: "dev-1", name: "CO2 Level", type: "pressure", unit: "ppm" },

  // Environment Monitor A2 sensors
  { id: "sen-5", deviceId: "dev-2", name: "Temperature", type: "temperature", unit: "°C" },
  { id: "sen-6", deviceId: "dev-2", name: "Humidity", type: "humidity", unit: "%" },
  { id: "sen-7", deviceId: "dev-2", name: "Air Quality Index", type: "pressure", unit: "AQI" },

  // Weather Station WS01 sensors
  { id: "sen-8", deviceId: "dev-3", name: "Wind Speed", type: "flow", unit: "m/s" },
  { id: "sen-9", deviceId: "dev-3", name: "Wind Direction", type: "pressure", unit: "°" },
  { id: "sen-10", deviceId: "dev-3", name: "Rainfall", type: "level", unit: "mm" },
  { id: "sen-11", deviceId: "dev-3", name: "Atmospheric Pressure", type: "pressure", unit: "hPa" },

  // Weather Station WS02 sensors
  { id: "sen-12", deviceId: "dev-4", name: "Temperature", type: "temperature", unit: "°C" },
  { id: "sen-13", deviceId: "dev-4", name: "UV Index", type: "pressure", unit: "UV" },
  { id: "sen-14", deviceId: "dev-4", name: "Visibility", type: "level", unit: "km" },

  // Plant Machine M1 sensors
  { id: "sen-15", deviceId: "dev-5", name: "Machine Temperature", type: "temperature", unit: "°C" },
  { id: "sen-16", deviceId: "dev-5", name: "Vibration Level", type: "pressure", unit: "mm/s" },
  { id: "sen-17", deviceId: "dev-5", name: "Oil Pressure", type: "pressure", unit: "bar" },
  { id: "sen-18", deviceId: "dev-5", name: "RPM", type: "flow", unit: "rpm" },

  // Plant Machine M2 sensors
  { id: "sen-19", deviceId: "dev-6", name: "Power Consumption", type: "power", unit: "kW" },
  { id: "sen-20", deviceId: "dev-6", name: "Temperature", type: "temperature", unit: "°C" },

  // Conveyor Belt CB01 sensors
  { id: "sen-21", deviceId: "dev-7", name: "Belt Speed", type: "flow", unit: "m/s" },
  { id: "sen-22", deviceId: "dev-7", name: "Load Weight", type: "pressure", unit: "kg" },
  { id: "sen-23", deviceId: "dev-7", name: "Motor Current", type: "current", unit: "A" },

  // Conveyor Belt CB02 sensors
  { id: "sen-24", deviceId: "dev-8", name: "Belt Tension", type: "pressure", unit: "N" },
  { id: "sen-25", deviceId: "dev-8", name: "Motor Current", type: "current", unit: "A" },

  // Energy Meter EM01 sensors
  { id: "sen-26", deviceId: "dev-9", name: "Voltage", type: "voltage", unit: "V" },
  { id: "sen-27", deviceId: "dev-9", name: "Current", type: "current", unit: "A" },
  { id: "sen-28", deviceId: "dev-9", name: "Power Factor", type: "power", unit: "PF" },

  // Energy Meter EM02 sensors
  { id: "sen-29", deviceId: "dev-10", name: "Energy Consumed", type: "power", unit: "kWh" },
  { id: "sen-30", deviceId: "dev-10", name: "Peak Demand", type: "power", unit: "kW" },

  // HVAC Unit H1 sensors
  { id: "sen-31", deviceId: "dev-11", name: "Set Temperature", type: "temperature", unit: "°C" },
  { id: "sen-32", deviceId: "dev-11", name: "Current Temperature", type: "temperature", unit: "°C" },
  { id: "sen-33", deviceId: "dev-11", name: "Fan Speed", type: "flow", unit: "%" },

  // HVAC Unit H2 sensors
  { id: "sen-34", deviceId: "dev-12", name: "Energy Efficiency", type: "power", unit: "%" },
  { id: "sen-35", deviceId: "dev-12", name: "Temperature", type: "temperature", unit: "°C" },
]

export const mockSensorData: SensorData[] = [
  // Generate time series data for each sensor over the last 24 hours
  ...mockSensors.flatMap((sensor) =>
    Array.from({ length: 48 }, (_, i) => ({
      timestamp: new Date(Date.now() - i * 30 * 60 * 1000), // Every 30 minutes
      sensorId: sensor.id,
      deviceId: sensor.deviceId,
      value: generateSensorValue(sensor.type, i),
    })),
  ),
]

function generateSensorValue(sensorType: string, timeIndex: number): number {
  const baseTime = (timeIndex / 48) * 24 // Convert to hours (0-24)

  switch (sensorType) {
    case "temperature":
      // Temperature varies with time of day
      return Math.round((20 + 10 * Math.sin(((baseTime - 6) * Math.PI) / 12) + Math.random() * 4 - 2) * 10) / 10
    case "humidity":
      return Math.round((50 + 20 * Math.sin((baseTime * Math.PI) / 12) + Math.random() * 10 - 5) * 10) / 10
    case "pressure":
      return Math.round((1013 + Math.random() * 20 - 10) * 10) / 10
    case "voltage":
      return Math.round((220 + Math.random() * 10 - 5) * 10) / 10
    case "current":
      return Math.round((15 + Math.random() * 10 - 5) * 10) / 10
    case "power":
      return Math.round((50 + Math.random() * 30 - 15) * 10) / 10
    case "flow":
      return Math.round((10 + Math.random() * 20 - 10) * 10) / 10
    case "level":
      return Math.round(Math.random() * 100 * 10) / 10
    default:
      return Math.round(Math.random() * 100 * 10) / 10
  }
}

export const mockComments: ChartComment[] = [
  {
    id: "comment-1",
    workspaceId: "ws-1",
    configId: "config-1",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    chartX: 150,
    chartY: 200,
    value: 23.5,
    sensorId: "sen-1",
    deviceId: "dev-1",
    comment: "Temperature spike detected - investigating HVAC system",
    author: "John Doe",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    isVisible: true,
  },
  {
    id: "comment-2",
    workspaceId: "ws-1",
    configId: "config-1",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    chartX: 300,
    chartY: 180,
    value: 21.2,
    sensorId: "sen-1",
    deviceId: "dev-1",
    comment: "Normal operating temperature after maintenance",
    author: "Jane Smith",
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    isVisible: true,
  },
  {
    id: "comment-3",
    workspaceId: "ws-1",
    configId: "config-2",
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    chartX: 450,
    chartY: 250,
    value: 68.3,
    sensorId: "sen-2",
    deviceId: "dev-1",
    comment: "Humidity levels elevated due to weather conditions",
    author: "Mike Johnson",
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    isVisible: true,
  },
  {
    id: "comment-4",
    workspaceId: "ws-2",
    configId: "config-3",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    chartX: 200,
    chartY: 300,
    value: 15.7,
    sensorId: "sen-8",
    deviceId: "dev-3",
    comment: "Strong wind conditions - storm approaching",
    author: "Weather Team",
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    isVisible: true,
  },
  {
    id: "comment-5",
    workspaceId: "ws-1",
    configId: "config-4",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    chartX: 350,
    chartY: 150,
    value: 85.2,
    sensorId: "sen-15",
    deviceId: "dev-5",
    comment: "Machine temperature within normal range after coolant refill",
    author: "Maintenance Team",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    isVisible: false,
  },
]

export const mockWorkspaces: Workspace[] = []

export const mockLists: List[] = []

export const mockConfigs: Config[] = []

export const mockTables = mockConfigs
