"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Edit2, Trash2, Plus } from "lucide-react"

interface Column {
  key?: string
  label: string
}

interface DataTableProps {
  title: string
  description: string
  columns: Column[]
  data: any[]
  onAdd: () => void
  onEdit: (item: any) => void
  onDelete: (id: string) => void
}

export default function DataTable({ title, description, columns, data, onAdd, onEdit, onDelete }: DataTableProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Button onClick={onAdd} className="gap-2">
          <Plus size={18} />
          Add New
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                {columns.map((col, colIdx) => (
                  <th key={col.key ?? col.label ?? colIdx} className="text-left py-3 px-4 font-semibold">
                    {col.label}
                  </th>
                ))}
                <th className="text-left py-3 px-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr key="no-records">
                  <td colSpan={columns.length + 1} className="text-center py-8 text-muted-foreground">
                    No records found
                  </td>
                </tr>
              ) : (
                data.map((item, idx) => {
                  const rowKey = item?.id ?? item?._id ?? idx
                  return (
                    <tr key={rowKey} className="border-b hover:bg-muted/50">
                      {columns.map((col, colIdx) => {
                        const colKey = col.key ?? col.label ?? colIdx
                        return (
                          <td key={`${rowKey}-${colKey}`} className="py-3 px-4">
                            {item[col.key ?? colKey]}
                          </td>
                        )
                      })}
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => onEdit(item)} className="gap-1">
                            <Edit2 size={16} />
                            Edit
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => onDelete(item.id ?? item._id ?? rowKey)} className="gap-1">
                            <Trash2 size={16} />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
