"use client"

import { useMemo, useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  CalendarDays,
  Download,
  Search,
  Clock,
  Activity,
  Monitor,
  Zap,
  Navigation,
  FileSpreadsheet,
  CalendarCheck,
  TrendingUp,
  Filter
} from "lucide-react"
import { API_URL } from "@/lib/api-config"
import { toast } from "sonner"

export default function DailyTimeTable() {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const [date, setDate] = useState(today)
  const [classes, setClasses] = useState<any[]>([])
  const [sections, setSections] = useState<any[]>([])
  const [selectedClass, setSelectedClass] = useState("")
  const [selectedSection, setSelectedSection] = useState("")

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      const token = localStorage.getItem('token')
      const [classRes, sectionRes] = await Promise.all([
        fetch(`${API_URL}/api/classes`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/api/sections`, { headers: { 'Authorization': `Bearer ${token}` } })
      ])

      if (classRes.ok) {
        const data = await classRes.json()
        setClasses(Array.isArray(data) ? data : (data.data || []))
      }
      if (sectionRes.ok) {
        const data = await sectionRes.json()
        setSections(data.data || [])
      }
    } catch (error) {
      toast.error("Telemetry failed")
    }
  }

  return (
    <DashboardLayout title="Operational Schedule">
      <div className="space-y-6 max-w-full pb-10">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-8 bg-gray-900 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden shadow-indigo-200">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-2 w-2 bg-indigo-500 rounded-full animate-ping" />
              <h1 className="text-3xl font-black tracking-tighter uppercase italic">Daily Operations Hub</h1>
            </div>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em] ml-1">Academics / Real-time Schedule Monitoring</p>
          </div>
          <div className="flex gap-4 relative z-10">
            <Button className="h-14 px-8 bg-indigo-600 hover:bg-white hover:text-indigo-600 rounded-2xl font-black uppercase text-xs tracking-widest transition-all duration-300 gap-3 border-none">
              <Download size={18} /> Export Master Log
            </Button>
          </div>
          <Zap className="absolute -right-10 -bottom-10 h-64 w-64 text-white/5 rotate-12" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
              <CardHeader className="bg-gradient-to-br from-indigo-50 to-white p-8 border-b border-gray-100">
                <CardTitle className="text-xs font-black uppercase tracking-widest text-indigo-600 flex items-center gap-3">
                  <Filter className="h-4 w-4" />
                  Control Parameters
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Target Class</Label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger className="h-14 rounded-2xl border-2 border-gray-100 bg-gray-50/50 hover:bg-white transition-all font-black uppercase italic tracking-tighter">
                      <SelectValue placeholder="SELECT UNIT" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-2 border-gray-100 shadow-2xl">
                      {classes.map(c => (
                        <SelectItem key={c._id} value={c._id} className="font-black uppercase italic py-3">{c.name || c.className}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Operational Node</Label>
                  <Select value={selectedSection} onValueChange={setSelectedSection}>
                    <SelectTrigger className="h-14 rounded-2xl border-2 border-gray-100 bg-gray-50/50 hover:bg-white transition-all font-black uppercase italic tracking-tighter">
                      <SelectValue placeholder="SELECT NODE" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-2 border-gray-100 shadow-2xl">
                      {sections.map(s => (
                        <SelectItem key={s._id} value={s.name} className="font-black uppercase italic py-3">Section {s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Schedule Timestamp</Label>
                  <div className="relative">
                    <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-400" />
                    <Input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="h-14 pl-12 rounded-2xl border-2 border-gray-100 bg-gray-50/50 hover:bg-white transition-all font-black uppercase tracking-widest"
                    />
                  </div>
                </div>

                <Button className="w-full h-16 bg-gray-900 hover:bg-indigo-600 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl transition-all duration-300 gap-3 group">
                  <Search className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  Activate Query
                </Button>
              </CardContent>
            </Card>

            <div className="bg-indigo-50 p-8 rounded-[2.5rem] border-2 border-indigo-100/50 relative overflow-hidden group">
              <p className="text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-2 italic">Active Sessions</p>
              <div className="flex items-end gap-3">
                <h3 className="text-5xl font-black tracking-tighter text-gray-900 leading-none">08</h3>
                <p className="text-indigo-400 text-[10px] font-black uppercase mb-1 tracking-tighter">Nodes Online</p>
              </div>
              <Activity className="absolute -right-4 -bottom-4 h-24 w-24 text-indigo-200/50 group-hover:scale-110 transition-transform" />
            </div>
          </div>

          <div className="lg:col-span-3">
            <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden h-full flex flex-col bg-white">
              <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-gray-100">
                    <Clock className="h-6 w-6 text-indigo-600 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-tighter text-gray-800 italic">Timeline Visualization</h2>
                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mt-1 italic">Real-time instructional delivery tracking</p>
                  </div>
                </div>
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-[10px] font-black uppercase text-indigo-600 tracking-widest mb-1 italic">Sync Status</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(i => <div key={i} className={`h-1 w-4 rounded-full ${i < 4 ? 'bg-indigo-500' : 'bg-gray-200'}`} />)}
                  </div>
                </div>
              </div>

              <CardContent className="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-8 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
                <div className="h-32 w-32 bg-indigo-50 rounded-[3rem] flex items-center justify-center border-4 border-white shadow-2xl animate-bounce">
                  <Navigation className="h-12 w-12 text-indigo-600 rotate-45" />
                </div>
                <div className="max-w-md space-y-4">
                  <h3 className="text-2xl font-black text-gray-800 uppercase italic tracking-tighter">Awaiting Navigation Input</h3>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] leading-relaxed italic">
                    Define target class and operational node parameters to visualize the daily instructional timeline.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-lg pt-10">
                  <div className="p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-100 flex flex-col items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-500" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Efficiency</span>
                  </div>
                  <div className="p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-100 flex flex-col items-center gap-2">
                    <Zap className="h-5 w-5 text-amber-500" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Load Factor</span>
                  </div>
                  <div className="p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-100 flex flex-col items-center gap-2">
                    <CalendarCheck className="h-5 w-5 text-indigo-500" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Compliance</span>
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
