"use client"

import { API_URL } from "@/lib/api-config"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import { StatusBadge } from "@/components/super-admin/status-badge"
import { ConfirmationDialog } from "@/components/super-admin/confirmation-dialog"
import FormModal from "@/components/form-modal"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  IndianRupee,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Send,
  Calendar
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts"

interface Invoice {
  id: string
  institute: string
  amount: number
  dueDate: string
  status: "Paid" | "Pending" | "Overdue"
  invoiceNumber: string
  issuedDate: string
  plan: string
}

export default function Billing() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null
  })
  const [dateFilter, setDateFilter] = useState("all")
  const { toast } = useToast()

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/api/super-admin/invoices`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      // Check if response is JSON
      const contentType = res.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('Backend API not available, using empty state')
        setInvoices([])
        setLoading(false)
        return
      }

      const data = await res.json()
      if (data.success) {
        setInvoices(data.data)
      } else {
        setInvoices([])
      }
    } catch (error) {
      console.error('Failed to fetch invoices:', error)
      // Don't show error toast if backend isn't ready, just use empty state
      setInvoices([])
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (data: any) => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/api/super-admin/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      })
      const result = await res.json()
      if (result.success) {
        toast({
          title: "Success",
          description: "Invoice created successfully"
        })
        fetchInvoices()
        setIsModalOpen(false)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create invoice",
        variant: "destructive"
      })
    }
  }

  const handleEdit = async (id: string, data: any) => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/api/super-admin/invoices/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      })
      const result = await res.json()
      if (result.success) {
        toast({
          title: "Success",
          description: "Invoice updated successfully"
        })
        fetchInvoices()
        setIsModalOpen(false)
        setEditingId(null)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update invoice",
        variant: "destructive"
      })
    }
  }

  const handleDelete = (item: any) => {
    setDeleteConfirm({ open: true, id: item.id })
  }

  const confirmDelete = async () => {
    if (deleteConfirm.id) {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`${API_URL}/api/super-admin/invoices/${deleteConfirm.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const result = await res.json()
        if (result.success) {
          toast({
            title: "Success",
            description: "Invoice deleted successfully"
          })
          fetchInvoices()
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete invoice",
          variant: "destructive"
        })
      }
    }
    setDeleteConfirm({ open: false, id: null })
  }

  const handleBulkAction = (action: string, selectedIds: string[]) => {
    if (action === "delete") {
      setInvoices(invoices.filter((i) => !selectedIds.includes(i.id)))
    }
  }

  if (loading) {
    return (
      <DashboardLayout title="Billing & Invoicing">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    )
  }

  const columns = [
    {
      key: "invoiceNumber",
      label: "Invoice #",
      render: (value: string, row: Invoice) => (
        <div>
          <p className="font-medium">{value}</p>
          <p className="text-xs text-muted-foreground">{row.institute}</p>
        </div>
      )
    },
    {
      key: "plan",
      label: "Plan"
    },
    {
      key: "amount",
      label: "Amount",
      render: (value: number) => (
        <span className="font-semibold">₹{value.toLocaleString()}</span>
      )
    },
    {
      key: "issuedDate",
      label: "Issued Date",
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      key: "dueDate",
      label: "Due Date",
      render: (value: string, row: Invoice) => {
        const daysUntilDue = Math.ceil((new Date(value).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        return (
          <div>
            <p>{new Date(value).toLocaleDateString()}</p>
            {row.status === "Pending" && daysUntilDue > 0 && (
              <p className="text-xs text-muted-foreground">{daysUntilDue} days left</p>
            )}
          </div>
        )
      }
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => <StatusBadge status={value} />
    },
  ]

  const formFields = [
    { name: "institute", label: "Institute", type: "text" as const, required: true },
    { name: "amount", label: "Amount", type: "number" as const, required: true },
    {
      name: "status", label: "Status", type: "select" as const, options: [
        { value: "Paid", label: "Paid" },
        { value: "Pending", label: "Pending" },
        { value: "Overdue", label: "Overdue" }
      ], required: true
    },
    { name: "dueDate", label: "Due Date", type: "date" as const, required: true },
    { name: "plan", label: "Plan", type: "text" as const, required: true },
  ]

  // Calculate stats
  const stats = {
    totalRevenue: invoices.filter(i => i.status === "Paid").reduce((sum, i) => sum + i.amount, 0),
    pendingPayments: invoices.filter(i => i.status === "Pending").reduce((sum, i) => sum + i.amount, 0),
    overduePayments: invoices.filter(i => i.status === "Overdue").reduce((sum, i) => sum + i.amount, 0),
    thisMonth: invoices.filter(i => {
      const invoiceDate = new Date(i.issuedDate)
      const now = new Date()
      return invoiceDate.getMonth() === now.getMonth() && invoiceDate.getFullYear() === now.getFullYear()
    }).reduce((sum, i) => sum + i.amount, 0)
  }

  // Revenue chart data
  const revenueData = [
    { month: "Jul", revenue: 45000 },
    { month: "Aug", revenue: 52000 },
    { month: "Sep", revenue: 48000 },
    { month: "Oct", revenue: 61000 },
    { month: "Nov", revenue: 55000 },
    { month: "Dec", revenue: 68000 },
  ]

  // Payment status distribution
  const statusData = [
    { name: "Paid", value: invoices.filter(i => i.status === "Paid").length },
    { name: "Pending", value: invoices.filter(i => i.status === "Pending").length },
    { name: "Overdue", value: invoices.filter(i => i.status === "Overdue").length },
  ]

  return (
    <DashboardLayout title="Billing & Invoicing">
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold mt-1">₹{stats.totalRevenue.toLocaleString()}</p>
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
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold mt-1">₹{stats.pendingPayments.toLocaleString()}</p>
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
                  <p className="text-sm text-muted-foreground">Overdue</p>
                  <p className="text-2xl font-bold mt-1">₹{stats.overduePayments.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">This Month</p>
                  <p className="text-2xl font-bold mt-1">₹{stats.thisMonth.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <IndianRupee className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>Last 6 months revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Status</CardTitle>
              <CardDescription>Invoice distribution by status</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-semibold">All Invoices</h2>
            <p className="text-sm text-muted-foreground">Manage billing and payment tracking</p>
          </div>
          <div className="flex gap-2">
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[180px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => {
                setEditingId(null)
                setIsModalOpen(true)
              }}
            >
              <Send className="h-4 w-4 mr-2" />
              Generate Invoice
            </Button>
          </div>
        </div>

        {/* Advanced Table */}
        <AdvancedTable
          columns={columns}
          data={invoices}
          searchable={true}
          searchPlaceholder="Search by invoice number or institute..."
          filterable={true}
          filterOptions={[
            { key: "status", label: "Status", options: ["Paid", "Pending", "Overdue"] },
            { key: "plan", label: "Plan", options: ["Basic", "Premium", "Enterprise"] }
          ]}
          selectable={true}
          onEdit={(item) => {
            setEditingId(item.id)
            setIsModalOpen(true)
          }}
          onDelete={handleDelete}
          onBulkAction={handleBulkAction}
          actions={[
            {
              label: "Download",
              onClick: (item) => console.log("Download", item),
              icon: <Download className="h-4 w-4 mr-2" />
            },
            {
              label: "Send Reminder",
              onClick: (item) => console.log("Send reminder", item),
              icon: <Send className="h-4 w-4 mr-2" />
            }
          ]}
          pageSize={10}
          emptyMessage="No invoices found."
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
          title={editingId ? "Edit Invoice" : "Generate Invoice"}
          initialData={editingId ? invoices.find((i) => i.id === editingId) : {}}
        />

        {/* Delete Confirmation */}
        <ConfirmationDialog
          open={deleteConfirm.open}
          onOpenChange={(open) => setDeleteConfirm({ open, id: null })}
          title="Delete Invoice"
          description="Are you sure you want to delete this invoice? This action cannot be undone."
          onConfirm={confirmDelete}
          confirmText="Delete"
          variant="destructive"
        />
      </div>
    </DashboardLayout>
  )
}
