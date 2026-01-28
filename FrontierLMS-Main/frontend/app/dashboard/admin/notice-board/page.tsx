"use client"

import { useState } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { StatCard } from "@/components/super-admin/stat-card"
import { StatusBadge } from "@/components/super-admin/status-badge"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import { ConfirmationDialog } from "@/components/super-admin/confirmation-dialog"
import { Button } from "@/components/ui/button"
import { Bell, AlertCircle, Users, Pin, Plus } from "lucide-react"
import FormModal from "@/components/form-modal"

interface Notice {
  id: string
  title: string
  content: string
  date: string
  expiryDate: string
  category: string
  priority: "High" | "Medium" | "Low"
  targetAudience: string
  isPinned: boolean
  postedBy: string
}

export default function NoticeBoard() {
  const [notices, setNotices] = useState<Notice[]>([
    { id: "1", title: "School Closure", content: "School will be closed on Friday for maintenance", date: "2024-11-01", expiryDate: "2024-11-10", category: "General", priority: "High", targetAudience: "All", isPinned: true, postedBy: "Admin" },
    { id: "2", title: "Exam Schedule", content: "Final exams start from December 1st", date: "2024-11-05", expiryDate: "2024-12-01", category: "Academic", priority: "High", targetAudience: "Students", isPinned: true, postedBy: "Admin" },
    { id: "3", title: "Sports Day", content: "Annual sports day on November 20th", date: "2024-11-08", expiryDate: "2024-11-20", category: "Event", priority: "Medium", targetAudience: "All", isPinned: false, postedBy: "Sports Dept" },
    { id: "4", title: "Parent Meeting", content: "Parent-teacher meeting scheduled", date: "2024-11-10", expiryDate: "2024-11-15", category: "Meeting", priority: "Medium", targetAudience: "Parents", isPinned: false, postedBy: "Admin" },
  ])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null
  })

  const handleAdd = (data: any) => {
    const newNotice: Notice = { 
      id: Date.now().toString(), 
      ...data,
      isPinned: data.isPinned === "true" || data.isPinned === true,
      date: new Date().toISOString().split('T')[0]
    }
    setNotices([...notices, newNotice])
    setIsModalOpen(false)
  }

  const handleEdit = (id: string, data: any) => {
    setNotices(notices.map((notice) => (notice.id === id ? { 
      ...notice, 
      ...data,
      isPinned: data.isPinned === "true" || data.isPinned === true
    } : notice)))
    setEditingId(null)
    setIsModalOpen(false)
  }

  const handleDelete = (item: any) => {
    setDeleteConfirm({ open: true, id: item.id })
  }

  const confirmDelete = () => {
    if (deleteConfirm.id) {
      setNotices(notices.filter((notice) => notice.id !== deleteConfirm.id))
    }
    setDeleteConfirm({ open: false, id: null })
  }

  const handleBulkAction = (action: string, selectedIds: string[]) => {
    if (action === "delete") {
      setNotices(notices.filter((n) => !selectedIds.includes(n.id)))
    }
  }

  const stats = {
    total: notices.length,
    pinned: notices.filter(n => n.isPinned).length,
    high: notices.filter(n => n.priority === "High").length,
    active: notices.filter(n => new Date(n.expiryDate) >= new Date()).length
  }

  const columns = [
    {
      key: "title",
      label: "Notice",
      render: (value: string, row: Notice) => (
        <div className="flex items-center gap-2">
          {row.isPinned && <Pin className="h-3 w-3 text-red-600" />}
          <div>
            <p className="font-medium">{value}</p>
            <p className="text-xs text-muted-foreground line-clamp-1">{row.content}</p>
          </div>
        </div>
      )
    },
    {
      key: "category",
      label: "Category",
      render: (value: string) => (
        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">{value}</span>
      )
    },
    {
      key: "priority",
      label: "Priority",
      render: (value: string) => {
        const colors = {
          High: "bg-red-100 text-red-700",
          Medium: "bg-orange-100 text-orange-700",
          Low: "bg-green-100 text-green-700"
        }
        return (
          <span className={`text-xs px-2 py-1 rounded-full ${colors[value as keyof typeof colors]}`}>
            {value}
          </span>
        )
      }
    },
    {
      key: "targetAudience",
      label: "Target",
      render: (value: string) => (
        <div className="flex items-center gap-1 text-sm">
          <Users className="h-3 w-3 text-muted-foreground" />
          <span>{value}</span>
        </div>
      )
    },
    {
      key: "date",
      label: "Posted Date",
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      key: "expiryDate",
      label: "Expires",
      render: (value: string) => {
        const isExpired = new Date(value) < new Date()
        return (
          <span className={isExpired ? "text-red-600 text-sm" : "text-sm"}>
            {new Date(value).toLocaleDateString()}
          </span>
        )
      }
    },
  ]

  const formFields = [
    { name: "title", label: "Notice Title", type: "text" as const, required: true },
    { name: "content", label: "Content", type: "text" as const, required: true },
    { name: "category", label: "Category", type: "select" as const, options: [
      { value: "General", label: "General" },
      { value: "Academic", label: "Academic" },
      { value: "Event", label: "Event" },
      { value: "Meeting", label: "Meeting" },
      { value: "Holiday", label: "Holiday" },
      { value: "Urgent", label: "Urgent" }
    ], required: true },
    { name: "priority", label: "Priority", type: "select" as const, options: [
      { value: "High", label: "High" },
      { value: "Medium", label: "Medium" },
      { value: "Low", label: "Low" }
    ], required: true },
    { name: "targetAudience", label: "Target Audience", type: "select" as const, options: [
      { value: "All", label: "All" },
      { value: "Students", label: "Students" },
      { value: "Parents", label: "Parents" },
      { value: "Staff", label: "Staff" }
    ], required: true },
    { name: "expiryDate", label: "Expiry Date", type: "date" as const, required: true },
    { name: "postedBy", label: "Posted By", type: "text" as const, required: true },
    { name: "isPinned", label: "Pin Notice", type: "select" as const, options: [
      { value: "true", label: "Yes" },
      { value: "false", label: "No" }
    ], required: true },
  ]

  return (
    <DashboardLayout title="Digital Notice Board">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold">Notice Board Management</h2>
            <p className="text-sm text-muted-foreground">Post and manage school notices and announcements</p>
          </div>
          <Button onClick={() => { setEditingId(null); setIsModalOpen(true) }}>
            <Plus className="h-4 w-4 mr-2" />
            Post Notice
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Notices"
            value={stats.total.toString()}
            icon={Bell}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
          />
          <StatCard
            title="Pinned"
            value={stats.pinned.toString()}
            icon={Pin}
            iconColor="text-red-600"
            iconBgColor="bg-red-100"
          />
          <StatCard
            title="High Priority"
            value={stats.high.toString()}
            icon={AlertCircle}
            iconColor="text-orange-600"
            iconBgColor="bg-orange-100"
          />
          <StatCard
            title="Active"
            value={stats.active.toString()}
            icon={Bell}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
          />
        </div>

        <AdvancedTable
          columns={columns}
          data={notices}
          searchable={true}
          searchPlaceholder="Search notices by title or content..."
          filterable={true}
          filterOptions={[
            { key: "priority", label: "Priority", options: ["High", "Medium", "Low"] },
            { key: "category", label: "Category", options: [...new Set(notices.map(n => n.category))] },
            { key: "targetAudience", label: "Audience", options: [...new Set(notices.map(n => n.targetAudience))] }
          ]}
          selectable={true}
          onEdit={(notice) => {
            setEditingId(notice.id)
            setIsModalOpen(true)
          }}
          onDelete={handleDelete}
          onBulkAction={handleBulkAction}
          pageSize={10}
          emptyMessage="No notices found."
        />

        <FormModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setEditingId(null) }}
          onSubmit={(data) => (editingId ? handleEdit(editingId, data) : handleAdd(data))}
          fields={formFields}
          title={editingId ? "Edit Notice" : "Post New Notice"}
          initialData={editingId ? {
            ...notices.find((n) => n.id === editingId),
            isPinned: notices.find((n) => n.id === editingId)?.isPinned ? "true" : "false"
          } : { isPinned: "false" }}
        />

        <ConfirmationDialog
          open={deleteConfirm.open}
          onOpenChange={(open) => setDeleteConfirm({ open, id: null })}
          title="Delete Notice"
          description="Are you sure you want to delete this notice? This action cannot be undone."
          onConfirm={confirmDelete}
          confirmText="Delete"
          variant="destructive"
        />
      </div>
    </DashboardLayout>
  )
}
