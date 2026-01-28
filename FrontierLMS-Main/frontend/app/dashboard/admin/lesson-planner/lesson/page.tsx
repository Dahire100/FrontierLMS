"use client"

import { API_URL } from "@/lib/api-config"
import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Search,
    BookOpen,
    Loader2,
    GraduationCap,
    Calendar,
    Clock,
    Eye,
    ChevronLeft,
    ChevronRight,
    Filter
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function LessonPage() {
    const { toast } = useToast()
    const [classes, setClasses] = useState<any[]>([])
    const [lessons, setLessons] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searching, setSearching] = useState(false)
    const [filters, setFilters] = useState({
        classId: "",
        subject: ""
    })

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
            if (result.success && Array.isArray(result.data)) {
                setClasses(result.data)
            }
        } catch (err) {
            toast({ title: "Error", description: "Failed to load classes", variant: "destructive" })
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

            const res = await fetch(`${API_URL}/api/lesson-planner?${params.toString()}`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const result = await res.json()
            if (result.success) {
                setLessons(result.data || [])
                toast({ title: "Success", description: `Found ${result.data?.length || 0} lesson plans` })
            } else {
                setLessons([])
            }
        } catch (err) {
            toast({ title: "Error", description: "Failed to load lessons", variant: "destructive" })
        } finally {
            setSearching(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
            case 'in-progress': return 'bg-blue-100 text-blue-700 border-blue-200'
            default: return 'bg-amber-100 text-amber-700 border-amber-200'
        }
    }

    return (
        <DashboardLayout title="Lesson Plans">
            <div className="space-y-8 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                                <BookOpen className="h-6 w-6 text-white" />
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Lesson Plans</h1>
                        </div>
                        <p className="text-gray-500 ml-14">View and manage all lesson plans organized by class and subject</p>
                    </div>
                </div>

                {/* Search Filters */}
                <Card className="border-0 shadow-xl rounded-3xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200/50 py-5">
                        <CardTitle className="text-base font-bold flex items-center gap-2 text-gray-800">
                            <Filter className="h-5 w-5 text-indigo-500" />
                            Search Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Class
                                </Label>
                                <Select value={filters.classId} onValueChange={(val) => setFilters({ ...filters, classId: val })}>
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
                                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Subject
                                </Label>
                                <Input
                                    value={filters.subject}
                                    onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                                    placeholder="Enter subject name"
                                    className="h-12 bg-gray-50 border-gray-200 rounded-xl hover:bg-white transition-colors"
                                />
                            </div>

                            <div className="flex items-end">
                                <Button
                                    onClick={handleSearch}
                                    disabled={searching}
                                    className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold"
                                >
                                    {searching ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Search className="h-5 w-5 mr-2" />}
                                    {searching ? "Searching..." : "Search Lessons"}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Results */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900">
                            {lessons.length > 0 ? `${lessons.length} Lessons Found` : 'Lesson List'}
                        </h2>
                        {lessons.length > 0 && (
                            <span className="text-sm text-gray-500">
                                Showing {lessons.length} results
                            </span>
                        )}
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                        </div>
                    ) : lessons.length === 0 ? (
                        <Card className="border-0 shadow-lg rounded-3xl">
                            <CardContent className="py-16 text-center">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <BookOpen className="h-10 w-10 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Lessons Found</h3>
                                <p className="text-gray-500 max-w-md mx-auto">
                                    Use the search filters above to find lesson plans by class and subject.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {lessons.map((lesson) => (
                                <Card key={lesson._id} className="group border-0 shadow-lg hover:shadow-2xl rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1">
                                    <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                                    <CardContent className="p-6 space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <h3 className="font-bold text-gray-900 text-lg line-clamp-1">{lesson.topic}</h3>
                                                <p className="text-sm text-gray-500">{lesson.subject}</p>
                                            </div>
                                            <span className={`px-3 py-1.5 rounded-full text-[10px] uppercase font-bold border ${getStatusColor(lesson.status)}`}>
                                                {lesson.status || 'planned'}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <GraduationCap className="h-4 w-4 text-indigo-500" />
                                                <span>{lesson.classId?.name || 'N/A'}-{lesson.classId?.section || ''}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Clock className="h-4 w-4 text-purple-500" />
                                                <span>{lesson.duration || 45} mins</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600 col-span-2">
                                                <Calendar className="h-4 w-4 text-pink-500" />
                                                <span>{lesson.lessonDate ? new Date(lesson.lessonDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'Not scheduled'}</span>
                                            </div>
                                        </div>

                                        <Button variant="outline" className="w-full h-11 rounded-xl border-gray-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors group-hover:border-indigo-300">
                                            <Eye className="h-4 w-4 mr-2" />
                                            View Details
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {lessons.length > 0 && (
                        <div className="flex items-center justify-center gap-2 pt-6">
                            <Button variant="outline" size="sm" disabled className="rounded-xl">
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 rounded-xl min-w-[40px]">1</Button>
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
