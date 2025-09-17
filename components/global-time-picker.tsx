"use client"

import { useState } from "react"
import { Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { TimeRange } from "@/lib/types"

interface GlobalTimePickerProps {
  timeRange: TimeRange
  onTimeRangeChange: (range: TimeRange) => void
}

const TIME_PRESETS = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "This Week", value: "this-week" },
  { label: "Last Week", value: "last-week" },
  { label: "Last 7 Days", value: "last-7-days" },
  { label: "This Month", value: "this-month" },
  { label: "Last Month", value: "last-month" },
  { label: "Last 30 Days", value: "last-30-days" },
]

export function GlobalTimePicker({ timeRange, onTimeRangeChange }: GlobalTimePickerProps) {
  const [open, setOpen] = useState(false)
  const [tempStartDate, setTempStartDate] = useState<Date | undefined>(timeRange.start)
  const [tempEndDate, setTempEndDate] = useState<Date | undefined>(timeRange.end)
  const [startTime, setStartTime] = useState(timeRange.start.toTimeString().slice(0, 5))
  const [endTime, setEndTime] = useState(timeRange.end.toTimeString().slice(0, 5))
  const [selectedPreset, setSelectedPreset] = useState(timeRange.preset || "Custom")
  const [isSelectingRange, setIsSelectingRange] = useState(false)

  const handlePresetChange = (presetValue: string) => {
    const preset = TIME_PRESETS.find((p) => p.value === presetValue)
    if (!preset) return

    let start: Date
    let end = new Date()

    try {
      switch (preset.value) {
        case "today":
          start = new Date()
          start.setHours(0, 0, 0, 0)
          end = new Date()
          end.setHours(23, 59, 59, 999)
          break
        case "yesterday":
          start = new Date()
          start.setDate(start.getDate() - 1)
          start.setHours(0, 0, 0, 0)
          end = new Date(start)
          end.setHours(23, 59, 59, 999)
          break
        case "this-week":
          start = new Date()
          const dayOfWeek = start.getDay()
          start.setDate(start.getDate() - dayOfWeek)
          start.setHours(0, 0, 0, 0)
          end = new Date()
          end.setHours(23, 59, 59, 999)
          break
        case "last-week":
          end = new Date()
          const lastWeekEnd = end.getDay()
          end.setDate(end.getDate() - lastWeekEnd - 1)
          end.setHours(23, 59, 59, 999)
          start = new Date(end)
          start.setDate(start.getDate() - 6)
          start.setHours(0, 0, 0, 0)
          break
        case "last-7-days":
          start = new Date()
          start.setDate(start.getDate() - 7)
          start.setHours(0, 0, 0, 0)
          end = new Date()
          end.setHours(23, 59, 59, 999)
          break
        case "this-month":
          start = new Date(end.getFullYear(), end.getMonth(), 1)
          start.setHours(0, 0, 0, 0)
          end = new Date()
          end.setHours(23, 59, 59, 999)
          break
        case "last-month":
          start = new Date(end.getFullYear(), end.getMonth() - 1, 1)
          start.setHours(0, 0, 0, 0)
          end = new Date(end.getFullYear(), end.getMonth(), 0)
          end.setHours(23, 59, 59, 999)
          break
        case "last-30-days":
          start = new Date()
          start.setDate(start.getDate() - 30)
          start.setHours(0, 0, 0, 0)
          end = new Date()
          end.setHours(23, 59, 59, 999)
          break
        default:
          return
      }

      setSelectedPreset(preset.label)
      setTempStartDate(start)
      setTempEndDate(end)
      setStartTime(start.toTimeString().slice(0, 5))
      setEndTime(end.toTimeString().slice(0, 5))

      onTimeRangeChange({
        start,
        end,
        preset: preset.label,
      })
      setOpen(false)
    } catch (error) {
      console.error("Error calculating date range:", error)
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return

    if (!isSelectingRange || !tempStartDate) {
      // First date selection or starting new range
      setTempStartDate(date)
      setTempEndDate(undefined)
      setIsSelectingRange(true)
    } else {
      // Second date selection - complete the range
      if (date < tempStartDate) {
        // If end date is before start date, swap them
        setTempStartDate(date)
        setTempEndDate(tempStartDate)
      } else {
        setTempEndDate(date)
      }
      setIsSelectingRange(false)
    }
  }

  const handleCustomApply = () => {
    if (!tempStartDate || !tempEndDate) {
      alert("Please select both start and end dates")
      return
    }

    try {
      const [startHour, startMin] = startTime.split(":").map(Number)
      const [endHour, endMin] = endTime.split(":").map(Number)

      const start = new Date(tempStartDate)
      start.setHours(startHour, startMin, 0, 0)

      const end = new Date(tempEndDate)
      end.setHours(endHour, endMin, 59, 999)

      if (start > end) {
        alert("Start date and time cannot be after end date and time")
        return
      }

      setSelectedPreset("Custom")
      onTimeRangeChange({
        start,
        end,
        preset: "Custom",
      })
      setOpen(false)
      setIsSelectingRange(false)
    } catch (error) {
      console.error("Error applying custom date range:", error)
      alert("Error applying date range. Please check your inputs.")
    }
  }

  const handleCancel = () => {
    setTempStartDate(timeRange.start)
    setTempEndDate(timeRange.end)
    setStartTime(timeRange.start.toTimeString().slice(0, 5))
    setEndTime(timeRange.end.toTimeString().slice(0, 5))
    setIsSelectingRange(false)
    setOpen(false)
  }

  const getTimeRangeDisplay = () => {
    const formatDate = (date: Date) => {
      return date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    }

    return `${formatDate(timeRange.start)} - ${formatDate(timeRange.end)}`
  }

  const getSelectedDates = () => {
    const dates = []
    if (tempStartDate) dates.push(tempStartDate)
    if (tempEndDate) dates.push(tempEndDate)
    return dates
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <span className="text-sm text-muted-foreground">Duration :</span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center gap-2 bg-background border-input hover:bg-accent hover:text-accent-foreground"
          >
            <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">
              {selectedPreset}
            </span>
            <span className="text-sm">{getTimeRangeDisplay()}</span>
            <Calendar className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto max-w-[500px] p-0" align="center">
          <div className="flex flex-col sm:flex-row">
            <div className="w-full sm:w-48 border-b sm:border-b-0 sm:border-r p-4">
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-left font-medium text-primary"
                  onClick={() => {
                    setSelectedPreset("Custom")
                    setIsSelectingRange(false)
                  }}
                >
                  Custom
                </Button>
                {TIME_PRESETS.map((preset) => (
                  <Button
                    key={preset.value}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-left hover:bg-accent"
                    onClick={() => handlePresetChange(preset.value)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex-1 p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-primary">Start Date *</Label>
                  <Input
                    type="date"
                    value={tempStartDate?.toISOString().split("T")[0] || ""}
                    onChange={(e) => {
                      const date = new Date(e.target.value)
                      if (!isNaN(date.getTime())) {
                        setTempStartDate(date)
                        setIsSelectingRange(false)
                      }
                    }}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-primary">Start Time *</Label>
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-primary">End Date *</Label>
                  <Input
                    type="date"
                    value={tempEndDate?.toISOString().split("T")[0] || ""}
                    onChange={(e) => {
                      const date = new Date(e.target.value)
                      if (!isNaN(date.getTime())) {
                        setTempEndDate(date)
                        setIsSelectingRange(false)
                      }
                    }}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-primary">End Time *</Label>
                  <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="mt-1" />
                </div>
              </div>

              <div className="border rounded-md">
                <div className="p-2 text-xs text-muted-foreground bg-muted/30">
                  {!tempStartDate || !isSelectingRange ? "Click to select start date" : "Click to select end date"}
                  {tempStartDate && (
                    <span className="ml-2 text-primary">Start: {tempStartDate.toLocaleDateString()}</span>
                  )}
                  {tempEndDate && <span className="ml-2 text-primary">End: {tempEndDate.toLocaleDateString()}</span>}
                </div>
                <CalendarComponent
                  mode="range"
                  selected={{
                    from: tempStartDate,
                    to: tempEndDate,
                  }}
                  onSelect={(range) => {
                    if (range?.from) {
                      setTempStartDate(range.from)
                      if (range.to) {
                        setTempEndDate(range.to)
                        setIsSelectingRange(false)
                      } else {
                        setTempEndDate(undefined)
                        setIsSelectingRange(true)
                      }
                    }
                  }}
                  className="rounded-md"
                  numberOfMonths={1}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={handleCancel} className="flex-1 bg-transparent">
                  Cancel
                </Button>
                <Button onClick={handleCustomApply} className="flex-1" disabled={!tempStartDate || !tempEndDate}>
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
