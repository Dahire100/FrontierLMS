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
import { Users, Search, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"

export default function AttendeeTracking() {
    const [logs, setLogs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchLogs()
    }, [])

    const fetchLogs = async () => {
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/online-classes`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                const allClasses = data.data || []

                // Flatten the attendance data from all classes to show a log
                const attendanceLogs: any[] = []
                allClasses.forEach((cls: any) => {
                    if (cls.attendance && Array.isArray(cls.attendance)) {
                        cls.attendance.forEach((att: any) => {
                            attendanceLogs.push({
                                id: att._id || Math.random().toString(),
                                studentName: att.studentId?.firstName ? `${att.studentId.firstName} ${att.studentId.lastName}` : "Unknown Student",
                                classSection: cls.classId ? `${cls.classId.name}-${cls.classId.section}` : "N/A",
                                subject: cls.subject,
                                joined: att.joinedAt ? new Date(att.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
                                left: att.leftAt ? new Date(att.leftAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
                                duration: att.duration ? `${att.duration}m` : '-' // Assuming duration is in minutes
                            })
                        })
                    }
                })
                setLogs(attendanceLogs)
            }
        } catch (err) {
            console.error(err)
            toast({ title: "Error", description: "Failed to load logs", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    return (
        <DashboardLayout title="Attendee Tracking">
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Attendee Tracking</h2>
                        <p className="text-muted-foreground mt-1">Monitor real-time student attendance in online classes.</p>
                    </div>
                </div>

                <Card className="border-gray-100 shadow-md bg-white/50 backdrop-blur-sm">
                    <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
                        <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                            <Search className="h-5 w-5 text-blue-600" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label className="text-gray-700 font-medium">Class</Label>
                                <Select>
                                    <SelectTrigger className="bg-white border-gray-200">
                                        <SelectValue placeholder="All" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Classes</SelectItem>
                                        <SelectItem value="6">Class 6</SelectItem>
                                        <SelectItem value="7">Class 7</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-gray-700 font-medium">Section</Label>
                                <Input placeholder="All" className="bg-white border-gray-200" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-gray-700 font-medium">Subject</Label>
                                <Input placeholder="All subjects" className="bg-white border-gray-200" />
                            </div>
                            <div className="space-y-2 flex items-end">
                                <Button className="w-full bg-blue-600 hover:bg-blue-700 shadow-sm" onClick={fetchLogs}>
                                    <Search className="mr-2 h-4 w-4" /> Search
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-gray-100 shadow-md bg-white overflow-hidden">
                    <CardHeader className="bg-gray-50/50 border-b border-gray-100">
                        <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
                            <Users className="h-5 w-5 text-purple-500" />
                            Attendee Log
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-gray-50">
                                    <TableRow>
                                        <TableHead className="font-semibold text-gray-700">Student</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Class/Section</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Subject</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Join Time</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Leave Time</TableHead>
                                        <TableHead className="font-semibold text-gray-700 text-right">Duration</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-12">
                                                <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
                                                <p className="mt-2 text-sm text-gray-500">Loading logs...</p>
                                            </TableCell>
                                        </TableRow>
                                    ) : logs.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                                No attendance records found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        logs.map((row) => (
                                            <TableRow key={row.id} className="hover:bg-gray-50/50 transition-colors">
                                                <TableCell className="font-medium text-gray-900">{row.studentName}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="bg-white">{row.classSection}</Badge>
                                                </TableCell>
                                                <TableCell>{row.subject}</TableCell>
                                                <TableCell className="text-green-600 font-medium">{row.joined}</TableCell>
                                                <TableCell className="text-red-500 font-medium">{row.left}</TableCell>
                                                <TableCell className="text-right font-semibold">{row.duration}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}

