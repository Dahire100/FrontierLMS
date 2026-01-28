"use client"

import { API_URL } from "@/lib/api-config"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { StatCard } from "@/components/super-admin/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Calendar, CheckCircle, XCircle, Clock, TrendingUp, Users, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

export default function ParentAttendance() {
  const [selectedChild, setSelectedChild] = useState<string>("")
  const [children, setChildren] = useState<any[]>([])
  const [attendanceData, setAttendanceData] = useState<any>(null)
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
          setSelectedChild(data.data.children[0]._id) // Default to first child
        }
      } catch (error) {
        console.error("Failed to fetch children", error)
      } finally {
        setLoading(false)
      }
    }
    fetchChildren()
  }, [])

  // Fetch attendance when selected child changes
  useEffect(() => {
    if (!selectedChild) return

    const fetchAttendance = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`${API_URL}/api/parent/child/${selectedChild}/attendance`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await res.json()

        if (data.success) {
          const stats = data.data.statistics
          const records = data.data.records.slice(0, 5) // Last 5 days for "recent"

          setAttendanceData({
            totalDays: stats.total,
            present: stats.present,
            absent: stats.absent,
            // API doesn't separate "late", so assume 0 or derived from remarks if needed. 
            // For now we just map 'present' status.
            late: 0,
            percentage: stats.percentage,
            recent: records.map((r: any) => ({
              date: r.date,
              status: r.status === 'present' ? 'Present' : (r.status === 'absent' ? 'Absent' : 'Late'),
              time: r.status === 'present' ? '08:00 AM' : '-' // Placeholder time as API might not return exact time yet
            }))
          })
        }
      } catch (error) {
        console.error("Failed to fetch attendance", error)
        toast.error("Failed to load attendance")
      }
    }
    fetchAttendance()
  }, [selectedChild])

  const currentData = attendanceData || {
    totalDays: 0, present: 0, absent: 0, late: 0, percentage: 0, recent: []
  }

  const handleViewReport = () => {
    const childName = children.find(c => c._id === selectedChild)?.firstName || "Child"
    toast.info("Downloading Full Attendance Report", { description: `Generating PDF report for ${childName}` })
  }

  const getSelectedChildName = () => {
    const child = children.find(c => c._id === selectedChild)
    return child ? `${child.firstName} ${child.lastName}` : "Loading..."
  }

  return (
    <DashboardLayout title="Attendance">
      <div className="space-y-6 animate-in fade-in-50 duration-500">
        {/* Header with Child Selector */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Attendance Tracking
            </h2>
            <p className="text-muted-foreground mt-1">
              Monitor attendance and punctuality for {getSelectedChildName()}
            </p>
          </div>

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
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Days"
            value={currentData.totalDays.toString()}
            icon={Calendar}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
          />
          <StatCard
            title="Present"
            value={currentData.present.toString()}
            icon={CheckCircle}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
          />
          <StatCard
            title="Absent"
            value={currentData.absent.toString()}
            icon={XCircle}
            iconColor="text-red-600"
            iconBgColor="bg-red-100"
          />
          <StatCard
            title="Late Arrivals"
            value={currentData.late.toString()}
            icon={Clock}
            iconColor="text-orange-600"
            iconBgColor="bg-orange-100"
          />
        </div>

        {/* Attendance Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Attendance Overview
              </CardTitle>
              <CardDescription>Overall academic year performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Attendance Rate</span>
                  <span className={`text-2xl font-bold ${currentData.percentage >= 90 ? 'text-green-600' : 'text-orange-500'}`}>
                    {currentData.percentage}%
                  </span>
                </div>
                <Progress value={currentData.percentage} className={`h-3 ${currentData.percentage >= 90 ? 'bg-green-100' : 'bg-orange-100'}`} />
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center p-3 rounded-lg bg-green-50">
                  <p className="text-2xl font-bold text-green-600">{currentData.present}</p>
                  <p className="text-xs font-semibold text-green-700">Present</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-red-50">
                  <p className="text-2xl font-bold text-red-600">{currentData.absent}</p>
                  <p className="text-xs font-semibold text-red-700">Absent</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-orange-50">
                  <p className="text-2xl font-bold text-orange-600">{currentData.late}</p>
                  <p className="text-xs font-semibold text-orange-700">Late</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Attendance */}
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                Recent History
              </CardTitle>
              <CardDescription>Last 5 school days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentData.recent.map((record: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${record.status === "Present" ? "bg-green-100" :
                        record.status === "Absent" ? "bg-red-100" : "bg-orange-100"
                        }`}>
                        {record.status === "Present" ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : record.status === "Absent" ? (
                          <XCircle className="h-4 w-4 text-red-600" />
                        ) : (
                          <Clock className="h-4 w-4 text-orange-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{new Date(record.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                        <p className="text-xs text-muted-foreground">{record.time !== "-" ? `Check-in: ${record.time}` : "Not checked in"}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-md text-xs font-semibold ${record.status === "Present" ? "bg-green-100 text-green-700" :
                      record.status === "Absent" ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"
                      }`}>
                      {record.status}
                    </span>
                  </div>
                ))}
              </div>
              <Button
                className="w-full mt-4 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
                onClick={handleViewReport}
              >
                Download Full Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
