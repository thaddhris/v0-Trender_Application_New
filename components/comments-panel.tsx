"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, Calendar, MapPin, ChevronRight, ChevronDown } from "lucide-react"
import type { ChartComment, Config, Device, Sensor } from "@/lib/types"

interface CommentsPanelProps {
  workspaceId: string
  comments: ChartComment[]
  configs: Config[]
  devices: Device[]
  sensors: Sensor[]
  onCommentClick: (comment: ChartComment) => void
  onToggleCommentVisibility: (commentId: string) => void
  onDeleteComment: (commentId: string) => void
}

export function CommentsPanel({
  workspaceId,
  comments,
  configs,
  devices,
  sensors,
  onCommentClick,
  onToggleCommentVisibility,
  onDeleteComment,
}: CommentsPanelProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isCollapsed, setIsCollapsed] = useState(false)

  const filteredComments = comments.filter(
    (comment) =>
      comment.workspaceId === workspaceId &&
      (comment.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getConfigName(comment.configId).toLowerCase().includes(searchTerm.toLowerCase())),
  )

  function getConfigName(configId: string): string {
    const config = configs.find((c) => c.id === configId)
    return config?.name || "Unknown Config"
  }

  function getDeviceSensorName(comment: ChartComment): string {
    const device = devices.find((d) => d.id === comment.deviceId)
    const sensor = sensors.find((s) => s.id === comment.sensorId)
    return `${device?.name || "Unknown"} - ${sensor?.name || "Unknown"}`
  }

  function formatTimestamp(timestamp: Date): string {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(timestamp)
  }

  function getSensorUnit(comment: ChartComment): string {
    const sensor = sensors.find((s) => s.id === comment.sensorId)
    return sensor?.unit || ""
  }

  return (
    <div
      className={`border-l bg-background flex flex-col h-full transition-all duration-300 ${isCollapsed ? "w-12" : "w-80"}`}
    >
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setIsCollapsed(!isCollapsed)} className="p-1 h-8 w-8">
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          {!isCollapsed && (
            <>
              <MessageSquare className="h-5 w-5" />
              <h3 className="font-semibold">Comments</h3>
              <Badge variant="secondary">{filteredComments.length}</Badge>
            </>
          )}
        </div>
      </div>

      {!isCollapsed && (
        <>
          <div className="p-4 pb-0">
            <Input
              placeholder="Search comments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-4"
            />
          </div>

          <ScrollArea className="flex-1 px-4">
            <div className="space-y-3 pb-4">
              {filteredComments.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No comments yet</p>
                  <p className="text-sm">Click on chart points to add comments</p>
                </div>
              ) : (
                filteredComments.map((comment) => (
                  <Card key={comment.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-sm font-medium">{getConfigName(comment.configId)}</CardTitle>
                          <p className="text-xs text-muted-foreground">{getDeviceSensorName(comment)}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0" onClick={() => onCommentClick(comment)}>
                      <p className="text-sm mb-2">{comment.comment}</p>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{formatTimestamp(comment.timestamp)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>
                            Value: {comment.value.toFixed(2)} {getSensorUnit(comment)}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Time: {comment.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </>
      )}
    </div>
  )
}
