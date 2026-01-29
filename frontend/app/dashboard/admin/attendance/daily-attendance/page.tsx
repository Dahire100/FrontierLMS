"use client"

import { API_URL } from "@/lib/api-config"
import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardTitle, CardHeader } from "@/components/ui/card"
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
import { Badge } from "@/components/ui/badge"
import { CalendarCheck, Loader2, Save, Search } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

export default function DailyAttendance() {
    const { toast } = useToast()
    const [classes, setClasses] = useState<any[]>([])
    const [students, setStudents] = useState<any[]>([])
    const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent' | 'late' | 'half_day'>>({})
    const [loading, setLoading] = useState(true)
    const [fetchingStudents, setFetchingStudents] = useState(false)
    const [saving, setSaving] = useState(false)
    const [classId, setClassId] = useState("")
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [searchQuery, setSearchQuery] = useState("")
    const [hasLoaded, setHasLoaded] = useState(false)

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

    const loadStudents = async () => {
        if (!classId) {
            toast({ title: "Required", description: "Please select a class", variant: "destructive" })
            return
        }

        try {
            setFetchingStudents(true)
            setHasLoaded(false)
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/attendance?classId=${classId}&date=${date}`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const result = await res.json()
            const list = Array.isArray(result)
                ? result
                : (result?.data && Array.isArray(result.data) ? result.data : null)

            if (Array.isArray(list)) {
                setStudents(list)
                setSearchQuery("")
                const initAttendance: Record<string, 'present' | 'absent' | 'late' | 'half_day'> = {}
                list.forEach((s: any) => {
                    // Default to 'present' if no status found, or map existing status
                    initAttendance[s._id] = s.status || 'present'
                })
                setAttendance(initAttendance)
                toast({ title: "Loaded", description: `Loaded ${list.length} students` })
            } else {
                setStudents([])
                toast({ title: "Error", description: result?.error || "Failed to load students", variant: "destructive" })
            }
        } catch (err) {
            toast({ title: "Error", description: "Failed to load students", variant: "destructive" })
        } finally {
            setHasLoaded(true)
            setFetchingStudents(false)
        }
    }

    const handleSaveAttendance = async () => {
        if (students.length === 0) {
            toast({ title: "No Data", description: "Please load students first", variant: "destructive" })
            return
        }

        setSaving(true)
        try {
            const token = localStorage.getItem("token")
            const attendanceRecords = students.map(student => ({
                studentId: student._id,
                status: attendance[student._id] || 'present'
            }))

            const res = await fetch(`${API_URL}/api/attendance`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    classId,
                    date,
                    attendanceRecords
                })
            })

            const data = await res.json()
            if (res.ok) {
                toast({ title: "Success", description: "Attendance saved successfully" })
            } else {
                toast({ title: "Error", description: data.error || "Failed to save attendance", variant: "destructive" })
            }
        } catch (err) {
            toast({ title: "Error", description: "Failed to save attendance", variant: "destructive" })
        } finally {
            setSaving(false)
        }
    }

    const setStatus = (studentId: string, status: 'present' | 'absent' | 'late' | 'half_day') => {
        setAttendance(prev => ({ ...prev, [studentId]: status }))
    }

    const markAllAs = (status: 'present' | 'absent') => {
        const newAttendance = { ...attendance }
        students.forEach(s => {
            newAttendance[s._id] = status
        })
        setAttendance(newAttendance)
    }

    return (
        <DashboardLayout title="Daily Attendance">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Filter Card */}
                <Card className="border-0 shadow-sm ring-1 ring-gray-200">
                    <CardHeader className="border-b bg-gray-50/50 pb-4">
                        <CardTitle className="text-base font-medium text-gray-700 flex items-center gap-2">
                            <Search className="h-4 w-4" />
                            Select Class & Date
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Class</Label>
                                <Select value={classId} onValueChange={setClassId}>
                                    <SelectTrigger className="bg-white">
                                        <SelectValue placeholder="Select class" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classes.map((cls) => (
                                            <SelectItem key={cls._id} value={cls._id}>
                                                Class {cls.name} - Section {cls.section}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Date</Label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                            </div>
                            <Button
                                onClick={loadStudents}
                                disabled={fetchingStudents || loading}
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                            >
                                {fetchingStudents ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Load Data"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Attendance List */}
                {fetchingStudents && (
                    <Card className="border-0 shadow-sm ring-1 ring-gray-200 overflow-hidden">
                        <div className="flex items-center gap-3 p-4 border-b bg-gray-50/50">
                            <Loader2 className="h-4 w-4 animate-spin text-slate-600" />
                            <div className="text-sm text-gray-700">Loading students…</div>
                        </div>
                    </Card>
                )}

                {!fetchingStudents && students.length === 0 && (
                    <Card className="border-0 shadow-sm ring-1 ring-gray-200 overflow-hidden">
                        <div className="p-6">
                            <div className="text-sm font-semibold text-gray-900">
                                {hasLoaded ? "No students found" : "Load attendance"}
                            </div>
                            <div className="mt-1 text-sm text-gray-600">
                                {hasLoaded
                                    ? "Try a different class/date and load again."
                                    : "Select a class and date above, then click Load Data."}
                            </div>
                        </div>
                    </Card>
                )}

                {!fetchingStudents && students.length > 0 && (
                    <Card className="border-0 shadow-sm ring-1 ring-gray-200 overflow-hidden">
                        <div className="flex flex-col gap-4 p-4 border-b bg-gray-50/50">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                    <CalendarCheck className="h-4 w-4 text-slate-600" />
                                    Student List
                                    <Badge variant="secondary" className="ml-2">{students.length} Students</Badge>
                                </h3>

                                {(() => {
                                    const counts = { present: 0, absent: 0, late: 0, half_day: 0 }
                                    students.forEach((s) => {
                                        const status = attendance[s._id] || 'present'
                                        counts[status] += 1
                                    })

                                    return (
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Present: {counts.present}</Badge>
                                            <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Absent: {counts.absent}</Badge>
                                            <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Late: {counts.late}</Badge>
                                            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Half Day: {counts.half_day}</Badge>
                                        </div>
                                    )
                                })()}
                            </div>

                            <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                                <div className="relative w-full md:max-w-sm">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                    <Input
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search by name / roll / ID"
                                        className="bg-white pl-9"
                                    />
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <Button size="sm" variant="outline" onClick={() => markAllAs('present')} className="text-green-700 hover:text-green-800 hover:bg-green-50 border-green-200">
                                        Mark All Present
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => markAllAs('absent')} className="text-red-700 hover:text-red-800 hover:bg-red-50 border-red-200">
                                        Mark All Absent
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={handleSaveAttendance}
                                        disabled={saving}
                                        className="bg-green-600 hover:bg-green-700 text-white min-w-[100px]"
                                    >
                                        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                        Save
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                                        <TableHead className="w-[100px]">Roll No</TableHead>
                                        <TableHead className="min-w-[200px]">Student Name</TableHead>
                                        <TableHead className="min-w-[400px]">Status</TableHead>
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
                                            <TableRow key={student._id} className="hover:bg-slate-50 transition-colors">
                                                <TableCell className="font-medium text-gray-700">
                                                    {student.rollNumber || student.rollNo || "N/A"}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-gray-900">{student.firstName} {student.lastName}</span>
                                                        <span className="text-xs text-gray-500">{student.studentId}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-1 flex-wrap">
                                                        {[
                                                            { id: 'present', label: 'Present', color: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200', activeColor: 'bg-green-600 text-white border-green-600' },
                                                            { id: 'absent', label: 'Absent', color: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200', activeColor: 'bg-red-600 text-white border-red-600' },
                                                            { id: 'late', label: 'Late', color: 'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200', activeColor: 'bg-yellow-500 text-white border-yellow-500' },
                                                            { id: 'half_day', label: 'Half Day', color: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200', activeColor: 'bg-blue-600 text-white border-blue-600' },
                                                        ].map((status) => (
                                                            <button
                                                                key={status.id}
                                                                onClick={() => setStatus(student._id, status.id as any)}
                                                                className={cn(
                                                                    "px-3 py-1.5 rounded-md text-xs font-semibold border transition-all duration-200",
                                                                    attendance[student._id] === status.id
                                                                        ? status.activeColor
                                                                        : status.color
                                                                )}
                                                            >
                                                                {status.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    )
}

