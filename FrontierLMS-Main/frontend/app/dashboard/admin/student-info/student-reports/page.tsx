"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import {
    Users,
    User,
    FileText,
    Monitor,
    BarChart,
    Lock,
    FilePen,
    Home,
    PieChart,
    FileMinus,
    Search,
    ChevronDown,
    Loader2,
    Download,
    ArrowRight,
    FileCheck,
    Info,
    ShieldCheck
} from "lucide-react"
import { API_URL } from "@/lib/api-config"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

// Report Data Configuration
const REPORT_TYPES = [
    { id: 'student_report', title: "Student Report", subtitle: "Class Section Wise", icon: User, color: "text-amber-600", bg: "bg-amber-100" },
    { id: 'guardian_report', title: "Guardian Report", subtitle: "Guardian Details", icon: Users, color: "text-orange-600", bg: "bg-orange-100" },
    { id: 'student_history', title: "Student History", subtitle: "Timeline Records", icon: FileText, color: "text-emerald-600", bg: "bg-emerald-100" },
    { id: 'strength_report', title: "Strength Report", subtitle: "Gender Distribution", icon: BarChart, color: "text-blue-600", bg: "bg-blue-100" },
    { id: 'login_credential', title: "Login Credentials", subtitle: "Access Records", icon: Lock, color: "text-purple-600", bg: "bg-purple-100" },
    { id: 'house_strength', title: "House Strength", subtitle: "House Wise Analysis", icon: Home, color: "text-yellow-600", bg: "bg-yellow-100" },
]

