"use client"

import { useState, useEffect, useCallback } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  BarChart2,
  Search,
  Filter,
  Download,
  Printer,
  Database,
  RefreshCcw,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  PieChart,
  ArrowUpRight,
  Loader2
} from "lucide-react"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import { API_URL } from "@/lib/api-config"
import { toast } from "sonner"

export default function StockReports() {
  const [items, setItems] = useState([])
  const [stats, setStats] = useState({ totalValue: 0, totalItems: 0, lowStockItems: 0, totalQuantity: 0 })
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  const fetchData = useCallback(async () => {
    try {
      setFetching(true)
      const token = localStorage.getItem("token")
      const headers = { "Authorization": `Bearer ${token}` }

      const [itemsRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/api/inventory?limit=100`, { headers }),
        fetch(`${API_URL}/api/inventory/stats/summary`, { headers })
      ])

      const itemsData = await itemsRes.json()
      const statsData = await statsRes.json()

      if (itemsData.items) setItems(itemsData.items)
      if (statsData) setStats(statsData)

    } catch (error) {
      console.error(error)
      toast.error("Failed to sync intelligence hub")
    } finally {
      setFetching(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const columns = [
    {
      key: "itemName",
      label: "Operational Asset",
      render: (val: string, row: any) => (
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 ${row.quantity <= row.minimumStock ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'} rounded-xl flex items-center justify-center shadow-sm border border-current opacity-80`}>
            <Database size={18} />
          </div>
          <div>
            <span className="font-black text-gray-900 tracking-tight uppercase leading-none">{val}</span>
            <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">{row.category}</div>
          </div>
        </div>
      )
    },
    {
      key: "quantity",
      label: "Buffer Level",
      render: (val: number, row: any) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`text-xl font-black ${val <= row.minimumStock ? 'text-rose-600 font-black' : 'text-gray-900 font-black'} tracking-tighter`}>{val}</span>
            <span className="text-[10px] text-gray-400 font-bold uppercase">Units</span>
          </div>
          <div className="h-1.5 w-24 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full ${val <= row.minimumStock ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min((val / (row.minimumStock || 10) * 2) * 100, 100)}%` }} />
          </div>
        </div>
      )
    },
    {
      key: "valuation",
      label: "Market Value",
      render: (_: any, row: any) => (
        <div className="font-black text-gray-600 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100 w-fit">
          ₹{(row.quantity * (row.sellingPrice || 0)).toLocaleString()}
        </div>
      )
    },
    {
      key: "status",
      label: "Operational State",
      render: (_: any, row: any) => {
        const isLow = row.quantity <= row.minimumStock
        return (
          <div className={`flex items-center gap-2 font-black text-[9px] uppercase tracking-widest py-1 px-3 rounded-full border ${isLow ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
            }`}>
            {isLow ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />}
            {isLow ? 'Critical Deficit' : 'Structural OK'}
          </div>
        )
      }
    }
  ]

  const filteredItems = items.filter((i: any) => i.itemName.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <DashboardLayout title="Inventory Intelligence: Stock Reports">
      <div className="max-w-[1600px] mx-auto space-y-10 pb-20">

        {/* Header Strategy */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-4 uppercase">
              <div className="h-12 w-12 bg-gradient-to-br from-purple-600 to-purple-900 rounded-2xl flex items-center justify-center shadow-xl text-white">
                <BarChart2 size={24} />
              </div>
              Stock Consumption Audit
            </h1>
            <p className="text-gray-500 mt-2 text-lg italic font-medium">Generate high-fidelity vision into institutional resource distribution and buffer health</p>
          </div>

          <div className="flex gap-4">
            <Button variant="outline" onClick={fetchData} className="h-12 border-gray-200 shadow-sm gap-2 rounded-2xl bg-white px-6 font-black text-xs uppercase tracking-widest text-gray-600 hover:bg-gray-50">
              <RefreshCcw size={18} className={fetching ? 'animate-spin' : ''} /> Execute Intelligence Sync
            </Button>
          </div>
        </div>

        {/* Tactical Scanner */}
        <Card className="border-none shadow-2xl ring-1 ring-black/5 overflow-hidden rounded-[2.5rem] bg-white">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-white border-b border-gray-100/50 p-8">
            <CardTitle className="text-[10px] flex items-center gap-3 text-purple-900 uppercase tracking-[0.3em] font-black">
              <Filter size={18} className="text-purple-600" /> Dimension Filtering
            </CardTitle>
          </CardHeader>
          <CardContent className="p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
              <div className="space-y-3">
                <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Archive Query</Label>
                <div className="relative group">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-purple-600 transition-colors" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Query nomenclature..."
                    className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 pl-12 rounded-2xl focus:ring-purple-500 font-bold"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <Card className="lg:col-span-2 border-none shadow-xl bg-white rounded-[3rem] overflow-hidden">
            <div className="p-8 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <h3 className="font-black text-gray-900 uppercase tracking-tight flex items-center gap-3">
                <Database size={20} className="text-purple-600" />
                Validated Structural Matrix
              </h3>
              <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center border border-gray-100 shadow-sm">
                <TrendingUp size={16} className="text-emerald-500" />
              </div>
            </div>
            <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
              <AdvancedTable
                columns={columns}
                data={filteredItems}
                loading={fetching}
                pagination
              />
            </div>
          </Card>

          <div className="space-y-10">
            <Card className="border-none shadow-xl bg-purple-900 text-white p-10 rounded-[3rem] relative overflow-hidden group">
              <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <PieChart size={240} />
              </div>
              <div className="relative z-10 space-y-6">
                <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                  <ShieldCheck size={24} className="text-purple-300" />
                </div>
                <h4 className="text-3xl font-black uppercase tracking-tight leading-none">Intelligence Audit</h4>
                <p className="text-purple-100/70 italic text-sm font-medium leading-relaxed">Identifying {stats.lowStockItems} structural deficits across {stats.totalItems} integrated assets.</p>
                <Button variant="outline" className="w-full h-12 border-purple-400 text-white hover:bg-white/10 font-black uppercase text-[10px] tracking-widest rounded-xl transition-all">
                  Review Security Logs
                </Button>
              </div>
            </Card>

            <Card className="border-none shadow-xl bg-white p-10 rounded-[3rem] ring-1 ring-black/5">
              <div className="space-y-8">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Capital Exposure</p>
                  <p className="text-4xl font-black text-gray-900 tracking-tighter mt-1">₹ {stats.totalValue.toLocaleString()}</p>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-gray-500 uppercase tracking-widest">Inflow Velocity</span>
                    <span className="font-black text-emerald-600">+{(stats.totalQuantity / 1000).toFixed(1)}%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[65%]" />
                  </div>
                </div>
                <Button className="w-full h-14 bg-gray-50 hover:bg-purple-50 text-purple-700 font-black uppercase text-[10px] tracking-widest rounded-2xl border-none transition-all flex items-center justify-center gap-2">
                  Deep Flow Analysis <ArrowUpRight size={14} />
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
