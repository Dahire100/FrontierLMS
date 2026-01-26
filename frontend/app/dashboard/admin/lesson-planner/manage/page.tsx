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
import { Badge } from "@/components/ui/badge"
import {
    Search,
    PenTool,
    Loader2,
    Calendar,
    Clock,
    User,
    BookOpen,
    Filter,
    ChevronLeft,
    ChevronRight,
    CheckCircle2,
    AlertCircle,
    Play
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function ManageLessonPlannerPage() {
    const { toast } = useToast()
    const [teachers, setTeachers] = useState<any[]>([])
    const [lessons, setLessons] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searching, setSearching] = useState(false)
    const [teacherId, setTeacherId] = useState("")
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])

    useEffect(() => {
        fetchTeachers()
    }, [])

    const fetchTeachers = async () => {
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/teachers`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const data = await res.json()
            if (data && Array.isArray(data)) {
                setTeachers(data)
            }
        } catch (err) {
            toast({ title: "Error", description: "Failed to load teachers", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = async () => {
        if (!teacherId) {
            toast({ title: "Required", description: "Please select a teacher", variant: "destructive" })
            return
        }

        setSearching(true)
        try {
            const token = localStorage.getItem("token")
            const params = new URLSearchParams()
            params.append("teacherId", teacherId)
            if (date) {
                params.append("startDate", date)
                params.append("endDate", date)
            }

            const res = await fetch(`${API_URL}/api/lesson-planner/teacher/me?${params.toString()}`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const result = await res.json()
            if (result.success) {
                setLessons(result.data || [])
                toast({ title: "Success", description: `Found ${(result.data || []).length} lesson plans` })
            } else {
                setLessons([])
            }
        } catch (err) {
            toast({ title: "Error", description: "Failed to search lesson plans", variant: "destructive" })
        } finally {
            setSearching(false)
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle2 className="h-4 w-4" />
            case 'in-progress': return <Play className="h-4 w-4" />
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

    return (
        <DashboardLayout title="Manage Lesson Planner">
            <div className="space-y-8 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl shadow-lg">
                                <PenTool className="h-6 w-6 text-white" />
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Manage Lesson Planner</h1>
                        </div>
                        <p className="text-gray-500 ml-14">View and manage lesson plans by teacher and date</p>
                    </div>
                </div>

                {/* Search Filters */}
                <Card className="border-0 shadow-xl rounded-3xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50 border-b border-purple-100 py-5">
                        <CardTitle className="text-base font-bold flex items-center gap-2 text-gray-800">
                            <Filter className="h-5 w-5 text-violet-500" />
                            Search Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Teacher <span className="text-red-500">*</span>
                                </Label>
                                <Select value={teacherId} onValueChange={setTeacherId}>
                                    <SelectTrigger className="h-12 bg-gray-50 border-gray-200 rounded-xl hover:bg-white transition-colors">
                                        <SelectValue placeholder="Select Teacher" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {loading ? (
                                            <div className="p-4 text-center">
                                                <Loader2 className="h-5 w-5 animate-spin mx-auto text-violet-600" />
                                            </div>
                                        ) : teachers.length === 0 ? (
                                            <div className="p-4 text-center text-sm text-gray-500">
                                                No teachers found
                                            </div>
                                        ) : (
                                            teachers.map((teacher) => (
                                                <SelectItem key={teacher._id} value={teacher._id}>
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4 text-gray-400" />
                                                        {teacher.firstName} {teacher.lastName}
                                                    </div>
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Date <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <Input
                                        type="date"
                                        className="h-12 bg-gray-50 border-gray-200 rounded-xl pl-12 hover:bg-white transition-colors"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex items-end">
                                <Button
                                    onClick={handleSearch}
                                    disabled={searching}
                                    className="w-full h-12 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold"
                                >
                                    {searching ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Search className="h-5 w-5 mr-2" />}
                                    {searching ? "Searching..." : "Search Plans"}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Results */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900">
                            {lessons.length > 0 ? `${lessons.length} Lesson Plans` : 'Lesson Plans'}
                        </h2>
                    </div>

                    {lessons.length === 0 ? (
                        <Card className="border-0 shadow-lg rounded-3xl">
                            <CardContent className="py-16 text-center">
                                <div className="w-20 h-20 bg-violet-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <PenTool className="h-10 w-10 text-violet-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Plans Found</h3>
                                <p className="text-gray-500 max-w-md mx-auto">
                                    Select a teacher and date to view their lesson plans for the day.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {lessons.map((lesson, index) => (
                                <Card key={lesson._id || index} className="border-0 shadow-lg hover:shadow-xl rounded-2xl transition-all duration-300 overflow-hidden">
                                    <div className="flex flex-col md:flex-row">
                                        {/* Left Color Bar */}
                                        <div className={`w-full md:w-2 h-2 md:h-auto ${lesson.status === 'completed' ? 'bg-emerald-500' :
                                            lesson.status === 'in-progress' ? 'bg-blue-500' : 'bg-amber-500'
                                            }`} />

                                        <CardContent className="flex-1 p-6">
                                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                                <div className="flex-1 space-y-3">
                                                    <div className="flex items-center gap-3 flex-wrap">
                                                        <h3 className="font-bold text-gray-900 text-lg">{lesson.topic}</h3>
                                                        <Badge variant="outline" className={`${getStatusStyles(lesson.status)} text-xs font-bold uppercase rounded-lg px-3 py-1 flex items-center gap-1`}>
                                                            {getStatusIcon(lesson.status)}
                                                            {lesson.status || 'planned'}
                                                        </Badge>
                                                    </div>

                                                    <div className="flex items-center gap-6 flex-wrap text-sm text-gray-600">
                                                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                                                            <BookOpen className="h-4 w-4 text-violet-500" />
                                                            <span className="font-medium">{lesson.classId?.name || 'N/A'}-{lesson.classId?.section || ''}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                                                            <PenTool className="h-4 w-4 text-purple-500" />
                                                            <span>{lesson.subject}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                                                            <Clock className="h-4 w-4 text-pink-500" />
                                                            <span>{lesson.duration || 45} mins</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2">
                                                    <Button variant="outline" className="rounded-xl border-gray-200 hover:bg-violet-50 hover:text-violet-600 hover:border-violet-200">
                                                        Edit
                                                    </Button>
                                                    <Button className="bg-violet-600 hover:bg-violet-700 rounded-xl">
                                                        View
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </div>
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
                            <Button size="sm" className="bg-violet-600 hover:bg-violet-700 rounded-xl min-w-[40px]">1</Button>
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
