"use client"

import { useState, useEffect } from "react"
import { API_URL } from "@/lib/api-config"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MessageSquare, Loader2, Search, Printer, Download, Eye } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const REMARK_TEMPLATES = [
    "Excellent work, keep it up!",
    "Good attempt, but needs improvement.",
    "Late submission.",
    "Incomplete assignment.",
    "Handwriting needs improvement.",
    "Well structured answers."
]

export default function TeacherRemarks() {
    const { toast } = useToast()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // Data states
    const [classes, setClasses] = useState<any[]>([])
    const [homeworksList, setHomeworksList] = useState<any[]>([])
    const [filteredHomeworks, setFilteredHomeworks] = useState<any[]>([]) // Used for dropdown based on class
    const [students, setStudents] = useState<any[]>([])

    // UI states
    const [allRemarks, setAllRemarks] = useState<any[]>([])
    const [filteredRemarks, setFilteredRemarks] = useState<any[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [viewRemark, setViewRemark] = useState<any | null>(null)
    const [viewOpen, setViewOpen] = useState(false)

    // Form state
    const [form, setForm] = useState({
        classId: "",
        homeworkId: "",
        studentId: "",
        remark: ""
    })

    useEffect(() => {
        fetchClasses()
        fetchRemarks()
    }, [])

    useEffect(() => {
        if (form.classId) {
            // Filter homeworks for this class
            const classHw = homeworksList.filter((h: any) =>
                (typeof h.classId === 'object' ? h.classId._id : h.classId) === form.classId
            )
            setFilteredHomeworks(classHw)

            // Fetch students for this class
            fetchStudents(form.classId)
        } else {
            setFilteredHomeworks([])
            setStudents([])
        }
    }, [form.classId, homeworksList])

    useEffect(() => {
        if (searchQuery) {
            const lower = searchQuery.toLowerCase()
            const filtered = allRemarks.filter(r =>
                r.studentName?.toLowerCase().includes(lower) ||
                r.homeworkTitle?.toLowerCase().includes(lower) ||
                r.remark?.toLowerCase().includes(lower)
            )
            setFilteredRemarks(filtered)
        } else {
            setFilteredRemarks(allRemarks)
        }
    }, [searchQuery, allRemarks])

    const fetchClasses = async () => {
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/classes`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const data = await res.json()
            if (Array.isArray(data)) setClasses(data)
            else if (data.data) setClasses(data.data)
        } catch { }
    }

    const fetchStudents = async (classId: string) => {
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/students?class=${classId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const data = await res.json()
            if (Array.isArray(data)) setStudents(data)
        } catch { }
    }

    const fetchRemarks = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem("token")
            // Reusing getAllHomework to extract remarks
            const res = await fetch(`${API_URL}/api/homework`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const data = await res.json()
            const hwList = (data.success && data.data) ? data.data : (Array.isArray(data) ? data : [])
            setHomeworksList(hwList)

            // Extract remarks
            const remarks: any[] = []
            hwList.forEach((hw: any) => {
                if (hw.submissions) {
                    hw.submissions.forEach((sub: any) => {
                        if (sub.feedback) {
                            remarks.push({
                                id: `${hw._id}-${sub.studentId?._id || sub.studentId}`,
                                homeworkId: hw._id,
                                homeworkTitle: hw.title,
                                classId: hw.classId,
                                studentId: sub.studentId?._id || sub.studentId,
                                studentName: sub.studentId?.firstName ? `${sub.studentId.firstName} ${sub.studentId.lastName}` : 'Unknown Student',
                                remark: sub.feedback,
                                date: sub.submittedAt || hw.createdAt
                            })
                        }
                    })
                }
            })
            setAllRemarks(remarks)
            setFilteredRemarks(remarks)
        } catch {
            toast({ title: "Error", description: "Failed to load remarks", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.classId || !form.homeworkId || !form.studentId || !form.remark) {
            toast({ title: "Validation Error", description: "All fields are required", variant: "destructive" })
            return
        }

        setSaving(true)
        try {
            const token = localStorage.getItem("token")

            // We need to keep existing marks if any.
            // First find the submission to get current marks
            const hw = homeworksList.find(h => h._id === form.homeworkId)
            const sub = hw?.submissions?.find((s: any) => (s.studentId?._id || s.studentId) === form.studentId)
            const currentMarks = sub?.marks

            const res = await fetch(`${API_URL}/api/homework/${form.homeworkId}/grade/${form.studentId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    grade: currentMarks, // Preserve marks? API expects 'grade' or 'marks'? Controller uses 'marks' from body.
                    marks: currentMarks, // sending both to be safe based on controller I read
                    feedback: form.remark
                })
            })

            const data = await res.json()
            if (data.success) {
                toast({ title: "Success", description: "Remark added successfully" })
                setForm({ classId: "", homeworkId: "", studentId: "", remark: "" })
                fetchRemarks() // Refresh list
            } else {
                toast({ title: "Error", description: "Failed to save remark", variant: "destructive" })
            }
        } catch {
            toast({ title: "Error", description: "Failed to save remark", variant: "destructive" })
        } finally {
            setSaving(false)
        }
    }

    const handleTemplateSelect = (template: string) => {
        setForm(prev => ({ ...prev, remark: template }))
    }

    const handlePrint = () => {
        window.print()
    }

    const handleDownload = () => {
        const headers = ["Student", "Class", "Homework", "Remark"]
        const csvContent = [
            headers.join(","),
            ...filteredRemarks.map(r => [
                `"${r.studentName}"`,
                `"${r.classId?.name || ''} ${r.classId?.section || ''}"`,
                `"${r.homeworkTitle}"`,
                `"${r.remark}"`
            ].join(","))
        ].join("\n")

        const blob = new Blob([csvContent], { type: "text/csv" })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "teacher_remarks.csv"
        a.click()
    }

    return (
        <DashboardLayout title="Teacher Remarks">
            <div className="space-y-6">
                <Card>
                    <CardHeader className="bg-pink-50 border-b border-pink-100">
                        <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                            <MessageSquare className="h-5 w-5" />
                            Add Remark
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label className="text-red-500">Class *</Label>
                                <Select value={form.classId} onValueChange={(val) => setForm({ ...form, classId: val, homeworkId: "", studentId: "" })}>
                                    <SelectTrigger className="bg-white border-gray-200">
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
                                <Label className="text-red-500">Homework *</Label>
                                <Select value={form.homeworkId} onValueChange={(val) => setForm({ ...form, homeworkId: val })} disabled={!form.classId}>
                                    <SelectTrigger className="bg-white border-gray-200">
                                        <SelectValue placeholder="Select Homework" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filteredHomeworks.map((hw) => (
                                            <SelectItem key={hw._id} value={hw._id}>
                                                {hw.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-red-500">Student *</Label>
                                <Select value={form.studentId} onValueChange={(val) => setForm({ ...form, studentId: val })} disabled={!form.classId}>
                                    <SelectTrigger className="bg-white border-gray-200">
                                        <SelectValue placeholder="Select Student" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {students.map((stu) => (
                                            <SelectItem key={stu._id} value={stu._id}>
                                                {stu.firstName} {stu.lastName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="md:col-span-3 space-y-2">
                                <div className="flex justify-between items-center">
                                    <Label className="text-red-500">Remark *</Label>
                                    <Select onValueChange={handleTemplateSelect}>
                                        <SelectTrigger className="w-[200px] h-8 text-xs bg-gray-50">
                                            <SelectValue placeholder="Use Template" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {REMARK_TEMPLATES.map((t, i) => (
                                                <SelectItem key={i} value={t}>{t}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Textarea
                                    value={form.remark}
                                    onChange={(e) => setForm({ ...form, remark: e.target.value })}
                                    rows={3}
                                    className="bg-white border-gray-200"
                                    placeholder="Enter remarks..."
                                />
                            </div>

                            <div className="md:col-span-3 flex justify-end">
                                <Button type="submit" disabled={saving} className="bg-blue-900 hover:bg-blue-800 px-8">
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    Save Remark
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="bg-pink-50 border-b border-pink-100">
                        <CardTitle className="text-lg flex justify-between items-center text-gray-800">
                            <span>Remarks List</span>
                            <div className="flex gap-2">
                                <div className="relative w-64">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search remarks..."
                                        className="pl-8 bg-white"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <Button variant="outline" size="icon" onClick={handleDownload}>
                                    <Download className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="icon" onClick={handlePrint}>
                                    <Printer className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="overflow-x-auto">
                            {loading ? (
                                <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-pink-50 hover:bg-pink-50">
                                            <TableHead className="font-bold text-gray-700 uppercase">Student</TableHead>
                                            <TableHead className="font-bold text-gray-700 uppercase">Class/Section</TableHead>
                                            <TableHead className="font-bold text-gray-700 uppercase">Homework</TableHead>
                                            <TableHead className="font-bold text-gray-700 uppercase">Remark</TableHead>
                                            <TableHead className="font-bold text-gray-700 uppercase text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredRemarks.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                    No remarks found.
                                                </TableCell>
                                            </TableRow>
                                        ) : filteredRemarks.map((row) => (
                                            <TableRow key={row.id}>
                                                <TableCell className="font-medium">{row.studentName}</TableCell>
                                                <TableCell>{row.classId?.name} {row.classId?.section}</TableCell>
                                                <TableCell>{row.homeworkTitle}</TableCell>
                                                <TableCell>{row.remark}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm" onClick={() => { setViewRemark(row); setViewOpen(true); }}>
                                                        <Eye className="h-4 w-4 text-blue-600" />
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

                <Dialog open={viewOpen} onOpenChange={setViewOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Remark Details</DialogTitle>
                        </DialogHeader>
                        {viewRemark && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div><Label className="text-gray-500">Student</Label><p className="font-semibold">{viewRemark.studentName}</p></div>
                                    <div><Label className="text-gray-500">Class</Label><p className="font-semibold">{viewRemark.classId?.name} {viewRemark.classId?.section}</p></div>
                                    <div className="col-span-2"><Label className="text-gray-500">Homework</Label><p className="font-semibold">{viewRemark.homeworkTitle}</p></div>
                                </div>
                                <div>
                                    <Label className="text-gray-500">Remark</Label>
                                    <p className="bg-gray-50 p-3 rounded mt-1">{viewRemark.remark}</p>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    )
}
