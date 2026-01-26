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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import {
  CalendarDays,
  Search,
  GraduationCap,
  ArrowRight,
  Users,
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react"
import { API_URL } from "@/lib/api-config"
import { toast } from "sonner"

interface Student {
  _id: string
  studentId: string
  firstName: string
  lastName: string
  rollNumber: string
}

interface ClassItem {
  _id: string
  name: string
  section: string
}

export default function PromoteStudents() {
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [fromClassId, setFromClassId] = useState("")
  const [toClassId, setToClassId] = useState("")
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear().toString())

  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_URL}/api/classes`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (res.ok) {
        const result = await res.json()
        setClasses(result.data || [])
      }
    } catch (error) {
      toast.error("Failed to fetch classes")
    }
  }

  const fetchStudents = async () => {
    if (!fromClassId) {
      toast.error("Please select a source class")
      return
    }

    try {
      setFetching(true)
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_URL}/api/classes/${fromClassId}/students`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (res.ok) {
        const result = await res.json()
        setStudents(result.data || [])
        setSelectedStudentIds([]) // Reset selection
      }
    } catch (error) {
      toast.error("Failed to fetch students")
    } finally {
      setFetching(false)
    }
  }

  const handlePromote = async () => {
    if (!fromClassId || !toClassId) {
      toast.error("Source and destination classes are required")
      return
    }
    if (selectedStudentIds.length === 0) {
      toast.error("No students selected for promotion")
      return
    }

    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_URL}/api/classes/promote`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fromClassId,
          toClassId,
          studentIds: selectedStudentIds,
          academicYear
        })
      })

      if (res.ok) {
        const result = await res.json()
        toast.success(result.message || "Students promoted successfully")
        fetchStudents() // Refresh list
      } else {
        const err = await res.json()
        toast.error(err.error || "Promotion failed")
      }
    } catch (error) {
      toast.error("Network error during promotion")
    } finally {
      setLoading(false)
    }
  }

  const toggleSelectAll = () => {
    if (selectedStudentIds.length === students.length) {
      setSelectedStudentIds([])
    } else {
      setSelectedStudentIds(students.map(s => s._id))
    }
  }

  const toggleSelectStudent = (id: string) => {
    setSelectedStudentIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  return (
    <DashboardLayout title="Promote Students">
      <div className="space-y-6 max-w-full pb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Student Promotion</h1>
            <p className="text-sm text-gray-500 italic">Batch migrate students to the next academic level</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold border border-indigo-100 uppercase tracking-wider">
            <GraduationCap className="h-4 w-4" />
            Academics / Promotion
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 border-gray-200 shadow-sm rounded-2xl h-fit">
            <CardHeader className="bg-gray-50 border-b p-6">
              <CardTitle className="text-base flex items-center gap-2">
                <Search className="h-4 w-4 text-indigo-600" />
                Select Criteria
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-700 uppercase">Promote From *</Label>
                <Select value={fromClassId} onValueChange={setFromClassId}>
                  <SelectTrigger className="h-11 font-medium">
                    <SelectValue placeholder="Select Source Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map(c => (
                      <SelectItem key={c._id} value={c._id}>{c.name} - {c.section}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-700 uppercase">Promote To *</Label>
                <Select value={toClassId} onValueChange={setToClassId}>
                  <SelectTrigger className="h-11 font-medium">
                    <SelectValue placeholder="Select Target Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map(c => (
                      <SelectItem key={c._id} value={c._id}>{c.name} - {c.section}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-700 uppercase">Target Academic Year *</Label>
                <Select value={academicYear} onValueChange={setAcademicYear}>
                  <SelectTrigger className="h-11 font-medium">
                    <SelectValue placeholder="Academic Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {[2024, 2025, 2026].map(year => (
                      <SelectItem key={year} value={year.toString()}>{year}-{year + 1}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={fetchStudents}
                className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 font-bold"
                disabled={fetching}
              >
                {fetching ? <Loader2 className="animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                Find Students
              </Button>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 border-gray-200 shadow-xl rounded-2xl overflow-hidden min-h-[400px]">
            <CardHeader className="p-6 border-b flex flex-row items-center justify-between bg-gray-50/50">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Users className="h-5 w-5 text-indigo-600" />
                  Student List
                  <span className="text-xs font-normal text-gray-500 ml-2">({selectedStudentIds.length} selected)</span>
                </CardTitle>
              </div>
              <Button
                onClick={handlePromote}
                disabled={loading || selectedStudentIds.length === 0}
                className="bg-emerald-600 hover:bg-emerald-700 h-10 px-6 font-bold flex gap-2"
              >
                {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                Authorize Promotion
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {fetching ? (
                <div className="h-64 flex flex-col items-center justify-center text-gray-400">
                  <Loader2 className="h-8 w-8 animate-spin mb-4" />
                  <p className="text-xs font-bold uppercase tracking-widest">Searching records...</p>
                </div>
              ) : students.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-100 hover:bg-gray-100">
                        <TableHead className="w-12 text-center p-4">
                          <Checkbox
                            checked={students.length > 0 && selectedStudentIds.length === students.length}
                            onCheckedChange={toggleSelectAll}
                            className="h-5 w-5"
                          />
                        </TableHead>
                        <TableHead className="p-4 font-bold text-gray-600">ID / Roll</TableHead>
                        <TableHead className="p-4 font-bold text-gray-600">Student Name</TableHead>
                        <TableHead className="p-4 font-bold text-gray-600 text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => (
                        <TableRow key={student._id} className="hover:bg-indigo-50/30 transition-colors border-b last:border-0 cursor-pointer" onClick={() => toggleSelectStudent(student._id)}>
                          <TableCell className="text-center p-4" onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={selectedStudentIds.includes(student._id)}
                              onCheckedChange={() => toggleSelectStudent(student._id)}
                              className="h-5 w-5"
                            />
                          </TableCell>
                          <TableCell className="p-4 font-mono text-xs font-bold">
                            {student.studentId} <span className="text-gray-400 ml-2">#{student.rollNumber}</span>
                          </TableCell>
                          <TableCell className="p-4 font-bold uppercase text-gray-800">
                            {student.firstName} {student.lastName}
                          </TableCell>
                          <TableCell className="p-4 text-right">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold border border-blue-100">
                              <AlertCircle className="h-3 w-3" />
                              Ready
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-gray-400 p-10 text-center">
                  <Users className="h-12 w-12 opacity-10 mb-4" />
                  <p className="text-sm font-bold text-gray-300">No student records found for the selected criteria</p>
                  <p className="text-[10px] uppercase tracking-widest mt-1">Select class and click search</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
