"use client"

import { useMemo, useState, useEffect, useCallback } from "react"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CalendarDays, Search, Loader2, Plus, Pencil, Trash2, Clock, MapPin, User, BookOpen } from "lucide-react"
import { API_URL } from "@/lib/api-config"
import { toast } from "sonner"

interface ClassItem {
  _id: string
  name: string
  section: string
}

interface Teacher {
  _id: string
  firstName: string
  lastName: string
}

interface Subject {
  _id: string
  name: string
  code: string
}

interface Period {
  periodNumber: number
  startTime: string
  endTime: string
  subject: any
  teacher: any
  _id?: string
}

interface DaySchedule {
  dayOfWeek: string
  periods: Period[]
  academicYear?: string
}

export default function ClassTimeTable() {
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])

  const [selectedClassId, setSelectedClassId] = useState<string>("")
  const [timetable, setTimetable] = useState<DaySchedule[]>([])
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPeriod, setEditingPeriod] = useState<{
    day: string,
    periodNum: number,
    data: any
  } | null>(null)

  const [periodForm, setPeriodForm] = useState({
    subjectId: "",
    teacherId: "",
    startTime: "08:00",
    endTime: "09:00"
  })

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const periodNumbers = [1, 2, 3, 4, 5, 6, 7, 8]

  // Fetch Initial Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token")
        const headers = { "Authorization": `Bearer ${token}` }

        const [classesRes, teachersRes, subjectsRes] = await Promise.all([
          fetch(`${API_URL}/api/classes`, { headers }),
          fetch(`${API_URL}/api/teachers`, { headers }),
          fetch(`${API_URL}/api/subjects`, { headers })
        ])

        const classesData = await classesRes.json()
        const teachersData = await teachersRes.json()
        const subjectsData = await subjectsRes.json()

        if (classesRes.ok) setClasses(Array.isArray(classesData) ? classesData : classesData.data || [])
        if (teachersRes.ok) setTeachers(Array.isArray(teachersData) ? teachersData : teachersData.data || [])
        if (subjectsRes.ok) setSubjects(Array.isArray(subjectsData) ? subjectsData : subjectsData.data || [])

      } catch (error) {
        console.error("Failed to fetch initial data", error)
        toast.error("Failed to load environment data")
      }
    }
    fetchData()
  }, [])

  const handleSearch = async () => {
    if (!selectedClassId) {
      toast.error("Please select a class")
      return
    }

    try {
      setSearching(true)
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_URL}/api/timetable/class/${selectedClassId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      })

      const data = await res.json()
      if (data.success) {
        setTimetable(data.data)
      } else {
        toast.error(data.error || "Failed to fetch timetable")
      }
    } catch (error) {
      console.error(error)
      toast.error("Error searching timetable")
    } finally {
      setSearching(false)
    }
  }

  const openAddModal = (day: string, periodNum: number, existing?: any) => {
    setEditingPeriod({ day, periodNum, data: existing })
    if (existing) {
      setPeriodForm({
        subjectId: existing.subject?._id || existing.subject || "",
        teacherId: existing.teacher?._id || existing.teacher || "",
        startTime: existing.startTime || "08:00",
        endTime: existing.endTime || "09:00"
      })
    } else {
      setPeriodForm({
        subjectId: "",
        teacherId: "",
        startTime: "08:00",
        endTime: "09:00"
      })
    }
    setIsModalOpen(true)
  }

  const handleSavePeriod = async () => {
    if (!periodForm.subjectId || !periodForm.teacherId) {
      toast.error("Please select subject and teacher")
      return
    }

    if (!editingPeriod) return

    try {
      setLoading(true)
      const token = localStorage.getItem("token")

      // Get existing periods for this day
      const daySchedule = timetable.find(t => t.dayOfWeek === editingPeriod.day)
      let periods = daySchedule ? [...daySchedule.periods] : []

      // Update or Add
      const pIdx = periods.findIndex(p => p.periodNumber === editingPeriod.periodNum)
      const newPeriodData = {
        periodNumber: editingPeriod.periodNum,
        subject: periodForm.subjectId,
        teacher: periodForm.teacherId,
        startTime: periodForm.startTime,
        endTime: periodForm.endTime
      }

      if (pIdx > -1) {
        periods[pIdx] = newPeriodData
      } else {
        periods.push(newPeriodData)
      }

      const res = await fetch(`${API_URL}/api/timetable`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          classId: selectedClassId,
          dayOfWeek: editingPeriod.day,
          periods,
          academicYear: "2023-24" // Static for now
        })
      })

      const data = await res.json()
      if (data.success) {
        toast.success("Timetable updated")
        handleSearch() // Refresh
        setIsModalOpen(false)
      } else {
        toast.error(data.error || "Failed to save")
      }
    } catch (error) {
      console.error(error)
      toast.error("Error saving period")
    } finally {
      setLoading(false)
    }
  }

  const handleRemovePeriod = async (day: string, periodNum: number) => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const daySchedule = timetable.find(t => t.dayOfWeek === day)
      if (!daySchedule) return

      const periods = daySchedule.periods.filter(p => p.periodNumber !== periodNum)

      const res = await fetch(`${API_URL}/api/timetable`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          classId: selectedClassId,
          dayOfWeek: day,
          periods,
          academicYear: "2023-24"
        })
      })

      if (res.ok) {
        toast.success("Period removed")
        handleSearch()
      }
    } catch (error) {
      toast.error("Delete failed")
    } finally {
      setLoading(false)
    }
  }

  const getPeriod = (day: string, periodNum: number) => {
    const daySchedule = timetable.find(t => t.dayOfWeek === day)
    return daySchedule?.periods.find(p => p.periodNumber === periodNum)
  }

  return (
    <DashboardLayout title="Class Time Table">
      <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-800 tracking-tighter uppercase italic">Timetable Designer</h1>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Academics / Class Schedule Management</p>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border">
            <CalendarDays className="h-4 w-4 text-pink-600" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Session 2023-24</span>
          </div>
        </div>

        <Card className="border-none shadow-xl rounded-3xl overflow-hidden overflow-hidden">
          <CardHeader className="bg-pink-600 p-6 border-none">
            <CardTitle className="text-lg flex items-center gap-3 text-white font-black uppercase tracking-tight">
              <Search className="h-5 w-5" />
              Configuration Selector
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
              <div className="md:col-span-3 space-y-3">
                <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Target Class & Section</Label>
                <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                  <SelectTrigger className="h-14 rounded-2xl border-2 border-gray-100 bg-gray-50/50 hover:bg-white transition-all shadow-inner focus:border-pink-600">
                    <SelectValue placeholder="Select high-level class" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl shadow-2xl border-2">
                    {classes.map((cls) => (
                      <SelectItem key={cls._id} value={cls._id} className="h-12 font-bold font-bold">
                        {cls.name} (Section {cls.section})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                size="lg"
                className="bg-pink-600 hover:bg-pink-700 h-14 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-pink-200"
                onClick={handleSearch}
                disabled={searching}
              >
                {searching ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Search className="h-5 w-5 mr-3" />}
                Pull Schedule
              </Button>
            </div>
          </CardContent>
        </Card>

        {selectedClassId && (
          <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
            <CardHeader className="p-8 bg-gray-900 border-b border-gray-800 flex flex-row items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-2xl font-black text-white uppercase tracking-tighter">Academic Blueprint</CardTitle>
                <p className="text-pink-400 text-[10px] font-black uppercase tracking-widest">
                  {classes.find(c => c._id === selectedClassId)?.name} - {classes.find(c => c._id === selectedClassId)?.section} | Active Load
                </p>
              </div>
              <div className="bg-white/10 px-6 py-2 rounded-2xl border border-white/5">
                <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">Admin Control Active</span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b-2">
                      <th className="p-10 text-left font-black text-gray-400 uppercase tracking-[0.2em] text-[10px] w-48 sticky left-0 bg-gray-50 z-10 border-r">Week Day</th>
                      {periodNumbers.map(num => (
                        <th key={num} className="p-10 text-center font-black text-gray-400 uppercase tracking-[0.2em] text-[10px] min-w-[200px]">
                          Period {num}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {days.map(day => (
                      <tr key={day} className="border-b border-gray-50 group">
                        <td className="p-10 font-black text-gray-800 bg-gray-50/10 uppercase tracking-tight text-sm sticky left-0 z-10 border-r bg-white group-hover:bg-pink-50 transition-colors">{day}</td>
                        {periodNumbers.map(num => {
                          const period = getPeriod(day, num)
                          return (
                            <td key={num} className="p-4 text-center align-middle group/cell border-r last:border-r-0">
                              {period ? (
                                <div className="relative bg-white border-2 border-gray-100 rounded-3xl p-5 shadow-sm group-hover/cell:border-pink-500 group-hover/cell:shadow-xl group-hover/cell:-translate-y-1 transition-all duration-300">
                                  <div className="space-y-3">
                                    <div className="h-8 w-8 bg-pink-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                                      <BookOpen className="h-4 w-4 text-pink-600" />
                                    </div>
                                    <div className="font-black text-gray-800 text-xs uppercase tracking-tight truncate px-2">
                                      {subjects.find(s => s._id === (period.subject?._id || period.subject))?.name || "Subject N/A"}
                                    </div>
                                    <div className="flex items-center justify-center gap-1.5 text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                                      <User className="h-3 w-3" />
                                      {teachers.find(t => t._id === (period.teacher?._id || period.teacher))?.firstName || "Teacher"}
                                    </div>
                                    <div className="flex items-center justify-center gap-1.5 text-[8px] font-black text-pink-600/60 font-mono">
                                      <Clock className="h-2.5 w-2.5" /> {period.startTime} - {period.endTime}
                                    </div>
                                  </div>

                                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover/cell:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-pink-50 text-gray-400 hover:text-pink-600" onClick={() => openAddModal(day, num, period)}>
                                      <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-rose-50 text-gray-400 hover:text-rose-600" onClick={() => handleRemovePeriod(day, num)}>
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <Button
                                  variant="ghost"
                                  className="h-32 w-full rounded-3xl border-2 border-dashed border-gray-200 hover:border-pink-400 hover:bg-pink-50/30 group/btn transition-all flex flex-col items-center justify-center gap-2"
                                  onClick={() => openAddModal(day, num)}
                                >
                                  <Plus className="h-6 w-6 text-gray-300 group-hover/btn:scale-125 transition-transform" />
                                  <span className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] group-hover/btn:text-pink-600">Assign Slot</span>
                                </Button>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[450px] rounded-[2rem] border-t-[8px] border-t-pink-600 p-8 shadow-2xl overflow-hidden">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black uppercase tracking-tighter italic flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-pink-600" />
                </div>
                Period Configuration
              </DialogTitle>
              <DialogDescription className="font-bold text-gray-400 uppercase text-[10px] tracking-widest mt-2">
                Drafting slot for {editingPeriod?.day} | Period {editingPeriod?.periodNum}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-8 py-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Assigned Subject</Label>
                  <Select value={periodForm.subjectId} onValueChange={(val) => setPeriodForm({ ...periodForm, subjectId: val })}>
                    <SelectTrigger className="h-14 rounded-2xl bg-gray-50 border-none shadow-inner focus:ring-2 ring-pink-600">
                      <SelectValue placeholder="Select high-level subject" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-2">
                      {subjects.map(sub => (
                        <SelectItem key={sub._id} value={sub._id} className="h-12 font-bold uppercase text-xs">
                          {sub.name} ({sub.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Assigned Teacher</Label>
                  <Select value={periodForm.teacherId} onValueChange={(val) => setPeriodForm({ ...periodForm, teacherId: val })}>
                    <SelectTrigger className="h-14 rounded-2xl bg-gray-50 border-none shadow-inner focus:ring-2 ring-pink-600">
                      <SelectValue placeholder="Select faculty member" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-2">
                      {teachers.map(tch => (
                        <SelectItem key={tch._id} value={tch._id} className="h-12 font-bold uppercase text-xs">
                          {tch.firstName} {tch.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Start Time</Label>
                    <Input
                      type="time"
                      value={periodForm.startTime}
                      onChange={e => setPeriodForm({ ...periodForm, startTime: e.target.value })}
                      className="h-14 rounded-2xl bg-gray-50 border-none shadow-inner text-lg font-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">End Time</Label>
                    <Input
                      type="time"
                      value={periodForm.endTime}
                      onChange={e => setPeriodForm({ ...periodForm, endTime: e.target.value })}
                      className="h-14 rounded-2xl bg-gray-50 border-none shadow-inner text-lg font-black"
                    />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" onClick={() => setIsModalOpen(false)} className="h-14 flex-1 rounded-2xl font-black uppercase text-xs tracking-widest">
                Discard
              </Button>
              <Button onClick={handleSavePeriod} disabled={loading} className="h-14 flex-1 rounded-2xl bg-pink-600 hover:bg-pink-700 font-black uppercase text-xs tracking-widest shadow-xl">
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Authorize Slot"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
