"use client"

import { useState, useEffect, useCallback } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  MapPin,
  Loader2,
  Trash2,
  RefreshCcw,
  Search,
  Navigation,
  Database,
  Phone,
  DollarSign,
  Bus,
  User,
  MoreVertical,
  Edit
} from "lucide-react"
import { toast } from "sonner"
import { API_URL } from "@/lib/api-config"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function RoutesPage() {
  const [routes, setRoutes] = useState<any[]>([])
  const [fetching, setFetching] = useState(true)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const [form, setForm] = useState({
    routeName: "",
    busNumber: "",
    driverName: "",
    driverPhone: "",
    fee: ""
  })

  const fetchData = useCallback(async () => {
    try {
      setFetching(true)
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_URL}/api/transport`, {
        headers: { "Authorization": `Bearer ${token}` }
      })

      if (!res.ok) throw new Error("Failed to fetch routes")
      const data = await res.json()
      setRoutes(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error(error)
      toast.error("Failed to sync navigation matrix")
    } finally {
      setFetching(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.routeName || !form.busNumber || !form.driverName || !form.driverPhone || !form.fee) {
      toast.error("All navigation parameters are required")
      return
    }

    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_URL}/api/transport`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(form)
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to commit route")

      toast.success("Navigation pathway synchronized")
      setForm({ routeName: "", busNumber: "", driverName: "", driverPhone: "", fee: "" })
      fetchData()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to purge this navigation route?")) return

    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_URL}/api/transport/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      })

      if (!res.ok) throw new Error("Failed to delete route")
      toast.success("Route purged from transit grid")
      fetchData()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const columns = [
    {
      key: "routeName",
      label: "Navigation Vector",
      render: (val: string) => (
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100 shadow-sm">
            <Navigation size={18} />
          </div>
          <span className="font-black text-gray-900 tracking-tight uppercase">{val}</span>
        </div>
      )
    },
    {
      key: "vehicleNumber",
      label: "Fleet Asset",
      render: (val: string) => (
        <div className="flex items-center gap-2">
          <Bus size={14} className="text-gray-300" />
          <span className="text-xs font-black text-gray-600 uppercase tracking-wider">{val}</span>
        </div>
      )
    },
    {
      key: "driverName",
      label: "Executive Operator",
      render: (val: string, row: any) => (
        <div>
          <div className="flex items-center gap-2">
            <User size={12} className="text-gray-300" />
            <span className="font-black text-gray-900 uppercase text-xs">{val}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Phone size={10} className="text-gray-200" />
            <span className="text-[9px] text-gray-400 font-bold">{row.driverPhone}</span>
          </div>
        </div>
      )
    },
    {
      key: "routeCharge",
      label: "Fiscal Yield",
      render: (val: number) => (
        <div className="font-black text-emerald-600 text-lg tracking-tighter">₹{val?.toLocaleString()}</div>
      )
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
            <DropdownMenuContent align="end" className="w-56 rounded-2xl shadow-2xl border-none ring-1 ring-black/5 p-2 bg-white">
              <DropdownMenuItem
                onClick={() => handleDelete(row._id)}
                className="gap-3 cursor-pointer text-rose-600 font-black text-[10px] uppercase tracking-widest rounded-xl py-3 hover:bg-rose-50"
              >
                <Trash2 size={14} /> Purge Route
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    }
  ]

  return (
    <DashboardLayout title="Transit Logistics: Navigation Routes">
      <div className="max-w-[1700px] mx-auto space-y-10 pb-20">

        {/* Header Context */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-4 uppercase">
              <div className="h-12 w-12 bg-blue-900 rounded-2xl flex items-center justify-center shadow-xl text-white transform hover:rotate-12 transition-transform">
                <MapPin size={24} />
              </div>
              Navigation Route Matrix
            </h1>
            <p className="text-gray-500 mt-2 text-lg italic font-medium">Define and optimize institutional transit pathways and mobility vectors</p>
          </div>

          <Button variant="outline" onClick={fetchData} className="h-12 border-gray-200 shadow-sm gap-2 rounded-2xl bg-white px-6 font-black text-xs uppercase tracking-widest text-gray-600 hover:bg-gray-50">
            <RefreshCcw size={18} className={fetching ? 'animate-spin' : ''} /> Sync Routes
          </Button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
          {/* Entry Center */}
          <div className="xl:col-span-4">
            <Card className="border-none shadow-2xl ring-1 ring-black/5 overflow-hidden sticky top-8 rounded-[2.5rem] bg-white">
              <CardHeader className="bg-gradient-to-r from-blue-50/50 to-white border-b border-gray-100 p-8">
                <CardTitle className="text-[10px] flex items-center gap-3 text-blue-900 uppercase tracking-[0.3em] font-black">
                  <Database size={18} className="text-blue-600" /> Route Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Route Identifier <span className="text-rose-500">*</span></Label>
                    <Input
                      value={form.routeName}
                      onChange={(e) => setForm({ ...form, routeName: e.target.value })}
                      className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 rounded-2xl focus:ring-blue-500 font-bold px-5"
                      placeholder="North Express Loop"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Fleet Asset ID <span className="text-rose-500">*</span></Label>
                    <Input
                      value={form.busNumber}
                      onChange={(e) => setForm({ ...form, busNumber: e.target.value })}
                      className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 rounded-2xl focus:ring-blue-500 font-bold px-5"
                      placeholder="KA-01-AB-1234"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Operator <span className="text-rose-500">*</span></Label>
                      <Input
                        value={form.driverName}
                        onChange={(e) => setForm({ ...form, driverName: e.target.value })}
                        className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 rounded-2xl focus:ring-blue-500 font-bold px-5"
                        placeholder="Name"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Contact <span className="text-rose-500">*</span></Label>
                      <Input
                        value={form.driverPhone}
                        onChange={(e) => setForm({ ...form, driverPhone: e.target.value })}
                        className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 rounded-2xl focus:ring-blue-500 font-bold px-5"
                        placeholder="Phone"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Monthly Yield (₹) <span className="text-rose-500">*</span></Label>
                    <Input
                      type="number"
                      value={form.fee}
                      onChange={(e) => setForm({ ...form, fee: e.target.value })}
                      className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 rounded-2xl focus:ring-blue-500 font-black text-lg px-5"
                      placeholder="1500"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-900 hover:bg-black text-white h-16 rounded-[1.5rem] shadow-2xl shadow-blue-100 font-black text-xs uppercase tracking-[0.3em] gap-3 transition-all hover:scale-[1.02] active:scale-95"
                  >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Database size={20} />}
                    Commit Route
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Matrix View */}
          <div className="xl:col-span-8 space-y-8">
            <div className="relative max-w-md group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-blue-600 transition-colors" />
              <Input
                className="pl-16 h-16 bg-white border-none ring-1 ring-black/5 shadow-2xl rounded-[1.5rem] focus:ring-2 focus:ring-blue-500/20 text-lg font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Query navigation archives..."
              />
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
              <AdvancedTable
                title="Validated Route Matrix"
                columns={columns}
                data={routes}
                loading={fetching}
                pagination
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
