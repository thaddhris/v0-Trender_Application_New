"use client"

import type React from "react"

import { useState } from "react"
import {
  Plus,
  Settings,
  ChevronDown,
  ChevronRight,
  Folder,
  Monitor,
  GripVertical,
  Edit2,
  X,
  Trash2,
  ChevronLeft,
  MoreHorizontal,
  Info,
  Search,
  Building,
  BarChart3,
  Edit,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { ExportDropdown } from "./export-dropdown"
import { getWorkspaceExportData, getListExportData } from "@/lib/export-utils"
import { mockSubmissions, mockForms } from "@/lib/mock-data"
import type { Workspace, List, TimeRange, Config } from "@/lib/types"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { WorkspaceSettingsDrawer } from "./workspace-settings-drawer"
import { mockDevices, mockSensors } from "@/lib/mock-data"

type ConfigType = Config & {
  workspace?: Workspace
  listName?: string
}

interface LeftNavigationBarProps {
  workspaces: Workspace[]
  configs: ConfigType[] // Renamed from tables to configs
  lists: List[]
  currentWorkspaceId: string
  currentConfigId: string | null // Renamed from currentTableId
  multiViewMode: boolean
  selectedConfigIds: string[] // Renamed from selectedTableIds
  timeRange?: TimeRange
  sidebarWidth?: number
  appMode: "edit" | "view"
  onWorkspaceSelect: (workspaceId: string) => void
  onConfigSelect: (configId: string) => void // Renamed from onTableSelect
  onMultiViewConfigToggle: (configId: string, selected: boolean) => void // Renamed from onMultiViewTableToggle
  onCreateWorkspace: (name: string) => void
  onCreateList: (workspaceId: string, name: string) => string
  onCreateConfig: (listId: string, name?: string) => string // Renamed from onCreateTable
  onUpdateWorkspace: (id: string, updates: Partial<Workspace>) => void
  onWorkspaceSettingsUpdate?: (workspaceId: string, settings: any) => void
  onMoveConfig?: (configId: string, newListId: string) => void // Renamed from onMoveTable
  onMoveList?: (listId: string, newWorkspaceId: string) => void
  onDeleteWorkspace?: (workspaceId: string) => void
  onDeleteList?: (listId: string) => void
  onDeleteConfig?: (configId: string) => void // Renamed from onDeleteTable
  isCollapsed?: boolean
  onCollapse?: () => void
}

export function LeftNavigationBar({
  workspaces,
  configs, // Renamed from tables
  lists,
  currentWorkspaceId,
  currentConfigId, // Renamed from currentTableId
  multiViewMode,
  selectedConfigIds, // Renamed from selectedTableIds
  timeRange = { start: new Date(Date.now() - 24 * 60 * 60 * 1000), end: new Date(), preset: "Last 24h" },
  sidebarWidth = 320,
  appMode,
  onWorkspaceSelect,
  onConfigSelect, // Renamed from onTableSelect
  onMultiViewConfigToggle, // Renamed from onMultiViewTableToggle
  onCreateWorkspace,
  onCreateList,
  onCreateConfig, // Renamed from onCreateTable
  onUpdateWorkspace,
  onWorkspaceSettingsUpdate,
  onMoveConfig, // Renamed from onMoveTable
  onMoveList,
  onDeleteWorkspace,
  onDeleteList,
  onDeleteConfig, // Renamed from onDeleteTable
  isCollapsed = false,
  onCollapse,
}: LeftNavigationBarProps) {
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<Set<string>>(new Set([currentWorkspaceId]))
  const [expandedLists, setExpandedLists] = useState<Set<string>>(new Set())
  const [creatingWorkspace, setCreatingWorkspace] = useState(false)
  const [creatingList, setCreatingList] = useState<string | null>(null)
  const [creatingConfig, setCreatingConfig] = useState<string | null>(null) // Renamed from creatingTable
  const [renamingList, setRenamingList] = useState<string | null>(null)
  const [renamingTable, setRenamingTable] = useState<string | null>(null)
  const [newItemName, setNewItemName] = useState("")
  const [workspaceSettingsOpen, setWorkspaceSettingsOpen] = useState(false)
  const [draggedItem, setDraggedItem] = useState<{ type: "config" | "list"; id: string } | null>(null) // Updated drag type
  const [dragOverTarget, setDragOverTarget] = useState<{ type: "list" | "workspace"; id: string } | null>(null)
  const [dragExpandedWorkspaces, setDragExpandedWorkspaces] = useState<Set<string>>(new Set())
  const [renamingWorkspace, setRenamingWorkspace] = useState<string | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    type: "workspace" | "list" | "table"
    id: string
    name: string
  } | null>(null)
  const [workspaceSettingsDrawerId, setWorkspaceSettingsDrawerId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const [titleDisplayMode, setTitleDisplayMode] = useState<"config-name" | "device-name" | "device-id">(
    // Updated display modes
    "config-name",
  )

  const getDeviceInfo = (formId?: string) => {
    if (!formId) return { deviceId: "Unknown", deviceName: "Unknown Device", deviceType: "Unknown" }

    const deviceMap: Record<string, { deviceId: string; deviceName: string; deviceType: string }> = {
      "form-1": {
        deviceId: "ENV-001",
        deviceName: "Environment Monitoring Device",
        deviceType: "Environmental Sensor",
      },
      "form-2": { deviceId: "WS-01", deviceName: "Weather Reporting Station", deviceType: "Weather Station" },
      "form-3": { deviceId: "PS-001", deviceName: "Plant Workshop Sensors", deviceType: "Industrial Sensor" },
      "form-4": { deviceId: "CB-01", deviceName: "Site Conveyor Belt Monitor", deviceType: "Conveyor Monitor" },
      "form-5": { deviceId: "EM-001", deviceName: "Energy Management System", deviceType: "Energy Monitor" },
      "form-6": { deviceId: "AP-01", deviceName: "Security Access Control", deviceType: "Access Control" },
      "form-7": { deviceId: "HVAC-01", deviceName: "HVAC Control System", deviceType: "HVAC Controller" },
      "form-8": { deviceId: "WQ-001", deviceName: "Water Quality Monitor", deviceType: "Water Sensor" },
      "form-9": { deviceId: "FS-001", deviceName: "Fire Safety System", deviceType: "Safety System" },
      "form-10": { deviceId: "P-001", deviceName: "Parking Management", deviceType: "Parking System" },
      "form-11": { deviceId: "L-001", deviceName: "Lighting Control System", deviceType: "Lighting Controller" },
      "form-12": { deviceId: "WM-001", deviceName: "Waste Management System", deviceType: "Waste Monitor" },
    }

    return deviceMap[formId] || { deviceId: "DEV-001", deviceName: "Unknown Device", deviceType: "Unknown" }
  }

  const getDeviceSensorInfo = (config: ConfigType) => {
    const device = mockDevices.find((d) => d.id === config.deviceId)
    const sensor = mockSensors.find((s) => s.id === config.sensorId)

    return {
      deviceId: device?.id || "Unknown",
      deviceName: device?.name || "Unknown Device",
      deviceType: device?.type || "Unknown",
      sensorName: sensor?.name || "Unknown Sensor",
      sensorType: sensor?.type || "unknown",
      sensorUnit: sensor?.unit || "",
    }
  }

  const getDisplayName = (config: ConfigType) => {
    const deviceSensorInfo = getDeviceSensorInfo(config)

    switch (titleDisplayMode) {
      case "device-id":
        return deviceSensorInfo.deviceId
      case "device-name":
        return `${deviceSensorInfo.deviceName} - ${deviceSensorInfo.sensorName}`
      case "config-name":
      default:
        return config.name
    }
  }

  const currentWorkspace = workspaces.find((w) => w.id === currentWorkspaceId)
  const workspaceLists = lists.filter((l) => l.workspaceId === currentWorkspaceId)

  const isVeryNarrow = sidebarWidth < 200
  const isNarrow = sidebarWidth < 280
  const showCompactIcons = sidebarWidth < 250

  const getSearchResults = () => {
    if (!searchQuery.trim()) return null

    const query = searchQuery.toLowerCase()
    const matchingConfigs: (ConfigType & { workspaceName: string; listName: string })[] = [] // Renamed from matchingTables
    const matchingLists: ((typeof lists)[0] & { workspaceName: string })[] = []
    const matchingWorkspaces: typeof workspaces = []

    // Search through all items
    workspaces.forEach((workspace) => {
      const workspaceLists = lists.filter((l) => l.workspaceId === workspace.id)

      // Check workspace name
      if (workspace.name.toLowerCase().includes(query)) {
        matchingWorkspaces.push(workspace)
      }

      workspaceLists.forEach((list) => {
        // Check list name
        if (list.name.toLowerCase().includes(query)) {
          matchingLists.push({ ...list, workspaceName: workspace.name })
        }

        const listConfigs = configs.filter((c) => c.listId === list.id)
        listConfigs.forEach((config) => {
          const displayName = getDisplayName(config)
          const deviceSensorInfo = getDeviceSensorInfo(config)

          // Search based on current title display mode and config name
          const shouldMatch =
            config.name.toLowerCase().includes(query) ||
            displayName.toLowerCase().includes(query) ||
            (titleDisplayMode === "device-id" && deviceSensorInfo.deviceId.toLowerCase().includes(query)) ||
            (titleDisplayMode === "device-name" && deviceSensorInfo.deviceName.toLowerCase().includes(query)) ||
            deviceSensorInfo.sensorName.toLowerCase().includes(query)

          if (shouldMatch) {
            matchingConfigs.push({
              ...config,
              workspaceName: workspace.name,
              listName: list.name,
            })
          }
        })
      })
    })

    return { matchingConfigs, matchingLists, matchingWorkspaces } // Updated return object
  }

  const searchResults = getSearchResults()

  const filteredWorkspaces = searchResults
    ? []
    : workspaces.filter((workspace) => {
        if (!searchQuery.trim()) return true

        const query = searchQuery.toLowerCase()

        // Check workspace name
        if (workspace.name.toLowerCase().includes(query)) return true

        // Check lists in this workspace
        const workspaceLists = lists.filter((l) => l.workspaceId === workspace.id)
        const hasMatchingList = workspaceLists.some((list) => list.name.toLowerCase().includes(query))
        if (hasMatchingList) return true

        // Check tables in this workspace
        const workspaceListIds = workspaceLists.map((l) => l.id)
        const hasMatchingTable = configs.some(
          (config) => workspaceListIds.includes(config.listId) && config.name.toLowerCase().includes(query),
        )
        if (hasMatchingTable) return true

        return false
      })

  const getFilteredLists = (workspaceId: string) => {
    const workspaceLists = lists.filter((l) => l.workspaceId === workspaceId)
    if (!searchQuery.trim()) return workspaceLists

    const query = searchQuery.toLowerCase()

    return workspaceLists.filter((list) => {
      // Check list name
      if (list.name.toLowerCase().includes(query)) return true

      // Check tables in this list
      const hasMatchingTable = configs.some(
        (config) => config.listId === list.id && config.name.toLowerCase().includes(query),
      )
      if (hasMatchingTable) return true

      return false
    })
  }

  const getFilteredTables = (listId: string) => {
    const listTables = configs.filter((t) => t.listId === listId)
    if (!searchQuery.trim()) return listTables

    const query = searchQuery.toLowerCase()
    return listTables.filter((table) => table.name.toLowerCase().includes(query))
  }

  const shouldAutoExpand = (workspaceId: string, listId?: string) => {
    if (!searchQuery.trim()) return false

    if (listId) {
      const filteredTables = getFilteredTables(listId)
      return filteredTables.length > 0
    } else {
      const filteredLists = getFilteredLists(workspaceId)
      return filteredLists.length > 0 || filteredLists.some((list) => getFilteredTables(list.id).length > 0)
    }
  }

  const handleWorkspaceAction = (workspaceId: string, action: () => void) => {
    if (workspaceId !== currentWorkspaceId) {
      onWorkspaceSelect(workspaceId)
      toggleWorkspace(workspaceId, true)
    }
    action()
  }

  const handleListAction = (listId: string, action: () => void) => {
    const list = lists.find((l) => l.id === listId)
    if (list && list.workspaceId !== currentWorkspaceId) {
      onWorkspaceSelect(list.workspaceId)
      toggleWorkspace(list.workspaceId, true)
    }
    action()
  }

  const toggleWorkspace = (workspaceId: string, forceExpand = false) => {
    if (forceExpand) {
      setExpandedWorkspaces(new Set([workspaceId]))
    } else {
      const newExpanded = new Set(expandedWorkspaces)
      if (newExpanded.has(workspaceId)) {
        newExpanded.delete(workspaceId)
      } else {
        newExpanded.clear()
        newExpanded.add(workspaceId)
      }
      setExpandedWorkspaces(newExpanded)
    }
  }

  const toggleList = (listId: string) => {
    const newExpanded = new Set(expandedLists)
    if (newExpanded.has(listId)) {
      newExpanded.delete(listId)
    } else {
      newExpanded.add(listId)
    }
    setExpandedLists(newExpanded)
  }

  const handleCreateWorkspace = () => {
    if (newItemName.trim()) {
      onCreateWorkspace(newItemName.trim())
      setNewItemName("")
      setCreatingWorkspace(false)
    }
  }

  const handleCreateList = (workspaceId: string) => {
    if (newItemName.trim()) {
      const listName = newItemName.trim()
      const newListId = onCreateList(workspaceId, listName)
      setNewItemName("")
      setCreatingList(null)
      setExpandedWorkspaces(new Set([workspaceId]))
      setExpandedLists(new Set([...expandedLists, newListId]))
    }
  }

  const handleCreateConfig = (listId: string) => {
    // Renamed from handleCreateTable
    if (newItemName.trim()) {
      onCreateConfig(listId, newItemName.trim())
      setNewItemName("")
      setCreatingConfig(null)
    }
  }

  const handleRenameList = (listId: string) => {
    if (newItemName.trim()) {
      const list = lists.find((l) => l.id === listId)
      if (list) {
        list.name = newItemName.trim()
      }
      setNewItemName("")
      setRenamingList(null)
    }
  }

  const handleRenameTable = (tableId: string) => {
    if (newItemName.trim()) {
      const table = configs.find((t) => t.id === tableId)
      if (table) {
        table.name = newItemName.trim()
      }
      setNewItemName("")
      setRenamingTable(null)
    }
  }

  const handleRenameWorkspace = (workspaceId: string) => {
    if (newItemName.trim()) {
      onUpdateWorkspace(workspaceId, { name: newItemName.trim() })
      setNewItemName("")
      setRenamingWorkspace(null)
    }
  }

  const handleDragStart = (e: React.DragEvent, type: "config" | "list", id: string) => {
    setDraggedItem({ type, id })
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", JSON.stringify({ type, id }))
  }

  const handleDragOver = (e: React.DragEvent, targetType: "list" | "workspace", targetId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverTarget({ type: targetType, id: targetId })

    if (targetType === "workspace" && !expandedWorkspaces.has(targetId)) {
      const newDragExpanded = new Set(dragExpandedWorkspaces)
      newDragExpanded.add(targetId)
      setDragExpandedWorkspaces(newDragExpanded)

      setTimeout(() => {
        setExpandedWorkspaces((prev) => new Set([...prev, targetId]))
      }, 500)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverTarget(null)
    }
  }

  const handleDrop = (e: React.DragEvent, targetType: "list" | "workspace", targetId: string) => {
    e.preventDefault()
    e.stopPropagation()

    if (!draggedItem) return

    if (draggedItem.type === "config" && targetType === "workspace") {
      // Find lists in target workspace
      const targetWorkspaceLists = lists.filter((l) => l.workspaceId === targetId)

      if (targetWorkspaceLists.length === 0) {
        // Create "List 1" if no lists exist in target workspace
        const newListId = onCreateList(targetId, "List 1")
        // Move table to the new list
        if (onMoveConfig) {
          onMoveConfig(draggedItem.id, newListId)
        }
      } else {
        // Move to first list in workspace
        if (onMoveConfig) {
          onMoveConfig(draggedItem.id, targetWorkspaceLists[0].id)
        }
      }
    } else if (draggedItem.type === "config" && targetType === "list" && onMoveConfig) {
      const sourceTable = configs.find((t) => t.id === draggedItem.id)
      if (sourceTable && sourceTable.listId !== targetId) {
        onMoveConfig(draggedItem.id, targetId)
      }
    } else if (draggedItem.type === "list" && targetType === "workspace" && onMoveList) {
      const sourceList = lists.find((l) => l.id === draggedItem.id)
      if (sourceList && sourceList.workspaceId !== targetId) {
        onMoveList(draggedItem.id, targetId)

        setTimeout(() => {
          // Trigger a re-render by updating expanded workspaces
          setExpandedWorkspaces(new Set(expandedWorkspaces))
        }, 100)
      }
    }

    setDraggedItem(null)
    setDragOverTarget(null)
    setDragExpandedWorkspaces(new Set())
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
    setDragOverTarget(null)
    setDragExpandedWorkspaces(new Set())
  }

  const isDropTarget = (type: "list" | "workspace", id: string) => {
    return dragOverTarget?.type === type && dragOverTarget?.id === id
  }

  const isDragging = (type: "config" | "list", id: string) => {
    return draggedItem?.type === type && draggedItem?.id === id
  }

  const handleDeleteConfirm = () => {
    if (!deleteConfirmation) return

    switch (deleteConfirmation.type) {
      case "workspace":
        onDeleteWorkspace?.(deleteConfirmation.id)
        break
      case "list":
        onDeleteList?.(deleteConfirmation.id)
        break
      case "table":
        onDeleteConfig?.(deleteConfirmation.id)
        break
    }

    setDeleteConfirmation(null)
  }

  const showDeleteConfirmation = (type: "workspace" | "list" | "table", id: string, name: string) => {
    setDeleteConfirmation({ type, id, name })
  }

  const renderTextWithOverflow = (text: string, className = "") => {
    return <span className={`${className} overflow-hidden whitespace-nowrap block`}>{text}</span>
  }

  const WorkspaceActions = ({ workspace }: { workspace: Workspace }) => {
    if (appMode === "view") {
      // View mode: only show Info and Export
      if (showCompactIcons) {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-accent">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-auto p-1">
              <div className="flex items-center gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-accent"
                        onClick={(e) => {
                          e.stopPropagation()
                        }}
                      >
                        <Info className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-xs">
                        <div>
                          <strong>Workspace:</strong> {workspace.name}
                        </div>
                        <div>
                          <strong>Type:</strong> Workspace Container
                        </div>
                        <div>
                          <strong>Tables:</strong>{" "}
                          {
                            configs.filter((t) =>
                              lists.some((l) => l.id === t.listId && l.workspaceId === workspace.id),
                            ).length
                          }
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <ExportDropdown
                        data={getWorkspaceExportData(
                          workspace.id,
                          configs,
                          lists,
                          timeRange,
                          mockSubmissions,
                          mockForms,
                        )}
                        filename={`workspace-${workspace.name.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}`}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        iconOnly
                      />
                    </TooltipTrigger>
                    <TooltipContent>Export</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }

      return (
        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-accent"
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                >
                  <Info className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-xs">
                  <div>
                    <strong>Workspace:</strong> {workspace.name}
                  </div>
                  <div>
                    <strong>Type:</strong> Workspace Container
                  </div>
                  <div>
                    <strong>Tables:</strong>{" "}
                    {
                      configs.filter((t) => lists.some((l) => l.id === t.listId && l.workspaceId === workspace.id))
                        .length
                    }
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <ExportDropdown
            data={getWorkspaceExportData(workspace.id, configs, lists, timeRange, mockSubmissions, mockForms)}
            filename={`workspace-${workspace.name.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}`}
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            iconOnly
          />
        </div>
      )
    }

    // Edit mode: show all controls (existing implementation)
    if (showCompactIcons) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-accent">
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-auto p-1">
            <div className="flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <ExportDropdown
                      data={getWorkspaceExportData(workspace.id, configs, lists, timeRange, mockSubmissions, mockForms)}
                      filename={`workspace-${workspace.name.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}`}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      iconOnly
                    />
                  </TooltipTrigger>
                  <TooltipContent>Export</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-accent"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleWorkspaceAction(workspace.id, () => setWorkspaceSettingsOpen(workspace.id))
                      }}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Add List</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-accent"
                      onClick={(e) => {
                        e.stopPropagation()
                        setWorkspaceSettingsDrawerId(workspace.id)
                      }}
                    >
                      <Settings className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Settings</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleWorkspaceAction(workspace.id, () =>
                          showDeleteConfirmation("workspace", workspace.id, workspace.name),
                        )
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }

    return (
      <div className="flex items-center gap-1">
        <ExportDropdown
          data={getWorkspaceExportData(workspace.id, configs, lists, timeRange, mockSubmissions, mockForms)}
          filename={`workspace-${workspace.name.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}`}
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          iconOnly
        />
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-accent"
          onClick={(e) => {
            e.stopPropagation()
            setCreatingList(workspace.id)
          }}
        >
          <Plus className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-accent"
          onClick={(e) => {
            e.stopPropagation()
            setWorkspaceSettingsDrawerId(workspace.id)
          }}
        >
          <Settings className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
          onClick={(e) => {
            e.stopPropagation()
            handleWorkspaceAction(workspace.id, () => showDeleteConfirmation("workspace", workspace.id, workspace.name))
          }}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    )
  }

  const ListActions = ({ list }: { list: (typeof lists)[0] }) => {
    if (appMode === "view") {
      // View mode: only show Info and Export
      if (showCompactIcons) {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-5 w-5 p-0 hover:bg-accent">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-auto p-1">
              <div className="flex items-center gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-accent"
                        onClick={(e) => {
                          e.stopPropagation()
                          // TODO: Show list info dialog
                        }}
                      >
                        <Info className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Info</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <ExportDropdown
                        data={getListExportData(list.id, configs, timeRange, mockSubmissions, mockForms)}
                        filename={`list-${list.name.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}`}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        iconOnly
                      />
                    </TooltipTrigger>
                    <TooltipContent>Export</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }

      return (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0 hover:bg-accent"
            onClick={(e) => {
              e.stopPropagation()
              // TODO: Show list info dialog
            }}
          >
            <Info className="h-3 w-3" />
          </Button>
          <ExportDropdown
            data={getListExportData(list.id, configs, timeRange, mockSubmissions, mockForms)}
            filename={`list-${list.name.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}`}
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0"
            iconOnly
          />
        </div>
      )
    }

    // Edit mode: show all controls (existing implementation)
    if (showCompactIcons) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-5 w-5 p-0 hover:bg-accent">
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-auto p-1">
            <div className="flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <ExportDropdown
                      data={getListExportData(list.id, configs, timeRange, mockSubmissions, mockForms)}
                      filename={`list-${list.name.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}`}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      iconOnly
                    />
                  </TooltipTrigger>
                  <TooltipContent>Export</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-accent"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleListAction(list.id, () => {
                          setNewItemName(list.name)
                          setRenamingList(list.id)
                        })
                      }}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Rename</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-accent"
                      onClick={(e) => {
                        e.stopPropagation()
                        setCreatingConfig(list.id)
                      }}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Add Config</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleListAction(list.id, () => showDeleteConfirmation("list", list.id, list.name))
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }

    return (
      <div className="flex items-center gap-1">
        <ExportDropdown
          data={getListExportData(list.id, configs, timeRange, mockSubmissions, mockForms)}
          filename={`list-${list.name.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}`}
          variant="ghost"
          size="sm"
          className="h-5 w-5 p-0"
          iconOnly
        />
        <Button
          variant="ghost"
          size="sm"
          className="h-5 w-5 p-0 hover:bg-accent"
          onClick={(e) => {
            e.stopPropagation()
            handleListAction(list.id, () => {
              setNewItemName(list.name)
              setRenamingList(list.id)
            })
          }}
        >
          <Edit2 className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-5 w-5 p-0 hover:bg-accent"
          onClick={(e) => {
            e.stopPropagation()
            setCreatingConfig(list.id)
          }}
        >
          <Plus className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-5 w-5 p-0 hover:bg-destructive hover:text-destructive-foreground"
          onClick={(e) => {
            e.stopPropagation()
            handleListAction(list.id, () => showDeleteConfirmation("list", list.id, list.name))
          }}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    )
  }

  const ConfigActions = ({ config }: { config: ConfigType }) => {
    if (appMode === "view") {
      const deviceSensorInfo = getDeviceSensorInfo(config)

      if (showCompactIcons) {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-5 w-5 p-0 hover:bg-accent">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-auto p-1">
              <div className="flex items-center gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-accent"
                        onClick={(e) => {
                          e.stopPropagation()
                        }}
                      >
                        <Info className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-xs">
                        <div>
                          <strong>Device:</strong> {deviceSensorInfo.deviceName}
                        </div>
                        <div>
                          <strong>Sensor:</strong> {deviceSensorInfo.sensorName}
                        </div>
                        <div>
                          <strong>Type:</strong> {deviceSensorInfo.sensorType}
                        </div>
                        <div>
                          <strong>Unit:</strong> {deviceSensorInfo.sensorUnit}
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }

      return (
        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-accent"
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                >
                  <Info className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-xs">
                  <div>
                    <strong>Device:</strong> {deviceSensorInfo.deviceName}
                  </div>
                  <div>
                    <strong>Sensor:</strong> {deviceSensorInfo.sensorName}
                  </div>
                  <div>
                    <strong>Type:</strong> {deviceSensorInfo.sensorType}
                  </div>
                  <div>
                    <strong>Unit:</strong> {deviceSensorInfo.sensorUnit}
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )
    }

    // Edit mode: show all controls (existing implementation)
    if (showCompactIcons) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-5 w-5 p-0 hover:bg-accent">
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-auto p-1">
            <div className="flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-accent"
                      onClick={(e) => {
                        e.stopPropagation()
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Rename</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={(e) => {
                        e.stopPropagation()
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }

    return (
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-5 w-5 p-0 hover:bg-accent"
          onClick={(e) => {
            e.stopPropagation()
          }}
        >
          <Edit className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-5 w-5 p-0 hover:bg-destructive hover:text-destructive-foreground"
          onClick={(e) => {
            e.stopPropagation()
          }}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    )
  }

  const handleWorkspaceClick = (workspaceId: string) => {
    if (workspaceId !== currentWorkspaceId) {
      onWorkspaceSelect(workspaceId)
      toggleWorkspace(workspaceId, true)
    } else {
      toggleWorkspace(workspaceId)
    }
  }

  return (
    <>
      <div className="h-full flex flex-col bg-background">
        <div className="p-2 border-b bg-background flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onCollapse} className="h-8 w-8 p-0">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {!isVeryNarrow && <h2 className="font-semibold text-lg text-foreground">Navigation</h2>}
          {isVeryNarrow && <h2 className="font-semibold text-sm text-foreground">Nav</h2>}
        </div>

        <div className="p-4 border-b bg-background">
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={isVeryNarrow ? "Search..." : "Search workspaces, lists, tables..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="w-full justify-between bg-transparent">
                  <span className="text-xs">
                    {titleDisplayMode === "config-name" && "Config Name"}
                    {titleDisplayMode === "device-id" && "Device ID"}
                    {titleDisplayMode === "device-name" && "Device Name"}
                  </span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-full">
                <DropdownMenuItem
                  onClick={() => setTitleDisplayMode("config-name")}
                  className={titleDisplayMode === "config-name" ? "bg-accent" : ""}
                >
                  Config Name
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTitleDisplayMode("device-id")}
                  className={titleDisplayMode === "device-id" ? "bg-accent" : ""}
                >
                  Device ID
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTitleDisplayMode("device-name")}
                  className={titleDisplayMode === "device-name" ? "bg-accent" : ""}
                >
                  Device Name
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {appMode === "edit" && (
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start hover:bg-primary/10 transition-colors bg-transparent"
                onClick={() => setCreatingWorkspace(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                {isVeryNarrow ? "WS" : "Workspace"}
              </Button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {searchResults ? (
            <div className="space-y-4 p-2">
              {/* Tables Section */}
              {searchResults.matchingConfigs.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 px-2">
                    Configs ({searchResults.matchingConfigs.length})
                  </h3>
                  <div className="space-y-1">
                    {searchResults.matchingConfigs.map((config) => (
                      <div
                        key={config.id}
                        className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                          currentConfigId === config.id ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                        }`}
                        onClick={() => {
                          const list = lists.find((l) => l.id === config.listId)
                          if (list && list.workspaceId !== currentWorkspaceId) {
                            onWorkspaceSelect(list.workspaceId)
                          }
                          onConfigSelect(config.id)
                        }}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <BarChart3 className="h-4 w-4 text-blue-500 flex-shrink-0" />
                          <div className="min-w-0">
                            {renderTextWithOverflow(getDisplayName(config), "text-sm font-medium")}
                            <div className="text-xs text-muted-foreground">
                              {config.workspaceName} / {config.listName}
                            </div>
                          </div>
                        </div>
                        <ConfigActions config={config} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lists Section */}
              {searchResults.matchingLists.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 px-2">
                    Lists ({searchResults.matchingLists.length})
                  </h3>
                  <div className="space-y-1">
                    {searchResults.matchingLists.map((list) => (
                      <div key={list.id} className="space-y-1">
                        <div className="flex items-center justify-between p-2 rounded cursor-pointer hover:bg-accent transition-colors">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0 flex-shrink-0"
                              onClick={(e) => {
                                e.stopPropagation()
                                if (list.workspaceId !== currentWorkspaceId) {
                                  onWorkspaceSelect(list.workspaceId)
                                }
                                setExpandedWorkspaces(new Set([list.workspaceId]))
                                toggleList(list.id)
                              }}
                            >
                              {expandedLists.has(list.id) ? (
                                <ChevronDown className="h-3 w-3" />
                              ) : (
                                <ChevronRight className="h-3 w-3" />
                              )}
                            </Button>
                            <Folder className="h-4 w-4 text-orange-500 flex-shrink-0" />
                            <div className="min-w-0">
                              {renderTextWithOverflow(list.name, "text-sm font-medium")}
                              <div className="text-xs text-muted-foreground">{list.workspaceName}</div>
                            </div>
                          </div>
                          <ListActions list={list} />
                        </div>

                        {expandedLists.has(list.id) && (
                          <div className="ml-6 space-y-1">
                            {configs
                              .filter((t) => t.listId === list.id)
                              .map((config) => (
                                <div
                                  key={config.id}
                                  className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                                    currentConfigId === config.id
                                      ? "bg-primary text-primary-foreground"
                                      : "hover:bg-accent"
                                  }`}
                                  onClick={() => {
                                    if (list.workspaceId !== currentWorkspaceId) {
                                      onWorkspaceSelect(list.workspaceId)
                                    }
                                    onConfigSelect(config.id)
                                  }}
                                >
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <BarChart3 className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                    {renderTextWithOverflow(getDisplayName(config), "text-sm")}
                                  </div>
                                  <ConfigActions config={config} />
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Workspaces Section */}
              {searchResults.matchingWorkspaces.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 px-2">
                    Workspaces ({searchResults.matchingWorkspaces.length})
                  </h3>
                  <div className="space-y-1">
                    {searchResults.matchingWorkspaces.map((workspace) => (
                      <div key={workspace.id} className="space-y-1">
                        <div
                          className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                            currentWorkspaceId === workspace.id
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-accent"
                          }`}
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:bg-accent flex-shrink-0"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleWorkspaceClick(workspace.id)
                                toggleWorkspace(workspace.id)
                              }}
                            >
                              {expandedWorkspaces.has(workspace.id) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                            <Building className="h-4 w-4 text-green-500 flex-shrink-0" />
                            {renderTextWithOverflow(workspace.name, "text-sm font-medium")}
                          </div>
                          <WorkspaceActions workspace={workspace} />
                        </div>

                        {expandedWorkspaces.has(workspace.id) && (
                          <div className="ml-6 space-y-1">
                            {lists
                              .filter((l) => l.workspaceId === workspace.id)
                              .map((list) => (
                                <div key={list.id} className="space-y-1">
                                  <div className="flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-muted transition-colors">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-5 w-5 p-0 flex-shrink-0"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        toggleList(list.id)
                                      }}
                                    >
                                      {expandedLists.has(list.id) ? (
                                        <ChevronDown className="h-3 w-3" />
                                      ) : (
                                        <ChevronRight className="h-3 w-3" />
                                      )}
                                    </Button>
                                    <Folder className="h-4 w-4 text-orange-500 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">{renderTextWithOverflow(list.name, "text-sm")}</div>
                                    <ListActions list={list} />
                                  </div>

                                  {expandedLists.has(list.id) && (
                                    <div className="ml-6 space-y-1">
                                      {configs
                                        .filter((t) => t.listId === list.id)
                                        .map((config) => (
                                          <div
                                            key={config.id}
                                            className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                                              currentConfigId === config.id
                                                ? "bg-primary text-primary-foreground"
                                                : "hover:bg-accent"
                                            }`}
                                            onClick={() => {
                                              if (workspace.id !== currentWorkspaceId) {
                                                onWorkspaceSelect(workspace.id)
                                              }
                                              onConfigSelect(config.id)
                                            }}
                                          >
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                              <BarChart3 className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                              {renderTextWithOverflow(getDisplayName(config), "text-sm")}
                                            </div>
                                            <ConfigActions config={config} />
                                          </div>
                                        ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results */}
              {searchResults.matchingConfigs.length === 0 &&
                searchResults.matchingLists.length === 0 &&
                searchResults.matchingWorkspaces.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No results found for "{searchQuery}"</p>
                  </div>
                )}
            </div>
          ) : (
            /* Regular workspace view when not searching */
            <div className="space-y-2 p-2">
              {creatingWorkspace && appMode === "edit" && (
                <div className="flex gap-2 mb-4 p-3 bg-muted rounded-lg border">
                  <Input
                    placeholder={isVeryNarrow ? "Name" : "Workspace name"}
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreateWorkspace()
                      if (e.key === "Escape") {
                        setCreatingWorkspace(false)
                        setNewItemName("")
                      }
                    }}
                    autoFocus
                    className="flex-1"
                  />
                  <Button size="sm" onClick={handleCreateWorkspace}>
                    Add
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setCreatingWorkspace(false)
                      setNewItemName("")
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {filteredWorkspaces.map((workspace) => {
                const filteredLists = getFilteredLists(workspace.id)
                const shouldExpandWorkspace = expandedWorkspaces.has(workspace.id) || shouldAutoExpand(workspace.id)

                return (
                  <div key={workspace.id} className="space-y-1">
                    {renamingWorkspace === workspace.id ? (
                      <div className="flex gap-2 p-3 bg-muted rounded-lg border">
                        <Input
                          placeholder={isVeryNarrow ? "Name" : "Workspace name"}
                          value={newItemName}
                          onChange={(e) => setNewItemName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleRenameWorkspace(workspace.id)
                            if (e.key === "Escape") setRenamingWorkspace(null)
                          }}
                          autoFocus
                          className="flex-1"
                        />
                        <Button size="sm" onClick={() => handleRenameWorkspace(workspace.id)}>
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setRenamingWorkspace(null)
                            setNewItemName("")
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div
                        className={`
                        flex items-center gap-2 p-3 rounded-lg transition-all duration-200 border
                        ${workspace.id === currentWorkspaceId ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted border-border"}
                        ${isDropTarget("workspace", workspace.id) ? "bg-primary/20 border-2 border-primary border-dashed" : ""}
                      `}
                        onDragOver={(e) => handleDragOver(e, "workspace", workspace.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, "workspace", workspace.id)}
                        onClick={() => handleWorkspaceClick(workspace.id)}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:bg-accent flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            if (workspace.id !== currentWorkspaceId) {
                              onWorkspaceSelect(workspace.id)
                              toggleWorkspace(workspace.id, true)
                            } else {
                              toggleWorkspace(workspace.id)
                            }
                          }}
                        >
                          {shouldExpandWorkspace ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                        <Monitor className="h-4 w-4 flex-shrink-0" />
                        <div
                          className="flex-1 cursor-pointer min-w-0"
                          onClick={() => {
                            if (workspace.id !== currentWorkspaceId) {
                              onWorkspaceSelect(workspace.id)
                              toggleWorkspace(workspace.id, true)
                            } else {
                              toggleWorkspace(workspace.id)
                            }
                          }}
                        >
                          {renderTextWithOverflow(workspace.name, "text-sm font-medium")}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <WorkspaceActions workspace={workspace} />
                        </div>
                      </div>
                    )}

                    {creatingList === workspace.id && appMode === "edit" && (
                      <div className="ml-6 flex gap-2 mb-2 p-2 bg-muted rounded border">
                        <Input
                          placeholder={isVeryNarrow ? "Name" : "List name"}
                          value={newItemName}
                          onChange={(e) => setNewItemName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleCreateList(workspace.id)
                            if (e.key === "Escape") {
                              setCreatingList(null)
                              setNewItemName("")
                            }
                          }}
                          autoFocus
                          className="flex-1"
                        />
                        <Button size="sm" onClick={() => handleCreateList(workspace.id)}>
                          Add
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setCreatingList(null)
                            setNewItemName("")
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}

                    {expandedWorkspaces.has(workspace.id) && (
                      <div className="ml-4 space-y-1">
                        {filteredLists.map((list) => {
                          const listConfigs = configs.filter((c) => c.listId === list.id) // Updated to use configs
                          const shouldExpandList = expandedLists.has(list.id) || shouldAutoExpand(workspace.id, list.id)

                          return (
                            <div key={list.id} className="space-y-1">
                              {renamingList === list.id ? (
                                <div className="ml-2 flex gap-2 p-2 bg-muted rounded border">
                                  <Input
                                    placeholder={isVeryNarrow ? "Name" : "List name"}
                                    value={newItemName}
                                    onChange={(e) => setNewItemName(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") handleRenameList(list.id)
                                      if (e.key === "Escape") setRenamingList(null)
                                    }}
                                    autoFocus
                                    className="flex-1"
                                  />
                                  <Button size="sm" onClick={() => handleRenameList(list.id)}>
                                    Save
                                  </Button>
                                </div>
                              ) : (
                                <div
                                  className={`
                                  flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-muted transition-all duration-200 border border-transparent
                                  ${isDragging("list", list.id) ? "opacity-50" : ""}
                                  ${isDropTarget("list", list.id) ? "bg-primary/15 border-2 border-primary border-dashed" : ""}
                                `}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, "list", list.id)}
                                  onDragEnd={handleDragEnd}
                                  onDragOver={(e) => handleDragOver(e, "list", list.id)}
                                  onDragLeave={handleDragLeave}
                                  onDrop={(e) => handleDrop(e, "list", list.id)}
                                  onClick={() => toggleList(list.id)}
                                >
                                  <GripVertical className="h-3 w-3 text-muted-foreground cursor-grab active:cursor-grabbing flex-shrink-0" />
                                  <Button variant="ghost" size="sm" className="h-5 w-5 p-0 flex-shrink-0">
                                    {shouldExpandList ? (
                                      <ChevronDown className="h-3 w-3" />
                                    ) : (
                                      <ChevronRight className="h-3 w-3" />
                                    )}
                                  </Button>
                                  <Folder className="h-4 w-4 text-orange-500 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    {renderTextWithOverflow(list.name, "text-sm text-foreground")}
                                  </div>
                                  <div className="flex items-center gap-1 flex-shrink-0">
                                    <ListActions list={list} />
                                  </div>
                                </div>
                              )}

                              {creatingConfig === list.id && appMode === "edit" && (
                                <div className="ml-8 flex gap-2 mb-2 p-2 bg-muted rounded border">
                                  <Input
                                    placeholder={isVeryNarrow ? "Name" : "Config name"}
                                    value={newItemName}
                                    onChange={(e) => setNewItemName(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") handleCreateConfig(list.id)
                                      if (e.key === "Escape") {
                                        setCreatingConfig(null)
                                        setNewItemName("")
                                      }
                                    }}
                                    autoFocus
                                    className="flex-1"
                                  />
                                  <Button size="sm" onClick={() => handleCreateConfig(list.id)}>
                                    Add
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setCreatingConfig(null)
                                      setNewItemName("")
                                    }}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}

                              {expandedLists.has(list.id) && (
                                <div className="ml-4 space-y-1">
                                  {listConfigs.map((config) => (
                                    <div
                                      key={config.id}
                                      className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                                        currentConfigId === config.id
                                          ? "bg-primary text-primary-foreground"
                                          : "hover:bg-accent"
                                      }`}
                                      onClick={() => onConfigSelect(config.id)}
                                      draggable={appMode === "edit"}
                                      onDragStart={(e) => appMode === "edit" && handleDragStart(e, "config", config.id)}
                                      onDragOver={handleDragOver}
                                      onDrop={(e) => appMode === "edit" && handleDrop(e, "list", list.id)}
                                    >
                                      <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <GripVertical className="h-3 w-3 text-muted-foreground cursor-grab active:cursor-grabbing flex-shrink-0" />
                                        {multiViewMode && (
                                          <Checkbox
                                            checked={selectedConfigIds.includes(config.id)}
                                            onCheckedChange={(checked) =>
                                              onMultiViewConfigToggle(config.id, checked as boolean)
                                            }
                                            onClick={(e) => e.stopPropagation()}
                                            className="flex-shrink-0"
                                          />
                                        )}
                                        <BarChart3 className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                        {renderTextWithOverflow(getDisplayName(config), "text-sm")}
                                      </div>
                                      <ConfigActions config={config} />
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg border shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Confirm Delete</h3>
            <p className="text-muted-foreground mb-4">
              Are you sure you want to delete "{deleteConfirmation.name}"?
              {deleteConfirmation.type === "workspace" &&
                " This will also delete all lists and tables in this workspace."}
              {deleteConfirmation.type === "list" && " This will also delete all tables in this list."}
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDeleteConfirmation(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteConfirm}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {workspaceSettingsDrawerId && (
        <WorkspaceSettingsDrawer
          workspace={workspaces.find((w) => w.id === workspaceSettingsDrawerId)!}
          isOpen={true}
          onClose={() => setWorkspaceSettingsDrawerId(null)}
          onUpdateWorkspace={(updates) => {
            onUpdateWorkspace(workspaceSettingsDrawerId, updates)
            setWorkspaceSettingsDrawerId(null)
          }}
          onWorkspaceSettingsUpdate={onWorkspaceSettingsUpdate}
          onRenameWorkspace={(name) => {
            setRenamingWorkspace(workspaceSettingsDrawerId)
            setNewItemName(name)
            setWorkspaceSettingsDrawerId(null)
          }}
        />
      )}
    </>
  )
}
