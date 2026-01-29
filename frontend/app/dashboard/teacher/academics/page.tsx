"use client"

import { API_URL } from "@/lib/api-config"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { StatCard } from "@/components/super-admin/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Users, CheckCircle, Clock, Loader2, Sparkles, GraduationCap, Calendar, ChevronRight } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface ClassItem {
  _id: string;
  name: string;
  section: string;
  studentCount: number;
  attendancePercentage: number;
}

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

export default function TeacherAcademics() {
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [timetable, setTimetable] = useState<DayTimetable[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token")
      const [classesRes, timetableRes] = await Promise.all([
        fetch(`${API_URL}/api/teacher/classes`, { headers: { "Authorization": `Bearer ${token}` } }),
        fetch(`${API_URL}/api/teacher/timetable`, { headers: { "Authorization": `Bearer ${token}` } })
      ])

      const classesData = await classesRes.json()
      const timetableData = await timetableRes.json()

      if (classesData.success) setClasses(classesData.data)
      if (timetableData.success) setTimetable(timetableData.data)
    } catch (err) {
      toast({ title: "Error", description: "Failed to load academic data", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const totalStudents = classes.reduce((sum, cls) => sum + (cls.studentCount || 0), 0)
  const avgAttendance = classes.length > 0
    ? Math.round(classes.reduce((sum, cls) => sum + (cls.attendancePercentage || 0), 0) / classes.length)
    : 0

  if (loading) {
    return (
      <DashboardLayout title="Academics">
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        </div>
      </DashboardLayout>
    )
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
  const todaysSchedule = timetable.find(t => t.day === today)?.periods || []

  return (
    <DashboardLayout title="Academic Command Center">
      <div className="space-y-8 max-w-[1400px] mx-auto pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-4xl font-black text-gray-900 tracking-tight italic">Curriculum Control</h2>
            <p className="text-muted-foreground font-medium italic">Oversee academic growth and instructional efficiency.</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => router.push('/dashboard/teacher/timetable')} variant="outline" className="h-12 px-6 font-black uppercase tracking-widest text-[10px] rounded-xl border-gray-200">
              Full Schedule
            </Button>
            <Button onClick={() => router.push('/dashboard/teacher/lesson-planner')} className="bg-indigo-600 hover:bg-indigo-700 h-12 px-6 font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg shadow-indigo-100">
              Lesson Vault
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard title="Total Students" value={totalStudents.toString()} icon={Users} iconColor="text-indigo-600" iconBgColor="bg-indigo-50" />
          <StatCard title="Active Batches" value={classes.length.toString()} icon={GraduationCap} iconColor="text-emerald-600" iconBgColor="bg-emerald-50" />
          <StatCard title="Lectures Today" value={todaysSchedule.length.toString()} icon={Calendar} iconColor="text-orange-600" iconBgColor="bg-orange-50" />
          <StatCard title="Avg Attendance" value={`${avgAttendance}%`} icon={Clock} iconColor="text-blue-600" iconBgColor="bg-blue-50" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8">
            <Card className="border-none shadow-2xl shadow-indigo-100/30 overflow-hidden ring-1 ring-gray-100">
              <CardHeader className="bg-gray-50/50 border-b py-6">
                <CardTitle className="flex items-center gap-2 font-black text-gray-800 italic uppercase tracking-wider">
                  <div className="p-2 bg-indigo-600 rounded-lg text-white">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  Assigned Teaching Batches
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {classes.length > 0 ? classes.map((cls) => (
                    <div key={cls._id} className="p-6 hover:bg-indigo-50/20 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="space-y-4 flex-1">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <h4 className="text-xl font-black text-gray-900 group-hover:text-indigo-600 transition-colors">Class {cls.name} <span className="text-indigo-600">({cls.section})</span></h4>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Section Portfolio • Enrolled: {cls.studentCount || 0}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-black text-gray-400 uppercase">Attendance Level</p>
                            <p className="text-lg font-black text-indigo-600">{cls.attendancePercentage || 0}%</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-500">
                            <span>Syllabus Completion Index</span>
                            <span className="text-indigo-600">75% (Demo)</span>
                          </div>
                          <Progress value={75} className="h-1.5" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/teacher/student-info?class=${cls._id}`)} className="font-black text-[10px] uppercase tracking-widest text-gray-400 hover:text-indigo-600 hover:bg-indigo-50">Students</Button>
                        <Button size="sm" onClick={() => router.push(`/dashboard/teacher/attendance?class=${cls.name}&section=${cls.section}`)} className="bg-gray-900 hover:bg-black font-black text-[10px] uppercase tracking-widest h-9 px-4 rounded-xl shadow-lg shadow-gray-100">Roll Call</Button>
                      </div>
                    </div>
                  )) : (
                    <div className="p-20 text-center">
                      <p className="text-sm font-black text-gray-300 uppercase tracking-widest italic">No Batches Assigned to your profile.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="border-none shadow-2xl shadow-gray-100/50 ring-1 ring-gray-100 overflow-hidden">
              <CardHeader className="bg-slate-900 text-white border-b py-6 relative">
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Operational Log</p>
                    <CardTitle className="text-lg font-black mt-1">Today's Protocol</CardTitle>
                  </div>
                  <Sparkles className="h-5 w-5 text-indigo-400 opacity-50" />
                </div>
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Clock className="h-24 w-24" />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {todaysSchedule.length > 0 ? todaysSchedule.map((p, i) => (
                    <div key={i} className="p-5 hover:bg-slate-50 transition-colors flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-indigo-50 flex flex-col items-center justify-center flex-shrink-0">
                        <span className="text-[8px] font-black text-indigo-300">P</span>
                        <span className="text-sm font-black text-indigo-600 leading-none">{p.periodNumber}</span>
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-black text-gray-900 italic">{p.subject}</p>
                        <div className="flex items-center gap-2 text-[9px] font-bold text-gray-400 uppercase">
                          <span>{p.startTime} - {p.endTime}</span>
                          <span>•</span>
                          <span className="text-indigo-500">Room {p.room}</span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-200" />
                    </div>
                  )) : (
                    <div className="p-12 text-center">
                      <p className="text-xs font-black text-gray-300 uppercase tracking-widest italic">No Lectures Scheduled Today.</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 p-4">
                <Button variant="ghost" onClick={() => router.push('/dashboard/teacher/timetable')} className="w-full font-black text-[10px] uppercase tracking-widest text-gray-400 hover:text-indigo-600">
                  View Complete Roster
                </Button>
              </CardFooter>
            </Card>

            <Card className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white border-none shadow-xl shadow-indigo-100 p-6 overflow-hidden relative">
              <div className="relative z-10 space-y-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Insight Pulse</p>
                  <p className="text-lg font-black italic">Curriculum Velocity</p>
                </div>
                <div className="flex items-end justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium opacity-80 italic italic">Target Completion</p>
                    <p className="text-3xl font-black">92%</p>
                  </div>
                  <div className="h-12 w-24 bg-white/10 rounded-lg flex items-center justify-center">
                    <p className="text-[10px] font-black opacity-60">+4.2%</p>
                  </div>
                </div>
              </div>
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <GraduationCap className="h-32 w-32" />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

