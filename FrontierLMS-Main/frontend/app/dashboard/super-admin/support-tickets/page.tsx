"use client"

import { useState } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import { StatusBadge } from "@/components/super-admin/status-badge"
import { ConfirmationDialog } from "@/components/super-admin/confirmation-dialog"
import FormModal from "@/components/form-modal"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  MessageSquare,
  User,
  Calendar
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Ticket {
  id: string
  title: string
  institute: string
  priority: "Low" | "Medium" | "High" | "Critical"
  status: "Open" | "In Progress" | "Resolved" | "Closed"
  category: string
  assignedTo: string
  createdDate: string
  slaHours: number
  hoursElapsed: number
  description?: string
}

export default function SupportTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([
    { 
      id: "1", 
      title: "Login Issue - Cannot Access Dashboard", 
      institute: "Central High School", 
      priority: "High", 
      status: "Open",
      category: "Technical",
      assignedTo: "John Doe",
      createdDate: "2025-01-05T10:30:00",
      slaHours: 24,
      hoursElapsed: 8,
      description: "Users unable to login to the system"
    },
    { 
      id: "2", 
      title: "Feature Request - Bulk Student Import", 
      institute: "North Academy", 
      priority: "Medium", 
      status: "In Progress",
      category: "Feature Request",
      assignedTo: "Jane Smith",
      createdDate: "2025-01-04T14:20:00",
      slaHours: 72,
      hoursElapsed: 30,
      description: "Request for bulk import functionality"
    },
    { 
      id: "3", 
      title: "Bug Report - Grade Calculation Error", 
      institute: "South Institute", 
      priority: "Critical", 
      status: "In Progress",
      category: "Bug",
      assignedTo: "John Doe",
      createdDate: "2025-01-06T09:15:00",
      slaHours: 12,
      hoursElapsed: 5,
      description: "Incorrect grade calculations in reports"
    },
    { 
      id: "4", 
      title: "General Inquiry - Pricing Plans", 
      institute: "East Valley School", 
      priority: "Low", 
      status: "Resolved",
      category: "General",
      assignedTo: "Sarah Johnson",
      createdDate: "2025-01-03T11:00:00",
      slaHours: 48,
      hoursElapsed: 72,
      description: "Questions about upgrading subscription"
    },
    { 
      id: "5", 
      title: "Payment Issue - Invoice Not Received", 
      institute: "West Point Academy", 
      priority: "High", 
      status: "Open",
      category: "Billing",
      assignedTo: "Mike Wilson",
      createdDate: "2025-01-06T16:45:00",
      slaHours: 24,
      hoursElapsed: 2,
      description: "Missing invoice for last month"
    },
  ])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null }>({ 
    open: false, 
    id: null 
  })

  const handleAdd = (data: any) => {
    const newTicket: Ticket = { 
      id: Date.now().toString(), 
      ...data,
      createdDate: new Date().toISOString(),
      hoursElapsed: 0,
      slaHours: data.priority === "Critical" ? 12 : data.priority === "High" ? 24 : data.priority === "Medium" ? 72 : 120
    }
    setTickets([...tickets, newTicket])
    setIsModalOpen(false)
  }

  const handleEdit = (id: string, data: any) => {
    setTickets(tickets.map((t) => (t.id === id ? { ...t, ...data } : t)))
    setIsModalOpen(false)
    setEditingId(null)
  }

  const handleDelete = (item: any) => {
    setDeleteConfirm({ open: true, id: item.id })
  }

  const confirmDelete = () => {
    if (deleteConfirm.id) {
      setTickets(tickets.filter((t) => t.id !== deleteConfirm.id))
    }
    setDeleteConfirm({ open: false, id: null })
  }

  const handleBulkAction = (action: string, selectedIds: string[]) => {
    if (action === "delete") {
      setTickets(tickets.filter((t) => !selectedIds.includes(t.id)))
    }
  }

  const getSLAStatus = (ticket: Ticket) => {
    const percentage = (ticket.hoursElapsed / ticket.slaHours) * 100
    if (percentage >= 100) return { color: "bg-red-500", text: "Breached" }
    if (percentage >= 75) return { color: "bg-orange-500", text: "At Risk" }
    return { color: "bg-green-500", text: "On Track" }
  }

  const columns = [
    { 
      key: "title", 
      label: "Ticket",
      render: (value: string, row: Ticket) => (
        <div>
          <p className="font-medium">{value}</p>
          <p className="text-xs text-muted-foreground">{row.institute}</p>
        </div>
      )
    },
    { 
      key: "category", 
      label: "Category",
      render: (value: string) => (
        <StatusBadge status={value} variant="info" />
      )
    },
    { 
      key: "priority", 
      label: "Priority",
      render: (value: string) => <StatusBadge status={value} />
    },
    { 
      key: "status", 
      label: "Status",
      render: (value: string) => <StatusBadge status={value} />
    },
    { 
      key: "assignedTo", 
      label: "Assigned To",
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-xs">{value.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <span className="text-sm">{value}</span>
        </div>
      )
    },
    { 
      key: "slaHours", 
      label: "SLA Status",
      render: (value: number, row: Ticket) => {
        const sla = getSLAStatus(row)
        const percentage = Math.min(100, (row.hoursElapsed / row.slaHours) * 100)
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={cn("h-full", sla.color)}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">{Math.round(percentage)}%</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {row.hoursElapsed}h / {row.slaHours}h
            </p>
          </div>
        )
      }
    },
    { 
      key: "createdDate", 
      label: "Created",
      render: (value: string) => {
        const date = new Date(value)
        const now = new Date()
        const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
        return (
          <div>
            <p className="text-sm">{date.toLocaleDateString()}</p>
            <p className="text-xs text-muted-foreground">{diffHours}h ago</p>
          </div>
        )
      }
    },
  ]

  const formFields = [
    { name: "title", label: "Ticket Title", type: "text" as const, required: true },
    { name: "institute", label: "Institute", type: "text" as const, required: true },
    { name: "category", label: "Category", type: "select" as const, options: [
      { value: "Technical", label: "Technical" },
      { value: "Billing", label: "Billing" },
      { value: "Feature Request", label: "Feature Request" },
      { value: "Bug", label: "Bug" },
      { value: "General", label: "General" }
    ], required: true },
    { name: "priority", label: "Priority", type: "select" as const, options: [
      { value: "Low", label: "Low" },
      { value: "Medium", label: "Medium" },
      { value: "High", label: "High" },
      { value: "Critical", label: "Critical" }
    ], required: true },
    { name: "status", label: "Status", type: "select" as const, options: [
      { value: "Open", label: "Open" },
      { value: "In Progress", label: "In Progress" },
      { value: "Resolved", label: "Resolved" },
      { value: "Closed", label: "Closed" }
    ], required: true },
    { name: "assignedTo", label: "Assigned To", type: "text" as const, required: true },
    { name: "description", label: "Description", type: "text" as const, required: false },
  ]

  // Calculate stats
  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === "Open").length,
    inProgress: tickets.filter(t => t.status === "In Progress").length,
    resolved: tickets.filter(t => t.status === "Resolved").length,
    breached: tickets.filter(t => t.hoursElapsed >= t.slaHours).length
  }

  return (
    <DashboardLayout title="Support Tickets">
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Tickets</p>
                  <p className="text-2xl font-bold mt-1">{stats.total}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Open</p>
                  <p className="text-2xl font-bold mt-1">{stats.open}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold mt-1">{stats.inProgress}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Resolved</p>
                  <p className="text-2xl font-bold mt-1">{stats.resolved}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">SLA Breached</p>
                  <p className="text-2xl font-bold mt-1">{stats.breached}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Bar */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">All Support Tickets</h2>
            <p className="text-sm text-muted-foreground">Track and manage customer support requests</p>
          </div>
          <Button
            onClick={() => {
              setEditingId(null)
              setIsModalOpen(true)
            }}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Create Ticket
          </Button>
        </div>

        {/* Advanced Table */}
        <AdvancedTable
          columns={columns}
          data={tickets}
          searchable={true}
          searchPlaceholder="Search by title, institute, or assigned staff..."
          filterable={true}
          filterOptions={[
            { key: "status", label: "Status", options: ["Open", "In Progress", "Resolved", "Closed"] },
            { key: "priority", label: "Priority", options: ["Low", "Medium", "High", "Critical"] },
            { key: "category", label: "Category", options: ["Technical", "Billing", "Feature Request", "Bug", "General"] }
          ]}
          selectable={true}
          onEdit={(item) => {
            setEditingId(item.id)
            setIsModalOpen(true)
          }}
          onDelete={handleDelete}
          onBulkAction={handleBulkAction}
          pageSize={10}
          emptyMessage="No support tickets found."
        />

        {/* Edit/Add Modal */}
        <FormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingId(null)
          }}
          onSubmit={(data) => (editingId ? handleEdit(editingId, data) : handleAdd(data))}
          fields={formFields}
          title={editingId ? "Edit Ticket" : "Create Ticket"}
          initialData={editingId ? tickets.find((t) => t.id === editingId) : {}}
        />

        {/* Delete Confirmation */}
        <ConfirmationDialog
          open={deleteConfirm.open}
          onOpenChange={(open) => setDeleteConfirm({ open, id: null })}
          title="Delete Ticket"
          description="Are you sure you want to delete this support ticket? This action cannot be undone."
          onConfirm={confirmDelete}
          confirmText="Delete"
          variant="destructive"
        />
      </div>
    </DashboardLayout>
  )
}
