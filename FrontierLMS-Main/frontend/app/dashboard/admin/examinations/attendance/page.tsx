"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Save, CalendarCheck, Filter, UserCheck, UserX, Loader2 } from "lucide-react"
import { API_URL } from "@/lib/api-config"
import { useToast } from "@/components/ui/use-toast"

export default function ExaminationAttendance() {
  const [showResult, setShowResult] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [students, setStudents] = useState<any[]>([])
  const [filters, setFilters] = useState({
    examName: "",
    class: "",
    section: "",
    subject: "" // Maybe exams are subject specific? Assuming general attendance for exam date
  })
  // For simplicity, we just use Class/Section/Date as per backend controller. 
  // Wait, the page is "Examination Attendance". Does it differ from regular attendance?
  // Usually Exam Attendance is specific to an exam (subject/paper). 
  // But the provided backend 'attendanceController' seems to be daily attendance.
  // 'examsController' doesn't seem to have 'markAttendance' specific to exam, but 'addResult'.
  // However, usually schools track "Present/Absent" for exam separately.
  // If this page is strictly "Attendance for Exam", maybe we should just use the daily attendance or a new field?
  // Given the backend status, I will use the general attendance controller but scoped to the exam date. 
  // User context implies "Examination Attendance". 

  // Actually, let's look at the UI. It asks for Exam, Class, Section.
  // If I select "Mid Term", it implies a date range or specific paper.
  // If I use the existing 'attendance' controller, it is date-based.
  // I will assume for now we just mark attendance for the date of the exam.
  // But wait, an exam might have multiple dates.

  // Let's check if 'exam-schedule' gives us dates. It does.
  // For now, I'll add a Date picker to the filters so they can mark attendance for that specific exam day.

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const { toast } = useToast()

  const handleSearch = async () => {
    if (!filters.class || !date) {
      toast({ title: "Error", description: "Class and Date are required", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const query = new URLSearchParams({
        class: filters.class,
        date: date,
        ...(filters.section && { section: filters.section })
      })

      const response = await fetch(`${API_URL}/api/attendance/class?${query}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        // Backend returns: _id, studentId, firstName, lastName, status (present/absent/etc), attendanceMarked
        // Map to our table format
        const mappedData = data.map((s: any) => ({
          studentId: s.studentId, // ID for DB
          rollNo: s.rollNo,
          name: `${s.firstName} ${s.lastName}`,
          present: s.status === 'present' || s.status === undefined, // Default to present if not marked
          status: s.status,
          attendanceMarked: s.attendanceMarked
        }))
        setStudents(mappedData)
        setShowResult(true)
      } else {
        toast({ title: "Error", description: "Failed to fetch student list", variant: "destructive" })
      }
    } catch (error) {
      console.error(error)
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleAttendanceChange = (index: number, checked: boolean) => {
    const newStudents = [...students]
    newStudents[index].present = checked
    setStudents(newStudents)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const token = localStorage.getItem('token')
      const attendanceRecords = students.map(s => ({
        studentId: s.studentId, // Assumes backend needs the Mongo ID which is safe
        status: s.present ? 'present' : 'absent',
        remarks: ''
      }))

      const payload = {
        date,
        class: filters.class,
        section: filters.section,
        attendanceRecords
      }

      const response = await fetch(`${API_URL}/api/attendance/mark`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        toast({ title: "Success", description: "Attendance saved successfully" })
      } else {
        const err = await response.json()
        toast({ title: "Error", description: err.error || "Failed to save", variant: "destructive" })
      }
    } catch (error) {
      console.error(error)
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  const stats = {
    present: students.filter(s => s.present).length,
    absent: students.filter(s => !s.present).length
  }

  return (
    <DashboardLayout title="Attendance">
      <div className="space-y-6 animate-in fade-in duration-500">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Exam Attendance</h2>
          <p className="text-muted-foreground mt-1">Mark and manage student attendance for examinations.</p>
        </div>

        <Card className="border-gray-100 shadow-md bg-white/50 backdrop-blur-sm">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
            <CardTitle className="text-lg font-medium flex items-center gap-2 text-gray-800">
              <Filter className="h-5 w-5 text-blue-600" />
              Select Criteria
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Exam <span className="text-red-500">*</span></Label>
                <Select onValueChange={(val) => setFilters({ ...filters, examName: val })}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="Select Exam" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mid">Mid Term</SelectItem>
                    <SelectItem value="final">Final Exam</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Class <span className="text-red-500">*</span></Label>
                <Select onValueChange={(val) => setFilters({ ...filters, class: val })}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Class 1</SelectItem>
                    <SelectItem value="2">Class 2</SelectItem>
                    <SelectItem value="10">Class 10</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Section</Label>
                <Select onValueChange={(val) => setFilters({ ...filters, section: val })}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="Select Section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Section A</SelectItem>
                    <SelectItem value="B">Section B</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Date <span className="text-red-500">*</span></Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-white border-gray-200"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={handleSearch} disabled={loading} className="bg-blue-600 hover:bg-blue-700 shadow-sm px-8">
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {showResult && (
          <Card className="border-gray-100 shadow-md bg-white overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-blue-600" />
                Student Attendance List
              </CardTitle>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <UserCheck className="w-4 h-4 text-green-600" />
                  <span>Present: {stats.present}</span>
                </div>
                <div className="flex items-center gap-1">
                  <UserX className="w-4 h-4 text-red-600" />
                  <span>Absent: {stats.absent}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="w-[100px] font-semibold">Roll No.</TableHead>
                      <TableHead className="font-semibold">Student Name</TableHead>
                      <TableHead className="w-[150px] font-semibold text-center">Attendance</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student, index) => (
                      <TableRow key={student.studentId} className="hover:bg-gray-50/50">
                        <TableCell className="font-medium text-gray-600">{student.rollNo}</TableCell>
                        <TableCell className="font-medium text-gray-900">{student.name}</TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={student.present}
                            onCheckedChange={(checked) => handleAttendanceChange(index, checked as boolean)}
                            className="data-[state=checked]:bg-blue-600"
                          />
                        </TableCell>
                        <TableCell>
                          {student.present ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Present</span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">Absent</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="p-4 border-t border-gray-100 bg-gray-50/30 flex justify-end">
                <Button onClick={handleSave} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700 shadow-sm px-8">
                  {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Attendance
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
