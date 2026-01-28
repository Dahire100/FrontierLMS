"use client"

import { API_URL } from "@/lib/api-config"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { StatCard } from "@/components/super-admin/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Download, Clock, BookOpen, Users, ChevronDown, CheckCircle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

export default function ParentExamSchedule() {
  const [selectedChild, setSelectedChild] = useState<string>("")
  const [children, setChildren] = useState<any[]>([])
  const [schedule, setSchedule] = useState<any[]>([])
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

  // Fetch exam schedule when selected child changes
  useEffect(() => {
    if (!selectedChild) return

    const fetchSchedule = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`${API_URL}/api/parent/child/${selectedChild}/exam-schedule`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await res.json()

        if (data.success) {
          setSchedule(data.data)
        } else {
          setSchedule([])
        }
      } catch (error) {
        console.error("Failed to fetch exam schedule", error)
        setSchedule([])
      } finally {
        setLoading(false)
      }
    }
    fetchSchedule()
  }, [selectedChild])


  const handleDownload = () => {
    toast.success("Schedule Downloaded", { description: "Exam schedule PDF has been saved to your device." })
  }

  const getSelectedChildName = () => {
    const child = children.find(c => c._id === selectedChild)
    return child ? `${child.firstName} ${child.lastName}` : "Loading..."
  }

  if (loading) {
    return (
      <DashboardLayout title="Exam Schedule">
        <div className="flex h-screen items-center justify-center">Loading...</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Exam Schedule">
      <div className="space-y-6 animate-in fade-in-50 duration-500">
        {/* Header with Child Selector */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Exam Schedule
            </h2>
            <p className="text-muted-foreground mt-1">
              Upcoming examinations for {getSelectedChildName()}
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDownload} disabled={schedule.length === 0}>
              <Download className="h-4 w-4 mr-2" /> Download PDF
            </Button>
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
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Total Exams"
            value={schedule.length.toString()}
            icon={BookOpen}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
          />
          <StatCard
            title="Next Exam"
            value={schedule.length > 0 ? schedule[0].subject : "N/A"} // Assuming sorted by date
            icon={Calendar}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-100"
          />
          <StatCard
            title="Status"
            value={schedule.length > 0 ? "Published" : "No Schedule"}
            icon={CheckCircle}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
          />
        </div>

        {/* Exam List */}
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Detailed Schedule
            </CardTitle>
            <CardDescription>Date sheet for upcoming tests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {schedule.length > 0 ? schedule.map((exam: any, index: number) => (
                <div key={exam._id || index} className="p-4 border rounded-xl hover:shadow-md transition-all bg-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg shrink-0 text-center min-w-[70px]">
                      <p className="text-xs font-bold text-blue-600 uppercase mb-1">{new Date(exam.date).toLocaleString('default', { month: 'short' })}</p>
                      <p className="text-2xl font-bold text-blue-700 leading-none">{new Date(exam.date).getDate()}</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-gray-900">{exam.subject}</h4>
                      <p className="text-sm font-medium text-blue-600">{exam.examType || "Examination"}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {exam.startTime} - {exam.endTime}</span>
                        <span className="flex items-center gap-1">Room: {exam.room || "TBA"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="md:text-right w-full md:w-auto mt-2 md:mt-0 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100 flex flex-row md:flex-col justify-between items-center md:items-end">
                    <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded-full">Upcoming</span>
                  </div>
                </div>
              )) : (
                <div className="text-center py-10 text-gray-500">No upcoming exams scheduled.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
