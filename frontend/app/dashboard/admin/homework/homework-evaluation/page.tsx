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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { ClipboardCheck, Loader2, Search, Eye, FileText, Printer, Download } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"

interface HomeworkItem {
    _id: string
    title: string
    classId: { _id: string; name: string; section: string }
    subject: string
    dueDate: string
    status: string
    submissions?: any[]
    description?: string
    totalMarks?: number
    assignedDate?: string
    attachments?: any[]
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

    // Evaluation Modal State
    const [selectedHomework, setSelectedHomework] = useState<HomeworkItem | null>(null)
    const [evaluationOpen, setEvaluationOpen] = useState(false)
    const [viewOpen, setViewOpen] = useState(false)
    const [students, setStudents] = useState<any[]>([])
    const [loadingStudents, setLoadingStudents] = useState(false)
    const [grades, setGrades] = useState<Record<string, { marks: string; feedback: string }>>({})

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
            else if (data.data && Array.isArray(data.data)) setClasses(data.data)
        } catch { }
    }

    const fetchHomework = async () => {
        try {
            setSearching(true)
            const token = localStorage.getItem("token")
            let url = `${API_URL}/api/homework`
            const params = new URLSearchParams()
            if (filters.classId && filters.classId !== 'all') params.append('classId', filters.classId)
            if (filters.status && filters.status !== 'all') params.append('status', filters.status)

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

    const openEvaluation = async (hw: HomeworkItem) => {
        setSelectedHomework(hw)
        setEvaluationOpen(true)
        setLoadingStudents(true)
        setStudents([])
        setGrades({})

        try {
            const token = localStorage.getItem("token")

            // 1. Fetch Students of the class
            // Assuming we query by class ID. 
            const studentRes = await fetch(`${API_URL}/api/students?class=${hw.classId._id}`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const studentData = await studentRes.json()

            // 2. Fetch fresh Homework details to ensure we have latest submissions
            // The list might be stale or not have full populated fields if needed
            const hwRes = await fetch(`${API_URL}/api/homework/${hw._id}`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const hwData = await hwRes.json()
            const freshHw = hwData.success ? hwData.data : hw;
            setSelectedHomework(freshHw);

            // 3. Map students to submissions
            if (Array.isArray(studentData)) {
                setStudents(studentData)

                // Initialize grades state from existing submissions
                const initialGrades: Record<string, { marks: string; feedback: string }> = {}
                freshHw.submissions?.forEach((sub: any) => {
                    // sub.studentId might be object or string depending on population
                    const sId = typeof sub.studentId === 'object' ? sub.studentId._id : sub.studentId
                    initialGrades[sId] = {
                        marks: sub.marks?.toString() || "",
                        feedback: sub.feedback || ""
                    }
                })
                setGrades(initialGrades)
            }

        } catch (err) {
            toast({ title: "Error", description: "Failed to load students for evaluation", variant: "destructive" })
        } finally {
            setLoadingStudents(false)
        }
    }

    const handleSaveGrade = async (studentId: string) => {
        if (!selectedHomework) return

        const gradeData = grades[studentId]
        if (!gradeData?.marks) {
            toast({ title: "Validation Error", description: "Please enter marks", variant: "destructive" })
            return
        }

        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/homework/${selectedHomework._id}/grade/${studentId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    marks: parseInt(gradeData.marks),
                    feedback: gradeData.feedback
                })
            })

            const data = await res.json()
            if (data.success) {
                toast({ title: "Success", description: "Grade saved successfully" })
                // Update local state to reflect 'graded' status if we were tracking it per student object
                // For now, fetching homework again might be overkill, so we rely on the toast
            } else {
                toast({ title: "Error", description: data.error || "Failed to save grade", variant: "destructive" })
            }
        } catch {
            toast({ title: "Error", description: "Network error", variant: "destructive" })
        }
    }

    const getSubmissionStatus = (studentId: string) => {
        if (!selectedHomework?.submissions) return 'pending'
        const sub = selectedHomework.submissions.find((s: any) => {
            const sId = typeof s.studentId === 'object' ? s.studentId._id : s.studentId
            return sId === studentId
        })
        return sub ? (sub.status || 'submitted') : 'pending'
    }

    const getSubmissionFile = (studentId: string) => {
        if (!selectedHomework?.submissions) return null
        const sub = selectedHomework.submissions.find((s: any) => {
            const sId = typeof s.studentId === 'object' ? s.studentId._id : s.studentId
            return sId === studentId
        })
        return sub?.attachments?.[0] // Assuming single file for simplicity, or return array
    }

    const handlePrint = (hw: HomeworkItem) => {
        window.print();
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
                                <Label>Homework Status</Label>
                                <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v })}>
                                    <SelectTrigger className="bg-white border-gray-200">
                                        <SelectValue placeholder="All" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="closed">Closed</SelectItem>
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
                                            <TableHead className="font-bold text-gray-700 uppercase">Submissions</TableHead>
                                            <TableHead className="font-bold text-gray-700 uppercase">Status</TableHead>
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
                                                    {hw.classId?.name} {hw.classId?.section}
                                                </TableCell>
                                                <TableCell>{hw.subject}</TableCell>
                                                <TableCell>{new Date(hw.dueDate).toLocaleDateString()}</TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">{hw.submissions?.length || 0}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={hw.status === 'active' ? "default" : "secondary"}>
                                                        {hw.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button size="sm" variant="ghost" onClick={() => { setSelectedHomework(hw); setViewOpen(true); }}>
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            className="bg-blue-600 hover:bg-blue-700"
                                                            onClick={() => openEvaluation(hw)}
                                                        >
                                                            Evaluate
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* View Dialog */}
                <Dialog open={viewOpen} onOpenChange={setViewOpen}>
                    <DialogContent className="max-w-3xl">
                        <DialogHeader>
                            <DialogTitle>Homework Details</DialogTitle>
                        </DialogHeader>
                        {selectedHomework && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div><Label className="text-gray-500">Title</Label><p className="font-semibold">{selectedHomework.title}</p></div>
                                    <div><Label className="text-gray-500">Subject</Label><p className="font-semibold">{selectedHomework.subject}</p></div>
                                    <div><Label className="text-gray-500">Class</Label><p className="font-semibold">{selectedHomework.classId?.name} {selectedHomework.classId?.section}</p></div>
                                    <div><Label className="text-gray-500">Due Date</Label><p className="font-semibold">{new Date(selectedHomework.dueDate).toLocaleDateString()}</p></div>
                                    <div><Label className="text-gray-500">Total Marks</Label><p className="font-semibold">{selectedHomework.totalMarks}</p></div>
                                </div>
                                <div>
                                    <Label className="text-gray-500">Description</Label>
                                    <p className="bg-gray-50 p-3 rounded text-sm">{selectedHomework.description}</p>
                                </div>
                                <div>
                                    <Button variant="outline" size="sm" onClick={() => handlePrint(selectedHomework)}>
                                        <Printer className="h-4 w-4 mr-2" /> Print
                                    </Button>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Evaluation Dialog */}
                <Dialog open={evaluationOpen} onOpenChange={setEvaluationOpen}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Evaluate Homework - {selectedHomework?.title}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            {loadingStudents ? (
                                <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Student Name</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Submission</TableHead>
                                            <TableHead>Marks (Max: {selectedHomework?.totalMarks})</TableHead>
                                            <TableHead>Remarks</TableHead>
                                            <TableHead>Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {students.map(student => {
                                            const status = getSubmissionStatus(student._id);
                                            const file = getSubmissionFile(student._id);

                                            return (
                                                <TableRow key={student._id}>
                                                    <TableCell className="font-medium">{student.firstName} {student.lastName}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={status === 'graded' ? 'default' : (status === 'submitted' ? 'secondary' : 'outline')}>
                                                            {status.toUpperCase()}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {file ? (
                                                            <a href={file.url} target="_blank" rel="noreferrer" className="text-blue-600 underline text-sm flex items-center gap-1">
                                                                <FileText className="h-3 w-3" /> View Property
                                                            </a>
                                                        ) : <span className="text-gray-400 text-xs">No file</span>}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            className="w-20"
                                                            type="number"
                                                            max={selectedHomework?.totalMarks}
                                                            value={grades[student._id]?.marks || ""}
                                                            onChange={(e) => setGrades({
                                                                ...grades,
                                                                [student._id]: { ...grades[student._id], marks: e.target.value }
                                                            })}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            className="w-40"
                                                            placeholder="Good job..."
                                                            value={grades[student._id]?.feedback || ""}
                                                            onChange={(e) => setGrades({
                                                                ...grades,
                                                                [student._id]: { ...grades[student._id], feedback: e.target.value }
                                                            })}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleSaveGrade(student._id)}>
                                                            Save
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    )
}
