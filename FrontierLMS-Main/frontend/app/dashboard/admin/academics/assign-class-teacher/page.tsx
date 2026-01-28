"use client"

import { useState, useEffect } from "react"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  CalendarDays,
  ChevronDown,
  LayoutList,
  Pencil,
  UserRound,
  Loader2,
  UserCheck,
  Briefcase,
  ShieldCheck,
  Search
} from "lucide-react"
import { API_URL } from "@/lib/api-config"
import { toast } from "sonner"

interface ClassItem {
  _id: string
  name: string
  section: string
  classTeacher?: {
    _id: string
    firstName: string
    lastName: string
    email: string
  }
}

interface Teacher {
  _id: string
  firstName: string
  lastName: string
}

export default function AssignClassTeacher() {
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)

  const [form, setForm] = useState({ classId: "", teacherId: "" })
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      setFetching(true)
      const token = localStorage.getItem("token")
      const headers = { "Authorization": `Bearer ${token}` }

      const [classesRes, teachersRes] = await Promise.all([
        fetch(`${API_URL}/api/classes`, { headers }),
        fetch(`${API_URL}/api/teachers`, { headers })
      ])

      const classesData = await classesRes.json()
      const teachersData = await teachersRes.json()

      if (classesRes.ok) setClasses(classesData.data || [])
      if (teachersRes.ok) setTeachers(Array.isArray(teachersData) ? teachersData : teachersData.data || [])
    } catch (error) {
      toast.error("Failed to load environment data")
    } finally {
      setFetching(false)
    }
  }

  const handleSave = async () => {
    if (!form.classId || !form.teacherId) {
      toast.error("Please identify both Class and Teacher")
      return
    }

    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_URL}/api/classes/${form.classId}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ classTeacher: form.teacherId })
      })

      if (res.ok) {
        toast.success("Appointment Authorized", {
          description: "Class teacher has been successfully delegated."
        })
        setForm({ classId: "", teacherId: "" })
        fetchInitialData()
      } else {
        const error = await res.json()
        toast.error(error.error || "Appointment Failed")
      }
    } catch (error) {
      toast.error("Network synchronization error")
    } finally {
      setLoading(false)
    }
  }

  const filteredClasses = classes.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.section.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <DashboardLayout title="Assign Class Teacher">
      <div className="space-y-6 max-w-full pb-10">
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border-l-[6px] border-l-rose-600">
          <div>
            <h1 className="text-2xl font-black text-gray-800 tracking-tighter uppercase italic">Faculty Delegation</h1>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Academics / Class Leadership Assignment</p>
          </div>
          <div className="h-12 w-12 bg-rose-50 rounded-full flex items-center justify-center text-rose-600 border border-rose-100 shadow-sm animate-pulse">
            <UserCheck className="h-6 w-6" />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          <Card className="xl:col-span-1 border-none shadow-xl rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-rose-600 p-6 text-white border-none">
              <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-3">
                <Pencil className="h-5 w-5" />
                Appointment Desk
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Select Jurisdiction (Class)</Label>
                  <Select value={form.classId} onValueChange={(val) => setForm({ ...form, classId: val })}>
                    <SelectTrigger className="h-14 rounded-2xl border-2 border-gray-100 bg-gray-50/30 hover:bg-white transition-all shadow-inner focus:border-rose-600 text-sm font-bold">
                      <SelectValue placeholder="Identify class" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl shadow-2xl border-2">
                      {classes.map(cls => (
                        <SelectItem key={cls._id} value={cls._id} className="h-12 font-bold uppercase">
                          {cls.name} - {cls.section}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Appoint Lead Faculty</Label>
                  <Select value={form.teacherId} onValueChange={(val) => setForm({ ...form, teacherId: val })}>
                    <SelectTrigger className="h-14 rounded-2xl border-2 border-gray-100 bg-gray-50/30 hover:bg-white transition-all shadow-inner focus:border-rose-600 text-sm font-bold">
                      <SelectValue placeholder="Choose teacher" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl shadow-2xl border-2">
                      {teachers.map(tch => (
                        <SelectItem key={tch._id} value={tch._id} className="h-12 font-bold uppercase">
                          {tch.firstName} {tch.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                className="w-full h-14 bg-rose-600 hover:bg-rose-700 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-rose-100 group transition-all active:scale-95"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <ShieldCheck className="h-5 w-5 mr-3 group-hover:rotate-12 transition-transform" />}
                Authorize Appointment
              </Button>
            </CardContent>
          </Card>

          <Card className="xl:col-span-3 border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-10 bg-gray-900 border-b border-gray-800 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-black text-white uppercase tracking-tighter italic flex items-center gap-3">
                  <LayoutList className="h-6 w-6 text-rose-500" />
                  Leadership Ledger
                </CardTitle>
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">Official Class-Teacher Hierarchy</p>
              </div>
              <div className="relative w-72">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="SEARCH HIERARCHY..."
                  className="h-12 pl-12 rounded-xl bg-white/5 border-white/10 text-white font-black text-xs tracking-widest focus:bg-white/10 transition-all uppercase"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 border-b-2">
                      <TableHead className="p-8 font-black text-gray-400 uppercase tracking-[0.2em] text-[10px]">Academic Unit</TableHead>
                      <TableHead className="p-8 font-black text-gray-400 uppercase tracking-[0.2em] text-[10px]">Appointed Leader</TableHead>
                      <TableHead className="p-8 font-black text-gray-400 uppercase tracking-[0.2em] text-[10px]">Contact Sync</TableHead>
                      <TableHead className="p-8 font-black text-gray-400 uppercase tracking-[0.2em] text-[10px] text-right">Audit Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fetching ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-64 text-center">
                          <Loader2 className="h-10 w-10 animate-spin mx-auto text-rose-600 opacity-20" />
                          <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mt-4">Pulling faculty records...</p>
                        </TableCell>
                      </TableRow>
                    ) : filteredClasses.map((row) => (
                      <TableRow key={row._id} className="hover:bg-rose-50/20 transition-colors border-b last:border-0 group">
                        <TableCell className="p-8 border-r">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-500 font-black text-sm group-hover:bg-rose-600 group-hover:text-white transition-all shadow-sm">
                              {row.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-black text-gray-800 uppercase tracking-tight">{row.name}</p>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Section {row.section}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="p-8">
                          <div className="flex items-center gap-3">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${row.classTeacher ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
                              <UserRound className="h-4 w-4" />
                            </div>
                            <span className={`text-xs font-black uppercase tracking-tight ${row.classTeacher ? 'text-gray-800' : 'text-gray-300 italic'}`}>
                              {row.classTeacher ? `${row.classTeacher.firstName} ${row.classTeacher.lastName}` : "Vacant Position"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="p-8 font-mono text-[10px] font-black text-gray-400 uppercase">
                          {row.classTeacher?.email || "SYSTEM_OFFLINE"}
                        </TableCell>
                        <TableCell className="p-8 text-right">
                          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border-2 text-[9px] font-black uppercase tracking-widest ${row.classTeacher
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                            : 'bg-rose-50 text-rose-600 border-rose-100'
                            }`}>
                            {row.classTeacher ? 'Authorized' : 'Pending'}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
