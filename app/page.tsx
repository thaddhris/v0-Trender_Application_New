"use client"

import { useState } from "react"
import { ResizableSidebar } from "@/components/resizable-sidebar"
import { LeftNavigationBar } from "@/components/left-navigation-bar"
import { TopHeader } from "@/components/top-header"
import { CenterCanvas } from "@/components/center-canvas"
import { ConfigSidebar } from "@/components/config-sidebar" // Added ConfigSidebar import
import { mockWorkspaces, mockConfigs, mockForms, mockLists, mockComments } from "@/lib/mock-data" // Added mockComments import
import type { TimeRange, Workspace, Config, Comment } from "@/lib/types" // Added Comment type import
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"

type ViewMode = "empty" | "chart" | "multi-view"
type AppMode = "edit" | "view"

export default function HomePage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(() => {
    if (mockWorkspaces.length === 0) {
      const defaultWorkspace: Workspace = {
        id: "ws-default",
        name: "My Workspace",
        settings: {
          fontSize: "medium",
          alignment: "left",
        },
        createdAt: new Date(),
      }
      return [defaultWorkspace]
    }
    return mockWorkspaces
  })
  const [forms, setForms] = useState(mockForms)
  const [configs, setConfigs] = useState(mockConfigs)
  const [lists, setLists] = useState(mockLists)
  const [comments, setComments] = useState(mockComments) // Added comments state
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState(() => {
    if (mockWorkspaces.length === 0) {
      return "ws-default"
    }
    return mockWorkspaces[0]?.id || "ws-default"
  })
  const [currentConfigId, setCurrentConfigId] = useState<string | null>(null)
  const [multiViewMode, setMultiViewMode] = useState(false)
  const [selectedConfigIds, setSelectedConfigIds] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>("empty")
  const [globalTimeRange, setGlobalTimeRange] = useState<TimeRange>({
    start: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
    end: new Date(),
    preset: "Last 24h",
  })
  const [sidebarWidth, setSidebarWidth] = useState(320)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [appMode, setAppMode] = useState<AppMode>("edit")
  const [isConfigSidebarOpen, setIsConfigSidebarOpen] = useState(false) // Added right sidebar state
  const [editingConfigId, setEditingConfigId] = useState<string | null>(null) // Added editing config state

  const currentWorkspace = workspaces.find((w) => w.id === currentWorkspaceId)

  const currentConfig = currentConfigId
    ? {
        ...configs.find((c) => c.id === currentConfigId),
        workspace: currentWorkspace,
        listName: lists.find((l) => l.id === configs.find((c) => c.id === currentConfigId)?.listId)?.name,
      }
    : null

  const selectedConfigs = configs
    .filter((c) => selectedConfigIds.includes(c.id))
    .map((config) => ({
      ...config,
      workspace: currentWorkspace,
    }))

  const handleConfigSelect = (configId: string) => {
    setCurrentConfigId(configId)
    setEditingConfigId(configId) // Set editing config when selected
    setIsConfigSidebarOpen(true) // Open right sidebar when config selected
    if (multiViewMode) {
      if (!selectedConfigIds.includes(configId)) {
        const newSelection = [...selectedConfigIds, configId]
        setSelectedConfigIds(newSelection)
        setViewMode("multi-view")
      }
    } else {
      setViewMode("chart")
      setSelectedConfigIds([])
    }
  }

  const handleMultiViewToggle = (enabled: boolean) => {
    setMultiViewMode(enabled)
    if (enabled) {
      if (currentConfigId && !selectedConfigIds.includes(currentConfigId)) {
        setSelectedConfigIds([currentConfigId])
        setViewMode("multi-view")
      } else if (selectedConfigIds.length > 0) {
        setViewMode("multi-view")
      }
    } else {
      if (currentConfigId) {
        setViewMode("chart")
      } else {
        setViewMode("empty")
      }
    }
  }

  const handleMultiViewConfigToggle = (configId: string, selected: boolean) => {
    if (selected) {
      const newSelection = [...selectedConfigIds, configId]
      setSelectedConfigIds(newSelection)
      setViewMode("multi-view")
      setCurrentConfigId(configId)
    } else {
      const newSelection = selectedConfigIds.filter((id) => id !== configId)
      setSelectedConfigIds(newSelection)
      if (newSelection.length === 0) {
        setViewMode("empty")
        setCurrentConfigId(null)
      } else if (configId === currentConfigId) {
        setCurrentConfigId(newSelection[0])
      }
    }
  }

  const handleRemoveFromMultiView = (configId: string) => {
    handleMultiViewConfigToggle(configId, false)
  }

  const handleReorderMultiViewConfigs = (configIds: string[]) => {
    setSelectedConfigIds(configIds)
  }

  const handleCreateWorkspace = (name: string) => {
    const newWorkspace: Workspace = {
      id: `ws-${Date.now()}`,
      name,
      settings: {
        fontSize: "medium",
        alignment: "left",
      },
      createdAt: new Date(),
    }
    setWorkspaces([...workspaces, newWorkspace])
    setCurrentWorkspaceId(newWorkspace.id)
  }

  const handleWorkspaceSettingsUpdate = (workspaceId: string, settings: any) => {
    console.log("[v0] Updating workspace settings:", { workspaceId, settings })

    setWorkspaces((prevWorkspaces) => {
      const updatedWorkspaces = prevWorkspaces.map((w) =>
        w.id === workspaceId ? { ...w, settings: { ...w.settings, ...settings } } : w,
      )

      console.log("[v0] Updated workspaces:", updatedWorkspaces)
      return updatedWorkspaces
    })

    setConfigs((prevConfigs) => [...prevConfigs])
  }

  const handleUpdateWorkspace = (id: string, updates: Partial<Workspace>) => {
    console.log("[v0] Updating workspace:", { id, updates })
    setWorkspaces(workspaces.map((w) => (w.id === id ? { ...w, ...updates } : w)))
  }

  const handleCreateConfig = (listId: string, name?: string) => {
    const newConfig: Config = {
      id: `config-${Date.now()}`,
      listId,
      name: name || "New Config",
      deviceId: "",
      sensorId: "",
      isLocked: false,
      createdAt: new Date(),
    }
    const updatedConfigs = [...configs, newConfig]
    setConfigs(updatedConfigs)
    setCurrentConfigId(newConfig.id)
    setEditingConfigId(newConfig.id) // Set editing config for new config
    setIsConfigSidebarOpen(true) // Open right sidebar for new config
    setViewMode("chart")

    setTimeout(() => {
      setConfigs([...updatedConfigs])
    }, 0)

    return newConfig.id
  }

  const handleCreateList = (workspaceId: string, name: string) => {
    const newList = {
      id: `list-${Date.now()}`,
      workspaceId,
      name,
      order: lists.filter((l) => l.workspaceId === workspaceId).length,
      createdAt: new Date().toISOString(),
    }
    setLists([...lists, newList])
    return newList.id
  }

  const handleUpdateConfig = (id: string, updates: Partial<Config>) => {
    setConfigs(configs.map((c) => (c.id === id ? { ...c, ...updates } : c)))
  }

  const handleConfigSidebarApply = (configData: Omit<Config, "id">) => {
    console.log("[v0] Apply button clicked with data:", configData) // Added debug logging

    if (editingConfigId) {
      const updatedConfig = {
        ...configData,
        id: editingConfigId,
        updatedAt: new Date().toISOString(),
      }

      console.log("[v0] Updating config:", updatedConfig) // Added debug logging
      setConfigs(configs.map((c) => (c.id === editingConfigId ? { ...c, ...updatedConfig } : c)))

      // Ensure the chart is displayed
      setCurrentConfigId(editingConfigId)
      setViewMode("chart")

      console.log("[v0] Set viewMode to chart, currentConfigId:", editingConfigId) // Added debug logging

      setIsConfigSidebarOpen(false)
      setEditingConfigId(null)
    }
  }

  const handleConfigSidebarClose = () => {
    setIsConfigSidebarOpen(false)
    setEditingConfigId(null)
  }

  const handleMoveConfig = (configId: string, newListId: string) => {
    setConfigs(configs.map((c) => (c.id === configId ? { ...c, listId: newListId } : c)))
    console.log(`Moved config ${configId} to list ${newListId}`)
  }

  const handleMoveList = (listId: string, newWorkspaceId: string) => {
    setLists(lists.map((l) => (l.id === listId ? { ...l, workspaceId: newWorkspaceId } : l)))
    console.log(`Moved list ${listId} to workspace ${newWorkspaceId}`)
  }

  const handleDeleteWorkspace = (workspaceId: string) => {
    const workspaceLists = lists.filter((l) => l.workspaceId === workspaceId)
    const workspaceListIds = workspaceLists.map((l) => l.id)
    const workspaceConfigs = configs.filter((c) => workspaceListIds.includes(c.listId))

    setConfigs(configs.filter((c) => !workspaceListIds.includes(c.listId)))
    setLists(lists.filter((l) => l.workspaceId !== workspaceId))
    const updatedWorkspaces = workspaces.filter((w) => w.id !== workspaceId)
    setWorkspaces(updatedWorkspaces)

    if (workspaceId === currentWorkspaceId && updatedWorkspaces.length > 0) {
      setCurrentWorkspaceId(updatedWorkspaces[0].id)
    }

    if (workspaceConfigs.some((c) => c.id === currentConfigId)) {
      setCurrentConfigId(null)
      setViewMode("empty")
      setSelectedConfigIds([])
    }
  }

  const handleDeleteList = (listId: string) => {
    const listConfigs = configs.filter((c) => c.listId === listId)
    setConfigs(configs.filter((c) => c.listId !== listId))
    setLists(lists.filter((l) => l.id !== listId))

    if (listConfigs.some((c) => c.id === currentConfigId)) {
      setCurrentConfigId(null)
      setViewMode("empty")
      setSelectedConfigIds([])
    }
  }

  const handleDeleteConfig = (configId: string) => {
    setConfigs(configs.filter((c) => c.id !== configId))

    if (configId === currentConfigId) {
      setCurrentConfigId(null)
      setViewMode("empty")
    }

    setSelectedConfigIds(selectedConfigIds.filter((id) => id !== configId))
  }

  const handleAddComment = (comment: Omit<Comment, "id" | "createdAt">) => {
    const newComment: Comment = {
      ...comment,
      id: `comment-${Date.now()}`,
      createdAt: new Date(),
    }
    setComments([...comments, newComment])
  }

  const handleUpdateComment = (commentId: string, updates: Partial<Comment>) => {
    setComments(comments.map((c) => (c.id === commentId ? { ...c, ...updates } : c)))
  }

  const handleDeleteComment = (commentId: string) => {
    setComments(comments.filter((c) => c.id !== commentId))
  }

  return (
    <div className="flex h-screen bg-background">
      {!isSidebarCollapsed ? (
        <ResizableSidebar
          workspaceId={currentWorkspaceId}
          onWidthChange={setSidebarWidth}
          defaultWidth={320}
          minWidth={200}
          maxWidth={600}
        >
          <LeftNavigationBar
            workspaces={workspaces}
            configs={configs}
            lists={lists}
            currentWorkspaceId={currentWorkspaceId}
            currentConfigId={currentConfigId}
            multiViewMode={multiViewMode}
            selectedConfigIds={selectedConfigIds}
            timeRange={globalTimeRange}
            sidebarWidth={sidebarWidth}
            isCollapsed={false}
            appMode={appMode}
            onCollapse={() => setIsSidebarCollapsed(true)}
            onWorkspaceSelect={setCurrentWorkspaceId}
            onConfigSelect={handleConfigSelect}
            onMultiViewConfigToggle={handleMultiViewConfigToggle}
            onCreateWorkspace={handleCreateWorkspace}
            onCreateList={handleCreateList}
            onCreateConfig={handleCreateConfig}
            onUpdateWorkspace={handleUpdateWorkspace}
            onMoveConfig={handleMoveConfig}
            onMoveList={handleMoveList}
            onWorkspaceSettingsUpdate={handleWorkspaceSettingsUpdate}
            onDeleteWorkspace={handleDeleteWorkspace}
            onDeleteList={handleDeleteList}
            onDeleteConfig={handleDeleteConfig}
          />
        </ResizableSidebar>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsSidebarCollapsed(false)}
          className="fixed top-16 left-2 z-50 h-8 w-8 p-0 bg-background border shadow-lg hover:bg-accent rounded-full"
          title="Expand sidebar"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}

      <div className="flex-1 flex flex-col">
        {currentWorkspace && (
          <TopHeader
            workspace={currentWorkspace}
            timeRange={globalTimeRange}
            multiViewMode={multiViewMode}
            currentTable={currentConfig}
            appMode={appMode}
            onAppModeChange={setAppMode}
            onTimeRangeChange={setGlobalTimeRange}
            onMultiViewToggle={handleMultiViewToggle}
            onWorkspaceUpdate={(updates) => handleUpdateWorkspace(currentWorkspace.id, updates)}
            onWorkspaceSettingsUpdate={(settings) => handleWorkspaceSettingsUpdate(currentWorkspace.id, settings)}
          />
        )}

        <div className="flex flex-1 relative">
          <CenterCanvas
            viewMode={viewMode}
            currentConfig={currentConfig}
            selectedConfigs={selectedConfigs}
            timeRange={globalTimeRange}
            currentWorkspace={currentWorkspace}
            appMode={appMode}
            comments={comments} // Added comments prop
            onUpdateConfig={handleUpdateConfig}
            onConfigSelect={handleConfigSelect}
            onRemoveConfig={handleRemoveFromMultiView}
            onReorderConfigs={handleReorderMultiViewConfigs}
            onAddComment={handleAddComment} // Added comment handlers
            onUpdateComment={handleUpdateComment}
            onDeleteComment={handleDeleteComment}
          />

          {isConfigSidebarOpen && (
            <ConfigSidebar
              isOpen={isConfigSidebarOpen}
              editingConfig={editingConfigId ? configs.find((c) => c.id === editingConfigId) : null}
              onApply={handleConfigSidebarApply}
              onClose={handleConfigSidebarClose}
            />
          )}
        </div>
      </div>
    </div>
  )
}
