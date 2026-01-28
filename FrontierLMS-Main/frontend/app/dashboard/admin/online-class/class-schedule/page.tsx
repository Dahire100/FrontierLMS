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
import { CalendarClock, Loader2, Plus, RefreshCcw, Video } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"

export default function ClassSchedule() {
    const [classes, setClasses] = useState<any[]>([])
    const [schedules, setSchedules] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState({
        subject: "",
        classId: "",
        title: "",
        scheduledDate: "",
        startTime: "",
        endTime: "",
        meetingLink: "",
        platform: "zoom"
    })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const token = localStorage.getItem("token")
            const [classesRes, schedulesRes] = await Promise.all([
                fetch(`${API_URL}/api/classes`, {
                    headers: { "Authorization": `Bearer ${token}` }
                }),
                fetch(`${API_URL}/api/online-classes`, {
                    headers: { "Authorization": `Bearer ${token}` }
                })
            ])

            if (classesRes.ok) {
                const classesData = await classesRes.json()
                if (Array.isArray(classesData)) setClasses(classesData)
            }

            if (schedulesRes.ok) {
                const schedulesData = await schedulesRes.json()
                if (schedulesData.data) setSchedules(schedulesData.data)
            }

        } catch (err) {
            console.error(err)
            toast({ title: "Error", description: "Failed to load data", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.subject || !form.classId || !form.title || !form.scheduledDate || !form.startTime || !form.endTime || !form.meetingLink) {
            toast({ title: "Error", description: "All fields are required", variant: "destructive" })
            return
        }

        setSaving(true)
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/online-classes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(form)
            })

            const data = await res.json()
            if (res.ok && data.success) {
                toast({ title: "Success", description: "Class scheduled successfully" })
                setForm({ subject: "", classId: "", title: "", scheduledDate: "", startTime: "", endTime: "", meetingLink: "", platform: "zoom" })
                fetchData()
            } else {
                toast({ title: "Error", description: data.error || "Failed to schedule class", variant: "destructive" })
            }
        } catch (err) {
            toast({ title: "Error", description: "Failed to schedule class", variant: "destructive" })
        } finally {
            setSaving(false)
        }
    }

    return (
        <DashboardLayout title="Class Schedule">
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Online Class Schedule</h2>
                        <p className="text-muted-foreground mt-1">Schedule and manage virtual classrooms effectively.</p>
                    </div>
                    <Button variant="outline" onClick={fetchData} className="gap-2">
                        <RefreshCcw className="h-4 w-4" /> Refresh
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                        <Card className="border-gray-100 shadow-xl bg-white/80 backdrop-blur-sm sticky top-6">
                            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                                <CardTitle className="text-lg flex items-center gap-2 text-blue-900 font-semibold">
                                    <Plus className="h-5 w-5" />
                                    Schedule New Class
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-gray-700 font-medium">Subject *</Label>
                                        <Input
                                            value={form.subject}
                                            onChange={(e) => setForm({ ...form, subject: e.target.value })}
                                            placeholder="e.g. Mathematics"
                                            className="bg-white border-gray-200 focus:border-blue-500 transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-700 font-medium">Class *</Label>
                                        <Select value={form.classId} onValueChange={(val) => setForm({ ...form, classId: val })}>
                                            <SelectTrigger className="bg-white border-gray-200">
                                                <SelectValue placeholder="Select class" />
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
                                        <Label className="text-gray-700 font-medium">Title/Topic *</Label>
                                        <Input
                                            value={form.title}
                                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                                            placeholder="e.g. Algebra Introduction"
                                            className="bg-white border-gray-200"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-700 font-medium">Date *</Label>
                                        <Input
                                            type="date"
                                            value={form.scheduledDate}
                                            onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
                                            className="bg-white border-gray-200"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-gray-700 font-medium">Start Time *</Label>
                                            <Input
                                                type="time"
                                                value={form.startTime}
                                                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                                                className="bg-white border-gray-200"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-gray-700 font-medium">End Time *</Label>
                                            <Input
                                                type="time"
                                                value={form.endTime}
                                                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                                                className="bg-white border-gray-200"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-700 font-medium">Meeting Link *</Label>
                                        <Input
                                            value={form.meetingLink}
                                            onChange={(e) => setForm({ ...form, meetingLink: e.target.value })}
                                            placeholder="https://..."
                                            className="bg-white border-gray-200"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-700 font-medium">Platform *</Label>
                                        <Select value={form.platform} onValueChange={(val) => setForm({ ...form, platform: val })}>
                                            <SelectTrigger className="bg-white border-gray-200">
                                                <SelectValue placeholder="Select platform" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="zoom">Zoom</SelectItem>
                                                <SelectItem value="google-meet">Google Meet</SelectItem>
                                                <SelectItem value="microsoft-teams">MS Teams</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="pt-4">
                                        <Button type="submit" disabled={saving} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg transition-all duration-200 transform hover:-translate-y-0.5">
                                            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Video className="h-4 w-4 mr-2" />}
                                            {saving ? "Scheduling..." : "Schedule Class"}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-2">
                        <Card className="border-gray-100 shadow-lg bg-white overflow-hidden h-full">
                            <CardHeader className="bg-gray-50/50 border-b border-gray-100 flex flex-row items-center justify-between">
                                <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
                                    <CalendarClock className="h-5 w-5 text-indigo-500" />
                                    Upcoming Classes
                                </CardTitle>
                                <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                                    {schedules.length} Scheduled
                                </Badge>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader className="bg-gray-50/80">
                                            <TableRow>
                                                <TableHead className="font-semibold text-gray-600">Subject</TableHead>
                                                <TableHead className="font-semibold text-gray-600">Class</TableHead>
                                                <TableHead className="font-semibold text-gray-600">Date & Time</TableHead>
                                                <TableHead className="font-semibold text-gray-600">Platform</TableHead>
                                                <TableHead className="font-semibold text-gray-600">Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {loading ? (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center py-12">
                                                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
                                                        <p className="mt-2 text-sm text-gray-500">Loading schedule...</p>
                                                    </TableCell>
                                                </TableRow>
                                            ) : schedules.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground bg-gray-50/30">
                                                        No classes scheduled yet. Create one to get started.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                schedules.map((row) => (
                                                    <TableRow key={row._id} className="hover:bg-blue-50/30 transition-colors group">
                                                        <TableCell className="font-medium text-gray-900">
                                                            <div>{row.subject}</div>
                                                            <div className="text-xs text-muted-foreground">{row.title}</div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline" className="bg-white">
                                                                {row.classId ? `${row.classId.name}-${row.classId.section}` : "N/A"}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex flex-col text-sm">
                                                                <span className="font-medium">{new Date(row.scheduledDate).toLocaleDateString()}</span>
                                                                <span className="text-muted-foreground text-xs">{row.startTime} - {row.endTime}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="capitalize">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className={`w-2 h-2 rounded-full ${row.platform === 'zoom' ? 'bg-blue-500' : row.platform === 'google-meet' ? 'bg-green-500' : 'bg-indigo-500'}`}></span>
                                                                {row.platform?.replace('-', ' ')}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge className={
                                                                row.status === 'ongoing' ? 'bg-green-100 text-green-700 animate-pulse' :
                                                                    row.status === 'completed' ? 'bg-gray-100 text-gray-700' :
                                                                        'bg-blue-100 text-blue-700'
                                                            }>
                                                                {row.status || 'Scheduled'}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}

