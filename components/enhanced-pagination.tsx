"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface EnhancedPaginationProps {
  currentPage: number
  totalPages: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

export function EnhancedPagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: EnhancedPaginationProps) {
  const [jumpToPage, setJumpToPage] = useState("")

  const startIndex = (currentPage - 1) * pageSize + 1
  const endIndex = Math.min(currentPage * pageSize, totalItems)

  const handleJumpToPage = () => {
    const page = Number.parseInt(jumpToPage)
    if (page >= 1 && page <= totalPages) {
      onPageChange(page)
      setJumpToPage("")
    }
  }

  const getVisiblePages = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...")
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages)
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="text-sm text-muted-foreground">
          Showing {startIndex}-{endIndex} of {totalItems} rows
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">Rows per page:</span>
          <Select value={pageSize.toString()} onValueChange={(value) => onPageSizeChange(Number(value))}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <span className="text-sm text-muted-foreground">Go to:</span>
          <Input
            type="number"
            min="1"
            max={totalPages}
            value={jumpToPage}
            onChange={(e) => setJumpToPage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleJumpToPage()}
            className="w-16 h-8"
            placeholder={currentPage.toString()}
          />
          <Button variant="outline" size="sm" onClick={handleJumpToPage} disabled={!jumpToPage}>
            Go
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="h-8 w-8 p-0"
          >
            <ChevronsLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          {getVisiblePages().map((page, index) => (
            <Button
              key={index}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => typeof page === "number" && onPageChange(page)}
              disabled={page === "..."}
            >
              {page}
            </Button>
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="h-8 w-8 p-0"
          >
            <ChevronsRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="text-sm text-muted-foreground ml-2">
          Page {currentPage} of {totalPages}
        </div>
      </div>
    </div>
  )
}
