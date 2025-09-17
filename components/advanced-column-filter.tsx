"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronDown, ChevronRight, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

interface FilterValue {
  value: string
  label: string
  count?: number
}

interface AdvancedColumnFilterProps {
  fieldName: string
  fieldType: string
  values: FilterValue[]
  selectedValues: string[]
  onSelectionChange: (values: string[]) => void
  onClose: () => void
  anchorElement?: HTMLElement
}

export function AdvancedColumnFilter({
  fieldName,
  fieldType,
  values,
  selectedValues,
  onSelectionChange,
  onClose,
  anchorElement,
}: AdvancedColumnFilterProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["values"]))
  const [position, setPosition] = useState({ top: 0, left: 0, maxHeight: 400 })
  const filterRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (anchorElement && filterRef.current) {
      const anchorRect = anchorElement.getBoundingClientRect()
      const filterRect = filterRef.current.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const viewportWidth = window.innerWidth

      let top = anchorRect.bottom + 4
      let left = anchorRect.left
      let maxHeight = viewportHeight - top - 20

      // Adjust if filter would go off-screen vertically
      if (top + 400 > viewportHeight) {
        top = anchorRect.top - 400 - 4
        maxHeight = anchorRect.top - 20
      }

      // Adjust if filter would go off-screen horizontally
      if (left + 320 > viewportWidth) {
        left = viewportWidth - 320 - 20
      }

      setPosition({ top, left, maxHeight: Math.max(300, maxHeight) })
    }
  }, [anchorElement])

  const filteredValues = values.filter((item) => item.label.toLowerCase().includes(searchTerm.toLowerCase()))

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  const handleSelectAll = () => {
    if (selectedValues.length === filteredValues.length) {
      onSelectionChange([])
    } else {
      onSelectionChange(filteredValues.map((v) => v.value))
    }
  }

  const handleValueToggle = (value: string) => {
    if (selectedValues.includes(value)) {
      onSelectionChange(selectedValues.filter((v) => v !== value))
    } else {
      onSelectionChange([...selectedValues, value])
    }
  }

  const getSortOptions = () => {
    switch (fieldType) {
      case "text":
        return ["Sort A to Z", "Sort Z to A"]
      case "number":
        return ["Sort Smallest to Largest", "Sort Largest to Smallest"]
      case "date":
        return ["Sort Oldest to Newest", "Sort Newest to Oldest"]
      default:
        return ["Sort A to Z", "Sort Z to A"]
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />

      <div
        ref={filterRef}
        className="fixed bg-background border rounded-lg shadow-lg p-4 space-y-3 z-50"
        style={{
          top: position.top,
          left: position.left,
          width: Math.min(320, window.innerWidth - 40),
          maxHeight: position.maxHeight,
          overflow: "auto",
        }}
      >
        {/* Sort Options */}
        <div className="space-y-2">
          {getSortOptions().map((option) => (
            <Button
              key={option}
              variant="ghost"
              className="w-full justify-start text-sm h-8"
              onClick={() => {
                console.log(`Sort: ${option}`)
              }}
            >
              {option}
            </Button>
          ))}
        </div>

        <Separator />

        {/* Filter Options */}
        <div className="space-y-2">
          {fieldType !== "boolean" && (
            <>
              <Button
                variant="ghost"
                className="w-full justify-between text-sm h-8"
                onClick={() => toggleSection("condition")}
              >
                <span>Filter by condition</span>
                {expandedSections.has("condition") ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>

              {expandedSections.has("condition") && (
                <div className="ml-4 space-y-2 p-2 bg-muted/30 rounded">
                  <p className="text-xs text-muted-foreground">Advanced filtering conditions will be available here</p>
                </div>
              )}
            </>
          )}

          <Button
            variant="ghost"
            className="w-full justify-between text-sm h-8"
            onClick={() => toggleSection("values")}
          >
            <span>Filter by values</span>
            {expandedSections.has("values") ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>

          {expandedSections.has("values") && (
            <div className="space-y-3">
              {/* Select All / Clear */}
              <div className="flex items-center justify-between text-sm">
                <Button variant="link" className="h-auto p-0 text-primary" onClick={handleSelectAll}>
                  {selectedValues.length === filteredValues.length ? "Clear" : `Select all ${filteredValues.length}`}
                </Button>
                <Badge variant="secondary" className="text-xs">
                  Displaying {filteredValues.length}
                </Badge>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search values..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-8"
                />
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1 border rounded p-2">
                {filteredValues.map((item) => (
                  <div
                    key={item.value}
                    className="flex items-center space-x-2 p-1 hover:bg-accent/50 rounded cursor-pointer"
                    onClick={() => handleValueToggle(item.value)}
                  >
                    <Checkbox
                      checked={selectedValues.includes(item.value)}
                      onCheckedChange={() => handleValueToggle(item.value)}
                    />
                    <span className="text-sm flex-1 truncate">{item.label || "(Blanks)"}</span>
                    {item.count && (
                      <Badge variant="outline" className="text-xs">
                        {item.count}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex gap-2">
          <Button size="sm" onClick={onClose} className="flex-1">
            Apply
          </Button>
          <Button size="sm" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </>
  )
}
