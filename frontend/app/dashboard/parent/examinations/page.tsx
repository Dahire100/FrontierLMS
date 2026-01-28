"use client"

import { API_URL } from "@/lib/api-config"
import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { StatCard } from "@/components/super-admin/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Calendar, BookOpen, Award, Clock, TrendingUp, Users, ChevronDown, Download } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import Link from "next/link"

export default function ParentExaminations() {
  const [selectedChild, setSelectedChild] = useState<string>("")
  const [children, setChildren] = useState<any[]>([])
  const [upcoming, setUpcoming] = useState<any[]>([])
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch children on mount
  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`${API_URL}/api/parent/dashboard`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await res.json()
        if (data.success && data.data.children.length > 0) {
          setChildren(data.data.children)
          setSelectedChild(data.data.children[0]._id)
        } else {
          setLoading(false)
        }
      } catch (error) {
        console.error("Failed to fetch children", error)
        setLoading(false)
      }
    }
    fetchChildren()
  }, [])

  // Fetch exam data when selected child changes
  useEffect(() => {
    if (!selectedChild) return

    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token')
        const headers = { 'Authorization': `Bearer ${token}` }

        // Fetch Schedule
        const scheduleRes = await fetch(`${API_URL}/api/parent/child/${selectedChild}/exam-schedule`, { headers })
        const scheduleData = await scheduleRes.json()
        if (scheduleData.success) {
          // Process schedule
          const processedSchedule = scheduleData.data.map((exam: any) => {
            const examDate = new Date(exam.date)
            const today = new Date()
            const diffTime = Math.abs(examDate.getTime() - today.getTime())
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

            return {
              id: exam._id,
              subject: exam.subject,
              date: exam.date,
              time: exam.startTime,
              duration: "3h", // Placeholder or calculate from start/end
              syllabus: exam.syllabus || "Full Syllabus",
              daysLeft: diffDays
            }
          })
          setUpcoming(processedSchedule)
        }

        // Fetch Results
        const resultsRes = await fetch(`${API_URL}/api/parent/child/${selectedChild}/results`, { headers })
        const resultsData = await resultsRes.json()
        if (resultsData.success) {
          // Process results
          const processedResults = resultsData.data.map((result: any) => {
            const total = result.examId?.totalMarks || 100
            const marks = result.marksObtained || 0
            return {
              id: result._id,
              subject: result.examId?.subject || result.examId?.examName || "Unknown",
              marks: marks,
              total: total,
              grade: result.grade,
              percentage: result.percentage || (total > 0 ? (marks / total * 100) : 0)
            }
          })
          setResults(processedResults)
        }

      } catch (error) {
        console.error("Failed to fetch exam data", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [selectedChild])


  const getSelectedChildName = () => {
    const child = children.find(c => c._id === selectedChild)
    return child ? `${child.firstName} ${child.lastName}` : "Loading..."
  }

  // Calculate stats
  const averagePercentage = results.length > 0
    ? results.reduce((sum, r) => sum + r.percentage, 0) / results.length
    : 0

  if (loading) {
    return (
      <DashboardLayout title="Examinations">
        <div className="flex h-screen items-center justify-center">Loading...</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Examinations">
      <div className="space-y-6 animate-in fade-in-50 duration-500">
        {/* Header with Child Selector */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Examinations
            </h2>
            <p className="text-muted-foreground mt-1">
              Track schedules and results for {getSelectedChildName()}
            </p>
          </div>

          {children.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="min-w-[180px] justify-between shadow-sm">
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    {getSelectedChildName()}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                {children.map(child => (
                  <DropdownMenuItem key={child._id} onClick={() => setSelectedChild(child._id)}>
                    {child.firstName} {child.lastName}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Upcoming Exams"
            value={upcoming.length.toString()}
            icon={Calendar}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
          />
          <StatCard
            title="Average Score"
            value={`${Math.round(averagePercentage)}%`}
            icon={TrendingUp}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
          />
          <StatCard
            title="Subjects Graded"
            value={results.length.toString()}
            icon={BookOpen}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-100"
          />
          <StatCard
            title="Next Exam In"
            value={upcoming.length > 0 ? `${upcoming[0].daysLeft} days` : "-"}
            icon={Clock}
            iconColor="text-orange-600"
            iconBgColor="bg-orange-100"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Upcoming Exams */}
          <Card className="border-none shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    Upcoming Exams
                  </CardTitle>
                  <CardDescription>Scheduled examinations</CardDescription>
                </div>
                <Link href="/dashboard/parent/exam-schedule">
                  <Button variant="ghost" size="icon" title="View Full Schedule">
                    <Calendar className="h-4 w-4 text-gray-500" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcoming.length > 0 ? upcoming.slice(0, 3).map((exam) => (
                  <div key={exam.id} className="group p-4 border rounded-xl hover:shadow-md transition-all bg-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                    <div className="flex items-start justify-between mb-2">
                      <div className="pl-2">
                        <p className="font-bold text-gray-800">{exam.subject}</p>
                        <p className="text-xs text-muted-foreground">{exam.syllabus}</p>
                      </div>
                      <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full font-medium border border-blue-100">
                        {exam.daysLeft} days left
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 pl-2 mt-3">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(exam.date).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {exam.time}</span>
                      <span className="col-span-2 flex items-center gap-1">⏳ Duration: {exam.duration}</span>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-muted-foreground">No upcoming exams.</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Results */}
          <Card className="border-none shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-purple-600" />
                    Recent Results
                  </CardTitle>
                  <CardDescription>Latest performance</CardDescription>
                </div>
                {/* Could add download here if supported */}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.slice(0, 5).map((result, index) => (
                  <div key={index} className="space-y-2 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700">{result.subject}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-green-600">{result.grade || "N/A"}</span>
                        <span className="text-sm text-muted-foreground font-medium">{result.marks}/{result.total}</span>
                      </div>
                    </div>
                    <Progress value={result.percentage} className="h-2" />
                  </div>
                ))}
                {results.length === 0 && <div className="text-center py-8 text-muted-foreground">No results found.</div>}

                {results.length > 0 && (
                  <div className="pt-4 border-t mt-2">
                    <div className="flex items-center justify-between bg-green-50 p-4 rounded-lg">
                      <span className="text-sm font-medium text-green-800">Overall Average</span>
                      <span className="text-2xl font-bold text-green-700">{Math.round(averagePercentage)}%</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Placeholders for Download Actions */}
        </div>
      </div>
    </DashboardLayout>
  )
}
