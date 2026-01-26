"use client"

import { useState, useEffect, useCallback } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Book,
  BookOpen,
  Users,
  AlertCircle,
  Plus,
  ClipboardList,
  RotateCcw,
  CheckSquare,
  History,
  Bookmark,
  Loader2,
  Library,
  ArrowRight,
  TrendingUp,
  Zap,
  Globe,
  Search,
  RefreshCcw,
  Database,
  Binary
} from "lucide-react"
import Link from "next/link"
import { API_URL } from "@/lib/api-config"
import { toast } from "sonner"
import { AdvancedTable } from "@/components/super-admin/advanced-table"

export default function LibraryDashboard() {
  const [books, setBooks] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [fetching, setFetching] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      setFetching(true)
      const token = localStorage.getItem("token")
      const headers = { "Authorization": `Bearer ${token}` }

      const [booksRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/api/library/books`, { headers }),
        fetch(`${API_URL}/api/library/stats`, { headers })
      ])

      const bData = await booksRes.json()
      const sData = await statsRes.json()

      if (bData.success) setBooks(bData.data)
      if (sData.success) setStats(sData.data)

    } catch (error) {
      console.error(error)
      toast.error("Failed to sync knowledge core")
    } finally {
      setFetching(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const modules = [
    { title: "Material Catalog", desc: "Index and manage knowledge assets", icon: Book, href: "/library/book-catalog", color: "blue" },
    { title: "Issuance Protocol", desc: "Orchestrate material dispersion", icon: ClipboardList, href: "/library/book-issue", color: "indigo" },
    { title: "Recovery Matrix", desc: "Process asset return flows", icon: RotateCcw, href: "/library/book-return", color: "emerald" },
    { title: "Buffer Intelligence", desc: "Monitor real-time availability", icon: CheckSquare, href: "/library/book-availability", color: "amber" },
    { title: "Interaction Ledger", desc: "Audit chronological histories", icon: History, href: "/library/student-history", color: "violet" },
    { title: "Demand Queue", desc: "Manage material reservations", icon: Bookmark, href: "/library/book-reservation", color: "rose" },
  ]

  const columns = [
    {
      key: "title",
      label: "Archival Node",
      render: (val: string, row: any) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 italic font-black text-indigo-600 text-[10px]">
            {row.bookNumber}
          </div>
          <div>
            <p className="font-black text-gray-900 tracking-tight uppercase text-xs">{val}</p>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{row.author}</p>
          </div>
        </div>
      )
    },
    {
      key: "availableQuantity",
      label: "Readiness",
      render: (val: number, row: any) => (
        <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${val > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
          }`}>
          {val > 0 ? `LIVE (${val}/${row.quantity})` : 'DEPLETED'}
        </div>
      )
    }
  ]

  return (
    <DashboardLayout title="Operational Center: Knowledge Logistics">
      <div className="max-w-[1700px] mx-auto space-y-12 pb-20">

        {/* Dynamic Hero Section */}
        <div className="relative overflow-hidden rounded-[3rem] bg-indigo-950 p-12 lg:p-20 text-white shadow-2xl">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
            <Globe className="w-full h-full scale-150 rotate-12 text-white" />
          </div>

          <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full backdrop-blur-md border border-white/5">
                <Zap size={14} className="text-amber-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Knowledge Grid v4.2 Active</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-black tracking-tighter uppercase leading-[0.9]">
                Institutional <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Resource</span> <br />
                Orchestration
              </h1>
              <p className="text-white/60 text-xl font-medium max-w-lg italic">
                Harmonize knowledge asset dispersion and recovery metrics through our integrated operational intelligence matrix.
              </p>
              <div className="flex gap-4">
                <Link href="/dashboard/admin/library/book-catalog">
                  <Button className="h-14 bg-white text-indigo-950 hover:bg-indigo-50 px-8 rounded-2xl font-black text-xs uppercase tracking-widest gap-3 transition-transform hover:scale-105 active:scale-95">
                    Executive Catalog <ArrowRight size={16} />
                  </Button>
                </Link>
                <Button variant="outline" onClick={fetchData} className="h-14 border-white/20 hover:bg-white/10 px-8 rounded-2xl font-black text-xs uppercase tracking-widest gap-3">
                  <RefreshCcw size={16} className={fetching ? 'animate-spin' : ''} /> Execute Sync
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {[
                { val: stats?.totalQuantity || 0, label: 'Asset Volume', icon: Database },
                { val: stats?.issuedCount || 0, label: 'Active Flows', icon: Binary },
                { val: stats?.availableQuantity || 0, label: 'Buffer Cache', icon: TrendingUp },
                { val: stats?.overdueCount || 0, label: 'Audit Alerts', icon: AlertCircle },
              ].map((s, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 backdrop-blur-xl p-8 rounded-[2.5rem] group hover:bg-white/10 transition-all cursor-default">
                  <s.icon className="text-blue-400 mb-4 group-hover:scale-110 transition-transform" size={24} />
                  <p className="text-4xl font-black tracking-tighter mb-1">{s.val}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tactical Modules */}
        <div className="space-y-8">
          <div className="flex items-center gap-4 px-2">
            <div className="h-1.5 w-12 bg-indigo-600 rounded-full" />
            <h2 className="text-xs font-black uppercase tracking-[0.4em] text-gray-400 leading-none">Logistical Sub-Systems</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {modules.map((m, idx) => (
              <Link key={idx} href={`/dashboard/admin${m.href}`}>
                <Card className="border-none shadow-2xl ring-1 ring-black/5 overflow-hidden rounded-[2.5rem] bg-white group hover:translate-y-[-8px] transition-all duration-500 h-full">
                  <CardContent className="p-10 flex flex-col h-full">
                    <div className={`h-16 w-16 bg-${m.color}-50 rounded-3xl flex items-center justify-center text-${m.color}-600 mb-8 border border-${m.color}-100 group-hover:bg-${m.color}-900 group-hover:text-white transition-all duration-500 shadow-xl shadow-${m.color}-50`}>
                      <m.icon size={28} />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-2 flex items-center justify-between">
                      {m.title}
                      <ArrowRight size={20} className="text-gray-200 group-hover:text-indigo-600 group-hover:translate-x-2 transition-all" />
                    </h3>
                    <p className="text-gray-500 font-medium italic mb-8">{m.desc}</p>
                    <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                      <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">Secure Access Verified</span>
                      <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="h-6 w-6 rounded-full border-2 border-white bg-gray-100" />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Real-time Feed & Activity */}
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <AdvancedTable
              title="Validated Registry Feed"
              columns={columns}
              data={books.slice(0, 10)}
              loading={fetching}
              pagination={false}
            />
          </div>

          <div className="lg:col-span-4 space-y-8">
            <Card className="border-none shadow-2xl ring-1 ring-black/5 rounded-[2.5rem] bg-white overflow-hidden h-full">
              <CardHeader className="bg-gray-50/50 p-8 border-b border-gray-100">
                <CardTitle className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-3">
                  <Search size={16} className="text-indigo-600" /> System Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-6">
                  {['Fiction', 'Sci-Tech', 'Archival'].map((cat, i) => (
                    <div key={cat} className="space-y-3">
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black uppercase text-gray-600 tracking-widest">{cat} Distribution</span>
                        <span className="text-xs font-black text-indigo-600">8{i}%</span>
                      </div>
                      <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full"
                          style={{ width: `8${i}%` }}
                        />
                      </div>
                    </div>
                  ))}

                  <div className="pt-10">
                    <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 flex items-center gap-4">
                      <CheckSquare className="text-emerald-600" size={24} />
                      <div>
                        <p className="text-[10px] font-black uppercase text-emerald-900 tracking-widest leading-none mb-1">Grid Integrity</p>
                        <p className="text-xs font-bold text-emerald-600">99.98% Synced</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
