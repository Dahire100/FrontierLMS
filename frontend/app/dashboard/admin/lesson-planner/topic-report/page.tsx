"use client"

import { API_URL } from "@/lib/api-config"
import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
    Search,
    ClipboardList,
    Loader2,
    Filter,
    Calendar,
    BookOpen,
    CheckCircle2,
    Clock,
    AlertCircle,
    Download,
    ChevronLeft,
    ChevronRight
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function TopicReportPage() {
    const { toast } = useToast()
    const [classes, setClasses] = useState<any[]>([])
    const [subjects, setSubjects] = useState<any[]>([])
    const [topics, setTopics] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searching, setSearching] = useState(false)

    const [filters, setFilters] = useState({
        classId: "",
        subject: ""
    })

    // Stats
    const stats = {
        total: topics.length,
        completed: topics.filter(t => t.status === 'completed').length,
        inProgress: topics.filter(t => t.status === 'in-progress').length,
        planned: topics.filter(t => t.status === 'planned' || !t.status).length
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

            const res = await fetch(`${API_URL}/api/lesson-planner/topics/list?${params.toString()}`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const result = await res.json()
            if (result.success && Array.isArray(result.data)) {
                setTopics(result.data)
                toast({ title: "Success", description: `Found ${result.data.length} topics` })
            } else {
                setTopics([])
                toast({ title: "No Data", description: "No topics found for selected criteria" })
            }
        } catch (err) {
            toast({ title: "Error", description: "Failed to fetch topics", variant: "destructive" })
        } finally {
            setSearching(false)
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle2 className="h-4 w-4" />
            case 'in-progress': return <Clock className="h-4 w-4" />
            default: return <AlertCircle className="h-4 w-4" />
        }
    }

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
            case 'in-progress': return 'bg-blue-100 text-blue-700 border-blue-200'
            default: return 'bg-amber-100 text-amber-700 border-amber-200'
        }
    }

    const handleExport = () => {
        const headers = ["Class", "Subject", "Topic", "Date", "Status"]
        const csvContent = [
            headers.join(","),
            ...topics.map(t => [
                `${t.classId?.name}-${t.classId?.section}`,
                t.subject,
                t.topic,
                new Date(t.lessonDate).toLocaleDateString(),
                t.status || 'planned'
            ].join(","))
        ].join("\n")

        const blob = new Blob([csvContent], { type: "text/csv" })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "topic_report.csv"
        a.click()
        window.URL.revokeObjectURL(url)
        toast({ title: "Exported", description: "Report downloaded successfully" })
    }

    return (
        <DashboardLayout title="Topic Report">
            <div className="space-y-8 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl shadow-lg">
                                <ClipboardList className="h-6 w-6 text-white" />
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Topic Report</h1>
                        </div>
                        <p className="text-gray-500 ml-14">Analyze topic coverage and completion rates</p>
                    </div>
                </div>

                {/* Stats Cards */}
                {topics.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card className="border-0 shadow-lg bg-white">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">Total Topics</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                    </div>
                                    <div className="p-3 bg-pink-100 rounded-xl">
                                        <BookOpen className="h-5 w-5 text-pink-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-lg bg-white">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">Completed</p>
                                        <p className="text-2xl font-bold text-emerald-600">{stats.completed}</p>
                                    </div>
                                    <div className="p-3 bg-emerald-100 rounded-xl">
                                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-lg bg-white">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">In Progress</p>
                                        <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
                                    </div>
                                    <div className="p-3 bg-blue-100 rounded-xl">
                                        <Clock className="h-5 w-5 text-blue-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-lg bg-white">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">Pending</p>
                                        <p className="text-2xl font-bold text-amber-600">{stats.planned}</p>
                                    </div>
                                    <div className="p-3 bg-amber-100 rounded-xl">
                                        <AlertCircle className="h-5 w-5 text-amber-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Search Filters */}
                <Card className="border-0 shadow-xl rounded-3xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-pink-50 to-rose-50 border-b border-pink-100 py-5">
                        <CardTitle className="text-base font-bold flex items-center gap-2 text-gray-800">
                            <Filter className="h-5 w-5 text-pink-500" />
                            Search Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Class</Label>
                                <Select value={filters.classId} onValueChange={(v) => setFilters({ ...filters, classId: v })}>
                                    <SelectTrigger className="h-12 bg-gray-50 border-gray-200 rounded-xl hover:bg-white transition-colors">
                                        <SelectValue placeholder="Select Class" />
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
                                        <SelectValue placeholder="Select Subject" />
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

                            <div className="flex items-end gap-2">
                                <Button
                                    onClick={handleSearch}
                                    disabled={searching}
                                    className="flex-1 h-12 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold"
                                >
                                    {searching ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Search className="h-5 w-5 mr-2" />}
                                    Search
                                </Button>
                                {topics.length > 0 && (
                                    <Button
                                        onClick={handleExport}
                                        variant="outline"
                                        className="h-12 rounded-xl border-gray-200 hover:bg-pink-50 hover:text-pink-600 hover:border-pink-200"
                                    >
                                        <Download className="h-5 w-5" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Results Grid */}
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-900">
                        {topics.length > 0 ? `${topics.length} Topics` : 'Topic List'}
                    </h2>

                    {searching ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="h-10 w-10 animate-spin text-pink-600" />
                        </div>
                    ) : topics.length === 0 ? (
                        <Card className="border-0 shadow-lg rounded-3xl">
                            <CardContent className="py-16 text-center">
                                <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <ClipboardList className="h-10 w-10 text-pink-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Topics Found</h3>
                                <p className="text-gray-500 max-w-md mx-auto">
                                    Select a class and subject to view the topic report.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {topics.map((topic) => (
                                <Card key={topic._id} className="border-0 shadow-lg hover:shadow-xl rounded-2xl transition-all duration-300 overflow-hidden group">
                                    <div className={`h-1.5 ${topic.status === 'completed' ? 'bg-emerald-500' :
                                        topic.status === 'in-progress' ? 'bg-blue-500' : 'bg-amber-500'
                                        }`} />
                                    <CardContent className="p-5 space-y-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <h3 className="font-bold text-gray-900 line-clamp-2">{topic.topic}</h3>
                                            <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-[10px] uppercase font-bold border flex items-center gap-1 ${getStatusStyles(topic.status)}`}>
                                                {getStatusIcon(topic.status)}
                                                {topic.status || 'planned'}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-3 flex-wrap text-sm">
                                            <div className="flex items-center gap-1.5 text-gray-600 bg-gray-50 px-2.5 py-1.5 rounded-lg">
                                                <BookOpen className="h-3.5 w-3.5 text-pink-500" />
                                                <span>{topic.classId?.name}-{topic.classId?.section}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-gray-600 bg-gray-50 px-2.5 py-1.5 rounded-lg">
                                                <Calendar className="h-3.5 w-3.5 text-rose-500" />
                                                <span>{topic.lessonDate ? new Date(topic.lessonDate).toLocaleDateString() : 'Not set'}</span>
                                            </div>
                                        </div>

                                        <p className="text-sm text-gray-500 font-medium">{topic.subject}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {topics.length > 0 && (
                        <div className="flex items-center justify-center gap-2 pt-6">
                            <Button variant="outline" size="sm" disabled className="rounded-xl">
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button size="sm" className="bg-pink-600 hover:bg-pink-700 rounded-xl min-w-[40px]">1</Button>
                            <Button variant="outline" size="sm" disabled className="rounded-xl">
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    )
}
