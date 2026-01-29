"use client"

import { API_URL } from "@/lib/api-config"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { StatCard } from "@/components/super-admin/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Users, CheckCircle, XCircle, Clock, Calendar, Save, Filter, ChevronRight, Loader2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Student {
  studentId: string;
  rollNo: string;
  firstName: string;
  lastName: string;
  status: string | null;
  date?: string;
}

interface ClassItem {
  _id: string;
  name: string;
  section: string;
}

export default function TeacherAttendance() {
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [selectedSection, setSelectedSection] = useState<string>("")
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState(false)
  const [isLocked, setIsLocked] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0])
  const { toast } = useToast()

  useEffect(() => {
    fetchClasses()
  }, [])

  useEffect(() => {
    if (selectedClass) {
      fetchStudents()
    }
  }, [selectedClass, selectedSection, currentDate])

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/api/teacher/classes`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      const result = await response.json()
      if (result.success && result.data.length > 0) {
        setClasses(result.data)
        const firstClass = result.data[0]
        setSelectedClass(firstClass._id) // Use _id
        setSelectedSection(firstClass.section)
      } else {
        setLoading(false)
      }
    } catch (err) {
      console.error("Error fetching classes:", err)
      setLoading(false)
    }
  }

  const fetchStudents = async () => {
    setLoading(true)
    setIsLocked(false)
    try {
      const token = localStorage.getItem("token")
      // 1. Fetch Class Roster (All Students in Class)
      const rosterRes = await fetch(`${API_URL}/api/teacher/classes/${selectedClass}/students`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      const rosterData = await rosterRes.json()

      // 2. Fetch Existing Attendance (if any)
      const selectedClassItem = classes.find(c => c._id === selectedClass);
      const className = selectedClassItem?.name || "";
      const classSection = selectedClassItem?.section || "";

      const attendanceRes = await fetch(`${API_URL}/api/teacher/attendance?className=${className}&section=${classSection}&date=${currentDate}`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      const attendanceData = await attendanceRes.json()

      let mergedStudents: Student[] = []

      if (rosterData.success && rosterData.data.students) {
        // Map students from roster
        mergedStudents = rosterData.data.students.map((s: any) => ({
          studentId: s._id,
          rollNo: s.rollNumber || "N/A",
          firstName: s.firstName,
          lastName: s.lastName,
          status: "present" // Default
        }));

        // If attendance exists, update status
        if (attendanceData.success && Array.isArray(attendanceData.data) && attendanceData.data.length > 0) {
          // Check if any record is locked
          if (attendanceData.data[0].locked) {
            setIsLocked(true)
          }

          attendanceData.data.forEach((record: any) => {
            const studentIndex = mergedStudents.findIndex(s => s.studentId === record.studentId);
            if (studentIndex !== -1) {
              mergedStudents[studentIndex].status = record.status;
            }
          });
        }
      }

      setStudents(mergedStudents)
    } catch (err) {
      console.error("Error fetching students:", err)
      toast({ title: "Error", description: "Failed to load students", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = (studentId: string, status: string) => {
    setStudents(students.map(s => s.studentId === studentId ? { ...s, status } : s))
  }

  const handleSaveAttendance = async () => {
    setMarking(true)
    try {
      const token = localStorage.getItem("token")
      const attendanceRecords = students.map(s => ({
        studentId: s.studentId,
        status: s.status,
        remarks: ""
      }))

      const selectedClassItem = classes.find(c => c._id === selectedClass);

      const response = await fetch(`${API_URL}/api/teacher/attendance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          date: currentDate,
          className: selectedClassItem?.name, // Send name as backend expects
          section: selectedClassItem?.section, // Send section as backend expects
          attendanceData: attendanceRecords // Backend expects attendanceData, not attendanceRecords (checked controller)
        })
      })

      const result = await response.json()
      if (response.ok) {
        toast({
          title: "Attendance Saved",
          description: `Successfully marked attendance for ${selectedClassItem?.name}-${selectedClassItem?.section}.`,
          className: "bg-green-50 border-green-200 text-green-800"
        })
      } else {
        throw new Error(result.error || "Failed to save attendance")
      }
    } catch (err) {
      toast({
        title: "Submission Failed",
        description: err instanceof Error ? err.message : "Network error",
        variant: "destructive"
      })
    } finally {
      setMarking(false)
    }
  }

  const presentCount = students.filter(s => s.status?.toLowerCase() === "present").length
  const absentCount = students.filter(s => s.status?.toLowerCase() === "absent").length
  const lateCount = students.filter(s => s.status?.toLowerCase() === "late").length
  const attendancePercentage = students.length > 0 ? Math.round((presentCount / students.length) * 100) : 0

  if (classes.length === 0 && !loading) {
    return (
      <DashboardLayout title="Attendance">
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Users className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">No Classes Assigned</h3>
          <p className="text-muted-foreground mt-1">You are not assigned as a teacher to any class.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Attendance Management">
      <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Mark Attendance</h2>
            <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
              <div className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(currentDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              <ChevronRight className="h-4 w-4" />
              <span className="text-gray-900 font-bold bg-gray-100 px-2 py-0.5 rounded-md">
                Class {selectedClass}-{selectedSection}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-700">Class:</span>
              <Select
                value={selectedClass}
                onValueChange={(val) => {
                  const cls = classes.find(c => c._id === val);
                  if (cls) {
                    setSelectedClass(cls._id);
                    setSelectedSection(cls.section);
                  }
                }}
              >
                <SelectTrigger className="w-[180px] h-10 shadow-sm">
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls._id} value={cls._id}>
                      Class {cls.name} - {cls.section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-700">Date:</span>
              <input
                type="date"
                className="h-10 border rounded-md px-3 text-sm shadow-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                value={currentDate}
                onChange={(e) => setCurrentDate(e.target.value)}
              />
            </div>

            <Button
              className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 h-10"
              onClick={handleSaveAttendance}
              disabled={marking || students.length === 0 || isLocked}
            >
              {marking ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
              ) : isLocked ? (
                <><CheckCircle className="mr-2 h-4 w-4" /> Locked</>
              ) : (
                <><Save className="mr-2 h-4 w-4" /> Save Attendance</>
              )}
            </Button>
          </div>
        </div>

        {isLocked && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <Clock className="h-5 w-5 text-amber-600" />
            <div>
              <p className="font-bold">Attendance Locked</p>
              <p className="text-xs">Already submitted to the registry. Contact administrator for any adjustments.</p>
            </div>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard title="Enrolled" value={students.length.toString()} icon={Users} iconColor="text-gray-600" iconBgColor="bg-gray-100" />
          <StatCard title="Present" value={presentCount.toString()} icon={CheckCircle} iconColor="text-emerald-600" iconBgColor="bg-emerald-50" />
          <StatCard title="Absent" value={absentCount.toString()} icon={XCircle} iconColor="text-rose-600" iconBgColor="bg-rose-50" />
          <StatCard title="Rate" value={`${attendancePercentage}%`} icon={Clock} iconColor="text-blue-600" iconBgColor="bg-blue-50" />
        </div>

        <Card className="shadow-2xl shadow-indigo-100/30 border-none overflow-hidden ring-1 ring-gray-100">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b py-5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2 font-black text-gray-800">
                  <div className="p-1.5 bg-indigo-600 rounded-lg text-white">
                    <Users className="h-4 w-4" />
                  </div>
                  Student Roll Call
                </CardTitle>
                <CardDescription className="font-medium">Set current status for each student in the roster</CardDescription>
              </div>
              <div className="flex gap-4 p-2 bg-gray-100/50 rounded-xl px-4">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-700">
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-sm"></div> Present: {presentCount}
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-rose-700">
                  <div className="w-2.5 h-2.5 bg-rose-500 rounded-full shadow-sm"></div> Absent: {absentCount}
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-700">
                  <div className="w-2.5 h-2.5 bg-amber-500 rounded-full shadow-sm"></div> Late: {lateCount}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-20 text-center space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mx-auto" />
                <p className="text-muted-foreground font-medium">Fetching student records...</p>
              </div>
            ) : students.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {students.map((student) => (
                  <div key={student.studentId} className={`flex flex-col sm:flex-row items-center justify-between p-5 hover:bg-gray-50/80 transition-all ${student.status?.toLowerCase() === 'absent' ? 'bg-rose-50/20' : ''}`}>
                    <div className="flex items-center gap-5 mb-4 sm:mb-0">
                      <Avatar className="h-14 w-14 border-4 border-white shadow-xl">
                        <AvatarFallback className={`text-white font-black text-lg ${student.status?.toLowerCase() === 'present' ? 'bg-gradient-to-br from-emerald-500 to-teal-600' :
                          student.status?.toLowerCase() === 'absent' ? 'bg-gradient-to-br from-rose-500 to-pink-600' :
                            'bg-gradient-to-br from-amber-400 to-orange-500'
                          }`}>
                          {student.firstName[0]}{student.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <p className="font-black text-gray-900 text-lg leading-none">{student.firstName} {student.lastName}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] font-black bg-white border-gray-200 shadow-sm text-gray-500 px-2 py-0">
                            ID: {student.rollNo}
                          </Badge>
                          {student.status && (
                            <span className={`text-[10px] font-black uppercase tracking-wider ${student.status.toLowerCase() === 'present' ? 'text-emerald-600' :
                              student.status.toLowerCase() === 'absent' ? 'text-rose-600' : 'text-amber-600'
                              }`}>
                              • {student.status}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={isLocked}
                        onClick={() => handleStatusChange(student.studentId, "present")}
                        className={`px-4 rounded-xl text-xs font-black uppercase tracking-widest h-9 transition-all ${student.status?.toLowerCase() === "present"
                          ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-200"
                          : "text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"
                          }`}
                      >
                        Present
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={isLocked}
                        onClick={() => handleStatusChange(student.studentId, "absent")}
                        className={`px-4 rounded-xl text-xs font-black uppercase tracking-widest h-9 transition-all ${student.status?.toLowerCase() === "absent"
                          ? "bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-200"
                          : "text-gray-400 hover:text-rose-600 hover:bg-rose-50"
                          }`}
                      >
                        Absent
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={isLocked}
                        onClick={() => handleStatusChange(student.studentId, "late")}
                        className={`px-4 rounded-xl text-xs font-black uppercase tracking-widest h-9 transition-all ${student.status?.toLowerCase() === "late"
                          ? "bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-200"
                          : "text-gray-400 hover:text-amber-600 hover:bg-amber-50"
                          }`}
                      >
                        Late
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-20 text-center">
                <p className="text-muted-foreground font-medium text-lg">No students found for this class.</p>
              </div>
            )}
          </CardContent>
          {students.length > 0 && (
            <CardFooter className="bg-gray-50/50 p-6 flex flex-col sm:flex-row justify-between items-center border-t gap-4">
              <div className="text-sm font-bold text-gray-500">
                Finalizing roster for <span className="text-indigo-600">{students.length} students</span>
              </div>
              <Button
                className="bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200 px-10 h-12 font-black uppercase tracking-widest text-sm"
                onClick={handleSaveAttendance}
                disabled={marking}
              >
                {marking ? <Loader2 className="animate-spin" /> : "Submit To Registry"}
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </DashboardLayout>
  )
}

