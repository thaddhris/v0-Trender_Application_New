"use client"

import { AdvancedChartView } from "@/components/advanced-chart-view"
import { CommentsPanel } from "@/components/comments-panel"
import { mockDevices, mockSensors } from "@/lib/mock-data"
import type { Config, TimeRange, Workspace, ChartComment } from "@/lib/types"

interface CenterCanvasProps {
  viewMode: "empty" | "chart" | "multi-view"
  currentConfig: Config | null
  selectedConfigs: Config[]
  timeRange: TimeRange
  currentWorkspace?: Workspace
  appMode: "edit" | "view"
  comments: ChartComment[]
  highlightedComment?: ChartComment | null
  onAddComment: (comment: Omit<ChartComment, "id" | "createdAt">) => void
  onUpdateConfig: (id: string, updates: Partial<Config>) => void
  onConfigSelect: (configId: string) => void
  onRemoveConfig?: (configId: string) => void
  onReorderConfigs?: (configIds: string[]) => void
  onCommentClick?: (comment: ChartComment) => void
  onToggleCommentVisibility?: (commentId: string) => void
  onDeleteComment?: (commentId: string) => void
}

export function CenterCanvas({
  viewMode,
  currentConfig,
  selectedConfigs,
  timeRange,
  currentWorkspace,
  appMode,
  comments,
  highlightedComment,
  onAddComment,
  onUpdateConfig,
  onConfigSelect,
  onRemoveConfig,
  onReorderConfigs,
  onCommentClick,
  onToggleCommentVisibility,
  onDeleteComment,
}: CenterCanvasProps) {
  const isConfigComplete = (config: Config | null): boolean => {
    return config !== null && config.deviceId && config.sensorId
  }

  const handleAddComment = (comment: Omit<ChartComment, "id" | "createdAt">) => {
    const commentWithWorkspace = {
      ...comment,
      workspaceId: currentWorkspace?.id || "default-workspace",
    }
    onAddComment(commentWithWorkspace)
  }

  const handleCommentClick = (comment: ChartComment) => {
    onCommentClick?.(comment)
  }

  const handleToggleCommentVisibility = (commentId: string) => {
    onToggleCommentVisibility?.(commentId)
  }

  const handleDeleteComment = (commentId: string) => {
    onDeleteComment?.(commentId)
  }

  if (viewMode === "empty") {
    return (
      <div className="flex-1 flex">
        <main className="flex-1 flex items-center justify-center bg-muted/20">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-semibold text-muted-foreground">Please configure a chart to get started</h2>
            <p className="text-muted-foreground">
              Create a new device sensor configuration from the navigation bar or select an existing one to begin
              analyzing your IoT device data.
            </p>
          </div>
        </main>
        <CommentsPanel
          workspaceId={currentWorkspace?.id || "default-workspace"}
          comments={comments}
          configs={selectedConfigs}
          devices={mockDevices}
          sensors={mockSensors}
          onCommentClick={handleCommentClick}
          onToggleCommentVisibility={handleToggleCommentVisibility}
          onDeleteComment={handleDeleteComment}
        />
      </div>
    )
  }

  if (viewMode === "multi-view") {
    const completeConfigs = selectedConfigs.filter(isConfigComplete)

    if (completeConfigs.length === 0) {
      return (
        <div className="flex-1 flex">
          <main className="flex-1 flex items-center justify-center bg-muted/20">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-semibold text-muted-foreground">
                Please select/add a configuration to see the chart
              </h2>
              <p className="text-muted-foreground">
                Configure your selected device sensor pairs in the sidebar to view the combined chart.
              </p>
            </div>
          </main>
          <CommentsPanel
            workspaceId={currentWorkspace?.id || "default-workspace"}
            comments={comments}
            configs={selectedConfigs}
            devices={mockDevices}
            sensors={mockSensors}
            onCommentClick={handleCommentClick}
            onToggleCommentVisibility={handleToggleCommentVisibility}
            onDeleteComment={handleDeleteComment}
          />
        </div>
      )
    }

    return (
      <div className="flex-1 flex">
        <main className="flex-1 overflow-hidden">
          <AdvancedChartView
            configs={completeConfigs}
            timeRange={timeRange}
            comments={comments}
            highlightedComment={highlightedComment}
            onAddComment={handleAddComment}
            className="w-full h-full"
          />
        </main>
        <CommentsPanel
          workspaceId={currentWorkspace?.id || "default-workspace"}
          comments={comments}
          configs={completeConfigs}
          devices={mockDevices}
          sensors={mockSensors}
          onCommentClick={handleCommentClick}
          onToggleCommentVisibility={handleToggleCommentVisibility}
          onDeleteComment={handleDeleteComment}
        />
      </div>
    )
  }

  if (viewMode === "chart" && currentConfig) {
    if (!isConfigComplete(currentConfig)) {
      return (
        <div className="flex-1 flex">
          <main className="flex-1 flex items-center justify-center bg-muted/20">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-semibold text-muted-foreground">
                Please select/add a configuration to see the chart
              </h2>
              <p className="text-muted-foreground">
                Configure the device and sensor pair in the sidebar to view the chart for "{currentConfig.name}".
              </p>
            </div>
          </main>
          <CommentsPanel
            workspaceId={currentWorkspace?.id || "default-workspace"}
            comments={comments}
            configs={[currentConfig]}
            devices={mockDevices}
            sensors={mockSensors}
            onCommentClick={handleCommentClick}
            onToggleCommentVisibility={handleToggleCommentVisibility}
            onDeleteComment={handleDeleteComment}
          />
        </div>
      )
    }

    return (
      <div className="flex-1 flex">
        <main className="flex-1 overflow-hidden">
          <AdvancedChartView
            configs={[currentConfig]}
            timeRange={timeRange}
            comments={comments}
            highlightedComment={highlightedComment}
            onAddComment={handleAddComment}
            className="w-full h-full"
          />
        </main>
        <CommentsPanel
          workspaceId={currentWorkspace?.id || "default-workspace"}
          comments={comments}
          configs={[currentConfig]}
          devices={mockDevices}
          sensors={mockSensors}
          onCommentClick={handleCommentClick}
          onToggleCommentVisibility={handleToggleCommentVisibility}
          onDeleteComment={handleDeleteComment}
        />
      </div>
    )
  }

  return null
}
