"use client"

import { useState, useEffect } from "react"
import { API_URL } from "@/lib/api-config"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart2, Loader2, Search, Download, Printer } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface HomeworkItem {
    _id: string
    title: string
    classId: { _id: string; name: string; section: string }
    subject: string
    dueDate: string
    totalMarks: number
    status: string
    submissions?: any[]
}

export default function HomeworkReport() {
    const { toast } = useToast()
    const [classes, setClasses] = useState<any[]>([])
    const [homework, setHomework] = useState<HomeworkItem[]>([])
    const [filteredHomework, setFilteredHomework] = useState<HomeworkItem[]>([])
    const [loading, setLoading] = useState(true)
    const [searching, setSearching] = useState(false)
    const [filters, setFilters] = useState({
        classId: "all",
        subject: "",
        status: "all",
        startDate: "",
        endDate: ""
    })

    useEffect(() => {
        fetchClasses()
        fetchHomework()
    }, [])

    useEffect(() => {
        applyFilters()
    }, [homework, filters])

    const fetchClasses = async () => {
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/classes`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const data = await res.json()
            if (Array.isArray(data)) setClasses(data)
            else if (data.data && Array.isArray(data.data)) setClasses(data.data)
        } catch { }
    }

    const fetchHomework = async () => {
        try {
            setSearching(true)
            const token = localStorage.getItem("token")
            // Fetch all base on class/status first to minimize data transfer if possible, 
            // but since we need client side filtering for others, we might just fetch broadly or let backend filter strict ones.
            // Backend only supports classId and status.
            let url = `${API_URL}/api/homework`
            const params = new URLSearchParams()

            // If classId is 'all', backend might return all. 
            if (filters.classId !== 'all') params.append('classId', filters.classId)

            // Backend supports status, so use it if possible to reduce load, 
            // but if we want to toggle status locally without refetching, we might want to fetch all.
            // Let's rely on client filtering for flexibility unless large data.
            // For now, let's fetch based on class and filter the rest locally.

            if (params.toString()) url += `?${params.toString()}`

            const res = await fetch(url, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const data = await res.json()
            if (Array.isArray(data)) {
                setHomework(data)
            } else if (data.success && Array.isArray(data.data)) {
                setHomework(data.data)
            }
        } catch {
            toast({ title: "Error", description: "Failed to load homework", variant: "destructive" })
        } finally {
            setLoading(false)
            setSearching(false)
        }
    }

    const applyFilters = () => {
        let result = [...homework]

        // Filter by Class (if not handled by backend or double check)
        if (filters.classId !== 'all') {
            result = result.filter(h =>
                (typeof h.classId === 'object' ? h.classId._id : h.classId) === filters.classId
            )
        }

        // Filter by Subject
        if (filters.subject) {
            result = result.filter(h => h.subject.toLowerCase().includes(filters.subject.toLowerCase()))
        }

        // Filter by Status
        if (filters.status !== 'all') {
            result = result.filter(h => h.status === filters.status)
        }

        // Filter by Date Range (Due Date)
        if (filters.startDate) {
            result = result.filter(h => new Date(h.dueDate) >= new Date(filters.startDate))
        }
        if (filters.endDate) {
            result = result.filter(h => new Date(h.dueDate) <= new Date(filters.endDate))
        }

        setFilteredHomework(result)
    }

    const handleExport = () => {
        const headers = ["Title", "Class", "Subject", "Due Date", "Status", "Total Marks", "Submissions"]
        const csvContent = [
            headers.join(","),
            ...filteredHomework.map(hw => [
                `"${hw.title}"`,
                `"${hw.classId?.name ? `${hw.classId.name}-${hw.classId.section}` : 'N/A'}"`,
                `"${hw.subject}"`,
                new Date(hw.dueDate).toLocaleDateString(),
                hw.status,
                hw.totalMarks || 0,
                hw.submissions?.length || 0
            ].join(","))
        ].join("\n")

        const blob = new Blob([csvContent], { type: "text/csv" })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "homework_report.csv"
        a.click()
        window.URL.revokeObjectURL(url)
        toast({ title: "Exported", description: "Report downloaded successfully" })
    }

    const handlePrint = () => {
        window.print()
    }

    // Summary Statistics
    const totalHomeworks = filteredHomework.length
    const totalSubmissions = filteredHomework.reduce((acc, curr) => acc + (curr.submissions?.length || 0), 0)
    const activeHomeworks = filteredHomework.filter(h => h.status === 'active').length

    return (
        <DashboardLayout title="Homework Report">
            <div className="space-y-6">
                <Card>
                    <CardHeader className="bg-pink-50 border-b border-pink-100">
                        <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                            <BarChart2 className="h-5 w-5" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            <div className="space-y-2">
                                <Label>Class</Label>
                                <Select value={filters.classId} onValueChange={(v) => setFilters({ ...filters, classId: v })}>
                                    <SelectTrigger className="bg-white border-gray-200">
                                        <SelectValue placeholder="All Classes" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Classes</SelectItem>
                                        {classes.map((cls) => (
                                            <SelectItem key={cls._id} value={cls._id}>
                                                Class {cls.name}-{cls.section}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Subject</Label>
                                <Input
                                    placeholder="Math, Science..."
                                    value={filters.subject}
                                    onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                                    className="bg-white border-gray-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v })}>
                                    <SelectTrigger className="bg-white border-gray-200">
                                        <SelectValue placeholder="All Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="closed">Closed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Start Date</Label>
                                <Input
                                    type="date"
                                    value={filters.startDate}
                                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                                    className="bg-white border-gray-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>End Date</Label>
                                <Input
                                    type="date"
                                    value={filters.endDate}
                                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                                    className="bg-white border-gray-200"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button onClick={fetchHomework} disabled={searching} className="bg-blue-900 hover:bg-blue-800">
                                {searching ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                                Refresh Data
                            </Button>
                            <Button variant="outline" onClick={handleExport} disabled={filteredHomework.length === 0}>
                                <Download className="h-4 w-4 mr-2" /> Export CSV
                            </Button>
                            <Button variant="outline" onClick={handlePrint} disabled={filteredHomework.length === 0}>
                                <Printer className="h-4 w-4 mr-2" /> Print
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-blue-50 border-blue-100">
                        <CardContent className="pt-6 text-center">
                            <div className="text-2xl font-bold text-blue-700">{totalHomeworks}</div>
                            <div className="text-sm text-blue-600">Total Homeworks</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-green-50 border-green-100">
                        <CardContent className="pt-6 text-center">
                            <div className="text-2xl font-bold text-green-700">{activeHomeworks}</div>
                            <div className="text-sm text-green-600">Active Homeworks</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-purple-50 border-purple-100">
                        <CardContent className="pt-6 text-center">
                            <div className="text-2xl font-bold text-purple-700">{totalSubmissions}</div>
                            <div className="text-sm text-purple-600">Total Submissions</div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader className="bg-pink-50 border-b border-pink-100">
                        <CardTitle className="text-lg text-gray-800">Report Preview</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="overflow-x-auto">
                            {loading ? (
                                <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-pink-50 hover:bg-pink-50">
                                            <TableHead className="font-bold text-gray-700 uppercase">Title</TableHead>
                                            <TableHead className="font-bold text-gray-700 uppercase">Class/Section</TableHead>
                                            <TableHead className="font-bold text-gray-700 uppercase">Subject</TableHead>
                                            <TableHead className="font-bold text-gray-700 uppercase">Due Date</TableHead>
                                            <TableHead className="font-bold text-gray-700 uppercase">Status</TableHead>
                                            <TableHead className="font-bold text-gray-700 uppercase text-right">Submissions</TableHead>
                                            <TableHead className="font-bold text-gray-700 uppercase text-right">Total Marks</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredHomework.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                                    No homework found matching filters.
                                                </TableCell>
                                            </TableRow>
                                        ) : filteredHomework.map((hw) => (
                                            <TableRow key={hw._id}>
                                                <TableCell className="font-medium">{hw.title}</TableCell>
                                                <TableCell>
                                                    {hw.classId?.name ? `${hw.classId.name}-${hw.classId.section}` : 'N/A'}
                                                </TableCell>
                                                <TableCell>{hw.subject}</TableCell>
                                                <TableCell>{new Date(hw.dueDate).toLocaleDateString()}</TableCell>
                                                <TableCell>
                                                    <span className={`px-2 py-1 rounded-full text-xs ${hw.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                        {hw.status}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">{hw.submissions?.length || 0}</TableCell>
                                                <TableCell className="text-right font-bold">{hw.totalMarks || 0}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
