"use client"

import { useState, useEffect, useCallback } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  MapPin,
  Bus,
  User,
  Wallet,
  Link2,
  ArrowRight,
  Navigation,
  ShieldCheck,
  Activity,
  Clock,
  Database,
  RefreshCcw,
  Zap,
  Globe,
  TrendingUp,
  Map
} from "lucide-react"
import Link from "next/link"
import { API_URL } from "@/lib/api-config"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

export default function TransportDashboard() {
  const [stats, setStats] = useState({
    totalRoutes: 0,
    activeVehicles: 0,
    totalDrivers: 0,
    mappedStudents: 0
  })
  const [fetching, setFetching] = useState(true)

  const [routes, setRoutes] = useState<any[]>([])

  const fetchData = useCallback(async () => {
    try {
      setFetching(true)
      const token = localStorage.getItem("token")
      const headers = { "Authorization": `Bearer ${token}` }

      const [routesRes, vehiclesRes, driversRes] = await Promise.all([
        fetch(`${API_URL}/api/transport`, { headers }),
        fetch(`${API_URL}/api/transport/vehicles`, { headers }),
        fetch(`${API_URL}/api/transport/drivers`, { headers })
      ])

      const rData = await routesRes.json()
      const vData = await vehiclesRes.json()
      const dData = await driversRes.json()

      // Store routes for display
      setRoutes(Array.isArray(rData) ? rData : [])

      setStats({
        totalRoutes: Array.isArray(rData) ? rData.length : 0,
        activeVehicles: Array.isArray(vData) ? vData.length : 0,
        totalDrivers: Array.isArray(dData) ? dData.length : 0,
        mappedStudents: 0 // Placeholder or fetch if endpoint exists
      })

    } catch (error) {
      console.error(error)
      toast.error("Failed to sync transit matrix")
    } finally {
      setFetching(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const modules = [
    { title: "Navigation Routes", desc: "Define and optimize transit pathways", icon: MapPin, href: "/transport/routes", color: "blue" },
    { title: "Fleet Management", desc: "Monitor vehicle integrity and status", icon: Bus, href: "/transport/vehicles", color: "emerald" },
    { title: "Executive Drivers", desc: "Manage chauffeur profiles and licensing", icon: User, href: "/transport/drivers", color: "orange" },
    { title: "Fiscal Logistics", desc: "Process transit fees and revenue flows", icon: Wallet, href: "/transport/fees", color: "purple" },
    { title: "Student Mapping", desc: "Synchronize beneficiaries with routes", icon: Link2, href: "/transport/student-route-mapping", color: "amber" },
  ]

  return (
    <DashboardLayout title="Operational Center: Transit Logistics">
      <div className="max-w-[1700px] mx-auto space-y-12 pb-20">

        {/* Dynamic Hero Section */}
        <div className="relative overflow-hidden rounded-[3rem] bg-slate-950 p-12 lg:p-20 text-white shadow-2xl">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
            <Map className="w-full h-full scale-150 -rotate-12 text-white" />
          </div>

          <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full backdrop-blur-md border border-white/5">
                <Zap size={14} className="text-blue-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Transit Grid v2.1 Active</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-black tracking-tighter uppercase leading-[0.9]">
                Fleet <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Mobility</span> <br />
                Orchestration
              </h1>
              <p className="text-white/60 text-xl font-medium max-w-lg italic">
                Harmonize institutional mobility flows and fleet integrity through our integrated transit intelligence matrix.
              </p>
              <div className="flex gap-4">
                <Link href="/dashboard/admin/transport/routes">
                  <Button className="h-14 bg-white text-slate-950 hover:bg-slate-50 px-8 rounded-2xl font-black text-xs uppercase tracking-widest gap-3 transition-transform hover:scale-105 active:scale-95">
                    Command routes <ArrowRight size={16} />
                  </Button>
                </Link>
                <Button variant="outline" onClick={fetchData} className="h-14 border-white/20 hover:bg-white/10 px-8 rounded-2xl font-black text-xs uppercase tracking-widest gap-3">
                  <RefreshCcw size={16} className={fetching ? 'animate-spin' : ''} /> Sync Mobility Grid
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {[
                { val: stats.totalRoutes, label: 'Active Routes', icon: Navigation, col: 'blue' },
                { val: stats.activeVehicles, label: 'Fleet Volume', icon: Bus, col: 'emerald' },
                { val: stats.totalDrivers, label: 'Active Staff', icon: ShieldCheck, col: 'orange' },
                { val: '98.4%', label: 'Transit Uptime', icon: TrendingUp, col: 'indigo' },
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
            <div className="h-1.5 w-12 bg-blue-600 rounded-full" />
            <h2 className="text-xs font-black uppercase tracking-[0.4em] text-gray-400 leading-none">Transit Sub-Systems</h2>
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
                      <ArrowRight size={20} className="text-gray-200 group-hover:text-blue-600 group-hover:translate-x-2 transition-all" />
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
                    <CardTitle className="text-2xl font-black text-gray-900 uppercase tracking-tight">Active Fleet Operations</CardTitle>
                    <CardDescription className="italic font-medium">Real-time status of institutional mobility assets</CardDescription>
                  </div>
                  <Globe className="text-blue-600 animate-pulse" size={24} />
                </div>
              </CardHeader>
              <CardContent className="p-10">
                <div className="space-y-6">
                  {fetching ? (
                    <div className="flex justify-center p-8">
                      <RefreshCcw className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                  ) : routes.length === 0 ? (
                    <div className="text-center p-8 text-gray-400">
                      <p className="font-bold">No active routes found</p>
                      <p className="text-xs mt-2">Configure routes to see fleet operations</p>
                    </div>
                  ) : (
                    routes.slice(0, 3).map((route, i) => (
                      <div key={i} className="flex items-center justify-between p-6 rounded-3xl bg-slate-50 border border-slate-100 group hover:bg-blue-50 hover:border-blue-100 transition-all">
                        <div className="flex items-center gap-6">
                          <div className="h-12 w-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center font-black text-blue-600 text-xs">
                            #{i + 1}
                          </div>
                          <div>
                            <p className="font-black text-gray-900 uppercase text-sm">{route.routeName}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Vehicle: {route.vehicleNumber}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-blue-900">₹{route.routeCharge}</p>
                          <p className="text-[9px] font-black uppercase text-emerald-500">Active</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <Card className="border-none shadow-2xl ring-1 ring-black/5 rounded-[3rem] bg-indigo-900 text-white overflow-hidden h-full">
              <CardHeader className="p-10">
                <CardTitle className="text-[10px] font-black text-blue-300 uppercase tracking-[0.4em] flex items-center gap-3">
                  <Activity size={16} /> Fleet Integrity
                </CardTitle>
              </CardHeader>
              <CardContent className="p-10 py-0">
                <div className="space-y-10">
                  <div className="flex justify-center flex-col items-center text-center">
                    <div className="relative h-40 w-40 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90">
                        <circle cx="80" cy="80" r="70" className="stroke-white/10 fill-none" strokeWidth="12" />
                        <circle cx="80" cy="80" r="70" className="stroke-emerald-400 fill-none" strokeWidth="12" strokeDasharray="440" strokeDashoffset="44" strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <p className="text-4xl font-black">90%</p>
                        <p className="text-[8px] font-black uppercase tracking-widest text-emerald-400">Optimal</p>
                      </div>
                    </div>
                    <p className="mt-8 font-black uppercase tracking-widest text-xs text-blue-200">System Capability Yield</p>
                  </div>

                  <div className="space-y-4 pt-10">
                    <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-3">
                        <ShieldCheck size={18} className="text-emerald-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Protocol Verified</span>
                      </div>
                      <span className="text-[9px] font-bold text-white/40">Active</span>
                    </div>
                    <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-3">
                        <Clock size={18} className="text-blue-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Latency Calibration</span>
                      </div>
                      <span className="text-[9px] font-bold text-white/40">Synced</span>
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
