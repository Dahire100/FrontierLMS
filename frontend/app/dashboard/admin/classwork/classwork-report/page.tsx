"use client"

import { useState, useEffect } from "react"
import { API_URL } from "@/lib/api-config"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart2, Loader2, Search, Download, FileText, Eye, Printer, Calendar, BookOpen, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

interface ClassworkItem {
    _id: string
    title: string
    description: string
    classId: { _id: string; name: string; section: string }
    subject: string
    assignedDate: string
    dueDate?: string
    status: string
    maxMarks: number
    submissions?: any[]
    attachments?: any[]
}

export default function ClassworkReport() {
    const [classes, setClasses] = useState<any[]>([])
    const [classwork, setClasswork] = useState<ClassworkItem[]>([])
    const [loading, setLoading] = useState(true)
    const [searching, setSearching] = useState(false)

    // Filters
    const [filters, setFilters] = useState({
        classId: "",
        subject: "",
        keyword: "",
        status: "",
        startDate: "",
        endDate: ""
    })

    // View Modal
    const [viewItem, setViewItem] = useState<ClassworkItem | null>(null)
    const [isViewOpen, setIsViewOpen] = useState(false)

    useEffect(() => {
        fetchClasses()
        fetchClasswork()
    }, [])

    const fetchClasses = async () => {
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/classes`, { headers: { "Authorization": `Bearer ${token}` } })
            const data = await res.json()
            if (data.success && Array.isArray(data.data)) setClasses(data.data)
            else if (Array.isArray(data)) setClasses(data)
        } catch { }
    }

    const fetchClasswork = async () => {
        try {
            setSearching(true)
            const token = localStorage.getItem("token")
            const params = new URLSearchParams()
            if (filters.classId && filters.classId !== 'all') params.append('classId', filters.classId)
            if (filters.subject && filters.subject !== 'all') params.append('subject', filters.subject)
            if (filters.status && filters.status !== 'all') params.append('status', filters.status)
            if (filters.keyword) params.append('keyword', filters.keyword)
            if (filters.startDate) params.append('startDate', filters.startDate)
            if (filters.endDate) params.append('endDate', filters.endDate)
            params.append('limit', '1000') // Fetch all for report

            const res = await fetch(`${API_URL}/api/classwork?${params.toString()}`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const data = await res.json()
            const list = Array.isArray(data) ? data : (data.data || [])
            setClasswork(list)
        } catch {
            toast.error("Failed to load classwork data")
        } finally {
            setLoading(false)
            setSearching(false)
        }
    }

    const getStatus = (cw: ClassworkItem) => {
        if (cw.status === 'completed') return 'Completed';
        if (cw.dueDate && new Date(cw.dueDate) < new Date()) return 'Expired';
        return 'Active'; // Default instead of 'Pending' if active
    }

    const handleExportCSV = () => {
        const headers = ["Title", "Class", "Subject", "Assigned Date", "Due Date", "Max Marks", "Status"]
        const csvContent = [
            headers.join(","),
            ...classwork.map(cw => [
                `"${cw.title}"`,
                cw.classId?.name ? `${cw.classId.name}-${cw.classId.section}` : 'N/A',
                cw.subject,
                new Date(cw.assignedDate).toLocaleDateString(),
                cw.dueDate ? new Date(cw.dueDate).toLocaleDateString() : 'No Due Date',
                cw.maxMarks || 0,
                getStatus(cw)
            ].join(","))
        ].join("\n")

        const blob = new Blob([csvContent], { type: "text/csv" })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `Classwork_Report_${new Date().toISOString().split('T')[0]}.csv`
        a.click()
    }

    const handleExportPDF = () => {
        const doc = new jsPDF()
        doc.text("Classwork Report", 14, 15)
        doc.setFontSize(10)
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22)

        const tableData = classwork.map(cw => [
            cw.title,
            cw.classId?.name ? `${cw.classId.name}-${cw.classId.section}` : 'N/A',
            cw.subject,
            new Date(cw.assignedDate).toLocaleDateString(),
            cw.dueDate ? new Date(cw.dueDate).toLocaleDateString() : '-',
            getStatus(cw)
        ])

        autoTable(doc, {
            head: [["Title", "Class", "Subject", "Assigned", "Due Date", "Status"]],
            body: tableData,
            startY: 30,
        })

        doc.save(`Classwork_Report_${new Date().toISOString().split('T')[0]}.pdf`)
    }

    const clearFilters = () => {
        setFilters({ classId: "", subject: "", keyword: "", status: "", startDate: "", endDate: "" })
        // fetchClasswork() // Optional: auto-fetch or wait for search click
    }

    // Stats
    const totalClasswork = classwork.length
    const activeClasswork = classwork.filter(c => getStatus(c) === 'Active').length
    const expiredClasswork = classwork.filter(c => getStatus(c) === 'Expired').length

    return (
        <DashboardLayout title="Classwork Report">
            <div className="space-y-6">

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-l-4 border-l-blue-500 shadow-sm">
                        <CardHeader className="py-4">
                            <CardTitle className="text-sm font-medium text-gray-500">Total Assignments</CardTitle>
                            <div className="text-2xl font-bold text-gray-900">{totalClasswork}</div>
                        </CardHeader>
                    </Card>
                    <Card className="border-l-4 border-l-green-500 shadow-sm">
                        <CardHeader className="py-4">
                            <CardTitle className="text-sm font-medium text-gray-500">Active / Ongoing</CardTitle>
                            <div className="text-2xl font-bold text-gray-900">{activeClasswork}</div>
                        </CardHeader>
                    </Card>
                    <Card className="border-l-4 border-l-red-500 shadow-sm">
                        <CardHeader className="py-4">
                            <CardTitle className="text-sm font-medium text-gray-500">Expired / Closed</CardTitle>
                            <div className="text-2xl font-bold text-gray-900">{expiredClasswork}</div>
                        </CardHeader>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader className="bg-gray-50/50 border-b pb-4">
                        <CardTitle className="text-base font-bold flex items-center gap-2 text-gray-700">
                            <Search className="h-4 w-4" /> Search & Filter
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label>Class</Label>
                                <Select value={filters.classId} onValueChange={(v) => setFilters({ ...filters, classId: v })}>
                                    <SelectTrigger className="bg-white"><SelectValue placeholder="All Classes" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Classes</SelectItem>
                                        {classes.map((cls) => (
                                            <SelectItem key={cls._id} value={cls._id}>Class {cls.name}-{cls.section}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Subject</Label>
                                <Input
                                    placeholder="e.g. Math"
                                    value={filters.subject}
                                    onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Keyword</Label>
                                <Input
                                    placeholder="Title search..."
                                    value={filters.keyword}
                                    onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v })}>
                                    <SelectTrigger className="bg-white"><SelectValue placeholder="All Status" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="pending">Active</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Start Date</Label>
                                <Input type="date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>End Date</Label>
                                <Input type="date" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} />
                            </div>
                            <div className="flex items-end gap-2 md:col-span-2">
                                <Button onClick={fetchClasswork} disabled={searching} className="bg-[#1a237e] hover:bg-[#1a237e]/90 w-32">
                                    {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
                                </Button>
                                <Button variant="outline" onClick={clearFilters} className="text-gray-500">Clear</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card className="border-t-4 border-t-[#1a237e]">
                    <CardHeader className="flex flex-row items-center justify-between border-b bg-gray-50/50 py-4">
                        <CardTitle className="text-base text-[#1a237e] flex gap-2 items-center">
                            <BookOpen className="h-5 w-5" /> Classwork List
                        </CardTitle>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2 text-green-700 bg-green-50 border-green-200 hover:bg-green-100">
                                <FileText className="h-4 w-4" /> CSV
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleExportPDF} className="gap-2 text-red-700 bg-red-50 border-red-200 hover:bg-red-100">
                                <Printer className="h-4 w-4" /> PDF
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            {loading ? (
                                <div className="p-12 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-900" /></div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-100/50">
                                            <TableHead className="font-bold text-gray-700">Class</TableHead>
                                            <TableHead className="font-bold text-gray-700">Section</TableHead>
                                            <TableHead className="font-bold text-gray-700">Subject</TableHead>
                                            <TableHead className="font-bold text-gray-700">Title</TableHead>
                                            <TableHead className="font-bold text-gray-700">Assigned</TableHead>
                                            <TableHead className="font-bold text-gray-700">Due Date</TableHead>
                                            <TableHead className="font-bold text-gray-700">Status</TableHead>
                                            <TableHead className="font-bold text-right text-gray-700">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {classwork.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={8} className="text-center py-10 text-gray-400">No classwork found matching criteria.</TableCell>
                                            </TableRow>
                                        ) : classwork.map((cw) => (
                                            <TableRow key={cw._id} className="hover:bg-blue-50/30 transition-colors">
                                                <TableCell className="font-medium text-[#1a237e]">{cw.classId?.name || '-'}</TableCell>
                                                <TableCell>{cw.classId?.section || '-'}</TableCell>
                                                <TableCell>{cw.subject}</TableCell>
                                                <TableCell className="max-w-[200px] truncate" title={cw.title}>{cw.title}</TableCell>
                                                <TableCell>{new Date(cw.assignedDate).toLocaleDateString()}</TableCell>
                                                <TableCell>{cw.dueDate ? new Date(cw.dueDate).toLocaleDateString() : 'No Due Date'}</TableCell>
                                                <TableCell>
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatus(cw) === 'Completed' ? 'bg-green-100 text-green-700 border-green-200' :
                                                            getStatus(cw) === 'Expired' ? 'bg-red-100 text-red-700 border-red-200' :
                                                                'bg-sky-100 text-sky-700 border-sky-200'
                                                        }`}>
                                                        {getStatus(cw)}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm" onClick={() => { setViewItem(cw); setIsViewOpen(true) }} className="h-8 w-8 p-0">
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

                {/* View Dialog */}
                <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-xl text-[#1a237e]">Classwork Details</DialogTitle>
                        </DialogHeader>
                        {viewItem && (
                            <div className="grid grid-cols-2 gap-y-4 gap-x-8 py-4">
                                <div className="col-span-2 p-4 bg-gray-50 rounded-lg border border-gray-100">
                                    <h3 className="font-bold text-lg mb-1">{viewItem.title}</h3>
                                    <p className="text-sm text-gray-500 flex gap-4">
                                        <span>Subject: <strong className="text-gray-700">{viewItem.subject}</strong></span>
                                        <span>Marks: <strong className="text-gray-700">{viewItem.maxMarks}</strong></span>
                                    </p>
                                </div>

                                <div>
                                    <Label className="text-gray-500 text-xs uppercase">Class details</Label>
                                    <p className="font-medium">Class {viewItem.classId?.name} ({viewItem.classId?.section})</p>
                                </div>
                                <div>
                                    <Label className="text-gray-500 text-xs uppercase">Assigned Date</Label>
                                    <p className="font-medium">{new Date(viewItem.assignedDate).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <Label className="text-gray-500 text-xs uppercase">Due Date</Label>
                                    <p className="font-medium text-red-600">{viewItem.dueDate ? new Date(viewItem.dueDate).toLocaleDateString() : 'None'}</p>
                                </div>
                                <div>
                                    <Label className="text-gray-500 text-xs uppercase">Submission Status</Label>
                                    <p className="font-medium">{viewItem.submissions?.length || 0} Submitted</p>
                                </div>

                                <div className="col-span-2 mt-2">
                                    <Label className="text-gray-500 text-xs uppercase mb-1 block">Description</Label>
                                    <div className="p-3 border rounded-md text-sm bg-white min-h-[80px] text-gray-700 whitespace-pre-wrap">
                                        {viewItem.description}
                                    </div>
                                </div>

                                {viewItem.attachments && viewItem.attachments.length > 0 && (
                                    <div className="col-span-2">
                                        <Label className="text-gray-500 text-xs uppercase mb-2 block">Attachments</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {viewItem.attachments.map((file: any, idx) => (
                                                <a
                                                    key={idx}
                                                    href={file.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-md text-sm hover:bg-blue-100 transition-colors"
                                                >
                                                    <Download className="h-3 w-3" /> {file.filename || `File ${idx + 1}`}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        <DialogFooter>
                            <Button onClick={() => setIsViewOpen(false)}>Close</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    )
}
