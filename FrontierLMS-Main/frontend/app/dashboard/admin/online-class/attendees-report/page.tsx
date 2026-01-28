"use client"

import { API_URL } from "@/lib/api-config"
import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { CalendarDays, Search, Loader2, Download, BarChart2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"

export default function OnlineClassAttendeesReport() {
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [classes, setClasses] = useState<any[]>([])
  const [selectedClass, setSelectedClass] = useState<string>("")

  useEffect(() => {
    const fetchClasses = async () => {
      const token = localStorage.getItem("token")
      try {
        const res = await fetch(`${API_URL}/api/classes`, {
          headers: { "Authorization": `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          setClasses(Array.isArray(data) ? data : [])
        }
      } catch (e) {
        console.error(e)
      }
    }
    fetchClasses()
  }, [])

  const generateReport = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      // Fetch online classes, filter by class/section if selected, then aggregate attendance
      // This logic ideally belongs on backend, but we'll do it client side for now as per `online-classes` general endpoint
      const res = await fetch(`${API_URL}/api/online-classes${selectedClass ? `?classId=${selectedClass}` : ''}`, {
        headers: { "Authorization": `Bearer ${token}` }
      })

      if (res.ok) {
        const data = await res.json()
        const onlineClasses = data.data || []

        // Aggregate attendance by student
        const studentAttendance: Record<string, any> = {}

        onlineClasses.forEach((cls: any) => {
          if (cls.attendance && Array.isArray(cls.attendance)) {
            cls.attendance.forEach((att: any) => {
              const studentId = att.studentId?._id || att.studentId
              if (!studentAttendance[studentId]) {
                studentAttendance[studentId] = {
                  studentId: studentId,
                  name: att.studentId?.firstName ? `${att.studentId.firstName} ${att.studentId.lastName}` : "Unknown Student",
                  rollNo: att.studentId?.rollNo || "N/A",
                  totalDuration: 0,
                  classesAttended: 0
                }
              }
              studentAttendance[studentId].classesAttended += 1
              // Parse duration if string "50m" -> 50
              const duration = typeof att.duration === 'string' ? parseInt(att.duration) : (att.duration || 0)
              studentAttendance[studentId].totalDuration += isNaN(duration) ? 0 : duration
            })
          }
        })

        setReports(Object.values(studentAttendance))
        if (Object.values(studentAttendance).length === 0) {
          toast({ title: "No Data", description: "No attendance records found for the selected criteria." })
        }
      }
    } catch (err) {
      console.error(err)
      toast({ title: "Error", description: "Failed to generate report", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout title="Attendees Report">
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Attendees Report</h2>
            <p className="text-muted-foreground mt-1">Generate comprehensive attendance reports for online classes.</p>
          </div>
        </div>

        <Card className="border-gray-100 shadow-md bg-white/50 backdrop-blur-sm">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
            <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
              <Search className="h-5 w-5 text-blue-600" />
              Report Criteria
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Class</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Classes</SelectItem>
                    {classes.map(c => (
                      <SelectItem key={c._id} value={c._id}>{c.name} - {c.section}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Date Range</Label>
                <Input type="date" className="bg-white border-gray-200" />
              </div>

              <div className="flex items-end">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 shadow-sm" onClick={generateReport} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <BarChart2 className="h-4 w-4 mr-2" />}
                  Generate Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {reports.length > 0 && (
          <Card className="border-gray-100 shadow-md bg-white overflow-hidden animate-in slide-in-from-bottom-4">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 flex flex-row justify-between items-center">
              <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-indigo-500" />
                Report Results
              </CardTitle>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" /> Export
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="font-semibold text-gray-700">Student Name</TableHead>
                      <TableHead className="font-semibold text-gray-700">Roll No</TableHead>
                      <TableHead className="font-semibold text-gray-700 text-right">Classes Attended</TableHead>
                      <TableHead className="font-semibold text-gray-700 text-right">Total Duration (min)</TableHead>
                      <TableHead className="font-semibold text-gray-700 text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((row) => (
                      <TableRow key={row.studentId} className="hover:bg-gray-50/50 transition-colors">
                        <TableCell className="font-medium text-gray-900">{row.name}</TableCell>
                        <TableCell>{row.rollNo}</TableCell>
                        <TableCell className="text-right">{row.classesAttended}</TableCell>
                        <TableCell className="text-right">{row.totalDuration}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={row.classesAttended > 0 ? "default" : "destructive"} className={row.classesAttended > 0 ? "bg-green-600" : ""}>
                            {row.classesAttended > 0 ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
