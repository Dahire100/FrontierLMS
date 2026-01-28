"use client"

import { useState, useEffect, useCallback } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Building2,
  Bed,
  Users,
  Wallet,
  UserCheck,
  ArrowRight,
  RefreshCcw,
  Zap,
  Home,
  TrendingUp,
  Activity,
  Database
} from "lucide-react"
import Link from "next/link"
import { API_URL } from "@/lib/api-config"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

export default function HostelDashboard() {
  const [stats, setStats] = useState({
    totalHostels: 0,
    totalRooms: 0,
    totalCapacity: 0,
    totalOccupied: 0,
    occupancyRate: 0
  })
  const [fetching, setFetching] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      setFetching(true)
      const token = localStorage.getItem("token")
      const headers = { "Authorization": `Bearer ${token}` }

      const [hostelsRes, allocationsRes] = await Promise.all([
        fetch(`${API_URL}/api/hostel`, { headers }),
        fetch(`${API_URL}/api/hostel/allocations`, { headers })
      ])

      const hData = await hostelsRes.json()
      const aData = await allocationsRes.json()

      if (hData.success) {
        const hostels = hData.data
        const totalCapacity = hostels.reduce((sum: number, h: any) => sum + (h.totalCapacity || 0), 0)
        const totalOccupied = hostels.reduce((sum: number, h: any) => sum + (h.totalOccupied || 0), 0)
        const totalRooms = hostels.reduce((sum: number, h: any) => sum + (h.totalRooms || 0), 0)

        setStats({
          totalHostels: hostels.length,
          totalRooms,
          totalCapacity,
          totalOccupied,
          occupancyRate: totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0
        })
      }

    } catch (error) {
      console.error(error)
      toast.error("Failed to sync residential matrix")
    } finally {
      setFetching(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const modules = [
    { title: "Residential Facilities", desc: "Manage hostel infrastructure", icon: Building2, href: "/hostel/hostel-list", color: "indigo" },
    { title: "Room Registry", desc: "Configure accommodation units", icon: Bed, href: "/hostel/rooms", color: "blue" },
    { title: "Bed Allocation", desc: "Assign beneficiaries to quarters", icon: UserCheck, href: "/hostel/bed-allocation", color: "emerald" },
    { title: "Attendance Protocol", desc: "Monitor residential presence", icon: Activity, href: "/hostel/attendance", color: "orange" },
    { title: "Fiscal Logistics", desc: "Process residential fees", icon: Wallet, href: "/hostel/fees", color: "purple" },
  ]

  return (
    <DashboardLayout title="Operational Center: Residential Logistics">
      <div className="max-w-[1700px] mx-auto space-y-12 pb-20">

        {/* Dynamic Hero Section */}
        <div className="relative overflow-hidden rounded-[3rem] bg-indigo-950 p-12 lg:p-20 text-white shadow-2xl">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
            <Home className="w-full h-full scale-150 -rotate-12 text-white" />
          </div>

          <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full backdrop-blur-md border border-white/5">
                <Zap size={14} className="text-indigo-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Residential Grid v3.0 Active</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-black tracking-tighter uppercase leading-[0.9]">
                Hostel <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">Accommodation</span> <br />
                Orchestration
              </h1>
              <p className="text-white/60 text-xl font-medium max-w-lg italic">
                Harmonize residential infrastructure and optimize beneficiary accommodation through our integrated hostel intelligence matrix.
              </p>
              <div className="flex gap-4">
                <Link href="/dashboard/admin/hostel/hostel-list">
                  <Button className="h-14 bg-white text-indigo-950 hover:bg-indigo-50 px-8 rounded-2xl font-black text-xs uppercase tracking-widest gap-3 transition-transform hover:scale-105 active:scale-95">
                    Command Facilities <ArrowRight size={16} />
                  </Button>
                </Link>
                <Button variant="outline" onClick={fetchData} className="h-14 border-white/20 hover:bg-white/10 px-8 rounded-2xl font-black text-xs uppercase tracking-widest gap-3">
                  <RefreshCcw size={16} className={fetching ? 'animate-spin' : ''} /> Sync Residential Grid
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {[
                { val: stats.totalHostels, label: 'Active Facilities', icon: Building2, col: 'indigo' },
                { val: stats.totalRooms, label: 'Total Quarters', icon: Bed, col: 'blue' },
                { val: stats.totalOccupied, label: 'Residents', icon: Users, col: 'emerald' },
                { val: `${stats.occupancyRate}%`, label: 'Occupancy Rate', icon: TrendingUp, col: 'amber' },
              ].map((s, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 backdrop-blur-xl p-8 rounded-[2.5rem] group hover:bg-white/10 transition-all cursor-default">
                  <s.icon className={`text-${s.col}-400 mb-4 group-hover:scale-110 transition-transform`} size={24} />
                  <p className="text-4xl font-black tracking-tighter mb-1">{s.val}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Logistical Modules */}
        <div className="space-y-8">
          <div className="flex items-center gap-4 px-2">
            <div className="h-1.5 w-12 bg-indigo-600 rounded-full" />
            <h2 className="text-xs font-black uppercase tracking-[0.4em] text-gray-400 leading-none">Residential Sub-Systems</h2>
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
                      <span className={`text-[9px] font-black text-${m.color}-600 uppercase tracking-widest bg-${m.color}-50 px-3 py-1 rounded-full`}>System Verified</span>
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

        {/* Real-time Insights */}
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8">
            <Card className="border-none shadow-2xl ring-1 ring-black/5 rounded-[3rem] bg-white overflow-hidden h-full">
              <CardHeader className="p-10 border-b border-gray-50">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-2xl font-black text-gray-900 uppercase tracking-tight">Facility Capacity Overview</CardTitle>
                    <CardDescription className="italic font-medium">Real-time occupancy across residential infrastructure</CardDescription>
                  </div>
                  <Database className="text-indigo-600 animate-pulse" size={24} />
                </div>
              </CardHeader>
              <CardContent className="p-10">
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-6 rounded-3xl bg-indigo-50 border border-indigo-100">
                    <div>
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Total Capacity</p>
                      <p className="text-3xl font-black text-indigo-900">{stats.totalCapacity} Beds</p>
                    </div>
                    <div className="h-16 w-16 rounded-2xl bg-white border border-indigo-200 flex items-center justify-center">
                      <Bed className="text-indigo-600" size={28} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-100">
                      <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Occupied</p>
                      <p className="text-2xl font-black text-emerald-900">{stats.totalOccupied}</p>
                    </div>
                    <div className="p-6 rounded-3xl bg-gray-50 border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Available</p>
                      <p className="text-2xl font-black text-gray-900">{stats.totalCapacity - stats.totalOccupied}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <Card className="border-none shadow-2xl ring-1 ring-black/5 rounded-[3rem] bg-indigo-900 text-white overflow-hidden h-full">
              <CardHeader className="p-10">
                <CardTitle className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.4em] flex items-center gap-3">
                  <Activity size={16} /> Facility Integrity
                </CardTitle>
              </CardHeader>
              <CardContent className="p-10 py-0">
                <div className="space-y-10">
                  <div className="flex justify-center flex-col items-center text-center">
                    <div className="relative h-40 w-40 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90">
                        <circle cx="80" cy="80" r="70" className="stroke-white/10 fill-none" strokeWidth="12" />
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          className="stroke-emerald-400 fill-none"
                          strokeWidth="12"
                          strokeDasharray="440"
                          strokeDashoffset={440 - (440 * stats.occupancyRate / 100)}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <p className="text-4xl font-black">{stats.occupancyRate}%</p>
                        <p className="text-[8px] font-black uppercase tracking-widest text-emerald-400">Occupancy</p>
                      </div>
                    </div>
                    <p className="mt-8 font-black uppercase tracking-widest text-xs text-indigo-200">System Capacity Yield</p>
                  </div>

                  <div className="space-y-4 pt-10">
                    <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-3">
                        <Building2 size={18} className="text-indigo-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Facilities Online</span>
                      </div>
                      <span className="text-[9px] font-bold text-white/40">{stats.totalHostels}</span>
                    </div>
                    <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-3">
                        <Bed size={18} className="text-emerald-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Quarters Active</span>
                      </div>
                      <span className="text-[9px] font-bold text-white/40">{stats.totalRooms}</span>
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
