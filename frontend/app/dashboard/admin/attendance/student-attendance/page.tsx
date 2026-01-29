"use client"

import { API_URL } from "@/lib/api-config"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CalendarDays, Search, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function StudentAttendance() {
  const { toast } = useToast()
  const [classes, setClasses] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState({
    classId: "",
    status: "all",
    date: new Date().toISOString().slice(0, 10)
  })

  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_URL}/api/classes`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      const result = await res.json()
      const list = Array.isArray(result)
        ? result
        : (result?.data && Array.isArray(result.data) ? result.data : [])

      if (Array.isArray(list)) {
        setClasses(list)
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to load classes", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!filters.classId) {
      toast({ title: "Required", description: "Please select a class", variant: "destructive" })
      return
    }

    setSearching(true)
    setHasSearched(false)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_URL}/api/attendance?classId=${filters.classId}&date=${filters.date}`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      const result = await res.json()
      const list = Array.isArray(result)
        ? result
        : (result?.data && Array.isArray(result.data) ? result.data : null)

      if (Array.isArray(list)) {
        // Filter client-side based on status
        const filteredData = filters.status === 'all'
          ? list
          : list.filter((s: any) =>
            filters.status === 'absent' ? (s.status === 'absent' || !s.status) : s.status === filters.status
          )

        setStudents(filteredData)
        setSearchQuery("")
        toast({ title: "Success", description: `Found ${filteredData.length} students` })
      } else {
        setStudents([])
        toast({ title: "No Data", description: "Failed to fetch attendance records", variant: "destructive" })
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to fetch attendance", variant: "destructive" })
    } finally {
      setHasSearched(true)
      setSearching(false)
    }
  }

  const getStatusBadge = (status: string | null) => {
    if (!status) return <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-bold">NOT MARKED</span>

    const styles = {
      'present': 'bg-green-100 text-green-700',
      'absent': 'bg-red-100 text-red-700',
      'late': 'bg-yellow-100 text-yellow-700',
      'half_day': 'bg-blue-100 text-blue-700'
    }[status] || 'bg-gray-100 text-gray-700'

    return <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${styles}`}>{status}</span>
  }

  return (
    <DashboardLayout title="Student Attendance">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-end text-sm text-gray-500">
          <span className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            <span className="text-blue-900">Attendance</span>
            <span>/</span>
            <span>Student Attendance</span>
          </span>
        </div>

        <Card>
          <CardHeader className="bg-pink-50 border-b border-pink-100">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                <Search className="h-5 w-5" />
                Select Criteria
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-red-500">Class *</Label>
                <Select value={filters.classId} onValueChange={(v) => setFilters({ ...filters, classId: v })}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls._id} value={cls._id}>
                        Class {cls.name}-{cls.section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Attendance Date</Label>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    type="date"
                    value={filters.date}
                    onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                    className="bg-white border-gray-200 pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v })}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="present">Present</SelectItem>
                    <SelectItem value="absent">Absent</SelectItem>
                    <SelectItem value="late">Late</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleSearch}
                disabled={searching || loading}
                className="bg-blue-900 hover:bg-blue-800"
              >
                {searching ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {searching && (
          <Card className="border-0 shadow-sm ring-1 ring-gray-200 overflow-hidden">
            <div className="flex items-center gap-3 p-4 border-b bg-gray-50/50">
              <Loader2 className="h-4 w-4 animate-spin text-slate-600" />
              <div className="text-sm text-gray-700">Loading attendance…</div>
            </div>
          </Card>
        )}

        {!searching && students.length === 0 && (
          <Card className="border-0 shadow-sm ring-1 ring-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="text-sm font-semibold text-gray-900">
                {hasSearched ? "No records found" : "Search attendance"}
              </div>
              <div className="mt-1 text-sm text-gray-600">
                {hasSearched
                  ? "Try a different class/date/status and search again."
                  : "Select criteria above and click Search."}
              </div>
            </div>
          </Card>
        )}

        {!searching && students.length > 0 && (
          <Card>
            <CardHeader className="bg-pink-50 border-b border-pink-100">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <CardTitle className="text-lg text-gray-800">Attendance List</CardTitle>

                <div className="relative w-full md:max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search student"
                    className="bg-white border-gray-200 pl-9"
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              <div className="mb-4 flex flex-wrap gap-2">
                {(() => {
                  const counts = { present: 0, absent: 0, late: 0, half_day: 0, not_marked: 0 }
                  students.forEach((s: any) => {
                    const status = s.status || 'not_marked'
                    if (status in counts) {
                      ;(counts as any)[status] += 1
                    } else {
                      counts.not_marked += 1
                    }
                  })
                  return (
                    <>
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">PRESENT: {counts.present}</span>
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold">ABSENT: {counts.absent}</span>
                      <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-bold">LATE: {counts.late}</span>
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-bold">HALF DAY: {counts.half_day}</span>
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-bold">NOT MARKED: {counts.not_marked}</span>
                    </>
                  )
                })()}
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-pink-50 hover:bg-pink-50">
                      <TableHead className="font-bold text-gray-700 uppercase">Roll No</TableHead>
                      <TableHead className="font-bold text-gray-700 uppercase">Name</TableHead>
                      <TableHead className="font-bold text-gray-700 uppercase">Date</TableHead>
                      <TableHead className="font-bold text-gray-700 uppercase text-center">Status</TableHead>
                      <TableHead className="font-bold text-gray-700 uppercase">Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students
                      .filter((student) => {
                        const q = searchQuery.trim().toLowerCase()
                        if (!q) return true
                        const fullName = `${student.firstName || ""} ${student.lastName || ""}`.trim().toLowerCase()
                        const roll = `${student.rollNumber || student.rollNo || ""}`.toLowerCase()
                        const sid = `${student.studentId || ""}`.toLowerCase()
                        return fullName.includes(q) || roll.includes(q) || sid.includes(q)
                      })
                      .map((student) => (
                        <TableRow key={student._id}>
                          <TableCell>{student.rollNumber || student.rollNo || "N/A"}</TableCell>
                          <TableCell className="font-medium">
                            {student.firstName} {student.lastName}
                          </TableCell>
                          <TableCell>{new Date(filters.date).toLocaleDateString()}</TableCell>
                          <TableCell className="text-center">
                            {getStatusBadge(student.status)}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {student.remarks || "-"}
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
