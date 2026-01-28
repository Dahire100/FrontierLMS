"use client"

import { useState, useEffect, useCallback } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  CheckSquare,
  Loader2,
  RefreshCcw,
  Search,
  Book,
  Database,
  Hash,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Activity,
  LineChart,
  PieChart,
  BarChart
} from "lucide-react"
import { toast } from "sonner"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import { API_URL } from "@/lib/api-config"

export default function BookAvailabilityPage() {
  const [books, setBooks] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [fetching, setFetching] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  const fetchData = useCallback(async () => {
    try {
      setFetching(true)
      const token = localStorage.getItem("token")
      const headers = { "Authorization": `Bearer ${token}` }

      const [booksRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/api/library/books`, { headers }),
        fetch(`${API_URL}/api/library/stats`, { headers })
      ])

      const booksData = await booksRes.json()
      const statsData = await statsRes.json()

      if (booksData.success) setBooks(booksData.data)
      if (statsData.success) setStats(statsData.data)

    } catch (error) {
      console.error(error)
      toast.error("Failed to sync buffer state")
    } finally {
      setFetching(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const columns = [
    {
      key: "title",
      label: "Knowledge Node",
      render: (val: string, row: any) => (
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm">
            <Book size={18} />
          </div>
          <div>
            <span className="font-black text-gray-900 tracking-tight uppercase leading-none">{val}</span>
            <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">ISBN: {row.isbn || 'REF_NULL'}</div>
          </div>
        </div>
      )
    },
    {
      key: "availableQuantity",
      label: "Buffer Readiness",
      render: (val: number, row: any) => {
        const ratio = val / row.quantity
        const isLow = ratio < 0.2
        return (
          <div className="flex items-center gap-4">
            <div className="h-2 w-24 bg-gray-100 rounded-full overflow-hidden border border-gray-50 shadow-inner">
              <div
                className={`h-full transition-all duration-1000 ${isLow ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`}
                style={{ width: `${ratio * 100}%` }}
              />
            </div>
            <div className="flex flex-col">
              <span className={`text-[10px] font-black uppercase tracking-tighter ${isLow ? 'text-rose-600' : 'text-emerald-700'}`}>
                {val} Units Valid
              </span>
              <span className="text-[8px] font-bold text-gray-400 uppercase">of {row.quantity} total</span>
            </div>
          </div>
        )
      }
    },
    {
      key: "rackNumber",
      label: "Grid Location",
      render: (val: string) => (
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100">
            <Layers size={12} className="text-gray-400" />
          </div>
          <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{val || 'FLOATING_NODE'}</span>
        </div>
      )
    },
    {
      key: "status",
      label: "System State",
      render: (_: any, row: any) => (
        <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border transition-all flex items-center gap-2 w-fit ${row.availableQuantity > 0
            ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
            : 'bg-rose-100 text-rose-700 border-rose-200 shadow-lg shadow-rose-100'
          }`}>
          {row.availableQuantity > 0 ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
          {row.availableQuantity > 0 ? 'READY' : 'DEPLETED'}
        </div>
      )
    }
  ]

  const filteredBooks = books.filter((b: any) =>
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.isbn?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <DashboardLayout title="Knowledge Logistics: Buffer Availability">
      <div className="max-w-[1700px] mx-auto space-y-12 pb-20">

        {/* Header Context */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-4 uppercase">
              <div className="h-12 w-12 bg-indigo-950 rounded-2xl flex items-center justify-center shadow-xl text-white transform hover:rotate-12 transition-transform">
                <Activity size={24} />
              </div>
              Real-Time Buffer Intelligence
            </h1>
            <p className="text-gray-500 mt-2 text-lg italic font-medium">Monitor institutional knowledge density and resource readiness across the archival landscape</p>
          </div>

          <Button variant="outline" onClick={fetchData} className="h-12 border-gray-200 shadow-sm gap-2 rounded-2xl bg-white px-6 font-black text-xs uppercase tracking-widest text-gray-600 hover:bg-gray-50">
            <RefreshCcw size={18} className={fetching ? 'animate-spin' : ''} /> Execute Intelligence Sync
          </Button>
        </div>

        {/* Macro Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { label: 'Total Nodes', val: stats?.totalQuantity || 0, icon: Layers, color: 'blue' },
            { label: 'Active Buffer', val: stats?.availableQuantity || 0, icon: CheckSquare, color: 'emerald' },
            { label: 'Issued Assets', val: stats?.issuedCount || 0, icon: BarChart, color: 'indigo' },
            { label: 'Critical Overdue', val: stats?.overdueCount || 0, icon: AlertTriangle, color: 'rose' }
          ].map((s, idx) => (
            <Card key={idx} className="border-none shadow-2xl ring-1 ring-black/5 overflow-hidden rounded-[2.5rem] bg-white group hover:translate-y-[-5px] transition-all duration-500">
              <CardContent className="p-8 flex items-center gap-6">
                <div className={`h-16 w-16 rounded-[1.5rem] bg-${s.color}-50 flex items-center justify-center text-${s.color}-600 border border-${s.color}-100 group-hover:bg-${s.color}-600 group-hover:text-white transition-all duration-500`}>
                  <s.icon size={28} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] leading-none mb-1">{s.label}</p>
                  <p className="text-3xl font-black text-gray-900 tracking-tighter">{s.val}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-8">
          {/* Perspective filters */}
          <div className="relative max-w-md group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-blue-600 transition-colors" />
            <Input
              className="pl-16 h-16 bg-white border-none ring-1 ring-black/5 shadow-2xl rounded-[1.5rem] focus:ring-2 focus:ring-blue-500/20 text-lg font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Query availability registry..."
            />
          </div>

          {/* Matrix View */}
          <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <AdvancedTable
              title="Validated Availability Matrix"
              columns={columns}
              data={filteredBooks}
              loading={fetching}
              pagination
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