export default function StudentReports() {
    const [activeReport, setActiveReport] = useState('student_report')
    const [classes, setClasses] = useState<{ id: string, name: string }[]>([])
    const [sections, setSections] = useState<{ id: string, name: string }[]>([])
    const [selectedClass, setSelectedClass] = useState("All")
    const [selectedSection, setSelectedSection] = useState("All")

    // Result State
    const [reportData, setReportData] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [hasSearched, setHasSearched] = useState(false)
    const [isDownloading, setIsDownloading] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token')
                const [classRes, sectionRes] = await Promise.all([
                    fetch(`${API_URL}/api/classes`, { headers: { Authorization: `Bearer ${token}` } }),
                    fetch(`${API_URL}/api/sections`, { headers: { Authorization: `Bearer ${token}` } })
                ])

                if (classRes.ok) {
                    const data = await classRes.json()
                    const items = Array.isArray(data) ? data : (data.data || [])
                    setClasses(items.map((c: any) => ({
                        id: c.className || c.name,
                        name: c.className || c.name
                    })))
                }
                if (sectionRes.ok) {
                    const data = await sectionRes.json()
                    const items = Array.isArray(data) ? data : (data.data || [])
                    setSections(items.map((s: any) => ({ id: s.name, name: s.name })))
                }
            } catch (err) {
                console.error("Failed to fetch dropdown data", err)
            }
        }
        fetchData()
    }, [])

    // Clear results when switching reports
    useEffect(() => {
        setReportData([])
        setHasSearched(false)
        setSelectedClass("All")
        setSelectedSection("All")
    }, [activeReport])

    const handleSearch = async () => {
        setLoading(true)
        setHasSearched(true)
        setReportData([])
        try {
            const token = localStorage.getItem('token')
            let url = `${API_URL}/api/students?`
            if (selectedClass && selectedClass !== "All") url += `class=${selectedClass}&`
            if (selectedSection && selectedSection !== "All") url += `section=${selectedSection}&`

            const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
            if (res.ok) {
                const data = await res.json()
                let processedData = Array.isArray(data) ? data : (data.data || [])
                setReportData(processedData)
            }
        } catch (err) {
            console.error("Search failed", err)
        } finally {
            setLoading(false)
        }
    }

    const currentReport = REPORT_TYPES.find(r => r.id === activeReport)

    const getColumns = () => {
        const commonColumns = [
            { header: "Admission No", accessor: "studentId" },
            { header: "Name", accessor: (row: any) => `${row.firstName} ${row.lastName}` },
            { header: "Class", accessor: (row: any) => `${row.class} - ${row.section}` },
        ]

        switch (activeReport) {
            case 'guardian_report':
                return [
                    ...commonColumns,
                    { header: "Father Name", accessor: "fatherName" },
                    { header: "Mother Name", accessor: "motherName" },
                    { header: "Guardian Phone", accessor: (row: any) => row.parentPhone || row.guardianPhone || "N/A" },
                ]
            case 'login_credential':
                return [
                    ...commonColumns,
                    { header: "Username", accessor: (row: any) => row.email || "N/A" },
                    { header: "Password", accessor: () => "******" },
                ]
            default:
                return [
                    ...commonColumns,
                    { header: "Date of Birth", accessor: (row: any) => row.dateOfBirth || "N/A" },
                    { header: "Gender", accessor: "gender" },
                    { header: "Mobile", accessor: (row: any) => row.phone || "N/A" },
                ]
        }
    }

    const columns = getColumns()

    const handleDownloadPDF = () => {
        if (reportData.length === 0) return
        setIsDownloading(true)

        setTimeout(() => {
            const doc = new jsPDF()
            doc.setFillColor(30, 30, 80) // Navy
            doc.rect(0, 0, 210, 45, 'F')
            doc.setTextColor(255, 255, 255)
            doc.setFontSize(22)
            doc.setFont("helvetica", "bold")
            doc.text("MODERN SCHOOL ERP", 20, 20)
            doc.setFontSize(10)
            doc.text(`STUDENT INFORMATION AUDIT | ${currentReport?.title.toUpperCase()}`, 20, 32)

            const head = [columns.map(c => c.header)]
            const body = reportData.map(row => columns.map(col => {
                if (typeof col.accessor === 'function') return col.accessor(row)
                return row[col.accessor]
            }))

            autoTable(doc, {
                startY: 55,
                head: head,
                body: body,
                headStyles: { fillColor: [30, 30, 80] },
                theme: 'grid'
            })

            doc.save(`${activeReport}_report_${new Date().getTime()}.pdf`)
            setIsDownloading(false)
            toast.success("PDF Downloaded Successfully")
        }, 1500)
    }

    return (
        <DashboardLayout title="Student Intelligence">
            <div className="max-w-[1600px] mx-auto space-y-8 pb-10">

                {/* Header */}
                <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border-l-[6px] border-l-[#1e1e50]">
                    <div>
                        <h1 className="text-2xl font-black text-gray-800 tracking-tighter uppercase italic">Enrollment Analytics</h1>
                        <p className="text-xs text-gray-400 font-black uppercase tracking-widest mt-1">Student Demographics & Credential Ledger</p>
                    </div>
                    <div className="hidden lg:flex items-center gap-4">
                        <div className="bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Database Linked</span>
                        </div>
                    </div>
                </div>

                {/* Report Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {REPORT_TYPES.map((report) => {
                        const Icon = report.icon
                        const isActive = activeReport === report.id
                        return (
                            <div
                                key={report.id}
                                onClick={() => setActiveReport(report.id)}
                                className={cn(
                                    "group bg-white p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center gap-3 text-center hover:shadow-xl",
                                    isActive
                                        ? "border-[#1e1e50] shadow-lg -translate-y-1"
                                        : "border-gray-50 hover:border-indigo-100"
                                )}
                            >
                                <div className={cn("p-4 rounded-2xl group-hover:scale-110 transition-transform shadow-sm", report.bg)}>
                                    <Icon className={cn("h-6 w-6", report.color)} />
                                </div>
                                <div>
                                    <h3 className="font-black text-[#1e1e50] text-[10px] uppercase tracking-tight">{report.title}</h3>
                                    <p className="text-gray-400 text-[9px] font-bold uppercase tracking-tighter mt-1">{report.subtitle}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Criteria Section */}
                <Card className="border-none shadow-xl bg-white rounded-[2rem] overflow-hidden">
                    <CardHeader className="p-8 border-b bg-gray-50/50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Search className="h-5 w-5 text-[#1e1e50]" />
                                <CardTitle className="text-xl font-black text-[#1e1e50] uppercase tracking-tighter">Query Filter</CardTitle>
                            </div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Academic Session: 2023-24</span>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Target Class</Label>
                                <Select onValueChange={setSelectedClass} value={selectedClass}>
                                    <SelectTrigger className="bg-gray-50 border-2 border-transparent focus:border-[#1e1e50] h-14 rounded-2xl shadow-inner transition-all">
                                        <SelectValue placeholder="Select Option" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-2">
                                        <SelectItem value="All">Global (All Classes)</SelectItem>
                                        {classes.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Target Section</Label>
                                <Select onValueChange={setSelectedSection} value={selectedSection}>
                                    <SelectTrigger className="bg-gray-50 border-2 border-transparent focus:border-[#1e1e50] h-14 rounded-2xl shadow-inner transition-all">
                                        <SelectValue placeholder="Select Option" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-2">
                                        <SelectItem value="All">Global (All Sections)</SelectItem>
                                        {sections.map(s => (
                                            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex justify-start mt-10">
                            <Button
                                onClick={handleSearch}
                                disabled={loading}
                                size="lg"
                                className="bg-[#1e1e50] hover:bg-black text-white px-10 h-14 rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 group"
                            >
                                {loading ? <Loader2 className="h-5 w-5 animate-spin mr-3" /> : <Search className="h-5 w-5 mr-3 group-hover:rotate-12 transition-transform" />}
                                Initiate Query
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Results Table */}
                {hasSearched && (
                    <Card className="border-none shadow-2xl bg-white rounded-[2rem] overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <CardHeader className="p-8 border-b bg-[#1e1e50] text-white">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="space-y-1 text-center md:text-left">
                                    <CardTitle className="text-2xl font-black uppercase tracking-tighter">Compiled Result</CardTitle>
                                    <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest">Filtered Output: {reportData.length} records detected</p>
                                </div>
                                <div className="flex gap-4">
                                    <Button
                                        variant="outline"
                                        className="h-12 px-6 rounded-xl border-2 border-white/20 bg-white/10 hover:bg-white/20 text-white font-black uppercase text-[10px] tracking-widest transition-all"
                                        onClick={() => window.print()}
                                    >
                                        Print Sheet
                                    </Button>
                                    <Button
                                        onClick={handleDownloadPDF}
                                        disabled={isDownloading || reportData.length === 0}
                                        className="h-12 px-8 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase text-[10px] tracking-widest shadow-xl transition-all flex items-center gap-2"
                                    >
                                        {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                                        Export PDF
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-gray-50">
                                        <TableRow className="hover:bg-transparent border-none">
                                            {columns.map((col, idx) => (
                                                <TableHead key={idx} className="font-black text-[#1e1e50] h-16 px-8 uppercase text-[10px] tracking-widest">{col.header}</TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? (
                                            <TableRow>
                                                <TableCell colSpan={columns.length} className="h-40 text-center">
                                                    <Loader2 className="h-10 w-10 animate-spin mx-auto text-indigo-200" />
                                                </TableCell>
                                            </TableRow>
                                        ) : reportData.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={columns.length} className="h-40 text-center">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <FileMinus className="h-12 w-12 text-gray-200" />
                                                        <p className="text-gray-400 font-black uppercase text-xs tracking-widest">No matching records found in database.</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            reportData.map((row, i) => (
                                                <TableRow key={row._id || i} className="hover:bg-indigo-50/30 transition-colors border-gray-50 h-16 group">
                                                    {columns.map((col, colIdx) => (
                                                        <TableCell key={colIdx} className="px-8 font-bold text-gray-600 text-xs">
                                                            {typeof col.accessor === 'function' ? col.accessor(row) : row[col.accessor]}
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {!hasSearched && (
                    <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-[2rem] p-20 text-center space-y-4">
                        <div className="p-6 bg-white rounded-full w-fit mx-auto shadow-sm border">
                            <Monitor className="h-8 w-8 text-gray-300" />
                        </div>
                        <h2 className="text-gray-400 font-black uppercase text-xs tracking-[0.3em]">Query Engine Ready</h2>
                        <p className="text-gray-300 text-[10px] font-bold uppercase tracking-widest">Select criteria above and initiate query to view academic data.</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
