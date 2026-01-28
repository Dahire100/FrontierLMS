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
import { Search, Save, FileSpreadsheet, Download, Filter, Loader2 } from "lucide-react"
import { API_URL } from "@/lib/api-config"
import { useToast } from "@/components/ui/use-toast"

export default function MarksRegister() {
  const [showResult, setShowResult] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [students, setStudents] = useState<any[]>([])

  // Data for dropdowns
  const [exams, setExams] = useState<any[]>([])
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([])

  const [filters, setFilters] = useState({
    examName: "",
    class: "",
    section: "",
    subject: ""
  })

  const [selectedExamId, setSelectedExamId] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchExams()
  }, [])

  const fetchExams = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/exams`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setExams(data)
      }
    } catch (error) {
      console.error(error)
    }
  }

  // Filter subjects based on selected Exam Name and Class
  useEffect(() => {
    if (filters.examName && filters.class) {
      const relevantExams = exams.filter(e =>
        e.examName === filters.examName && e.class === filters.class
      )
      const subjects = Array.from(new Set(relevantExams.map(e => e.subject))) as string[]
      setAvailableSubjects(subjects)
    } else {
      setAvailableSubjects([])
    }
  }, [filters.examName, filters.class, exams])

  const handleSearch = async () => {
    if (!filters.examName || !filters.class || !filters.subject) {
      toast({ title: "Error", description: "Exam, Class and Subject are required", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('token')

      // 1. Find the specific Exam ID
      const targetExam = exams.find(e =>
        e.examName === filters.examName &&
        e.class === filters.class &&
        e.subject === filters.subject
      )

      if (!targetExam) {
        toast({ title: "Error", description: "Exam not defined for this selection", variant: "destructive" })
        setLoading(false)
        return
      }
      setSelectedExamId(targetExam._id || targetExam.id) // handle _id or id depending on backend

      // 2. Fetch Students for Class/Section
      const studentQuery = new URLSearchParams({
        class: filters.class,
        ...(filters.section && { section: filters.section })
      })
      const studentRes = await fetch(`${API_URL}/api/students?${studentQuery}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      // 3. Fetch Existing Results for Exam
      const resultRes = await fetch(`${API_URL}/api/exams/${targetExam._id}/results`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (studentRes.ok) {
        const studentsData = await studentRes.json()
        const resultsData = resultRes.ok ? await resultRes.json() : []

        // Merge Student and Result Data
        // Backend results: { studentId: ID, marksObtained, grade, remarks, ... }
        // We match by studentId

        const mergedData = studentsData.students.map((student: any) => {
          const result = resultsData.find((r: any) =>
            (r.studentId._id || r.studentId) === (student._id || student.id)
          )

          return {
            studentId: student._id || student.id,
            rollNo: student.rollNumber || student.studentId,
            name: `${student.firstName} ${student.lastName}`,
            marks: result ? result.marksObtained : '',
            grade: result ? result.grade : '',
            remarks: result ? result.remarks : ''
          }
        })

        setStudents(mergedData)
        setShowResult(true)
      } else {
        toast({ title: "Error", description: "Failed to fetch data", variant: "destructive" })
      }

    } catch (error) {
      console.error(error)
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (index: number, field: string, value: any) => {
    const newStudents = [...students]
    newStudents[index][field] = value
    setStudents(newStudents)
  }

  const handleSave = async () => {
    if (!selectedExamId) return

    setIsSaving(true)
    try {
      const token = localStorage.getItem('token')

      // Prepare payload
      // Filter out students with empty marks if needed, or send all? 
      // User might want to save partial marks. I will send all where marks are present.

      const resultsToSave = students
        .filter(s => s.marks !== '' && s.marks !== undefined)
        .map(s => ({
          studentId: s.studentId,
          marksObtained: Number(s.marks),
          grade: s.grade,
          remarks: s.remarks
        }))

      if (resultsToSave.length === 0) {
        toast({ title: "Warning", description: "No marks entered to save", variant: "default" })
        setIsSaving(false)
        return
      }

      const response = await fetch(`${API_URL}/api/exams/results/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          examId: selectedExamId,
          results: resultsToSave
        })
      })

      if (response.ok) {
        toast({ title: "Success", description: "Marks saved successfully" })
      } else {
        const error = await response.json()
        toast({ title: "Error", description: error.error || "Failed to save marks", variant: "destructive" })
      }
    } catch (error) {
      console.error(error)
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  // Extract unique Exam Names
  const uniqueExamNames = Array.from(new Set(exams.map(e => e.examName)))

  return (
    <DashboardLayout title="Marks Register">
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Marks Register</h2>
            <p className="text-muted-foreground mt-1">Enter and manage student examination marks.</p>
          </div>
        </div>

        <Card className="border-gray-100 shadow-md bg-white/50 backdrop-blur-sm">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
            <CardTitle className="text-lg font-medium flex items-center gap-2 text-gray-800">
              <Filter className="h-5 w-5 text-blue-600" />
              Select Criteria
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Exam <span className="text-red-500">*</span></Label>
                <Select onValueChange={(val) => setFilters({ ...filters, examName: val, subject: '' })}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="Select Exam" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueExamNames.map((name: string, i) => (
                      <SelectItem key={i} value={name}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Class <span className="text-red-500">*</span></Label>
                <Select onValueChange={(val) => setFilters({ ...filters, class: val, subject: '' })}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Class 1</SelectItem>
                    <SelectItem value="2">Class 2</SelectItem>
                    <SelectItem value="3">Class 3</SelectItem>
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
                    <SelectItem value="C">Section C</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Subject <span className="text-red-500">*</span></Label>
                <Select onValueChange={(val) => setFilters({ ...filters, subject: val })}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="Select Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSubjects.map((sub, i) => (
                      <SelectItem key={i} value={sub}>{sub}</SelectItem>
                    ))}
                    {availableSubjects.length === 0 && <SelectItem value="disabled" disabled>Select Exam & Class first</SelectItem>}
                  </SelectContent>
                </Select>
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
              <CardTitle className="text-lg font-medium">Enter Marks</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="hidden md:flex">
                  <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
                  Import CSV
                </Button>
                <Button variant="outline" size="sm" className="hidden md:flex">
                  <Download className="w-4 h-4 mr-2 text-gray-600" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="w-[100px] font-semibold">Roll No.</TableHead>
                      <TableHead className="font-semibold">Student Name</TableHead>
                      <TableHead className="w-[150px] font-semibold">Marks Obtained</TableHead>
                      <TableHead className="w-[100px] font-semibold">Grade</TableHead>
                      <TableHead className="font-semibold">Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student, index) => (
                      <TableRow key={student.studentId} className="hover:bg-gray-50/50">
                        <TableCell className="font-medium text-gray-600">{student.rollNo}</TableCell>
                        <TableCell className="font-medium text-gray-900">{student.name}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={student.marks}
                            onChange={(e) => handleInputChange(index, 'marks', e.target.value)}
                            className="w-24 border-gray-200 focus:border-blue-500 focus:ring-blue-500 h-9"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={student.grade}
                            onChange={(e) => handleInputChange(index, 'grade', e.target.value)}
                            className="w-20 border-gray-200 focus:border-blue-500 focus:ring-blue-500 h-9"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={student.remarks}
                            onChange={(e) => handleInputChange(index, 'remarks', e.target.value)}
                            className="w-full min-w-[200px] border-gray-200 focus:border-blue-500 focus:ring-blue-500 h-9"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="p-4 border-t border-gray-100 bg-gray-50/30 flex justify-end">
                <Button onClick={handleSave} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700 shadow-sm px-8">
                  {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Marks
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
