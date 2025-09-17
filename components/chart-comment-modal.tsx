"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

interface ChartCommentModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (comment: string) => void
  chartPoint: {
    timestamp: Date
    value: number
    x: number
    y: number
    sensorId: string
    deviceId: string
    configId: string
  } | null
}

export function ChartCommentModal({ isOpen, onClose, onSave, chartPoint }: ChartCommentModalProps) {
  const [comment, setComment] = useState("")

  const handleSave = () => {
    if (comment.trim()) {
      onSave(comment.trim())
      setComment("")
      onClose()
    }
  }

  const handleClose = () => {
    setComment("")
    onClose()
  }

  if (!chartPoint) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Comment</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p>Time: {chartPoint.timestamp.toLocaleString()}</p>
            <p>Value: {chartPoint.value.toFixed(2)}</p>
          </div>
          <Textarea
            placeholder="Enter your comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!comment.trim()}>
            Save Comment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
