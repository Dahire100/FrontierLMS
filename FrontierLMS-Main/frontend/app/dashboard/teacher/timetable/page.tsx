"use client"

import { API_URL } from "@/lib/api-config"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import {
  Calendar,
  Clock,
  MapPin,
  BookOpen,
  Loader2,
  CalendarDays,
  ChevronRight
} from "lucide-react"

interface Period {
  periodNumber: number;
  subject: string;
  startTime: string;
  endTime: string;
  room: string;
  className: string;
  section: string;
}

interface DayTimetable {
  day: string;
  periods: Period[];
}

export default function TeacherTimetable() {
  const [timetable, setTimetable] = useState<DayTimetable[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchTimetable()
  }, [])

  const fetchTimetable = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/api/teacher/timetable`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      const result = await response.json()
      if (result.success) {
        setTimetable(result.data)
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to load timetable", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout title="Timetable">
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Academic Schedule">
      <div className="space-y-8 max-w-[1400px] mx-auto pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Weekly Lecture Roster</h2>
            <p className="text-muted-foreground font-medium">Coordinate your teaching sessions across all assigned batches.</p>
          </div>
          <div className="p-4 bg-white rounded-2xl border shadow-sm flex items-center gap-4">
            <Clock className="h-5 w-5 text-indigo-500" />
            <div>
              <p className="text-[10px] font-black uppercase text-gray-400">Current Session</p>
              <p className="text-sm font-black text-gray-900">2024-2025 Academic Year</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {timetable.map((dayData) => (
            <Card key={dayData.day} className="border-none shadow-2xl shadow-indigo-100/30 overflow-hidden ring-1 ring-gray-100 group transition-all hover:ring-indigo-200">
              <CardHeader className="bg-gray-50/50 border-b py-5 flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-600 rounded-lg text-white group-hover:scale-110 transition-transform">
                    <CalendarDays className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-lg font-black text-gray-800">{dayData.day}</CardTitle>
                </div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-white px-3 py-1 rounded-full border">
                  {dayData.periods.length} Sessions
                </span>
              </CardHeader>
              <CardContent className="p-0">
                {dayData.periods.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {dayData.periods.map((period, idx) => (
                      <div key={idx} className="p-5 flex items-center justify-between hover:bg-indigo-50/20 transition-colors">
                        <div className="flex gap-4">
                          <div className="w-12 h-12 bg-white border-2 border-indigo-100 rounded-xl flex flex-col items-center justify-center shadow-sm">
                            <span className="text-[10px] font-black text-indigo-400 leading-none mb-0.5">P</span>
                            <span className="text-lg font-black text-indigo-600 leading-none">{period.periodNumber}</span>
                          </div>
                          <div className="space-y-0.5">
                            <h4 className="font-black text-gray-900 text-sm leading-tight flex items-center gap-2">
                              {period.subject}
                              <ChevronRight className="h-3 w-3 text-gray-300" />
                              <span className="text-indigo-600">Class {period.className}-{period.section}</span>
                            </h4>
                            <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {period.startTime} - {period.endTime}
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                <span className="font-extrabold text-gray-600">Room: {period.room || 'Not Assigned'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="hidden sm:block">
                          <Button variant="ghost" size="sm" className="font-black text-gray-400 hover:text-indigo-600 hover:bg-indigo-50">
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <p className="text-sm font-black text-gray-300 uppercase tracking-widest">No Lectures Scheduled</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}


