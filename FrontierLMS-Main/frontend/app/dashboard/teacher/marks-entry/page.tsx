"use client"

import { API_URL } from "@/lib/api-config"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import {
  ClipboardList,
  Search,
  Loader2,
  CheckCircle,
  AlertCircle,
  Save,
  BookMarked,
  Users,
  ChevronRight,
  Calculator,
  History
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface Exam {
  _id: string;
  examName: string;
  subject: string;
  totalMarks: number;
}

interface StudentResult {
  studentId: string;
  rollNumber: string;
  firstName: string;
  lastName: string;
  marksObtained: string;
  remarks: string;
}

interface ClassItem {
  _id: string;
  name: string;
  section: string;
}

export default function MarksEntry() {
  const [exams, setExams] = useState<Exam[]>([])
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [selectedClassId, setSelectedClassId] = useState("")
  const [selectedExamId, setSelectedExamId] = useState("")
  const [students, setStudents] = useState<StudentResult[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      const token = localStorage.getItem("token")
      const [classRes, examRes] = await Promise.all([
        fetch(`${API_URL}/api/teacher/classes`, {
          headers: { "Authorization": `Bearer ${token}` }
        }),
        fetch(`${API_URL}/api/teacher/exams`, {
          headers: { "Authorization": `Bearer ${token}` }
        })
      ])

      const classData = await classRes.json()
      const examData = await examRes.json()

      if (classData.success) setClasses(classData.data)
      if (examData.success) setExams(examData.data)
    } finally {
      setLoading(false)
    }
  }

  const loadStudentsAndResults = async () => {
    if (!selectedClassId || !selectedExamId) {
      toast({ title: "Validation Error", description: "Please select both Class and Exam", variant: "destructive" })
      return
    }

    setLoadingStudents(true)
    try {
      const token = localStorage.getItem("token")
      const [studentsRes, resultsRes] = await Promise.all([
        fetch(`${API_URL}/api/teacher/classes/${selectedClassId}/students`, {
          headers: { "Authorization": `Bearer ${token}` }
        }),
        fetch(`${API_URL}/api/teacher/exams/${selectedExamId}/results`, {
          headers: { "Authorization": `Bearer ${token}` }
        })
      ])

      const studentsData = await studentsRes.json()
      const resultsData = await resultsRes.json()

      if (studentsData.success) {
        const mapped = studentsData.data.students.map((s: any) => {
          const result = resultsData.data?.find((r: any) => r.studentId === s._id)
          return {
            studentId: s._id,
            rollNumber: s.rollNumber,
            firstName: s.firstName,
            lastName: s.lastName,
            marksObtained: result ? result.marksObtained.toString() : "",
            remarks: result ? result.remarks || "" : ""
          }
        })
        setStudents(mapped)
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to load student roster", variant: "destructive" })
    } finally {
      setLoadingStudents(false)
    }
  }

  const handleMarksChange = (studentId: string, val: string) => {
    setStudents(students.map(s => s.studentId === studentId ? { ...s, marksObtained: val } : s))
  }

  const handleRemarksChange = (studentId: string, val: string) => {
    setStudents(students.map(s => s.studentId === studentId ? { ...s, remarks: val } : s))
  }

  const handleSaveMarks = async () => {
    setSaving(true)
    try {
      const token = localStorage.getItem("token")
      const resultsToSave = students.map(s => ({
        studentId: s.studentId,
        marksObtained: parseFloat(s.marksObtained) || 0,
        remarks: s.remarks
      }))

      const res = await fetch(`${API_URL}/api/teacher/exams/results/bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          examId: selectedExamId,
          results: resultsToSave
        })
      })

      const data = await res.json()
      if (data.success) {
        toast({
          title: "Marks Archived",
          description: "Student performance data has been synchronized successfully.",
          className: "bg-emerald-50 text-emerald-800 border-emerald-200"
        })
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to save academic records", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout title="Academic Registry">
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        </div>
      </DashboardLayout>
    )
  }

  const currentExam = exams.find(e => e._id === selectedExamId)
  const currentClass = classes.find(c => c._id === selectedClassId)

  return (
    <DashboardLayout title="Performance Portal">
      <div className="space-y-8 max-w-[1500px] mx-auto pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Academic Evaluator</h2>
            <p className="text-muted-foreground font-medium">Capture and audit student assessment metrics across institutional terms.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="h-12 px-6 font-black rounded-xl border-none bg-white shadow-xl shadow-indigo-100/50">
              <History className="h-4 w-4 mr-2" /> History
            </Button>
          </div>
        </div>

        <Card className="border-none shadow-2xl shadow-indigo-100/40 bg-white ring-1 ring-gray-100 rounded-2xl overflow-hidden">
          <CardHeader className="bg-gray-50/50 border-b py-6 px-8">
            <CardTitle className="text-gray-800 font-black tracking-tight text-lg flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-indigo-600" /> Assessment Context
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8 px-8 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
              <div className="space-y-3">
                <Label className="font-black text-[10px] uppercase tracking-widest text-gray-400">Target Examination</Label>
                <Select value={selectedExamId} onValueChange={setSelectedExamId}>
                  <SelectTrigger className="h-12 rounded-xl border-gray-200 bg-white focus:ring-4 focus:ring-indigo-100 transition-all font-bold">
                    <SelectValue placeholder="Choose an Exam" />
                  </SelectTrigger>
                  <SelectContent>
                    {exams.map(e => (
                      <SelectItem key={e._id} value={e._id} className="font-medium">{e.examName} ({e.subject})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label className="font-black text-[10px] uppercase tracking-widest text-gray-400">Target Cohort</Label>
                <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                  <SelectTrigger className="h-12 rounded-xl border-gray-200 bg-white focus:ring-4 focus:ring-indigo-100 transition-all font-bold">
                    <SelectValue placeholder="Choose Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map(c => (
                      <SelectItem key={c._id} value={c._id} className="font-medium">Class {c.name}-{c.section}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={loadStudentsAndResults}
                disabled={loadingStudents || !selectedClassId || !selectedExamId}
                className="h-12 bg-indigo-600 hover:bg-indigo-700 font-black uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-95"
              >
                {loadingStudents ? <Loader2 className="animate-spin h-5 w-5 mr-3" /> : <Search className="h-5 w-5 mr-3" />}
                Sync Evaluator
              </Button>
            </div>
          </CardContent>
        </Card>

        {students.length > 0 && (
          <Card className="border-none shadow-2xl shadow-indigo-100/30 overflow-hidden ring-1 ring-gray-100 bg-white rounded-2xl">
            <CardHeader className="border-b py-8 px-8 bg-white">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-black text-2xl text-gray-900 tracking-tight">Evaluative Marksheet</h3>
                    <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 font-black h-7 px-4 rounded-lg">
                      {currentExam?.subject} Evaluator
                    </Badge>
                  </div>
                  <p className="text-muted-foreground font-medium italic">Max Score Capability: <span className="text-indigo-600 font-black">{currentExam?.totalMarks} pts</span></p>
                </div>
                <div className="flex items-center gap-8 p-6 bg-gray-50/50 rounded-2xl border border-gray-100">
                  <div className="text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Roster Size</p>
                    <p className="text-2xl font-black text-indigo-600">{students.length}</p>
                  </div>
                  <div className="w-[1px] h-10 bg-gray-200"></div>
                  <div className="text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Audit Status</p>
                    <p className="text-2xl font-black text-emerald-600">{students.filter(s => s.marksObtained !== "").length}</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50 hover:bg-gray-50/50 border-b">
                      <TableHead className="w-32 font-black text-[10px] uppercase tracking-widest text-gray-500 pl-8 h-16">Roll Index</TableHead>
                      <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-500 h-16">Candidate Identity</TableHead>
                      <TableHead className="w-48 font-black text-[10px] uppercase tracking-widest text-gray-500 text-center h-16">Acquired Score</TableHead>
                      <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-500 h-16 pr-8">Qualitative Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((row) => (
                      <TableRow key={row.studentId} className="group hover:bg-indigo-50/30 transition-all">
                        <TableCell className="pl-8 font-black text-gray-400 group-hover:text-indigo-400">#{row.rollNumber || '???'} </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-black text-indigo-600 text-xs shadow-sm group-hover:scale-110 transition-transform">
                              {row.firstName[0]}{row.lastName[0]}
                            </div>
                            <span className="font-black text-gray-800 uppercase tracking-tight text-sm">{row.firstName} {row.lastName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center flex-col items-center gap-2">
                            <div className="relative w-32">
                              <Input
                                type="number"
                                className="text-center font-black text-lg text-indigo-600 h-12 border-2 focus:ring-4 focus:ring-indigo-50 rounded-xl bg-white shadow-sm transition-all"
                                value={row.marksObtained}
                                onChange={(e) => handleMarksChange(row.studentId, e.target.value)}
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300">/ {currentExam?.totalMarks}</span>
                            </div>
                            {parseFloat(row.marksObtained) > (currentExam?.totalMarks || 0) && (
                              <span className="text-[10px] font-black text-red-500 animate-pulse">Exceeds Maximum</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="pr-8">
                          <Input
                            placeholder="Add evaluator feedback..."
                            className="h-12 border-none bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-50 rounded-xl font-medium transition-all"
                            value={row.remarks}
                            onChange={(e) => handleRemarksChange(row.studentId, e.target.value)}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50/50 p-10 border-t flex flex-col sm:flex-row justify-between items-center gap-8">
              <div className="flex flex-col gap-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Legal Disclaimer</p>
                <p className="text-sm font-bold text-gray-400 max-w-sm leading-relaxed">By committing, you certify these academic metrics are verified and audit-ready.</p>
              </div>
              <div className="flex gap-4 w-full sm:w-auto">
                <Button variant="ghost" className="h-14 px-8 font-black uppercase tracking-widest text-xs text-gray-400">Discard Session</Button>
                <Button
                  className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 h-14 px-12 font-black uppercase tracking-widest text-xs rounded-xl shadow-xl shadow-indigo-100 transition-all active:scale-95"
                  onClick={handleSaveMarks}
                  disabled={saving}
                >
                  {saving ? <Loader2 className="animate-spin h-5 w-5 mr-3" /> : <Save className="h-5 w-5 mr-3" />}
                  Synchronize All
                </Button>
              </div>
            </CardFooter>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}


