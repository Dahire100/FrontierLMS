"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  CalendarDays,
  Search,
  BookOpen,
  User,
  GraduationCap,
  Library,
  Loader2,
  Sparkles,
  BookMarked
} from "lucide-react"
import { API_URL } from "@/lib/api-config"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Student {
  _id: string
  studentId: string
  firstName: string
  lastName: string
  rollNumber: string
  profilePicture?: string
}

interface ClassItem {
  _id: string
  name: string
  section: string
}

interface Subject {
  _id: string
  name: string
  code: string
  type: string
}

export default function StudentSubjects() {
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [selectedClassId, setSelectedClassId] = useState("")
  const [selectedStudentId, setSelectedStudentId] = useState("")
  const [studentSubjects, setStudentSubjects] = useState<Subject[]>([])

  const [loading, setLoading] = useState(false)
  const [fetchingStudents, setFetchingStudents] = useState(false)

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
        const data = await res.json()
        setClasses(data.data || [])
      }
    } catch (error) {
      toast.error("Failed to load classes")
    }
  }

  const handleClassChange = async (classId: string) => {
    setSelectedClassId(classId)
    setSelectedStudentId("")
    setStudentSubjects([])

    if (!classId) return

    try {
      setFetchingStudents(true)
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_URL}/api/classes/${classId}/students`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setStudents(data.data || [])
      }
    } catch (error) {
      toast.error("Failed to load students")
    } finally {
      setFetchingStudents(false)
    }
  }

  const handleSearch = async () => {
    if (!selectedClassId || !selectedStudentId) {
      toast.error("Please select class and student")
      return
    }

    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      // Currently, students inherit subjects from class. So we fetch class subjects.
      // If student specific subjects are implemented later, fetch specific student subjects.
      const res = await fetch(`${API_URL}/api/classes/${selectedClassId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      })

      if (res.ok) {
        const data = await res.json()
        // If class subjects are populated
        if (data.data?.subjects) {
          // data.data.subjects might be IDs or objects depending on backend populate
          // Assuming populate based on previous files: .populate('subjects', 'name code type')
          setStudentSubjects(data.data.subjects)
        } else {
          setStudentSubjects([])
        }
      }
    } catch (error) {
      toast.error("Failed to fetch subjects")
    } finally {
      setLoading(false)
    }
  }

  const selectedStudent = students.find(s => s._id === selectedStudentId)

  return (
    <DashboardLayout title="Student Subjects">
      <div className="space-y-6 max-w-full pb-10">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-8 bg-gradient-to-br from-cyan-900 to-blue-900 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-2 w-2 bg-cyan-400 rounded-full animate-ping" />
              <h1 className="text-3xl font-black tracking-tighter uppercase italic">Academic Portfolio</h1>
            </div>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em] ml-1">Academics / Individual Subject Registry</p>
          </div>
          <BookMarked className="absolute -right-10 -bottom-10 h-64 w-64 text-white/5 rotate-12" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Search Panel */}
          <Card className="lg:col-span-1 border-none shadow-xl rounded-[2rem] overflow-hidden bg-white h-fit">
            <CardHeader className="bg-cyan-600 p-6 text-white border-none">
              <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-3">
                <Search className="h-5 w-5" />
                Record Locator
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Class & Section</Label>
                <Select value={selectedClassId} onValueChange={handleClassChange}>
                  <SelectTrigger className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 hover:bg-white focus:border-cyan-500 font-bold">
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-2 shadow-xl">
                    {classes.map(c => (
                      <SelectItem key={c._id} value={c._id} className="font-bold py-3">{c.name} - {c.section}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Student Profile</Label>
                <Select value={selectedStudentId} onValueChange={setSelectedStudentId} disabled={!selectedClassId || fetchingStudents}>
                  <SelectTrigger className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 hover:bg-white focus:border-cyan-500 font-bold">
                    <SelectValue placeholder={
                      fetchingStudents ? "Loading..." :
                        (selectedClassId && students.length === 0) ? "No Students Found" :
                          "Select Student"
                    } />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-2 shadow-xl">
                    {students.length > 0 ? (
                      students.map(s => (
                        <SelectItem key={s._id} value={s._id} className="font-bold py-3">
                          <div className="flex items-center gap-2">
                            <span>{s.firstName} {s.lastName}</span>
                            <span className="text-gray-400 text-xs text-[10px]">#{s.rollNumber}</span>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                        {selectedClassId ? "No students in this class" : "Select a class first"}
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleSearch}
                disabled={loading || !selectedStudentId}
                className="w-full h-14 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-cyan-200 mt-4"
              >
                {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "Retrieve Portfolio"}
              </Button>
            </CardContent>
          </Card>

          {/* Results Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Student Header Card */}
            {selectedStudent ? (
              <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-gray-100 flex flex-col sm:flex-row items-center gap-6 animate-in slide-in-from-bottom-4 duration-500">
                <Avatar className="h-24 w-24 border-4 border-cyan-100 shadow-md">
                  <AvatarImage src={selectedStudent.profilePicture} />
                  <AvatarFallback className="bg-cyan-600 text-white font-black text-2xl">
                    {selectedStudent.firstName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center sm:text-left space-y-1">
                  <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight">{selectedStudent.firstName} {selectedStudent.lastName}</h2>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                    <span className="bg-cyan-50 text-cyan-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-cyan-100">
                      ID: {selectedStudent.studentId}
                    </span>
                    <span className="bg-gray-50 text-gray-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-gray-100">
                      Roll: {selectedStudent.rollNumber}
                    </span>
                  </div>
                </div>
                <div className="sm:ml-auto">
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Subjects</p>
                    <p className="text-4xl font-black text-cyan-600">{studentSubjects.length}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-[2rem] h-40 flex items-center justify-center border-2 border-dashed border-gray-200 text-gray-400">
                <p className="font-bold text-sm uppercase tracking-widest">Select a student to view details</p>
              </div>
            )}

            {/* Subjects Grid */}
            {studentSubjects.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {studentSubjects.map((subject, index) => (
                  <Card key={subject._id || index} className="border-none shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition-all group cursor-default">
                    <div className="h-2 bg-gradient-to-r from-cyan-400 to-blue-500" />
                    <CardContent className="p-6 flex items-start justify-between">
                      <div>
                        <h3 className="font-black text-gray-800 uppercase tracking-tight text-lg mb-1 group-hover:text-cyan-600 transition-colors">{subject.name}</h3>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-50 inline-block px-2 py-1 rounded">{subject.code}</p>
                      </div>
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${subject.type === 'theory' ? 'bg-indigo-50 text-indigo-600' :
                        subject.type === 'practical' ? 'bg-emerald-50 text-emerald-600' :
                          'bg-orange-50 text-orange-600'
                        }`}>
                        {subject.type === 'theory' && <BookOpen className="h-5 w-5" />}
                        {subject.type === 'practical' && <Sparkles className="h-5 w-5" />}
                        {subject.type === 'both' && <Library className="h-5 w-5" />}
                        {subject.type === 'co-curricular' && <GraduationCap className="h-5 w-5" />}
                      </div>
                    </CardContent>
                    <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                      <span>Type: {subject.type}</span>
                      <span className="text-cyan-600">Active</span>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              selectedStudent && (
                <div className="text-center py-20 bg-white rounded-[2rem] shadow-sm border border-gray-100">
                  <BookOpen className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-400 font-bold uppercase tracking-widest">No subjects assigned</p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
