"use client"

import { useState, useEffect, useCallback } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Factory,
  User,
  Phone,
  Mail,
  Tag,
  Database,
  Search,
  RefreshCcw,
  MoreVertical,
  Edit,
  Trash2,
  Globe,
  ShieldCheck,
  Plus,
  Loader2
} from "lucide-react"
import { toast } from "sonner"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { API_URL } from "@/lib/api-config"

export default function VendorManagement() {
  const [vendors, setVendors] = useState<any[]>([])
  const [form, setForm] = useState({ vendorName: "", phone: "", email: "", notes: "", vendorCode: "" })
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  const fetchData = useCallback(async () => {
    try {
      setFetching(true)
      const token = localStorage.getItem("token")
      const headers = { "Authorization": `Bearer ${token}` }

      const res = await fetch(`${API_URL}/api/inventory/vendors`, { headers })
      const data = await res.json()

      if (Array.isArray(data)) {
        setVendors(data)
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to sync stakeholder registry")
    } finally {
      setFetching(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.vendorName || !form.phone || !form.vendorCode) {
      toast.error("Stakeholder name, code and credentials are required")
      return
    }

    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_URL}/api/inventory/vendors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(form)
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.error || "Failed to initialize induction")

      toast.success("Vendor protocol initialized")
      setForm({ vendorName: "", phone: "", email: "", notes: "", vendorCode: "" })
      fetchData()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to purge this vendor from the registry?")) return

    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_URL}/api/inventory/vendors/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      })

      if (!res.ok) throw new Error("Failed to purge")
      toast.success("Vendor purged from registry")
      fetchData()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const columns = [
    {
      key: "vendorName",
      label: "Market Stakeholder",
      render: (val: string, row: any) => (
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 shadow-sm border border-amber-100 font-black text-xs">
            {val ? val[0] : 'V'}
          </div>
          <div>
            <span className="font-black text-gray-900 tracking-tight uppercase leading-none">{val}</span>
            <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">ID: {row.vendorCode}</div>
          </div>
        </div>
      )
    },
    {
      key: "contact",
      label: "Communications",
      render: (_: any, row: any) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
            <Phone size={12} className="text-amber-500" /> {row.phone}
          </div>
          <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium">
            <Mail size={10} /> {row.email || 'No encrypted mail'}
          </div>
        </div>
      )
    },
    {
      key: "status",
      label: "Grid Status",
      render: (val: string, row: any) => {
        const isActive = row.isActive !== false
        return (
          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-[0.1em] border ${!isActive ? "bg-amber-100 text-amber-700 border-amber-200" : "bg-emerald-100 text-emerald-700 border-emerald-200"
            }`}>
            {isActive ? "Active" : "Under Review"}
          </span>
        )
      }
    },
    {
      key: "actions",
      label: "Control",
      render: (_: any, row: any) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full">
                <MoreVertical className="h-4 w-4 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-2xl border-none ring-1 ring-black/5 p-2 bg-white">
              <DropdownMenuItem className="gap-2 cursor-pointer font-bold rounded-lg py-2">
                <Edit size={14} className="text-amber-600" /> Modify Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDelete(row._id)} className="gap-2 cursor-pointer text-rose-600 font-bold rounded-lg py-2">
                <Trash2 size={14} /> Purge Vendor
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    }
  ]

  const filteredVendors = vendors.filter((v: any) =>
    v.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.vendorCode.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <DashboardLayout title="Market Oversight: Vendor Management">
      <div className="max-w-[1600px] mx-auto space-y-10 pb-20">

        {/* Header Context */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-4 uppercase">
              <div className="h-12 w-12 bg-gradient-to-br from-amber-600 to-amber-800 rounded-2xl flex items-center justify-center shadow-xl text-white">
                <Factory size={24} />
              </div>
              Institutional Supply Chain
            </h1>
            <p className="text-gray-500 mt-2 text-lg italic font-medium">Orchestrate vendor relations and optimize market stakeholder procurement networks</p>
          </div>

          <Button variant="outline" onClick={fetchData} className="h-12 border-gray-200 shadow-sm gap-2 rounded-2xl bg-white px-6 font-black text-xs uppercase tracking-widest text-gray-600 hover:bg-gray-50">
            <RefreshCcw size={18} className={fetching ? 'animate-spin' : ''} /> Global Source Grid
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Enrollment Panel */}
          <div className="lg:col-span-4">
            <Card className="border-none shadow-2xl ring-1 ring-black/5 overflow-hidden sticky top-8 rounded-[2rem] bg-white">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-white border-b border-gray-100/50 p-8">
                <CardTitle className="text-[10px] flex items-center gap-3 text-amber-900 uppercase tracking-[0.3em] font-black">
                  <User size={18} className="text-amber-600" /> Stakeholder Induction
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Vendor Identity <span className="text-rose-500">*</span></Label>
                    <div className="relative group">
                      <Factory className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-amber-600 transition-colors" size={16} />
                      <Input
                        value={form.vendorName}
                        onChange={(e) => setForm({ ...form, vendorName: e.target.value })}
                        placeholder="Full legal entity name"
                        className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 pl-12 rounded-2xl focus:ring-amber-500 font-bold"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Registry Code <span className="text-rose-500">*</span></Label>
                    <Input
                      value={form.vendorCode}
                      onChange={(e) => setForm({ ...form, vendorCode: e.target.value })}
                      placeholder="Unique UID (e.g. VND-505)"
                      className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 px-5 rounded-2xl focus:ring-amber-500 font-black text-amber-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Contact Reference <span className="text-rose-500">*</span></Label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-amber-600" size={16} />
                      <Input
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="+91 XXXXXXXXXX"
                        className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 pl-12 rounded-2xl focus:ring-amber-500 font-black"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Digital Correspondence</Label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-amber-600" size={16} />
                      <Input
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="enterprise@domain.com"
                        className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 pl-12 rounded-2xl focus:ring-amber-500 font-medium"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Operational Metadata</Label>
                    <Textarea
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      placeholder="Supply terms & domain details..."
                      className="bg-gray-50/50 border-none ring-1 ring-gray-100 min-h-[100px] rounded-3xl focus:ring-amber-500 font-medium p-5"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-amber-600 hover:bg-black text-white h-16 rounded-[1.5rem] shadow-2xl shadow-amber-100 font-black text-xs uppercase tracking-[0.3em] gap-3 transition-all hover:scale-[1.02] active:scale-95"
                  >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Database size={20} />}
                    Initialize Induction
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Matrix Panel */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
              <div className="relative flex-1 max-w-md group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-amber-600 transition-colors" />
                <Input
                  className="pl-16 h-16 bg-white border-none ring-1 ring-black/5 shadow-2xl rounded-[1.5rem] focus:ring-2 focus:ring-amber-500/20 text-lg font-medium"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Query stakeholder registry..."
                />
              </div>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
              <AdvancedTable
                title="Validated Stakeholder Matrix"
                columns={columns}
                data={filteredVendors}
                loading={fetching}
                pagination
              />
            </div>

            <div className="p-8 bg-amber-50/50 rounded-[3rem] border border-amber-100 border-dashed flex items-center gap-6">
              <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center shadow-xl border border-amber-100">
                <ShieldCheck size={28} className="text-amber-600" />
              </div>
              <div>
                <p className="font-black text-lg uppercase tracking-tight text-amber-900 leading-tight">Vendor Compliance</p>
                <p className="text-amber-600/70 font-medium text-sm italic">All market stakeholders are vetted against institutional procurement benchmarks for session 2024-25.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
