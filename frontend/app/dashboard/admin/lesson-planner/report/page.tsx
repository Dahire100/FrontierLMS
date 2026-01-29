"use client"

import { API_URL } from "@/lib/api-config"
import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Search,
    BarChart3,
    Download,
    Loader2,
    Filter,
    Calendar,
    TrendingUp,
    CheckCircle2,
    Clock,
    Target,
    FileSpreadsheet
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function LessonPlannerReportPage() {
    const { toast } = useToast()
    const [classes, setClasses] = useState<any[]>([])
    const [subjects, setSubjects] = useState<any[]>([])
    const [reportData, setReportData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searching, setSearching] = useState(false)

    const [filters, setFilters] = useState({
        classId: "",
        subject: "",
        startDate: "",
        endDate: ""
    })

    // Summary stats
    const summary = {
        totalTopics: reportData.reduce((sum, r) => sum + (r.total || 0), 0),
        completed: reportData.reduce((sum, r) => sum + (r.completed || 0), 0),
        inProgress: reportData.reduce((sum, r) => sum + (r.inProgress || 0), 0),
        avgCompletion: reportData.length > 0
            ? Math.round(reportData.reduce((sum, r) => sum + (r.completionRate || 0), 0) / reportData.length)
            : 0
    }

    useEffect(() => {
        fetchClasses()
        fetchSubjects()
    }, [])

    const fetchClasses = async () => {
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/classes`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const result = await res.json()
            if (result.success && Array.isArray(result.data)) {
                setClasses(result.data)
            }
        } catch (err) {
            toast({ title: "Error", description: "Failed to load classes", variant: "destructive" })
        }
    }

    const fetchSubjects = async () => {
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/subjects`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const result = await res.json()
            if (result.success && Array.isArray(result.data)) {
                setSubjects(result.data)
            }
        } catch (err) {
            toast({ title: "Error", description: "Failed to load subjects", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = async () => {
        setSearching(true)
        try {
            const token = localStorage.getItem("token")
            const params = new URLSearchParams()
            if (filters.classId) params.append("classId", filters.classId)
            if (filters.subject) params.append("subject", filters.subject)
            if (filters.startDate) params.append("startDate", filters.startDate)
            if (filters.endDate) params.append("endDate", filters.endDate)

            const res = await fetch(`${API_URL}/api/lesson-planner/reports/summary?${params.toString()}`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const result = await res.json()
            if (result.success && Array.isArray(result.data)) {
                setReportData(result.data)
                toast({ title: "Success", description: `Report generated with ${result.data.length} records` })
            } else {
                setReportData([])
                toast({ title: "No Data", description: "No lesson plans found for selected criteria" })
            }
        } catch (err) {
            toast({ title: "Error", description: "Failed to generate report", variant: "destructive" })
        } finally {
            setSearching(false)
        }
    }

    const handleExport = () => {
        const headers = ["Class", "Subject", "Total Topics", "Planned", "In Progress", "Completed", "Completion %"]
        const csvContent = [
            headers.join(","),
            ...reportData.map(row => [
                row.className,
                row.subject,
                row.total,
                row.planned,
                row.inProgress,
                row.completed,
                `${Math.round(row.completionRate)}%`
            ].join(","))
        ].join("\n")

        const blob = new Blob([csvContent], { type: "text/csv" })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "lesson_planner_report.csv"
        a.click()
        window.URL.revokeObjectURL(url)
        toast({ title: "Exported", description: "Report downloaded successfully" })
    }

    const getProgressColor = (rate: number) => {
        if (rate >= 75) return 'bg-emerald-500'
        if (rate >= 50) return 'bg-blue-500'
        if (rate >= 25) return 'bg-amber-500'
        return 'bg-red-500'
    }

    return (
        <DashboardLayout title="Lesson Planner Report">
            <div className="space-y-8 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-lg">
                                <BarChart3 className="h-6 w-6 text-white" />
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Lesson Planner Report</h1>
                        </div>
                        <p className="text-gray-500 ml-14">Generate insights and analytics on lesson plan progress</p>
                    </div>
                </div>

                {/* Summary Stats */}
                {reportData.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-white">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-100 rounded-2xl">
                                        <Target className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Total Topics</p>
                                        <p className="text-3xl font-bold text-gray-900">{summary.totalTopics}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-white">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-emerald-100 rounded-2xl">
                                        <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Completed</p>
                                        <p className="text-3xl font-bold text-gray-900">{summary.completed}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-white">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-amber-100 rounded-2xl">
                                        <Clock className="h-6 w-6 text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">In Progress</p>
                                        <p className="text-3xl font-bold text-gray-900">{summary.inProgress}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-white">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-purple-100 rounded-2xl">
                                        <TrendingUp className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Avg Completion</p>
                                        <p className="text-3xl font-bold text-gray-900">{summary.avgCompletion}%</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Search Filters */}
                <Card className="border-0 shadow-xl rounded-3xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-100 py-5">
                        <CardTitle className="text-base font-bold flex items-center gap-2 text-gray-800">
                            <Filter className="h-5 w-5 text-orange-500" />
                            Report Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Class</Label>
                                <Select value={filters.classId} onValueChange={(v) => setFilters({ ...filters, classId: v })}>
                                    <SelectTrigger className="h-12 bg-gray-50 border-gray-200 rounded-xl hover:bg-white transition-colors">
                                        <SelectValue placeholder="All Classes" />
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
                                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Subject</Label>
                                <Select value={filters.subject} onValueChange={(v) => setFilters({ ...filters, subject: v })}>
                                    <SelectTrigger className="h-12 bg-gray-50 border-gray-200 rounded-xl hover:bg-white transition-colors">
                                        <SelectValue placeholder="All Subjects" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subjects.map((sub) => (
                                            <SelectItem key={sub._id} value={sub.name}>
                                                {sub.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Start Date</Label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        type="date"
                                        className="h-12 bg-gray-50 border-gray-200 rounded-xl pl-10 hover:bg-white transition-colors"
                                        value={filters.startDate}
                                        onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">End Date</Label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        type="date"
                                        className="h-12 bg-gray-50 border-gray-200 rounded-xl pl-10 hover:bg-white transition-colors"
                                        value={filters.endDate}
                                        onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex items-end">
                                <Button
                                    onClick={handleSearch}
                                    disabled={searching}
                                    className="w-full h-12 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold"
                                >
                                    {searching ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Search className="h-5 w-5 mr-2" />}
                                    Generate
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Results Table */}
                <Card className="border-0 shadow-xl rounded-3xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200/50 py-5 flex flex-row items-center justify-between">
                        <CardTitle className="text-base font-bold text-gray-800 flex items-center gap-2">
                            <FileSpreadsheet className="h-5 w-5 text-orange-500" />
                            Report Summary
                        </CardTitle>
                        {reportData.length > 0 && (
                            <Button onClick={handleExport} variant="outline" className="rounded-xl border-gray-200 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200">
                                <Download className="h-4 w-4 mr-2" />
                                Export CSV
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                                        <TableHead className="font-bold text-gray-700">CLASS</TableHead>
                                        <TableHead className="font-bold text-gray-700">SUBJECT</TableHead>
                                        <TableHead className="font-bold text-gray-700 text-center">TOTAL</TableHead>
                                        <TableHead className="font-bold text-gray-700 text-center">PLANNED</TableHead>
                                        <TableHead className="font-bold text-gray-700 text-center">IN PROGRESS</TableHead>
                                        <TableHead className="font-bold text-gray-700 text-center">COMPLETED</TableHead>
                                        <TableHead className="font-bold text-gray-700 text-center">PROGRESS</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {searching ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-16">
                                                <Loader2 className="h-10 w-10 animate-spin mx-auto text-orange-600" />
                                            </TableCell>
                                        </TableRow>
                                    ) : reportData.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-16">
                                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <BarChart3 className="h-8 w-8 text-gray-400" />
                                                </div>
                                                <p className="text-gray-500 font-medium">No report data available</p>
                                                <p className="text-gray-400 text-sm mt-1">Use the filters above to generate a report</p>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        reportData.map((row, idx) => (
                                            <TableRow key={idx} className="hover:bg-slate-50/50">
                                                <TableCell className="font-semibold text-gray-900">{row.className}</TableCell>
                                                <TableCell className="text-gray-600">{row.subject}</TableCell>
                                                <TableCell className="text-center">
                                                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg font-semibold">{row.total}</span>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-lg font-semibold">{row.planned}</span>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg font-semibold">{row.inProgress}</span>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg font-semibold">{row.completed}</span>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex items-center gap-3 justify-center">
                                                        <div className="w-24 h-3 bg-gray-100 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full ${getProgressColor(row.completionRate)} transition-all`}
                                                                style={{ width: `${row.completionRate}%` }}
                                                            />
                                                        </div>
                                                        <span className={`text-xs font-bold ${row.completionRate >= 75 ? 'text-emerald-600' :
                                                            row.completionRate >= 50 ? 'text-blue-600' :
                                                                row.completionRate >= 25 ? 'text-amber-600' : 'text-red-600'
                                                            }`}>
                                                            {Math.round(row.completionRate)}%
                                                        </span>
                                                    </div>
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
        </DashboardLayout>
    )
}
