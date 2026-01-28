"use client"

import { useState, useEffect } from "react"
import { API_URL } from "@/lib/api-config"
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
import { ClipboardCheck, Loader2, Search } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface HomeworkItem {
    _id: string
    title: string
    classId: { _id: string; name: string; section: string }
    subject: string
    dueDate: string
    status: string
    submissions?: { studentId: string; grade?: string; remarks?: string }[]
}

export default function HomeworkEvaluation() {
    const { toast } = useToast()
    const [classes, setClasses] = useState<any[]>([])
    const [homework, setHomework] = useState<HomeworkItem[]>([])
    const [loading, setLoading] = useState(true)
    const [searching, setSearching] = useState(false)
    const [filters, setFilters] = useState({
        classId: "",
        status: "all"
    })
    const [grading, setGrading] = useState<Record<string, { grade: string; remarks: string }>>({})

    useEffect(() => {
        fetchClasses()
        fetchHomework()
    }, [])

    const fetchClasses = async () => {
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/classes`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const data = await res.json()
            if (Array.isArray(data)) setClasses(data)
        } catch { }
    }

    const fetchHomework = async () => {
        try {
            setSearching(true)
            const token = localStorage.getItem("token")
            let url = `${API_URL}/api/homework`
            if (filters.classId) url += `?classId=${filters.classId}`

            const res = await fetch(url, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const data = await res.json()
            if (Array.isArray(data)) {
                setHomework(data)
            } else if (data.data && Array.isArray(data.data)) {
                setHomework(data.data)
            }
        } catch {
            toast({ title: "Error", description: "Failed to load homework", variant: "destructive" })
        } finally {
            setLoading(false)
            setSearching(false)
        }
    }

    const handleGrade = async (homeworkId: string, studentId: string) => {
        const gradeData = grading[homeworkId]
        if (!gradeData?.grade) {
            toast({ title: "Required", description: "Please enter a grade", variant: "destructive" })
            return
        }

        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/homework/${homeworkId}/grade/${studentId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    grade: gradeData.grade,
                    remarks: gradeData.remarks || ""
                })
            })

            if (res.ok) {
                toast({ title: "Success", description: "Grade saved successfully" })
                fetchHomework()
            } else {
                const err = await res.json()
                toast({ title: "Error", description: err.error || "Failed to save grade", variant: "destructive" })
            }
        } catch {
            toast({ title: "Error", description: "Network error", variant: "destructive" })
        }
    }

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            'submitted': 'bg-green-100 text-green-700',
            'pending': 'bg-yellow-100 text-yellow-700',
            'graded': 'bg-blue-100 text-blue-700',
            'overdue': 'bg-red-100 text-red-700'
        }
        return <span className={`px-2 py-1 rounded-full text-xs font-bold ${styles[status] || 'bg-gray-100 text-gray-700'}`}>{status}</span>
    }

    return (
        <DashboardLayout title="Homework Evaluation">
            <div className="space-y-6">
                <Card>
                    <CardHeader className="bg-pink-50 border-b border-pink-100">
                        <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                            <ClipboardCheck className="h-5 w-5" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                <Label>Status</Label>
                                <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v })}>
                                    <SelectTrigger className="bg-white border-gray-200">
                                        <SelectValue placeholder="All" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="submitted">Submitted</SelectItem>
                                        <SelectItem value="graded">Graded</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-end">
                                <Button onClick={fetchHomework} disabled={searching} className="bg-blue-900 hover:bg-blue-800 w-full">
                                    {searching ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                                    Search
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="bg-pink-50 border-b border-pink-100">
                        <CardTitle className="text-lg text-gray-800">Homework List</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <div className="overflow-x-auto">
                            {loading ? (
                                <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-pink-50 hover:bg-pink-50">
                                            <TableHead className="font-bold text-gray-700 uppercase">Title</TableHead>
                                            <TableHead className="font-bold text-gray-700 uppercase">Class</TableHead>
                                            <TableHead className="font-bold text-gray-700 uppercase">Subject</TableHead>
                                            <TableHead className="font-bold text-gray-700 uppercase">Due Date</TableHead>
                                            <TableHead className="font-bold text-gray-700 uppercase">Grade</TableHead>
                                            <TableHead className="font-bold text-gray-700 uppercase">Remarks</TableHead>
                                            <TableHead className="font-bold text-gray-700 uppercase text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {homework.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                                    No homework found.
                                                </TableCell>
                                            </TableRow>
                                        ) : homework.map((hw) => (
                                            <TableRow key={hw._id}>
                                                <TableCell className="font-medium">{hw.title}</TableCell>
                                                <TableCell>
                                                    {hw.classId?.name ? `${hw.classId.name}-${hw.classId.section}` : 'N/A'}
                                                </TableCell>
                                                <TableCell>{hw.subject}</TableCell>
                                                <TableCell>{new Date(hw.dueDate).toLocaleDateString()}</TableCell>
                                                <TableCell>
                                                    <Input
                                                        placeholder="Grade"
                                                        className="w-20 bg-white border-gray-200"
                                                        value={grading[hw._id]?.grade || ""}
                                                        onChange={(e) => setGrading({
                                                            ...grading,
                                                            [hw._id]: { ...grading[hw._id], grade: e.target.value }
                                                        })}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        placeholder="Remarks"
                                                        className="w-32 bg-white border-gray-200"
                                                        value={grading[hw._id]?.remarks || ""}
                                                        onChange={(e) => setGrading({
                                                            ...grading,
                                                            [hw._id]: { ...grading[hw._id], remarks: e.target.value }
                                                        })}
                                                    />
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        size="sm"
                                                        className="bg-green-600 hover:bg-green-700"
                                                        onClick={() => handleGrade(hw._id, "default")}
                                                    >
                                                        Save Grade
                                                    </Button>
                                                </TableCell>
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
