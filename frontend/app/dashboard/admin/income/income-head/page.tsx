"use client"

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
  FolderOpen,
  Calendar,
  TrendingUp,
  ListTree
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface IncomeHeadItem {
  id: string
  name: string
  amount: number
  description?: string
  isActive?: boolean
}

export default function IncomeHead() {
  const { toast } = useToast()
  const [heads, setHeads] = useState<IncomeHeadItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null
  })

  useEffect(() => {
    fetchHeads()
  }, [])

  const fetchHeads = async () => {
    setLoading(true)
    try {
      const response = await apiFetch(API_ENDPOINTS.INCOME.HEADS)
      if (response.ok) {
        const data = await response.json()
        const mappedArray = Array.isArray(data) ? data : data.data || []
        setHeads(mappedArray.map((item: any) => ({
          id: item._id,
          name: item.name,
          amount: item.amount,
          description: item.description,
          isActive: item.isActive !== false
        })))
      } else {
        toast({ title: "Error", description: "Backend server is not running. Start it: cd backend && npm start", variant: "destructive" })
      }
    } catch (error) {
      console.error('Error fetching heads:', error)
      toast({ title: "Error", description: "Backend server is not running. Start it: cd backend && npm start", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (data: any) => {
    try {
      const response = await apiFetch(API_ENDPOINTS.INCOME.HEADS, {
        method: 'POST',
        body: JSON.stringify(data)
      })
      if (response.ok) {
        toast({ title: "Success", description: "Income head created successfully." })
        fetchHeads()
        setIsModalOpen(false)
      } else {
        toast({ title: "Error", description: "Backend server is not running. Start it: cd backend && npm start", variant: "destructive" })
      }
    } catch (error) {
      console.error('Error adding head:', error)
      toast({ title: "Error", description: "Backend server is not running. Start it: cd backend && npm start", variant: "destructive" })
    }
  }

  const handleEdit = async (id: string, data: any) => {
    try {
      const response = await apiFetch(`${API_ENDPOINTS.INCOME.HEADS}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      })
      if (response.ok) {
        toast({ title: "Updated", description: "Income head updated." })
        fetchHeads()
        setIsModalOpen(false)
        setEditingId(null)
      } else {
        toast({ title: "Error", description: "Backend server is not running. Start it: cd backend && npm start", variant: "destructive" })
      }
    } catch (error) {
      console.error('Error updating head:', error)
      toast({ title: "Error", description: "Backend server is not running. Start it: cd backend && npm start", variant: "destructive" })
    }
  }

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return
    try {
      const response = await apiFetch(`${API_ENDPOINTS.INCOME.HEADS}/${deleteConfirm.id}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        toast({ title: "Deleted", description: "Income head removed." })
        fetchHeads()
      } else {
        toast({ title: "Error", description: "Backend server is not running. Start it: cd backend && npm start", variant: "destructive" })
      }
    } catch (error) {
      console.error('Error deleting head:', error)
      toast({ title: "Error", description: "Backend server is not running. Start it: cd backend && npm start", variant: "destructive" })
    } finally {
      setDeleteConfirm({ open: false, id: null })
    }
  }

  const columns = [
    {
      key: "name",
      label: "Category Name",
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-gradient-to-br from-violet-400 to-purple-500 rounded-lg flex items-center justify-center border border-violet-200 shadow-sm">
            <FolderOpen className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-gray-900">{value}</span>
        </div>
      )
    },
    {
      key: "amount",
      label: "Default Amount",
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-violet-600" />
          <span className="font-bold text-violet-700 text-base">₹{(value || 0).toLocaleString()}</span>
        </div>
      )
    },
    {
      key: "description",
      label: "Description",
      sortable: false,
      render: (value: string) => (
        <span className="text-xs text-gray-600 line-clamp-2">{value || "N/A"}</span>
      )
    },
    {
      key: "isActive",
      label: "Status",
      sortable: true,
      render: (value: boolean) => (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${value ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-700"}`}>
          {value ? "Active" : "Inactive"}
        </span>
      )
    }
  ]

  const formFields: FormField[] = [
    { name: "name", label: "Income Head Name", type: "text", required: true, placeholder: "e.g., Admission Fee, Tuition Fee" },
    { name: "amount", label: "Default Amount (₹)", type: "number", required: true, placeholder: "Enter standard amount" },
    { name: "description", label: "Description", type: "textarea", required: false, placeholder: "Optional details about this income category..." },
    {
      name: "isActive",
      label: "Status",
      type: "select",
      options: [
        { value: "true", label: "Active" },
        { value: "false", label: "Inactive" }
      ],
      required: false
    }
  ]

  const stats = {
    total: heads.length,
    active: heads.filter(h => h.isActive).length,
    totalAmount: heads.reduce((sum, h) => sum + (h.amount || 0), 0)
  }

  return (
    <DashboardLayout title="Income Categories">
      <div className="space-y-6 max-w-[1600px] mx-auto pb-10">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <div className="h-10 w-10 bg-gradient-to-br from-violet-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <ListTree className="text-white" size={20} />
              </div>
              Income Head Configuration
            </h1>
            <p className="text-sm text-gray-500 mt-1">Define and manage income categories for revenue classification</p>
          </div>
          <Button
            onClick={() => { setEditingId(null); setIsModalOpen(true); }}
            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-200 gap-2 h-11 px-6 rounded-xl font-semibold transition-all hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4" /> Create Head
          </Button>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Categories"
            value={stats.total.toString()}
            icon={FolderOpen}
            iconColor="text-violet-600"
            iconBgColor="bg-violet-50"
            description="Income heads"
          />
          <StatCard
            title="Active Heads"
            value={stats.active.toString()}
            icon={TrendingUp}
            iconColor="text-emerald-600"
            iconBgColor="bg-emerald-50"
            description="In use"
          />
          <StatCard
            title="Combined Value"
            value={`₹${stats.totalAmount.toLocaleString()}`}
            icon={DollarSign}
            iconColor="text-violet-600"
            iconBgColor="bg-violet-50"
            description="Default amounts"
          />
        </div>

        <AdvancedTable
          title="Income Category Registry"
          columns={columns}
          data={heads}
          loading={loading}
          searchable
          searchPlaceholder="Search by category name..."
          pagination
          onEdit={(row) => {
            setEditingId(row.id)
            setIsModalOpen(true)
          }}
          onDelete={(row) => setDeleteConfirm({ open: true, id: row.id })}
        />

        <FormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingId(null)
          }}
          title={editingId ? "Update Income Head" : "Create New Income Category"}
          fields={formFields}
          initialData={editingId ? heads.find(h => h.id === editingId) : undefined}
          onSubmit={(data: any) => editingId ? handleEdit(editingId, data) : handleAdd(data)}
        />

        <ConfirmationDialog
          open={deleteConfirm.open}
          onOpenChange={(open) => setDeleteConfirm({ open, id: null })}
          onConfirm={confirmDelete}
          title="Delete Income Head?"
          description="This will permanently remove this income category. Existing transactions using this head may be affected."
          variant="destructive"
        />
      </div>
    </DashboardLayout>
  )
}
