"use client"

import { useState, useEffect, useCallback } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Pencil,
  List,
  Download,
  Search,
  FileText,
  Printer,
  Grid,
  Columns,
  Package,
  Layers,
  DollarSign,
  Tag,
  Database,
  ArrowRight,
  MoreVertical,
  Trash2,
  Edit,
  AlertCircle,
  Boxes,
  Loader2
} from "lucide-react"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { API_URL } from "@/lib/api-config"
import { toast } from "sonner"

export default function ItemMaster() {
  const [items, setItems] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [form, setForm] = useState({
    itemName: "",
    category: "",
    subCategory: "", // optional
    purchasePrice: "",
    sellingPrice: "",
    minimumStock: "",
    description: "",
    itemCode: ""
  })

  const fetchData = useCallback(async () => {
    try {
      setFetching(true)
      const token = localStorage.getItem("token")
      const headers = { "Authorization": `Bearer ${token}` }

      const [itemsRes, catRes] = await Promise.all([
        fetch(`${API_URL}/api/inventory?limit=100`, { headers }),
        fetch(`${API_URL}/api/inventory/categories`, { headers })
      ])

      const itemsData = await itemsRes.json()
      const catData = await catRes.json()

      if (itemsData.items) setItems(itemsData.items)
      if (Array.isArray(catData)) setCategories(catData)

    } catch (error) {
      console.error(error)
      toast.error("Failed to sync matrix")
    } finally {
      setFetching(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSave = async () => {
    if (!form.itemName || !form.itemCode || !form.category) {
      toast.error("Required fields missing")
      return
    }

    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_URL}/api/inventory`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(form)
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.error || "Failed to commit")

      toast.success("Structural entry committed")
      setForm({ itemName: "", category: "", subCategory: "", purchasePrice: "", sellingPrice: "", minimumStock: "", description: "", itemCode: "" })
      fetchData()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      key: "itemName",
      label: "Resource Descriptor",
      render: (val: string, row: any) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
            <Boxes size={16} />
          </div>
          <div>
            <span className="font-black text-gray-900 tracking-tight uppercase leading-none">{val}</span>
            <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">{row.category} / UID: {row.itemCode}</div>
          </div>
        </div>
      )
    },
    {
      key: "purchasePrice",
      label: "Acquisition (₹)",
      render: (val: number) => (
        <div className="font-medium text-gray-400 italic">
          ₹{val?.toLocaleString() || '0'}
        </div>
      )
    },
    {
      key: "sellingPrice",
      label: "Valuation (₹)",
      render: (val: number) => (
        <div className="font-black text-indigo-700">
          ₹{val?.toLocaleString() || '0'}
        </div>
      )
    },
    {
      key: "quantity",
      label: "Current Buffer",
      render: (val: number, row: any) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-black ${val <= row.minimumStock ? 'text-rose-600' : 'text-gray-900'}`}>
              {val} Units
            </span>
          </div>
          <div className="h-1 w-16 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500" style={{ width: `${Math.min((val / (row.minimumStock || 10) * 2) * 100, 100)}%` }} />
          </div>
        </div>
      )
    },
    {
      key: "actions",
      label: "Protocol Control",
      render: () => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full">
                <MoreVertical className="h-4 w-4 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-2xl border-none ring-1 ring-black/5 p-2 bg-white">
              <DropdownMenuItem className="gap-2 cursor-pointer font-bold rounded-lg py-2 transition-colors">
                <Edit size={14} className="text-indigo-600" /> Modify Struct
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 cursor-pointer text-rose-600 font-bold rounded-lg py-2 transition-colors">
                <Trash2 size={14} /> Purge Record
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    }
  ]

  const filteredItems = items.filter((i: any) => i.itemName.toLowerCase().includes(searchTerm.toLowerCase()) || i.itemCode.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <DashboardLayout title="Operational Archive: Resource Master">
      <div className="max-w-[1700px] mx-auto space-y-10 pb-20">

        {/* Header Strategy */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-4 uppercase">
              <div className="h-12 w-12 bg-indigo-900 rounded-xl flex items-center justify-center shadow-xl text-white">
                <Database size={24} />
              </div>
              Institutional Resource Master
            </h1>
            <p className="text-gray-500 mt-2 text-lg italic font-medium">Define structural resource taxonomies and institutional valuation tokens</p>
          </div>

          <div className="flex gap-4">
            <Button variant="outline" className="h-12 border-gray-200 shadow-sm gap-2 rounded-2xl bg-white px-6 font-black text-xs uppercase tracking-widest text-gray-600 transition-all hover:bg-gray-50">
              <Download size={18} /> Bulk Import Archive
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
          {/* Definition Panel */}
          <div className="xl:col-span-4 transition-all duration-500">
            <Card className="border-none shadow-[0_25px_60px_-15px_rgba(26,35,126,0.15)] ring-1 ring-black/5 overflow-hidden sticky top-8 rounded-[2.5rem] bg-white">
              <CardHeader className="bg-gradient-to-r from-indigo-50/50 via-white to-transparent border-b border-gray-100/50 p-10">
                <CardTitle className="text-[10px] flex items-center gap-3 text-indigo-900 uppercase tracking-[0.3em] font-black">
                  <Pencil size={18} className="text-indigo-600" /> Structure Definition
                </CardTitle>
              </CardHeader>
              <CardContent className="p-10 space-y-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Asset Nomenclature <span className="text-rose-500 font-black">*</span></Label>
                  <div className="relative group">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors" size={16} />
                    <Input
                      value={form.itemName}
                      onChange={(e) => setForm({ ...form, itemName: e.target.value })}
                      placeholder="Identify structural resource"
                      className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 pl-12 rounded-2xl focus:ring-indigo-500 font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Registry Code <span className="text-rose-500 font-black">*</span></Label>
                  <Input
                    value={form.itemCode}
                    onChange={(e) => setForm({ ...form, itemCode: e.target.value })}
                    placeholder="Unique UID (e.g. LAP-001)"
                    className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 px-5 rounded-2xl focus:ring-indigo-500 font-black text-indigo-900"
                  />
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Core Category <span className="text-rose-500 font-black">*</span></Label>
                    <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                      <SelectTrigger className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 rounded-2xl focus:ring-indigo-500 font-black">
                        <SelectValue placeholder="Protocol" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                        {categories.length > 0 ? categories.map((c: any) => (
                          <SelectItem key={c._id} value={c.categoryName} className="rounded-xl font-bold py-2.5">{c.categoryName}</SelectItem>
                        )) : (
                          <SelectItem value="Stationery" className="rounded-xl font-bold py-2.5">Stationery (Auto)</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Acquisition (₹) <span className="text-rose-500 font-black">*</span></Label>
                    <div className="relative group">
                      <DollarSign size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600" />
                      <Input
                        value={form.purchasePrice}
                        onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })}
                        placeholder="0.00"
                        className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 pl-11 rounded-2xl focus:ring-indigo-500 font-black"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Valuation (₹) <span className="text-rose-500 font-black">*</span></Label>
                    <div className="relative group">
                      <DollarSign size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-900" />
                      <Input
                        value={form.sellingPrice}
                        onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })}
                        placeholder="0.00"
                        className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 pl-11 rounded-2xl focus:ring-indigo-500 font-black text-indigo-900"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Operational Threshold</Label>
                  <Input
                    value={form.minimumStock}
                    onChange={(e) => setForm({ ...form, minimumStock: e.target.value })}
                    type="number"
                    placeholder="Low stock alert trigger"
                    className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 rounded-2xl focus:ring-indigo-500 font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Audit Metadata</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="bg-gray-50/50 border-none ring-1 ring-gray-100 min-h-[120px] rounded-3xl focus:ring-indigo-500 font-medium p-6"
                    placeholder="Resource technical specifications..."
                  />
                </div>

                <Button
                  onClick={handleSave}
                  disabled={loading}
                  className="w-full bg-indigo-900 hover:bg-black text-white h-16 rounded-[1.5rem] shadow-2xl shadow-indigo-100 font-black text-xs uppercase tracking-[0.3em] gap-3 transition-all hover:scale-[1.02] active:scale-95"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <Database size={20} />}
                  Commit Structural Entry
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Database Panel */}
          <div className="xl:col-span-8 space-y-8">
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
              <div className="relative flex-1 max-w-md group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-indigo-600 transition-colors" />
                <Input
                  className="pl-16 h-16 bg-white border-none ring-1 ring-black/5 shadow-2xl rounded-[1.5rem] focus:ring-2 focus:ring-indigo-500/20 text-lg font-medium"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Query resource registry..."
                />
              </div>
              <div className="flex gap-4">
                <Button variant="outline" onClick={fetchData} className="h-16 border-gray-200 shadow-xl gap-3 rounded-2xl bg-white px-8 font-black text-xs uppercase tracking-widest text-gray-600 transition-all hover:bg-gray-50 active:scale-95">
                  <RefreshCcw size={18} className={fetching ? 'animate-spin' : ''} /> Sync
                </Button>
              </div>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
              <AdvancedTable
                title="Validated Master Matrix"
                columns={columns}
                data={filteredItems}
                loading={fetching}
                pagination
              />
            </div>

            <div className="bg-indigo-50/50 p-10 rounded-[3rem] border border-indigo-100 border-dashed flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="flex items-center gap-6 text-indigo-900">
                <div className="h-16 w-16 bg-white rounded-3xl flex items-center justify-center shadow-xl border border-indigo-100">
                  <AlertCircle size={32} className="text-indigo-600 animate-pulse" />
                </div>
                <div>
                  <p className="font-black text-xl uppercase tracking-tight">System Awareness</p>
                  <p className="text-indigo-600/70 font-medium max-w-sm">Resource valuations are synchronized with institutional fiscal protocols for session 2024-25.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

function Plus({ size, className }: { size?: number, className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14" /><path d="M12 5v14" /></svg>
}

function RefreshCcw({ size, className }: { size?: number, className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path d="M16 16h5v5" /></svg>
}
