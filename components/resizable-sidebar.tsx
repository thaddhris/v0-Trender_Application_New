"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ResizableSidebarProps {
  children: React.ReactNode
  defaultWidth?: number
  minWidth?: number
  maxWidth?: number
  workspaceId: string
  onWidthChange?: (width: number) => void
}

export function ResizableSidebar({
  children,
  defaultWidth = 320,
  minWidth = 200,
  maxWidth = 600,
  workspaceId,
  onWidthChange,
}: ResizableSidebarProps) {
  const [width, setWidth] = useState(() => {
    // Load saved width for this workspace from localStorage
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`sidebar-width-${workspaceId}`)
      return saved ? Number.parseInt(saved, 10) : defaultWidth
    }
    return defaultWidth
  })

  const [isResizing, setIsResizing] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const startXRef = useRef(0)
  const startWidthRef = useRef(0)
  const prevWorkspaceIdRef = useRef(workspaceId)

  const memoizedOnWidthChange = useCallback(onWidthChange || (() => {}), [onWidthChange])

  // Save width to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(`sidebar-width-${workspaceId}`, width.toString())
    }
    if (onWidthChange) {
      memoizedOnWidthChange(width)
    }
  }, [width, workspaceId, memoizedOnWidthChange, onWidthChange])

  // Load width when workspace changes
  useEffect(() => {
    if (prevWorkspaceIdRef.current !== workspaceId) {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem(`sidebar-width-${workspaceId}`)
        if (saved) {
          const savedWidth = Number.parseInt(saved, 10)
          setWidth(savedWidth)
        } else {
          setWidth(defaultWidth)
        }
      } else {
        setWidth(defaultWidth)
      }
      prevWorkspaceIdRef.current = workspaceId
    }
  }, [workspaceId, defaultWidth])

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      setIsResizing(true)
      startXRef.current = e.clientX
      startWidthRef.current = width
      document.body.style.cursor = "col-resize"
      document.body.style.userSelect = "none"
    },
    [width],
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return

      const deltaX = e.clientX - startXRef.current
      const newWidth = Math.min(maxWidth, Math.max(minWidth, startWidthRef.current + deltaX))
      setWidth(newWidth)
    },
    [isResizing, minWidth, maxWidth],
  )

  const handleMouseUp = useCallback(() => {
    setIsResizing(false)
    document.body.style.cursor = ""
    document.body.style.userSelect = ""
  }, [])

  const handleDoubleClick = useCallback(() => {
    setWidth(defaultWidth)
  }, [defaultWidth])

  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isResizing, handleMouseMove, handleMouseUp])

  return (
    <div className="flex h-full">
      <div
        ref={sidebarRef}
        className="relative border-r bg-background flex flex-col shadow-sm transition-all duration-200"
        style={{ width: `${width}px` }}
      >
        {children}

        {/* Resize Handle */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={`
                  absolute top-0 right-0 w-1 h-full cursor-col-resize 
                  hover:bg-primary/20 transition-colors duration-200
                  ${isResizing ? "bg-primary/30" : "bg-transparent"}
                  group
                `}
                onMouseDown={handleMouseDown}
                onDoubleClick={handleDoubleClick}
              >
                {/* Visual indicator */}
                <div className="absolute top-1/2 right-0 w-1 h-8 -translate-y-1/2 bg-border group-hover:bg-primary/50 transition-colors duration-200 rounded-l" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Drag to resize • Double-click to reset</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}
