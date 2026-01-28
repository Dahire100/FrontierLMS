"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CalendarDays, Search, Loader2, User, Clock, BookOpen, GraduationCap, MapPin } from "lucide-react"
import { API_URL } from "@/lib/api-config"
import { toast } from "sonner"

interface Teacher {
  _id: string
  firstName: string
  lastName: string
}

interface Period {
  periodNumber: number
  startTime: string
  endTime: string
  subject: {
    _id: string
    name: string
  }
  teacher: string
}

interface DaySchedule {
  dayOfWeek: string
  periods: Period[]
  classId: {
    _id: string
    name: string
    section: string
  }
}

export default function TeacherTimetable() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("")
  const [schedule, setSchedule] = useState<DaySchedule[]>([])
  const [fetching, setFetching] = useState(false)
  const [searching, setSearching] = useState(false)

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const periodNumbers = [1, 2, 3, 4, 5, 6, 7, 8]

  useEffect(() => {
    fetchTeachers()
  }, [])

  const fetchTeachers = async () => {
    try {
      setFetching(true)
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_URL}/api/teachers`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      const data = await res.json()
      setTeachers(Array.isArray(data) ? data : data.data || [])
    } catch (error) {
      toast.error("Failed to load faculty")
    } finally {
      setFetching(false)
    }
  }

  const handleSearch = async () => {
    if (!selectedTeacherId) {
      toast.error("Please select a faculty member")
      return
    }

    try {
      setSearching(true)
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_URL}/api/timetable/teacher/${selectedTeacherId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        setSchedule(data.data)
      }
    } catch (error) {
      toast.error("Failed to pull schedule")
    } finally {
      setSearching(false)
    }
  }

  const getSlot = (day: string, periodNum: number) => {
    // A teacher might have multiple classes in the same period number (unlikely but possible in raw data)
    // We filter schedule entries for this day that contain this period number
    const daySchedules = schedule.filter(s => s.dayOfWeek === day)
    for (const s of daySchedules) {
      const period = s.periods.find(p => p.periodNumber === periodNum)
      if (period) return { period, class: s.classId }
    }
    return null
  }

  return (
    <DashboardLayout title="Teacher Timetable">
      <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border-l-[6px] border-l-amber-600">
          <div>
            <h1 className="text-2xl font-black text-gray-800 tracking-tighter uppercase italic">Faculty Workload</h1>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Academics / Individual Teacher Schedule</p>
          </div>
          <div className="h-12 w-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 border border-amber-100 shadow-sm animate-pulse">
            <GraduationCap className="h-6 w-6" />
          </div>
        </div>

        <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-amber-600 p-6 text-white">
            <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-3">
              <Search className="h-5 w-5" />
              Faculty Search Criteria
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
              <div className="md:col-span-3 space-y-3">
                <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Assigned Staff Member</Label>
                <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
                  <SelectTrigger className="h-14 rounded-2xl border-2 border-gray-100 bg-gray-50/30 hover:bg-white transition-all shadow-inner focus:border-amber-600 text-sm font-bold">
                    <SelectValue placeholder="Identify faculty personnel" />
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
              <Button
                className="h-14 bg-amber-600 hover:bg-amber-700 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-amber-100 transition-all flex items-center gap-3"
                onClick={handleSearch}
                disabled={searching}
              >
                {searching ? <Loader2 className="animate-spin h-5 w-5" /> : <Search className="h-5 w-5" />}
                Pull Schedule
              </Button>
            </div>
          </CardContent>
        </Card>

        {selectedTeacherId && (
          <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
            <CardHeader className="p-10 bg-gray-900 border-b border-gray-800 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-black text-white uppercase tracking-tighter italic">Teaching Log</CardTitle>
                <p className="text-amber-400 text-[10px] font-black uppercase tracking-widest mt-1">
                  {teachers.find(t => t._id === selectedTeacherId)?.firstName} {teachers.find(t => t._id === selectedTeacherId)?.lastName} | Weekly Commitments
                </p>
              </div>
              <div className="bg-white/10 px-5 py-2 rounded-xl border border-white/5 flex items-center gap-3">
                <Clock className="h-4 w-4 text-amber-500" />
                <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">Active session 2023-24</span>
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
                        <td className="p-10 font-black text-gray-800 bg-gray-50/10 uppercase tracking-tight text-sm sticky left-0 z-10 border-r bg-white group-hover:bg-amber-50 transition-colors">{day}</td>
                        {periodNumbers.map(num => {
                          const slot = getSlot(day, num)
                          return (
                            <td key={num} className="p-4 text-center align-middle border-r last:border-r-0 group/cell">
                              {slot ? (
                                <div className="bg-white border-2 border-gray-100 rounded-3xl p-6 shadow-sm group-hover/cell:border-amber-500 group-hover/cell:shadow-xl group-hover/cell:-translate-y-1 transition-all duration-300">
                                  <div className="space-y-3">
                                    <div className="h-10 w-10 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                      <BookOpen className="h-5 w-5 text-amber-600" />
                                    </div>
                                    <div className="font-black text-gray-800 text-sm uppercase tracking-tight truncate">
                                      {slot.period.subject?.name || "Subject"}
                                    </div>
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
                                      <MapPin className="h-3 w-3 text-gray-500" />
                                      <span className="text-[10px] font-black text-gray-600 uppercase tracking-tighter">
                                        {slot.class?.name}-{slot.class?.section}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-center gap-1.5 text-[10px] font-black text-amber-600 font-mono mt-2">
                                      <Clock className="h-3 w-3" /> {slot.period.startTime} - {slot.period.endTime}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="h-32 flex flex-col items-center justify-center gap-2 opacity-10">
                                  <Clock className="h-6 w-6" />
                                  <span className="text-[9px] font-black uppercase tracking-widest">No Assignment</span>
                                </div>
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
      </div>
    </DashboardLayout>
  )
}
