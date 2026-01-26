"use client"

import { API_URL } from "@/lib/api-config"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { StatCard } from "@/components/super-admin/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Calendar, FileText, CheckCircle, TrendingUp, Loader2, Clock, MapPin, Search, ChevronRight, Sparkles, Target, Activity } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface Exam {
  _id: string;
  examName: string;
  class: string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  totalMarks: number;
}

export default function TeacherExaminations() {
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchExams()
  }, [])

  const fetchExams = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/api/teacher/exams`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      const result = await response.json()
      if (result.success) {
        setExams(result.data)
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to load examination schedule", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const upcomingExams = exams.filter(e => new Date(e.date) >= new Date())
  const pastExams = exams.filter(e => new Date(e.date) < new Date())

  if (loading) {
    return (
      <DashboardLayout title="Examinations">
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Academic Assessment">
      <div className="space-y-8 max-w-[1400px] mx-auto pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-4xl font-black text-gray-900 tracking-tight italic">Examination Command</h2>
            <p className="text-muted-foreground font-medium">Orchestrate assessments and monitor student performance metrics.</p>
          </div>
          <Button
            onClick={() => router.push('/dashboard/teacher/marks-entry')}
            className="bg-gray-900 hover:bg-black h-12 px-8 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-gray-100 rounded-xl"
          >
            Enter Result Vault
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard title="Total Exams" value={exams.length.toString()} icon={Target} iconColor="text-indigo-600" iconBgColor="bg-indigo-50" />
          <StatCard title="Upcoming" value={upcomingExams.length.toString()} icon={Clock} iconColor="text-blue-600" iconBgColor="bg-blue-50" />
          <StatCard title="Archived" value={pastExams.length.toString()} icon={CheckCircle} iconColor="text-emerald-600" iconBgColor="bg-emerald-50" />
          <StatCard title="Batches" value={Array.from(new Set(exams.map(e => e.class))).length.toString()} icon={TrendingUp} iconColor="text-purple-600" iconBgColor="bg-purple-50" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8">
            <Card className="border-none shadow-2xl shadow-indigo-100/30 overflow-hidden ring-1 ring-gray-100">
              <CardHeader className="bg-gray-50/50 border-b py-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 font-black text-gray-800">
                    <Calendar className="h-5 w-5 text-indigo-600" />
                    Upcoming Assessment Schedule
                  </CardTitle>
                  <Button variant="outline" size="sm" className="h-8 rounded-lg font-black text-[10px] uppercase">Sync Schedule</Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {upcomingExams.length > 0 ? (
                    upcomingExams.map((exam) => (
                      <div key={exam._id} className="p-6 hover:bg-slate-50/50 transition-all group flex items-start justify-between">
                        <div className="space-y-4 flex-1">
                          <div className="space-y-1">
                            <h4 className="text-xl font-black text-gray-900 group-hover:text-indigo-600 transition-colors uppercase italic tracking-tighter">
                              {exam.examName}
                            </h4>
                            <div className="flex items-center gap-3 text-sm font-bold text-muted-foreground">
                              <span className="flex items-center gap-1"><Sparkles className="h-3.5 w-3.5" />{exam.subject}</span>
                              <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-black text-gray-600 uppercase">Class {exam.class}</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-6">
                            <div className="flex items-center gap-2 text-xs font-black uppercase text-gray-400">
                              <Calendar className="h-3.5 w-3.5" />
                              {new Date(exam.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                            <div className="flex items-center gap-2 text-xs font-black uppercase text-gray-400">
                              <Clock className="h-3.5 w-3.5" />
                              {exam.startTime} - {exam.endTime}
                            </div>
                            <div className="flex items-center gap-2 text-xs font-black uppercase text-indigo-500">
                              <Target className="h-3.5 w-3.5" />
                              {exam.totalMarks} Total Points
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={() => router.push(`/dashboard/teacher/marks-entry?exam=${exam._id}`)}
                          className="bg-indigo-600 hover:bg-indigo-700 font-black h-10 px-6 rounded-xl shadow-lg shadow-indigo-100 text-[10px] uppercase"
                        >
                          Configure Marks
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="p-20 text-center">
                      <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 grayscale opacity-50">
                        <Calendar className="h-8 w-8 text-gray-300" />
                      </div>
                      <p className="text-sm font-black text-gray-400 uppercase tracking-widest">No Examinations Pending</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-2xl shadow-gray-100 overflow-hidden ring-1 ring-gray-100">
              <CardHeader className="bg-gray-50/50 border-b py-6">
                <CardTitle className="text-lg font-black text-gray-800 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-gray-400" />
                  Examination Archives
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {pastExams.length > 0 ? (
                    pastExams.map((exam) => (
                      <div key={exam._id} className="p-5 flex items-center justify-between opacity-70 hover:opacity-100 transition-opacity">
                        <div>
                          <p className="font-bold text-gray-900">{exam.examName}</p>
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{exam.subject} • {new Date(exam.date).toLocaleDateString()}</p>
                        </div>
                        <Button variant="ghost" size="sm" className="font-black text-[10px] uppercase text-indigo-400">View Audit</Button>
                      </div>
                    ))
                  ) : (
                    <div className="p-12 text-center text-sm font-medium text-gray-400">Archive repository is empty.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white border-none shadow-2xl shadow-indigo-200 overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform">
                <Activity className="h-32 w-32" />
              </div>
              <CardHeader className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">System Insight</p>
                <CardTitle className="text-2xl font-black mt-2 leading-none">Grading Velocity</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest">
                    <span className="opacity-70">Average Grade Completion</span>
                    <span>84%</span>
                  </div>
                  <Progress value={84} className="h-2 bg-indigo-900/40" />
                </div>
                <div className="pt-4 grid grid-cols-2 gap-4">
                  <div className="bg-white/10 rounded-xl p-3">
                    <p className="text-[10px] font-black opacity-60 uppercase mb-1">Response Time</p>
                    <p className="text-lg font-black">1.2d</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3">
                    <p className="text-[10px] font-black opacity-60 uppercase mb-1">Consistency</p>
                    <p className="text-lg font-black">9.8</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl ring-1 ring-gray-100">
              <CardHeader className="border-b py-5 bg-gray-50/50">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Proctoring Guide</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {[
                  "Verify candidate ID protocols",
                  "Seal digital answer receptacles",
                  "Monitor biometric deviations",
                  "Finalize incident report logs"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[10px] font-black text-indigo-600">
                      {i + 1}
                    </div>
                    <p className="text-xs font-bold text-gray-600 italic leading-relaxed">{item}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

