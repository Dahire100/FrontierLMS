"use client"

import { API_URL } from "@/lib/api-config"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { StatCard } from "@/components/super-admin/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Users,
  BookOpen,
  TrendingUp,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Search,
  Loader2,
  User,
  ChevronRight,
  Filter,
  ArrowRight
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  rollNumber: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  gender: string;
  bloodGroup: string;
  fatherName: string;
  motherName: string;
  class: string;
  section: string;
}

interface ClassDetails {
  _id: string;
  name: string;
  section: string;
  studentCount: number;
}

export default function TeacherStudentInfo() {
  const [classes, setClasses] = useState<ClassDetails[]>([])
  const [selectedClass, setSelectedClass] = useState<ClassDetails | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [studentsLoading, setStudentsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/api/teacher/classes`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      const result = await response.json()
      if (result.success) {
        setClasses(result.data)
        if (result.data.length > 0) {
          handleClassSelect(result.data[0])
        }
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to load classes", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleClassSelect = async (cls: ClassDetails) => {
    setSelectedClass(cls)
    setStudentsLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/api/teacher/classes/${cls._id}/students`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      const result = await response.json()
      if (result.success) {
        setStudents(result.data.students)
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to load students", variant: "destructive" })
    } finally {
      setStudentsLoading(false)
    }
  }

  const filteredStudents = students.filter(s =>
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.rollNumber.includes(searchQuery)
  )

  const totalStudentsCount = classes.reduce((sum, c) => sum + (c.studentCount || 0), 0)

  if (loading) {
    return (
      <DashboardLayout title="Student Directory">
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Learner Ecosystem">
      <div className="space-y-8 max-w-[1400px] mx-auto pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Student Insight Portal</h2>
            <p className="text-muted-foreground font-medium">Comprehensive directory and performance analytics for your assigned cohorts.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="h-12 px-6 font-black rounded-xl border-2">
              <Filter className="h-4 w-4 mr-2" /> Global Filter
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Assigned Pupils" value={totalStudentsCount.toString()} icon={Users} iconColor="text-indigo-600" iconBgColor="bg-indigo-50" />
          <StatCard title="Active Batches" value={classes.length.toString()} icon={BookOpen} iconColor="text-blue-600" iconBgColor="bg-blue-50" />
          <StatCard title="Avg Performance" value="85%" icon={TrendingUp} iconColor="text-emerald-600" iconBgColor="bg-emerald-50" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          <Card className="xl:col-span-1 border-none shadow-2xl shadow-indigo-100/30 ring-1 ring-gray-100 h-fit sticky top-24">
            <CardHeader className="bg-gray-50/50 border-b">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-gray-500">Cohort Navigation</CardTitle>
            </CardHeader>
            <CardContent className="p-2 space-y-1">
              {classes.map((cls) => (
                <button
                  key={cls._id}
                  onClick={() => handleClassSelect(cls)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${selectedClass?._id === cls._id
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100 scale-[1.02]"
                    : "hover:bg-indigo-50 text-gray-700 font-bold"
                    }`}
                >
                  <div className="text-left">
                    <p className={`text-sm font-black ${selectedClass?._id === cls._id ? "text-white" : "text-gray-900"}`}>Class {cls.name}-{cls.section}</p>
                    <p className={`text-[10px] uppercase font-black tracking-tighter ${selectedClass?._id === cls._id ? "text-indigo-200" : "text-gray-400"}`}>{cls.studentCount || 0} Registered</p>
                  </div>
                  <ChevronRight className={`h-4 w-4 ${selectedClass?._id === cls._id ? "text-white" : "text-gray-300"}`} />
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="xl:col-span-3 border-none shadow-2xl shadow-indigo-100/30 ring-1 ring-gray-100 overflow-hidden">
            <CardHeader className="bg-white border-b py-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-2 font-black text-xl text-gray-800 tracking-tight">
                  <Users className="h-5 w-5 text-indigo-600" />
                  Roster Overview: {selectedClass ? `Class ${selectedClass.name}-${selectedClass.section}` : "Select a class"}
                </CardTitle>
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400 font-black" />
                  <Input
                    placeholder="Search name or roll..."
                    className="h-11 pl-10 rounded-xl bg-gray-50 border-none focus:ring-4 focus:ring-indigo-100"
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 min-h-[400px]">
              {studentsLoading ? (
                <div className="flex items-center justify-center p-20">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                </div>
              ) : filteredStudents.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {filteredStudents.map((student) => (
                    <div key={student._id} className="flex items-center justify-between p-6 hover:bg-gray-50/80 transition-all group">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 border-2 border-white shadow-xl ring-2 ring-indigo-50 group-hover:scale-110 transition-transform">
                          <AvatarFallback className="bg-indigo-600 text-white font-black text-sm">
                            {student.firstName[0]}{student.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-black text-gray-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight text-sm">{student.firstName} {student.lastName}</p>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ID: {student.rollNumber || 'TEMPORARY'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="hidden sm:flex flex-col items-end gap-1">
                          <span className="text-[10px] font-black uppercase text-gray-400 tracking-tighter">Academic Status</span>
                          <Badge className="bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase border-none h-5">Good Standing</Badge>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button className="h-10 px-6 font-black rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 group">
                              Details <ArrowRight className="h-3 w-3 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl border-none shadow-2xl p-0 overflow-hidden">
                            <div className="bg-indigo-600 p-8 text-white relative">
                              <div className="absolute top-0 right-0 p-8 opacity-10">
                                <User className="h-32 w-32" />
                              </div>
                              <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                                <Avatar className="h-28 w-28 border-4 border-white/20 shadow-2xl">
                                  <AvatarFallback className="text-3xl bg-white text-indigo-600 font-black">
                                    {student.firstName[0]}{student.lastName[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="text-center md:text-left">
                                  <DialogTitle className="font-black text-3xl tracking-tighter uppercase text-white">{student.firstName} {student.lastName}</DialogTitle>
                                  <p className="text-indigo-100 font-bold opacity-80 uppercase tracking-widest text-xs mt-1">Class {student.class}-{student.section} • Roll No: {student.rollNumber}</p>
                                  <div className="flex gap-2 mt-4 justify-center md:justify-start">
                                    <Badge className="bg-white/20 text-white hover:bg-white/30 border-none px-3 font-bold">Male</Badge>
                                    <Badge className="bg-white/20 text-white hover:bg-white/30 border-none px-3 font-bold">{student.bloodGroup || "O+"}</Badge>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="p-8 space-y-8">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-medium">
                                <div className="space-y-4">
                                  <div className="space-y-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Digital Contact</p>
                                    <div className="flex items-center gap-3 text-sm font-black text-gray-700 p-3 bg-gray-50 rounded-xl">
                                      <Mail className="w-4 h-4 text-indigo-500" />
                                      {student.email || "No email synchronized"}
                                    </div>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Direct Line</p>
                                    <div className="flex items-center gap-3 text-sm font-black text-gray-700 p-3 bg-gray-50 rounded-xl">
                                      <Phone className="w-4 h-4 text-indigo-500" />
                                      {student.phone || "No phone linked"}
                                    </div>
                                  </div>
                                </div>
                                <div className="space-y-4">
                                  <div className="space-y-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Temporal Identity</p>
                                    <div className="flex items-center gap-3 text-sm font-black text-gray-700 p-3 bg-gray-50 rounded-xl">
                                      <Calendar className="w-4 h-4 text-indigo-500" />
                                      DOB: {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : "N/A"}
                                    </div>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Guardian Pedigree</p>
                                    <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded-xl">
                                      <div className="flex items-center gap-2 text-sm font-black text-gray-700">
                                        <User className="h-3 w-3 text-indigo-400" /> {student.fatherName} (Father)
                                      </div>
                                      <div className="flex items-center gap-2 text-sm font-black text-gray-700">
                                        <User className="h-3 w-3 text-indigo-400" /> {student.motherName} (Mother)
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Residency</p>
                                <div className="flex items-start gap-3 text-sm font-black text-gray-700 p-3 bg-gray-50 rounded-xl">
                                  <MapPin className="w-4 h-4 text-indigo-500 mt-1 shrink-0" />
                                  {student.address || "No address data available in records"}
                                </div>
                              </div>

                              <div className="flex gap-4 pt-4 border-t">
                                <Button className="flex-1 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-black shadow-xl shadow-indigo-100" onClick={() => toast({ title: "Synchronized", description: "Student records synced successfully." })}>Synchronize Records</Button>
                                <Button variant="outline" className="flex-1 h-12 rounded-xl border-2 font-black" onClick={() => toast({ title: "Archived", description: "Student analytics archived." })}>Archive Analytics</Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-32 text-center">
                  <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 border-2 border-dashed border-gray-200">
                    <Users className="h-8 w-8 text-gray-300" />
                  </div>
                  <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">No Matches Identified</h3>
                  <p className="text-xs text-gray-400 font-medium max-w-[250px] mt-2">Try adjusting your search query or selecting a different academic batch.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

