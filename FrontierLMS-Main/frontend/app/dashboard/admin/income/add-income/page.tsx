"use client"

import { useState, useEffect } from "react"
import { apiFetch, API_ENDPOINTS } from "@/lib/api-config"
import DashboardLayout from "@/components/dashboard-layout"
import { StatCard } from "@/components/super-admin/stat-card"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import FormModal, { FormField } from "@/components/form-modal"
import { ConfirmationDialog } from "@/components/super-admin/confirmation-dialog"
import { Button } from "@/components/ui/button"
import { ViewIncomeModal } from "@/components/income/view-income-modal"
import {
  Plus,
  DollarSign,
  TrendingUp,
  Calendar,
  Receipt,
  CheckCircle2,
  Clock,
  Eye
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface IncomeItem {
  id: string
  incomeHead: string
  invoiceNo: string
  amount: number
  date: string
  incomeFrom?: string
  other?: string
  accountType?: string
  accountName?: string
  description?: string
  createdBy?: string
  approvedBy?: string
  status?: "pending" | "approved" | "rejected"
}

export default function AddIncome() {
  const { toast } = useToast()
  const [incomes, setIncomes] = useState<IncomeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [viewingId, setViewingId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null
  })

  useEffect(() => {
    fetchIncomes()
  }, [])

  const fetchIncomes = async () => {
    setLoading(true)
    try {
      const response = await apiFetch(API_ENDPOINTS.INCOME.BASE)
      if (response.ok) {
        const data = await response.json()
        const mappedArray = Array.isArray(data) ? data : data.data || []
        setIncomes(mappedArray.map((item: any) => ({
          id: item._id,
          incomeHead: item.incomeHead,
          invoiceNo: item.invoiceNo,
          amount: item.amount,
          date: item.date ? new Date(item.date).toISOString().split('T')[0] : "",
          incomeFrom: item.incomeFrom,
          other: item.other,
          accountType: item.accountType,
          accountName: item.accountName,
          description: item.description,
          createdBy: item.createdBy?.name || "System", // Update based on actual backend response
          approvedBy: item.approvedBy?.name || "-",
          status: item.status || "pending"
        })))
      } else {
        toast({
          title: "Error",
          description: "Backend server is not running.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Fetch error", error);
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (formData: Record<string, any>) => {
    try {
      const response = await apiFetch(API_ENDPOINTS.INCOME.BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount)
        })
      })

      if (response.ok) {
        toast({ title: "Success", description: "Income record added successfully" })
        setIsModalOpen(false)
        fetchIncomes()
      } else {
        const error = await response.json()
        toast({ title: "Error", description: error.message || "Failed to add income", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to add income record", variant: "destructive" })
    }
  }

  const handleEdit = async (id: string, formData: Record<string, any>) => {
    try {
      const response = await apiFetch(`${API_ENDPOINTS.INCOME.BASE}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount)
        })
      })

      if (response.ok) {
        toast({ title: "Success", description: "Income record updated successfully" })
        setIsModalOpen(false)
        setEditingId(null)
        fetchIncomes()
      } else {
        const error = await response.json()
        toast({ title: "Error", description: error.message || "Failed to update income", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update income record", variant: "destructive" })
    }
  }

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return

    try {
      const response = await apiFetch(`${API_ENDPOINTS.INCOME.BASE}/${deleteConfirm.id}`, {
        method: "DELETE"
      })

      if (response.ok) {
        toast({ title: "Success", description: "Income record deleted" })
        fetchIncomes()
      } else {
        toast({ title: "Error", description: "Failed to delete income", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete income record", variant: "destructive" })
    } finally {
      setDeleteConfirm({ open: false, id: null })
    }
  }

  const columns = [
    {
      key: "incomeHead",
      label: "Income Head",
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center">
            <Receipt className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-gray-800">{value}</span>
        </div>
      )
    },
    {
      key: "amount",
      label: "Amount",
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center gap-1.5">
          <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
          <span className="font-semibold text-emerald-700">₹{(value || 0).toLocaleString()}</span>
        </div>
      )
    },
    {
      key: "date",
      label: "Date",
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-sm text-gray-600">{value ? new Date(value).toLocaleDateString() : 'N/A'}</span>
        </div>
      )
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: string) => {
        const colors = {
          approved: "bg-green-100 text-green-700 border-green-200",
          pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
          rejected: "bg-red-100 text-red-700 border-red-200"
        }
        return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${colors[value as keyof typeof colors] || colors.pending} uppercase tracking-wide`}>
            {value || "pending"}
          </span>
        )
      }
    },
    {
      key: "createdBy",
      label: "Created By",
      sortable: true,
      render: (value: string) => (
        <span className="text-xs text-gray-600 font-medium">{value}</span>
      )
    }
  ]

  const formFields: FormField[] = [
    { name: "incomeHead", label: "Income Head", type: "text", required: true, placeholder: "Admission, Donation, etc." },
    {
      name: "accountType",
      label: "Account Type",
      type: "select",
      options: [
        { value: "cash", label: "Cash" },
        { value: "bank", label: "Bank Transfer" },
        { value: "cheque", label: "Cheque" },
        { value: "online", label: "Online Payment" }
      ],
      required: true
    },
    { name: "accountName", label: "Account Name", type: "text", required: true, placeholder: "e.g. Main Operations Account" },
    { name: "incomeFrom", label: "Income Source", type: "text", required: true, placeholder: "Student, Parent, Organization" },
    { name: "invoiceNo", label: "Invoice Number", type: "text", required: true, placeholder: "Auto-generated or manual" },
    { name: "date", label: "Transaction Date", type: "date", required: true },
    { name: "amount", label: "Amount (₹)", type: "number", required: true, placeholder: "Enter amount" },
    { name: "other", label: "Additional Info", type: "text", required: false, placeholder: "Other details" },
    { name: "description", label: "Description", type: "textarea", required: false, placeholder: "Transaction notes..." },
    {
      name: "status",
      label: "Approval Status",
      type: "select",
      options: [
        { value: "pending", label: "Pending" },
        { value: "approved", label: "Approved" },
        { value: "rejected", label: "Rejected" }
      ],
      required: false
    }
  ]

  const stats = {
    total: incomes.length,
    approved: incomes.filter(i => i.status === 'approved').length,
    pending: incomes.filter(i => i.status === 'pending').length,
    totalAmount: incomes.reduce((sum, i) => sum + (i.amount || 0), 0)
  }

  return (
    <DashboardLayout title="Income Management">
      <div className="space-y-6 max-w-[1600px] mx-auto pb-10">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <div className="h-10 w-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="text-white" size={20} />
              </div>
              Revenue Management
            </h1>
            <p className="text-sm text-gray-500 mt-1">Track all institutional income streams and financial inflows</p>
          </div>
          <Button
            onClick={() => {
              setEditingId(null);
              setIsModalOpen(true);
            }}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-200 gap-2 h-11 px-6 rounded-xl font-semibold transition-all hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4" /> Record Income
          </Button>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Total Transactions"
            value={stats.total.toString()}
            icon={Receipt}
            iconColor="text-emerald-600"
            iconBgColor="bg-emerald-50"
            description="All records"
          />
          <StatCard
            title="Approved Revenue"
            value={stats.approved.toString()}
            icon={CheckCircle2}
            iconColor="text-teal-600"
            iconBgColor="bg-teal-50"
            description="Verified income"
          />
          <StatCard
            title="Pending Review"
            value={stats.pending.toString()}
            icon={Clock}
            iconColor="text-yellow-600"
            iconBgColor="bg-yellow-50"
            description="Awaiting approval"
          />
          <StatCard
            title="Total Revenue"
            value={`₹${stats.totalAmount.toLocaleString()}`}
            icon={DollarSign}
            iconColor="text-emerald-600"
            iconBgColor="bg-emerald-50"
            description="Cumulative income"
          />
        </div>

        <AdvancedTable
          title="Income Registry"
          columns={columns}
          data={incomes}
          loading={loading}
          searchable
          searchPlaceholder="Search by income head, invoice, or source..."
          pagination
          onEdit={(row) => {
            setEditingId(row.id)
            setIsModalOpen(true)
          }}
          onView={(row) => setViewingId(row.id)}
          onDelete={(row) => setDeleteConfirm({ open: true, id: row.id })}
        />

        <FormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingId(null)
          }}
          title={editingId ? "Update Income Record" : "Record New Revenue"}
          fields={formFields}
          initialData={editingId ? incomes.find(i => i.id === editingId) : undefined}
          onSubmit={(data: any) => editingId ? handleEdit(editingId, data) : handleAdd(data)}
        />

        <ViewIncomeModal
          isOpen={!!viewingId}
          onClose={() => setViewingId(null)}
          income={incomes.find(i => i.id === viewingId)}
        />

        <ConfirmationDialog
          open={deleteConfirm.open}
          onOpenChange={(open) => setDeleteConfirm({ open, id: null })}
          onConfirm={confirmDelete}
          title="Delete Income Record?"
          description="This will permanently remove this income entry from the financial records. This action cannot be undone."
          variant="destructive"
        />
      </div>
    </DashboardLayout>
  )
}

