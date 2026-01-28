"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  Eye
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Column {
  key: string
  label: string
  sortable?: boolean
  render?: (value: any, row: any) => React.ReactNode
}

interface AdvancedTableProps {
  title?: string
  columns: Column[]
  data: any[]
  searchable?: boolean
  searchPlaceholder?: string
  filterable?: boolean
  filterOptions?: { key: string; label: string; options: (string | { label: string; value: string })[] }[]
  selectable?: boolean
  onEdit?: (item: any) => void
  onDelete?: (item: any) => void
  onView?: (item: any) => void
  onBulkAction?: (action: string, selectedIds: string[]) => void
  actions?: { label: string; onClick: (item: any) => void; icon?: React.ReactNode; disabled?: (item: any) => boolean }[]
  pageSize?: number
  pagination?: boolean
  emptyMessage?: string | React.ReactNode
  loading?: boolean
  headerClassName?: string
  searchFields?: string[]
  className?: string
}

export function AdvancedTable({
  title,
  columns,
  data,
  searchable = true,
  searchPlaceholder = "Search...",
  filterable = false,
  filterOptions = [],
  selectable = false,
  onEdit,
  onDelete,
  onView,
  onBulkAction,
  actions = [],
  pageSize = 10,
  pagination = true,
  emptyMessage = "No data found",
  loading = false,
  headerClassName,
  searchFields = [],
  className
}: AdvancedTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null)
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<Record<string, string>>({})

  // Filter data
  const filteredData = useMemo(() => {
    let result = [...data]

    // Apply search
    if (searchTerm) {
      result = result.filter((row) => {
        // Search in visible columns
        const inColumns = columns.some((col) => {
          const value = row[col.key]
          return value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        })

        // Search in additional fields (e.g. parentName hidden column)
        const inExtraFields = searchFields.some((field) => {
          const value = row[field]
          return value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        })

        return inColumns || inExtraFields
      })
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "all") {
        result = result.filter((row) => row[key]?.toString().toLowerCase() === value.toLowerCase())
      }
    })

    return result
  }, [data, searchTerm, filters, columns])

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]

      if (aValue === bValue) return 0

      const comparison = aValue > bValue ? 1 : -1
      return sortConfig.direction === "asc" ? comparison : -comparison
    })
  }, [filteredData, sortConfig])

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return sortedData.slice(startIndex, startIndex + pageSize)
  }, [sortedData, currentPage, pageSize])

  const totalPages = Math.ceil(sortedData.length / pageSize)

  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (!current || current.key !== key) {
        return { key, direction: "asc" }
      }
      if (current.direction === "asc") {
        return { key, direction: "desc" }
      }
      return null
    })
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(paginatedData.map((row) => row._id || row.id)));
    } else {
      setSelectedRows(new Set())
    }
  }

  const handleSelectRow = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedRows)
    if (checked) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedRows(newSelected)
  }

  const getSortIcon = (columnKey: string) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
    }
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    )
  }

  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="space-y-4">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          {searchable && (
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          )}

          {filterable && filterOptions.map((filter) => (
            <Select
              key={filter.key}
              value={filters[filter.key] || "all"}
              onValueChange={(value) => setFilters({ ...filters, [filter.key]: value })}
            >
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder={filter.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All {filter.label}</SelectItem>
                {filter.options.map((option) => {
                  const optionValue = typeof option === 'string' ? option : option.value
                  const optionLabel = typeof option === 'string' ? option : option.label
                  return (
                    <SelectItem key={optionValue} value={optionValue.toLowerCase()}>
                      {optionLabel}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          ))}
        </div>

        {/* Bulk Actions */}
        {selectable && selectedRows.size > 0 && onBulkAction && (
          <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
            <span className="text-sm font-medium">{selectedRows.size} selected</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                onBulkAction("delete", Array.from(selectedRows))
                setSelectedRows(new Set())
              }}
            >
              Delete Selected
            </Button>
          </div>
        )}

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={cn("bg-muted/50", headerClassName)}>
                <tr>
                  {selectable && (
                    <th className="w-12 px-4 py-3">
                      <Checkbox
                        checked={paginatedData.length > 0 && selectedRows.size === paginatedData.length}
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                  )}
                  {columns.map((column) => (
                    <th key={column.key} className="text-left px-4 py-3 font-semibold text-sm">
                      {column.sortable !== false ? (
                        <button
                          onClick={() => handleSort(column.key)}
                          className="flex items-center gap-2 hover:text-foreground transition-colors"
                        >
                          {column.label}
                          {getSortIcon(column.key)}
                        </button>
                      ) : (
                        column.label
                      )}
                    </th>
                  ))}
                  {(onEdit || onDelete || onView || actions.length > 0) && (
                    <th className="text-left px-4 py-3 font-semibold text-sm w-24">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  // Loading skeleton
                  Array.from({ length: pageSize }).map((_, index) => (
                    <tr key={index} className="border-t">
                      {selectable && (
                        <td className="px-4 py-3">
                          <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                        </td>
                      )}
                      {columns.map((column) => (
                        <td key={column.key} className="px-4 py-3">
                          <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: `${60 + Math.random() * 40}%` }} />
                        </td>
                      ))}
                      <td className="px-4 py-3">
                        <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : paginatedData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length + (selectable ? 1 : 0) + 1}
                      className="text-center py-12 text-muted-foreground"
                    >
                      {emptyMessage}
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((row) => (
                    <tr key={row._id || row.id} className="border-t hover:bg-muted/30 transition-colors">
                      {selectable && (
                        <td className="px-4 py-3">
                          <Checkbox
                            checked={selectedRows.has(row._id || row.id)}
                            onCheckedChange={(checked) => handleSelectRow(row._id || row.id, checked as boolean)}
                          />
                        </td>
                      )}
                      {columns.map((column) => (
                        <td key={column.key} className="px-4 py-3 text-sm">
                          {column.render ? column.render(row[column.key], row) : row[column.key]}
                        </td>
                      ))}
                      {(onEdit || onDelete || onView || actions.length > 0) && (
                        <td className="px-4 py-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {onView && (
                                <DropdownMenuItem onClick={() => onView(row)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </DropdownMenuItem>
                              )}
                              {onEdit && (
                                <DropdownMenuItem onClick={() => onEdit(row)}>
                                  <Edit2 className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                              )}
                              {actions.map((action, idx) => (
                                <DropdownMenuItem
                                  key={idx}
                                  onClick={() => action.onClick(row)}
                                  disabled={action.disabled ? action.disabled(row) : false}
                                >
                                  {action.icon}
                                  {action.label}
                                </DropdownMenuItem>
                              ))}
                              {onDelete && (
                                <DropdownMenuItem
                                  onClick={() => onDelete(row)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {pagination && totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} results
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
