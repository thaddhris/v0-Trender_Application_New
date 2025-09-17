"use client"

import { EnhancedListView } from "./enhanced-list-view"
import type { List } from "@/lib/types"

interface ListViewProps {
  list: List
  onTableSelect: (tableId: string) => void
}

export function ListView({ list, onTableSelect }: ListViewProps) {
  return (
    <EnhancedListView
      list={list}
      workspaces={[]} // Placeholder - would need to be passed from parent
      currentWorkspaceId=""
      onTableSelect={onTableSelect}
      onMultiView={() => {}} // Placeholder
      onMoveTable={() => {}} // Placeholder
      onReorderTables={() => {}} // Placeholder
    />
  )
}
