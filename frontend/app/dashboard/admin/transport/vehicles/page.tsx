"use client"

import { useState, useEffect, useCallback } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Bus,
  Trash2,
  RefreshCcw,
  Search,
  Database,
  Users,
  Gauge,
  MoreVertical,
  Loader2
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

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<any[]>([])
  const [fetching, setFetching] = useState(true)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const [form, setForm] = useState({
    number: "",
    capacity: "",
    route: ""
  })

  const fetchData = useCallback(async () => {
    try {
      setFetching(true)
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_URL}/api/transport/vehicles`, {
        headers: { "Authorization": `Bearer ${token}` }
      })

      if (!res.ok) throw new Error("Failed to fetch vehicles")
      const data = await res.json()
      setVehicles(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error(error)
      toast.error("Failed to sync fleet registry")
    } finally {
      setFetching(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.number || !form.capacity) {
      toast.error("Fleet asset ID and capacity are required")
      return
    }

    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_URL}/api/transport/vehicles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          number: form.number,
          capacity: Number(form.capacity),
          route: form.route
        })
      })

      if (!res.ok) throw new Error("Failed to add vehicle")

      toast.success("Fleet asset synchronized")
      setForm({ number: "", capacity: "", route: "" })
      fetchData()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to purge this fleet asset?")) return

    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_URL}/api/transport/vehicles/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      })

      if (!res.ok) throw new Error("Failed to delete vehicle")
      toast.success("Asset purged from fleet registry")
      fetchData()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const columns = [
    {
      key: "vehicleNumber",
      label: "Fleet Asset ID",
      render: (val: string) => (
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-sm">
            <Bus size={18} />
          </div>
          <span className="font-black text-gray-900 tracking-tight uppercase">{val}</span>
        </div>
      )
    },
    {
      key: "capacity",
      label: "Load Capacity",
      render: (val: number) => (
        <div className="flex items-center gap-3">
          <Gauge size={14} className="text-gray-300" />
          <span className="text-xs font-black text-gray-600 uppercase">{val} Passengers</span>
        </div>
      )
    },
    {
      key: "route",
      label: "Assigned Vector",
      render: (val: string) => (
        <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${val ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-gray-50 text-gray-400 border-gray-100'
          }`}>
          {val || 'UNASSIGNED'}
        </div>
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
                <Trash2 size={14} /> Purge Asset
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    }
  ]

  return (
    <DashboardLayout title="Transit Logistics: Fleet Management">
      <div className="max-w-[1700px] mx-auto space-y-10 pb-20">

        {/* Header Context */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-4 uppercase">
              <div className="h-12 w-12 bg-emerald-900 rounded-2xl flex items-center justify-center shadow-xl text-white transform hover:rotate-12 transition-transform">
                <Bus size={24} />
              </div>
              Fleet Asset Registry
            </h1>
            <p className="text-gray-500 mt-2 text-lg italic font-medium">Monitor vehicle integrity and optimize institutional mobility capacity</p>
          </div>

          <Button variant="outline" onClick={fetchData} className="h-12 border-gray-200 shadow-sm gap-2 rounded-2xl bg-white px-6 font-black text-xs uppercase tracking-widest text-gray-600 hover:bg-gray-50">
            <RefreshCcw size={18} className={fetching ? 'animate-spin' : ''} /> Sync Fleet
          </Button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
          {/* Entry Center */}
          <div className="xl:col-span-4">
            <Card className="border-none shadow-2xl ring-1 ring-black/5 overflow-hidden sticky top-8 rounded-[2.5rem] bg-white">
              <CardHeader className="bg-gradient-to-r from-emerald-50/50 to-white border-b border-gray-100 p-8">
                <CardTitle className="text-[10px] flex items-center gap-3 text-emerald-900 uppercase tracking-[0.3em] font-black">
                  <Database size={18} className="text-emerald-600" /> Asset Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Vehicle Identifier <span className="text-rose-500">*</span></Label>
                    <Input
                      value={form.number}
                      onChange={(e) => setForm({ ...form, number: e.target.value })}
                      className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 rounded-2xl focus:ring-emerald-500 font-bold px-5"
                      placeholder="KA-01-AB-1234"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Passenger Capacity <span className="text-rose-500">*</span></Label>
                    <Input
                      type="number"
                      value={form.capacity}
                      onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                      className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 rounded-2xl focus:ring-emerald-500 font-black text-lg px-5"
                      placeholder="50"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Route Assignment</Label>
                    <Input
                      value={form.route}
                      onChange={(e) => setForm({ ...form, route: e.target.value })}
                      className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 rounded-2xl focus:ring-emerald-500 font-bold px-5"
                      placeholder="North Express Loop"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-emerald-700 hover:bg-black text-white h-16 rounded-[1.5rem] shadow-2xl shadow-emerald-100 font-black text-xs uppercase tracking-[0.3em] gap-3 transition-all hover:scale-[1.02] active:scale-95"
                  >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Database size={20} />}
                    Commit Asset
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Matrix View */}
          <div className="xl:col-span-8 space-y-8">
            <div className="relative max-w-md group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-emerald-600 transition-colors" />
              <Input
                className="pl-16 h-16 bg-white border-none ring-1 ring-black/5 shadow-2xl rounded-[1.5rem] focus:ring-2 focus:ring-emerald-500/20 text-lg font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Query fleet registry..."
              />
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
              <AdvancedTable
                title="Validated Fleet Matrix"
                columns={columns}
                data={vehicles}
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
