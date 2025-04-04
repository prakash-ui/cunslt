"use client"

import type React from "react"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

interface Column<T> {
  header: string
  accessorKey: keyof T
  cell?: (item: T) => React.ReactNode
}

interface AccessibleTableProps<T> {
  data: T[]
  columns: Column<T>[]
  caption?: string
  className?: string
  emptyState?: React.ReactNode
  id?: string
  sortable?: boolean
  onRowClick?: (item: T) => void
}

export function AccessibleTable<T>({
  data,
  columns,
  caption,
  className,
  emptyState,
  id,
  sortable = false,
  onRowClick,
}: AccessibleTableProps<T>) {
  return (
    <div className={cn("w-full overflow-auto", className)}>
      <Table id={id}>
        {caption && <caption className="text-sm text-muted-foreground mb-2">{caption}</caption>}
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.header as string} className={sortable ? "cursor-pointer" : undefined}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                {emptyState || "No results found."}
              </TableCell>
            </TableRow>
          ) : (
            data.map((item, index) => (
              <TableRow
                key={index}
                onClick={onRowClick ? () => onRowClick(item) : undefined}
                className={onRowClick ? "cursor-pointer hover:bg-muted/50" : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                onKeyDown={
                  onRowClick
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault()
                          onRowClick(item)
                        }
                      }
                    : undefined
                }
                aria-label={onRowClick ? "Click to view details" : undefined}
              >
                {columns.map((column) => (
                  <TableCell key={column.accessorKey as string}>
                    {column.cell ? column.cell(item) : (item[column.accessorKey] as React.ReactNode)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

