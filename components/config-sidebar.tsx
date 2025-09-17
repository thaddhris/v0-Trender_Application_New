"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { X } from "lucide-react"
import type { Config } from "@/lib/types"
import { mockDevices, mockSensors } from "@/lib/mock-data"

interface ConfigSidebarProps {
  isOpen: boolean
  onClose: () => void
  onApply: (config: Omit<Config, "id">) => void
  editingConfig?: Config | null
}

export function ConfigSidebar({ isOpen, onClose, onApply, editingConfig }: ConfigSidebarProps) {
  const [configName, setConfigName] = useState(editingConfig?.name || "")
  const [selectedDeviceId, setSelectedDeviceId] = useState(editingConfig?.deviceId || "")
  const [selectedSensorId, setSelectedSensorId] = useState(editingConfig?.sensorId || "")

  const handleApply = () => {
    if (!configName || !selectedDeviceId || !selectedSensorId) return

    const device = mockDevices.find((d) => d.id === selectedDeviceId)
    const sensor = mockSensors.find((s) => s.id === selectedSensorId)

    if (!device || !sensor) return

    onApply({
      name: configName,
      deviceId: selectedDeviceId,
      sensorId: selectedSensorId,
      deviceName: device.name,
      sensorName: sensor.name,
      sensorType: sensor.type,
      unit: sensor.unit,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    // Reset form
    setConfigName("")
    setSelectedDeviceId("")
    setSelectedSensorId("")
    onClose()
  }

  const selectedDevice = mockDevices.find((d) => d.id === selectedDeviceId)
  const availableSensors = selectedDeviceId ? mockSensors.filter((s) => s.deviceId === selectedDeviceId) : []

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-96">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle>{editingConfig ? "Edit Config" : "Create New Config"}</SheetTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label htmlFor="config-name">Config Name</Label>
            <Input
              id="config-name"
              placeholder="Enter config name"
              value={configName}
              onChange={(e) => setConfigName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="device-select">Device</Label>
            <Select value={selectedDeviceId} onValueChange={setSelectedDeviceId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a device" />
              </SelectTrigger>
              <SelectContent>
                {mockDevices.map((device) => (
                  <SelectItem key={device.id} value={device.id}>
                    <div className="flex flex-col">
                      <span>{device.name}</span>
                      <span className="text-xs text-muted-foreground">{device.location}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sensor-select">Sensor</Label>
            <Select value={selectedSensorId} onValueChange={setSelectedSensorId} disabled={!selectedDeviceId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a sensor" />
              </SelectTrigger>
              <SelectContent>
                {availableSensors.map((sensor) => (
                  <SelectItem key={sensor.id} value={sensor.id}>
                    <div className="flex flex-col">
                      <span>{sensor.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {sensor.type} • {sensor.unit}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleApply}
            className="w-full"
            disabled={!configName || !selectedDeviceId || !selectedSensorId}
          >
            Apply
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