import { useState, useEffect } from "react"
import { apiFetch, API_ENDPOINTS } from "@/lib/api-config"
import DashboardLayout from "@/components/dashboard-layout"
import { StatCard } from "@/components/super-admin/stat-card"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import FormModal, { FormField } from "@/components/form-modal"
import { ConfirmationDialog } from "@/components/super-admin/confirmation-dialog"
import { Button } from "@/components/ui/button"
import {
  Plus,
  DollarSign,
  TrendingUp,
  Calendar,
  Receipt,
  CheckCircle2,
  Clock,
  Edit
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface IncomeItem {
  id: string
  incomeHead: string
  invoiceNo: string
  amount: number
  date: string
  incomeFrom?: string
  other?: string
  accountType?: string
  accountName?: string
  description?: string
  createdBy?: string
  approvedBy?: string
  status?: "pending" | "approved" | "rejected"
}

export default function AddIncome() {
  const { toast } = useToast()
  const [heads, setHeads] = useState<any[]>([])
  const [incomes, setIncomes] = useState<IncomeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null
  })
  const [formData, setFormData] = useState({
    incomeHead: "", accountType: "", accountName: "", incomeFrom: "",
    other: "", invoiceNo: "", date: "", amount: "", description: ""
  });

  useEffect(() => {
    fetchHeads()
    fetchIncomes()
  }, [])

  const fetchHeads = async () => {
    try {
      const res = await apiFetch(API_ENDPOINTS.INCOME.HEADS)
      if (res.ok) {
        const data = await res.json()
        setHeads(data.data || [])
      }
    } catch (e) { }
  }

  const fetchIncomes = async () => {
    setLoading(true)
    try {
      const response = await apiFetch(API_ENDPOINTS.INCOME.BASE)
      if (response.ok) {
        const data = await response.json()
        const mappedArray = Array.isArray(data) ? data : data.data || []
        setIncomes(mappedArray.map((item: any) => ({
          id: item._id,
          incomeHead: item.incomeHead,
          invoiceNo: item.invoiceNo,
          amount: item.amount,
          date: new Date(item.date).toLocaleDateString(),
          incomeFrom: item.incomeFrom,
          other: item.other,
          accountType: item.accountType,
          accountName: item.accountName,
          description: item.description,
          createdBy: item.createdBy?.name || "N/A",
          approvedBy: item.approvedBy?.name || "-",
          status: item.status || "pending"
        })))
      } else {
        toast({
          title: "Error",
          description: "Backend server is not running. Start it with: cd backend && npm start",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Backend server is not running. Start it with: cd backend && npm start",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (formData: Record<string, any>) => {
    try {
      const response = await apiFetch(API_ENDPOINTS.INCOME.BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount)
        })
      })

      if (response.ok) {
        toast({ title: "Success", description: "Income record added successfully" })
        setIsModalOpen(false)
        fetchIncomes()
      } else {
        const error = await response.json()
        toast({ title: "Error", description: error.message || "Failed to add income", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to add income record", variant: "destructive" })
    }
  }

  const handleEdit = async (id: string, formData: Record<string, any>) => {
    try {
      const response = await apiFetch(`${API_ENDPOINTS.INCOME.BASE}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount)
        })
      })

      if (response.ok) {
        toast({ title: "Success", description: "Income record updated successfully" })
        setIsModalOpen(false)
        setEditingId(null)
        fetchIncomes()
      } else {
        const error = await response.json()
        toast({ title: "Error", description: error.message || "Failed to update income", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update income record", variant: "destructive" })
    }
  }

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return

    try {
      const response = await apiFetch(`${API_ENDPOINTS.INCOME.BASE}/${deleteConfirm.id}`, {
        method: "DELETE"
      })

      if (response.ok) {
        toast({ title: "Success", description: "Income record deleted" })
        fetchIncomes()
      } else {
        toast({ title: "Error", description: "Failed to delete income", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete income record", variant: "destructive" })
    } finally {
      setDeleteConfirm({ open: false, id: null })
    }
  }

  const columns = [
    {
      key: "incomeHead",
      label: "Income Head",
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center">
            <Receipt className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-gray-800">{value}</span>
        </div>
      )
    },
    {
      key: "amount",
      label: "Amount",
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center gap-1.5">
          <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
          <span className="font-semibold text-emerald-700">₹{value.toLocaleString()}</span>
        </div>
      )
    },
    {
      key: "date",
      label: "Date",
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-sm text-gray-600">{value}</span>
        </div>
      )
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: string) => {
        const colors = {
          approved: "bg-green-100 text-green-700 border-green-200",
          pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
          rejected: "bg-red-100 text-red-700 border-red-200"
        }
        return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${colors[value as keyof typeof colors] || colors.pending}`}>
            {value || "pending"}
          </span>
        )
      }
    },
    {
      key: "createdBy",
      label: "Created By",
      sortable: true,
      render: (value: string) => (
        <span className="text-xs text-gray-600 font-medium">{value}</span>
      )
    }
  ]

  const formFields: FormField[] = [
    { name: "incomeHead", label: "Income Head", type: "text", required: true, placeholder: "Admission, Donation, etc." },
    {
      name: "accountType",
      label: "Account Type",
      type: "select",
      options: [
        { value: "cash", label: "Cash" },
        { value: "bank", label: "Bank Transfer" },
        { value: "cheque", label: "Cheque" },
        { value: "online", label: "Online Payment" }
      ],
      required: false
    },
    { name: "accountName", label: "Account Name", type: "text", required: false, placeholder: "Account holder name" },
    { name: "incomeFrom", label: "Income Source", type: "text", required: true, placeholder: "Student, Parent, Organization" },
    { name: "other", label: "Additional Info", type: "text", required: false, placeholder: "Other details" },
    { name: "invoiceNo", label: "Invoice Number", type: "text", required: true, placeholder: "Auto-generated or manual" },
    { name: "date", label: "Transaction Date", type: "date", required: true },
    { name: "amount", label: "Amount (₹)", type: "number", required: true, placeholder: "Enter amount" },
    { name: "description", label: "Description", type: "textarea", required: false, placeholder: "Transaction notes..." }
  ]

  const stats = {
    total: incomes.length,
    approved: incomes.filter(i => i.status === 'approved').length,
    pending: incomes.filter(i => i.status === 'pending').length,
    totalAmount: incomes.reduce((sum, i) => sum + (i.amount || 0), 0)
  }

  return (
    <DashboardLayout title="Income Management">
      <div className="space-y-6 max-w-[1600px] mx-auto pb-10">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <div className="h-10 w-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="text-white" size={20} />
              </div>
              Revenue Management
            </h1>
            <p className="text-sm text-gray-500 mt-1">Track all institutional income streams and financial inflows</p>
          </div>
          <Button
            onClick={() => {
              setEditingId(null);
              setFormData({
                incomeHead: "", accountType: "", accountName: "", incomeFrom: "",
                other: "", invoiceNo: "", date: "", amount: "", description: ""
              });
              setIsModalOpen(true);
            }}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-200 gap-2 h-11 px-6 rounded-xl font-semibold transition-all hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4" /> Record Income
          </Button>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Total Transactions"
            value={stats.total.toString()}
            icon={Receipt}
            iconColor="text-emerald-600"
            iconBgColor="bg-emerald-50"
            description="All records"
          />
          <StatCard
            title="Approved Revenue"
            value={stats.approved.toString()}
            icon={CheckCircle2}
            iconColor="text-teal-600"
            iconBgColor="bg-teal-50"
            description="Verified income"
          />
          <StatCard
            title="Pending Review"
            value={stats.pending.toString()}
            icon={Clock}
            iconColor="text-yellow-600"
            iconBgColor="bg-yellow-50"
            description="Awaiting approval"
          />
          <StatCard
            title="Total Revenue"
            value={`₹${stats.totalAmount.toLocaleString()}`}
            icon={DollarSign}
            iconColor="text-emerald-600"
            iconBgColor="bg-emerald-50"
            description="Cumulative income"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Form */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="bg-pink-50 border-b border-pink-100">
                <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                  <Edit className="h-5 w-5" />
                  Quick Add Income
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleAdd({ ...formData, amount: Number(formData.amount) });
                  setFormData({
                    incomeHead: "", accountType: "", accountName: "", incomeFrom: "",
                    other: "", invoiceNo: "", date: "", amount: "", description: ""
                  });
                }} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="incomeHead">Income Head *</Label>
                    <Select value={formData.incomeHead} onValueChange={(val) => setFormData({ ...formData, incomeHead: val })}>
                      <SelectTrigger className="bg-white border-gray-200">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {heads.length > 0 ? heads.map(h => (
                          <SelectItem key={h._id} value={h.name}>{h.name}</SelectItem>
                        )) : (
                          <>
                            <SelectItem value="admission">Admission Form</SelectItem>
                            <SelectItem value="donation">Donation</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accountType">Account Type</Label>
                    <Select value={formData.accountType} onValueChange={(val) => setFormData({ ...formData, accountType: val })}>
                      <SelectTrigger className="bg-white border-gray-200">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="bank">Bank</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accountName">Account Name</Label>
                    <Select value={formData.accountName} onValueChange={(val) => setFormData({ ...formData, accountName: val })}>
                      <SelectTrigger className="bg-white border-gray-200">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="acc1">Account 1</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="incomeFrom">Income From *</Label>
                    <Select value={formData.incomeFrom} onValueChange={(val) => setFormData({ ...formData, incomeFrom: val })}>
                      <SelectTrigger className="bg-white border-gray-200">
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="parent">Parent</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="other">Other Info</Label>
                    <Input
                      id="other"
                      placeholder="Details"
                      value={formData.other}
                      onChange={(e) => setFormData({ ...formData, other: e.target.value })}
                      className="bg-white border-gray-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="invoiceNo">Invoice No. *</Label>
                    <Input
                      id="invoiceNo"
                      value={formData.invoiceNo}
                      onChange={(e) => setFormData({ ...formData, invoiceNo: e.target.value })}
                      className="bg-white border-gray-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="bg-white border-gray-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount *</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter Amount"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="bg-white border-gray-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="bg-white border-gray-200"
                      rows={3}
                    />
                  </div>
                  <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">Submit Income</Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* List Section */}
          <div className="lg:col-span-2">
            <AdvancedTable
              title="Income Registry"
              columns={columns}
              data={incomes}
              loading={loading}
              searchable
              searchPlaceholder="Search by income head, invoice, or source..."
              pagination
              onEdit={(row) => {
                setEditingId(row.id)
                setIsModalOpen(true)
              }}
              onDelete={(row) => setDeleteConfirm({ open: true, id: row.id })}
            />
          </div>
        </div>

        <FormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingId(null)
          }}
          title={editingId ? "Update Income Record" : "Record New Revenue"}
          fields={formFields}
          initialData={editingId ? incomes.find(i => i.id === editingId) : undefined}
          onSubmit={(data: any) => editingId ? handleEdit(editingId, data) : handleAdd(data)}
        />

        <ConfirmationDialog
          open={deleteConfirm.open}
          onOpenChange={(open) => setDeleteConfirm({ open, id: null })}
          onConfirm={confirmDelete}
          title="Delete Income Record?"
          description="This will permanently remove this income entry from the financial records. This action cannot be undone."
          variant="destructive"
        />
      </div>
    </DashboardLayout>
  )
}

