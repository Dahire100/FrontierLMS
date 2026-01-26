"use client"

import { API_URL } from "@/lib/api-config"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  CheckSquare,
  Users,
  Calendar,
  Save,
  Search,
  Loader2,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ClipboardList
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  rollNumber: string;
}

interface AttendanceRecord {
  studentId: string;
  status: 'present' | 'absent' | 'late' | 'half_day';
}

export default function MarkAttendance() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [classes, setClasses] = useState<any[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [saving, setSaving] = useState(false)

  const [filters, setFilters] = useState({
    classId: "",
    section: "",
    date: new Date().toISOString().split('T')[0]
  })

  const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent' | 'late' | 'half_day'>>({})

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/api/teacher/classes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        setClasses(data.data)
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to load classes", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const loadStudents = async () => {
    if (!filters.classId) {
      toast({ title: "Incomplete Selection", description: "Please select a class first", variant: "destructive" })
      return
    }

    setLoadingStudents(true)
    try {
      const token = localStorage.getItem('token')
      const [studentRes, attendanceRes] = await Promise.all([
        fetch(`${API_URL}/api/teacher/classes/${filters.classId}/students`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/api/teacher/attendance?date=${filters.date}&className=${classes.find(c => c._id === filters.classId)?.name}&section=${classes.find(c => c._id === filters.classId)?.section}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ])

      const studentData = await studentRes.json()
      const attendanceData = await attendanceRes.json()

      if (studentData.success) {
        setStudents(studentData.data.students)

        // Initialize attendance state
        const initialAttendance: any = {}
        studentData.data.students.forEach((s: Student) => {
          const existing = attendanceData.data?.find((a: any) => a.studentId === s._id)
          initialAttendance[s._id] = existing ? existing.status : 'present'
        })
        setAttendance(initialAttendance)
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to load student roster", variant: "destructive" })
    } finally {
      setLoadingStudents(false)
    }
  }

  const handleStatusChange = (studentId: string, status: any) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }))
  }

  const saveAttendance = async () => {
    setSaving(true)
    try {
      const token = localStorage.getItem('token')
      const selectedClass = classes.find(c => c._id === filters.classId)

      const attendanceData = Object.entries(attendance).map(([studentId, status]) => ({
        studentId,
        status
      }))

      const res = await fetch(`${API_URL}/api/teacher/attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          date: filters.date,
          className: selectedClass?.name,
          section: selectedClass?.section,
          attendanceData
        })
      })

      const data = await res.json()
      if (data.success) {
        toast({
          title: "Attendance Saved",
          description: `Roster for ${selectedClass?.name}-${selectedClass?.section} updated successfully.`,
          className: "bg-emerald-50 border-emerald-200 text-emerald-800"
        })
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to save attendance", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout title="Mark Attendance">
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Presence Registry">
      <div className="space-y-8 max-w-[1400px] mx-auto pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Attendance Governance</h2>
            <p className="text-muted-foreground font-medium">Capture daily pupil presence and synchronize with institutional records.</p>
          </div>
        </div>

        <Card className="border-none shadow-2xl shadow-indigo-100/40 bg-white ring-1 ring-gray-100 rounded-2xl overflow-hidden">
          <CardHeader className="bg-gray-50/50 border-b py-6">
            <CardTitle className="flex items-center gap-2 text-gray-800 font-black tracking-tight">
              <ClipboardList className="h-5 w-5 text-indigo-600" />
              Cohort Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8 px-8 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="space-y-3">
                <Label className="font-black text-[10px] uppercase tracking-widest text-gray-400">Target Academic Batch</Label>
                <Select onValueChange={(v) => setFilters({ ...filters, classId: v })}>
                  <SelectTrigger className="h-12 rounded-xl border-gray-200 bg-white focus:ring-4 focus:ring-indigo-100 transition-all font-bold">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map(c => (
                      <SelectItem key={c._id} value={c._id} className="font-medium">Class {c.name}-{c.section}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="font-black text-[10px] uppercase tracking-widest text-gray-400">Institutional Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3.5 h-5 w-5 text-gray-300 pointer-events-none" />
                  <Input
                    type="date"
                    value={filters.date}
                    onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                    className="h-12 pl-10 rounded-xl border-gray-200 bg-white focus:ring-4 focus:ring-indigo-100 transition-all font-bold"
                  />
                </div>
              </div>

              <div className="md:col-span-2 flex items-end">
                <Button
                  onClick={loadStudents}
                  disabled={loadingStudents}
                  className="bg-indigo-600 hover:bg-indigo-700 h-12 px-10 rounded-xl font-black shadow-lg shadow-indigo-100 transition-all active:scale-95 w-full md:w-auto"
                >
                  {loadingStudents ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Users className="h-5 w-5 mr-2" />}
                  Synchronize Roster
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {students.length > 0 && (
          <Card className="border-none shadow-2xl shadow-indigo-100/30 overflow-hidden ring-1 ring-gray-100 rounded-2xl">
            <CardHeader className="bg-white border-b py-6 px-8 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black text-gray-800 tracking-tight">Roster Management</CardTitle>
                <CardDescription className="font-medium">Batch {classes.find(c => c._id === filters.classId)?.name}-{classes.find(c => c._id === filters.classId)?.section} • {new Date(filters.date).toLocaleDateString(undefined, { dateStyle: 'long' })}</CardDescription>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Live Recording</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                      <TableHead className="w-[100px] font-black text-[10px] uppercase tracking-widest text-gray-500 pl-8 h-14">Roll No</TableHead>
                      <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-500 h-14">Learner Identity</TableHead>
                      <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-500 text-center h-14">Registry Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student._id} className="hover:bg-indigo-50/30 transition-colors group">
                        <TableCell className="font-black text-gray-400 pl-8">{student.rollNumber || '-'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center font-black text-indigo-600 text-xs border border-indigo-100 group-hover:scale-110 transition-transform">
                              {student.firstName[0]}{student.lastName[0]}
                            </div>
                            <span className="font-black text-gray-800 uppercase tracking-tight">{student.firstName} {student.lastName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-2">
                            <Button
                              variant={attendance[student._id] === 'present' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handleStatusChange(student._id, 'present')}
                              className={`rounded-lg h-9 px-4 font-black text-[10px] uppercase tracking-widest transition-all ${attendance[student._id] === 'present'
                                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-100'
                                  : 'hover:bg-emerald-50 text-emerald-600 border-emerald-100'
                                }`}
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1.5" /> Present
                            </Button>
                            <Button
                              variant={attendance[student._id] === 'absent' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handleStatusChange(student._id, 'absent')}
                              className={`rounded-lg h-9 px-4 font-black text-[10px] uppercase tracking-widest transition-all ${attendance[student._id] === 'absent'
                                  ? 'bg-red-600 hover:bg-red-700 shadow-md shadow-red-100'
                                  : 'hover:bg-red-50 text-red-600 border-red-100'
                                }`}
                            >
                              <XCircle className="h-3 w-3 mr-1.5" /> Absent
                            </Button>
                            <Button
                              variant={attendance[student._id] === 'late' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handleStatusChange(student._id, 'late')}
                              className={`rounded-lg h-9 px-4 font-black text-[10px] uppercase tracking-widest transition-all ${attendance[student._id] === 'late'
                                  ? 'bg-amber-600 hover:bg-amber-700 shadow-md shadow-amber-100'
                                  : 'hover:bg-amber-50 text-amber-600 border-amber-100'
                                }`}
                            >
                              Late
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex justify-end p-8 bg-gray-50/50 border-t items-center gap-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  {Object.values(attendance).filter(v => v === 'present').length} Present • {Object.values(attendance).filter(v => v === 'absent').length} Absent
                </p>
                <Button
                  onClick={saveAttendance}
                  disabled={saving}
                  className="bg-indigo-600 hover:bg-indigo-700 h-14 px-12 rounded-xl font-black shadow-xl shadow-indigo-100 transition-all active:scale-95"
                >
                  {saving ? <Loader2 className="h-6 w-6 animate-spin mr-2" /> : <Save className="h-6 w-6 mr-2" />}
                  Commit Registry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}


