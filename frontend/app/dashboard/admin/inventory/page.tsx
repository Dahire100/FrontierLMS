"use client"

import { useState, useEffect, useCallback } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { StatCard } from "@/components/super-admin/stat-card"
import { StatusBadge } from "@/components/super-admin/status-badge"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import { ConfirmationDialog } from "@/components/super-admin/confirmation-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Package,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Plus,
  ClipboardList,
  ArrowUpDown,
  Factory,
  BarChart2,
  Loader2,
  ArrowRight,
  Boxes,
  Truck,
  History,
  ShieldAlert,
  RefreshCcw,
  Database,
  Layers,
  ShoppingCart,
  Archive
} from "lucide-react"
import Link from "next/link"
import FormModal from "@/components/form-modal"
import { API_URL } from "@/lib/api-config"
import { toast } from "sonner"

interface InventoryItem {
  _id: string
  itemName: string
  itemCode: string
  quantity: number
  unit: string
  minimumStock: number
  category: string
  status: "available" | "in-use" | "maintenance" | "disposed"
  lastUpdated: string
}

interface InventoryStats {
  totalItems: number
  totalQuantity: number
  lowStockItems: number
  totalValue: number
}

export default function Inventory() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<InventoryStats>({ totalItems: 0, totalQuantity: 0, lowStockItems: 0, totalValue: 0 })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null
  })

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const headers = { "Authorization": `Bearer ${token}` }

      const [itemsRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/api/inventory?limit=100`, { headers }),
        fetch(`${API_URL}/api/inventory/stats/summary`, { headers })
      ])

      const itemsData = await itemsRes.json()
      const statsData = await statsRes.json()

      if (itemsData.items) {
        setItems(itemsData.items)
      } else if (Array.isArray(itemsData)) {
        setItems(itemsData)
      }

      if (statsData) {
        setStats(statsData)
      }

    } catch (error) {
      console.error(error)
      // toast.error("Institutional archive offline. Mode: Safe Persistence")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleAdd = async (data: any) => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_URL}/api/inventory`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data)
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.error || "Failed to add asset")

      toast.success("Asset initialized successfully")
      setIsModalOpen(false)
      fetchData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add asset")
    }
  }

  const handleEdit = async (id: string, data: any) => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_URL}/api/inventory/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data)
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.error || "Failed to update asset")

      toast.success("Asset profile updated")
      setIsModalOpen(false)
      setEditingId(null)
      fetchData()
    } catch (error) {
      toast.error("Profile synchronization failed")
    }
  }

  const handleDelete = (item: any) => {
    setDeleteConfirm({ open: true, id: item._id })
  }

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return

    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_URL}/api/inventory/${deleteConfirm.id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.error || "Failed to purge asset")

      toast.success("Asset purged from archive")
      fetchData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Purge protocol failed")
    } finally {
      setDeleteConfirm({ open: false, id: null })
    }
  }

  const columns = [
    {
      key: "itemName",
      label: "Asset Profile",
      render: (value: string, row: InventoryItem) => (
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-gradient-to-br from-teal-500 to-teal-700 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-teal-100 ring-2 ring-white">
            <Archive size={20} />
          </div>
          <div>
            <div className="font-black text-gray-900 leading-tight uppercase tracking-tight">{value}</div>
            <div className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mt-0.5">UID: {row.itemCode}</div>
          </div>
        </div>
      )
    },
    {
      key: "category",
      label: "Classification",
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.6)]" />
          <span className="text-xs font-black text-gray-700 uppercase tracking-widest">{value}</span>
        </div>
      )
    },
    {
      key: "quantity",
      label: "Operational Stock",
      render: (value: number, row: InventoryItem) => {
        const isLow = value <= row.minimumStock;
        return (
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <span className={`text-xl font-black ${isLow ? 'text-rose-600' : 'text-gray-900'} tracking-tighter`}>
                {value}
              </span>
              <span className="text-[10px] font-black text-gray-400 uppercase">{row.unit}</span>
            </div>
            <div className={`h-1.5 w-24 bg-gray-100 rounded-full overflow-hidden`}>
              <div
                className={`h-full ${isLow ? 'bg-rose-500' : 'bg-teal-500'} transition-all`}
                style={{ width: `${Math.min((value / (row.minimumStock * 3)) * 100, 100)}%` }}
              />
            </div>
          </div>
        )
      }
    },
    {
      key: "status",
      label: "Grid Status",
      render: (value: string) => {
        const statusColors: Record<string, string> = {
          available: "bg-emerald-50 text-emerald-700 border-emerald-100",
          "in-use": "bg-blue-50 text-blue-700 border-blue-100",
          maintenance: "bg-amber-50 text-amber-700 border-amber-100",
          disposed: "bg-rose-50 text-rose-700 border-rose-100"
        }
        return (
          <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border ${statusColors[value] || "bg-gray-50 text-gray-600"}`}>
            {value}
          </span>
        )
      }
    },
  ]

  const modules = [
    { title: "Item Inventory", description: "Universal Catalog Master", icon: Boxes, href: "/dashboard/admin/inventory/item-master", gradient: "from-indigo-600 to-indigo-800", light: "bg-indigo-50", iconColor: "text-indigo-600" },
    { title: "Stock Logistics", description: "Movement & Flow Control", icon: Truck, href: "/dashboard/admin/inventory/stock-in-out", gradient: "from-teal-500 to-teal-700", light: "bg-teal-50", iconColor: "text-teal-600" },
    { title: "Vendor Grid", description: "Institutional Suppliers", icon: Factory, href: "/dashboard/admin/inventory/vendor-management", gradient: "from-amber-500 to-amber-700", light: "bg-amber-50", iconColor: "text-amber-600" },
    { title: "Analytical Hub", description: "Consumption Intelligence", icon: BarChart2, href: "/dashboard/admin/inventory/stock-reports", gradient: "from-purple-600 to-purple-800", light: "bg-purple-50", iconColor: "text-purple-600" },
  ]

  const formFields = [
    { name: "itemName", label: "Item Nomenclature", type: "text" as const, required: true },
    { name: "itemCode", label: "Registry Code", type: "text" as const, required: true },
    {
      name: "category", label: "Classification", type: "select" as const, options: [
        { value: "Stationery", label: "Stationery" },
        { value: "Classroom", label: "Classroom" },
        { value: "Electronics", label: "Electronics" },
        { value: "Maintenance", label: "Maintenance" },
        { value: "Sports", label: "Sports" },
        { value: "Furniture", label: "Furniture" },
        { value: "Lab Equipment", label: "Lab Equipment" }
      ], required: true
    },
    { name: "quantity", label: "Initial Inventory", type: "number" as const, required: true },
    {
      name: "unit", label: "Unit Type", type: "select" as const, options: [
        { value: "Pieces", label: "Pieces" },
        { value: "Boxes", label: "Boxes" },
        { value: "Kg", label: "Kg" },
        { value: "Liters", label: "Liters" },
        { value: "Sets", label: "Sets" }
      ], required: true
    },
    { name: "minimumStock", label: "Threshold Alert", type: "number" as const, required: true },
  ]

  return (
    <DashboardLayout title="Universal Asset Strategy">
      <div className="max-w-[1700px] mx-auto space-y-12 pb-20">

        {/* Master Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-4 uppercase">
              <div className="h-14 w-14 bg-gradient-to-br from-teal-600 via-teal-700 to-teal-900 rounded-[1.5rem] flex items-center justify-center shadow-2xl text-white transform hover:rotate-6 transition-transform">
                <Package size={32} />
              </div>
              Global Inventory Hub
            </h1>
            <p className="text-gray-500 mt-2 text-xl italic font-medium">Coordinate institutional assets and resource lifecycle management</p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={fetchData} className="h-14 border-gray-200 shadow-xl gap-3 rounded-2xl bg-white px-8 font-black text-xs uppercase tracking-widest text-gray-600 transition-all hover:bg-gray-50 active:scale-95">
              <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} /> Sync Architecture
            </Button>
            <Button onClick={() => { setEditingId(null); setIsModalOpen(true) }} className="h-14 bg-gradient-to-r from-teal-600 to-teal-800 hover:from-teal-700 hover:to-black text-white px-10 rounded-2xl shadow-2xl shadow-teal-100 font-black text-xs uppercase tracking-widest gap-3 transition-all hover:scale-105 active:scale-95">
              <Plus size={20} /> Initialize New Asset
            </Button>
          </div>
        </div>

        {/* Tactical Modules */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {modules.map((module, idx) => (
            <Link key={idx} href={module.href} className="group">
              <Card className="h-full border-none shadow-xl hover:shadow-[0_25px_60px_rgba(20,184,166,0.15)] transition-all duration-500 hover:-translate-y-3 overflow-hidden bg-white ring-1 ring-black/5 rounded-[2.5rem]">
                <div className={`h-2 w-full bg-gradient-to-r ${module.gradient}`} />
                <CardHeader className="pb-4 pt-10 px-10">
                  <div className="flex justify-between items-start">
                    <div className={`p-4 ${module.light} rounded-2xl shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                      <module.icon className={`h-8 w-8 ${module.iconColor}`} />
                    </div>
                    <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-teal-600 transition-all duration-300">
                      <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-12 px-10">
                  <h3 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tight">{module.title}</h3>
                  <p className="text-sm text-gray-400 font-medium italic leading-relaxed">{module.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Intelligence Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <StatCard
            title="Registry Size"
            value={stats.totalItems.toString()}
            description="Active Asset Profiles"
            icon={Archive}
            iconColor="text-teal-600"
            iconBgColor="bg-teal-50"
            trend={{ value: 4, isPositive: true }}
          />
          <StatCard
            title="Total Inventory"
            value={stats.totalQuantity.toLocaleString()}
            description="Operational Units"
            icon={Layers}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-50"
          />
          <StatCard
            title="Exposure Risk"
            value={stats.lowStockItems.toString()}
            description="Low Threshold Alerts"
            icon={ShieldAlert}
            iconColor="text-rose-600"
            iconBgColor="bg-rose-50"
          />
          <StatCard
            title="Asset Valuation"
            value={`₹${stats.totalValue.toLocaleString()}`}
            description="Capital Expenditure"
            icon={Database}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-50"
          />
        </div>

        {/* Main Resource Matrix */}
        <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <AdvancedTable
            title="Consolidated Resource Matrix"
            columns={columns}
            data={items}
            loading={loading}
            searchable={true}
            searchPlaceholder="Extract asset by nomenclature or UID..."
            filterable={true}
            filterOptions={[
              { key: "category", label: "Dimension", options: [...new Set(items.map(i => i.category))] }
            ]}
            selectable={true}
            onEdit={(item) => {
              setEditingId(item._id)
              setIsModalOpen(true)
            }}
            onDelete={handleDelete}
            pageSize={10}
            emptyMessage="No asset records identified in the institutional archive."
          />
        </div>

        <FormModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setEditingId(null) }}
          onSubmit={(data) => (editingId ? handleEdit(editingId, data) : handleAdd(data))}
          fields={formFields}
          title={editingId ? "Modify Asset Identity" : "Initialize New Asset Profile"}
          initialData={editingId ? items.find((i) => i._id === editingId) : {}}
        />

        <ConfirmationDialog
          open={deleteConfirm.open}
          onOpenChange={(open) => setDeleteConfirm({ open, id: null })}
          title="Security: Purge Asset Record"
          description="Are you sure you want to proceed with permanent archival deletion? This structural change cannot be rolled back."
          onConfirm={confirmDelete}
          confirmText="Execute Purge"
          variant="destructive"
        />
      </div>
    </DashboardLayout>
  )
}
