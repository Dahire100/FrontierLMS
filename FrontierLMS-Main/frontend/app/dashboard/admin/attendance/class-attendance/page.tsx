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
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, Users2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function ClassAttendance() {
    const { toast } = useToast()
    const [classes, setClasses] = useState<any[]>([])
    const [students, setStudents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [fetching, setFetching] = useState(false)
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

    const loadAttendance = async () => {
        if (!classId) {
            toast({ title: "Required", description: "Please select a class", variant: "destructive" })
            return
        }

        try {
            setFetching(true)
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
                toast({ title: "Loaded", description: `Loaded data for ${list.length} students` })
            } else {
                setStudents([])
                toast({ title: "Error", description: result?.error || "Failed to load data", variant: "destructive" })
            }
        } catch (err) {
            toast({ title: "Error", description: "Failed to load attendance", variant: "destructive" })
        } finally {
            setHasLoaded(true)
            setFetching(false)
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'present': return <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200 capitalize">Present</Badge>
            case 'absent': return <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200 capitalize">Absent</Badge>
            case 'late': return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200 capitalize">Late</Badge>
            case 'half_day': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200 capitalize">Half Day</Badge>
            default: return <Badge variant="outline" className="text-gray-500 capitalize">Not Marked</Badge>
        }
    }

    return (
        <DashboardLayout title="Class View Attendance">
            <div className="max-w-6xl mx-auto space-y-6">
                <Card className="border-0 shadow-sm ring-1 ring-gray-200">
                    <CardHeader className="border-b bg-gray-50/50 pb-4">
                        <CardTitle className="text-base font-medium text-gray-700 flex items-center gap-2">
                            <Search className="h-4 w-4" />
                            View Attendance Criteria
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
                                onClick={loadAttendance}
                                disabled={fetching || loading}
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                            >
                                {fetching ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "View Attendance"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {fetching && (
                    <Card className="border-0 shadow-sm ring-1 ring-gray-200 overflow-hidden">
                        <div className="flex items-center gap-3 p-4 border-b bg-gray-50/50">
                            <Loader2 className="h-4 w-4 animate-spin text-slate-600" />
                            <div className="text-sm text-gray-700">Loading attendance…</div>
                        </div>
                    </Card>
                )}

                {!fetching && students.length === 0 && (
                    <Card className="border-0 shadow-sm ring-1 ring-gray-200 overflow-hidden">
                        <div className="p-6">
                            <div className="text-sm font-semibold text-gray-900">
                                {hasLoaded ? "No students found" : "View attendance"}
                            </div>
                            <div className="mt-1 text-sm text-gray-600">
                                {hasLoaded
                                    ? "Try a different class/date and load again."
                                    : "Select a class and date above, then click View Attendance."}
                            </div>
                        </div>
                    </Card>
                )}

                {!fetching && students.length > 0 && (
                    <Card className="border-0 shadow-sm ring-1 ring-gray-200 overflow-hidden">
                        <div className="flex flex-col gap-4 p-4 border-b bg-gray-50/50">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                    <Users2 className="h-4 w-4 text-slate-600" />
                                    Student Status
                                    <Badge variant="secondary" className="ml-2">{students.length} Students</Badge>
                                </h3>

                                {(() => {
                                    const counts = { present: 0, absent: 0, late: 0, half_day: 0, not_marked: 0 }
                                    students.forEach((s) => {
                                        const status = s.status || 'not_marked'
                                        if (status in counts) {
                                            ;(counts as any)[status] += 1
                                        } else {
                                            counts.not_marked += 1
                                        }
                                    })

                                    return (
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Present: {counts.present}</Badge>
                                            <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Absent: {counts.absent}</Badge>
                                            <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Late: {counts.late}</Badge>
                                            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Half Day: {counts.half_day}</Badge>
                                            <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">Not Marked: {counts.not_marked}</Badge>
                                        </div>
                                    )
                                })()}
                            </div>

                            <div className="relative w-full md:max-w-sm">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                <Input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by name / roll / ID"
                                    className="bg-white pl-9"
                                />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                                        <TableHead className="w-[100px]">Roll No</TableHead>
                                        <TableHead>Student Name</TableHead>
                                        <TableHead>Father Name</TableHead>
                                        <TableHead className="text-right">Status</TableHead>
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
                                            <TableCell className="font-medium text-gray-700">{student.rollNumber || student.rollNo || "N/A"}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-900">{student.firstName} {student.lastName}</span>
                                                    <span className="text-xs text-gray-500">{student.studentId}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-gray-600">{student.fatherName || "-"}</TableCell>
                                            <TableCell className="text-right">
                                                {getStatusBadge(student.status)}
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

