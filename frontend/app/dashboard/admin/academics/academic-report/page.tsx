"use client"

import { useState } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, PieChart, BarChart, Download, ArrowRight, Home, ShieldCheck, BookOpen, GraduationCap, Calendar, Users, Loader2, FileCheck, Info, Clock, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

const ACADEMIC_REPORTS = [
    {
        id: "class_performance",
        title: "Class Performance Analytics",
        description: "Comparative study of academic results across different classes and sections for the current term.",
        icon: GraduationCap,
        color: "text-blue-600",
        bg: "bg-blue-50",
        stats: "82% Overall GPA",
        tag: "PERFORMANCE",
        data: [
            { label: "Class 10-A", value: "88%", color: "bg-emerald-500" },
            { label: "Class 10-B", value: "84%", color: "bg-blue-500" },
            { label: "Class 9-A", value: "79%", color: "bg-orange-500" },
            { label: "Class 9-B", value: "77%", color: "bg-red-500" }
        ]
    },
    {
        id: "subject_distribution",
        title: "Subject Distribution",
        description: "Analysis of curriculum coverage and student enrollment across various elective and core subjects.",
        icon: BookOpen,
        color: "text-purple-600",
        bg: "bg-purple-50",
        stats: "42 Active Subjects",
        tag: "CURRICULUM",
        data: [
            { label: "Mathematics", value: "92% Coverage", color: "text-emerald-600" },
            { label: "Science", value: "88% Coverage", color: "text-blue-600" },
            { label: "Humanities", value: "85% Coverage", color: "text-purple-600" },
            { label: "Languages", value: "90% Coverage", color: "text-orange-600" }
        ]
    },
    {
        id: "timetable_compliance",
        title: "Timetable Compliance",
        description: "Monitoring the adherence to the published schedules and teacher substitution frequency.",
        icon: Clock,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        stats: "96% Adherence",
        tag: "OPERATIONS",
        data: [
            { label: "Scheduled Slots", value: 1240, status: "Complete" },
            { label: "Substitutions", value: 24, status: "Handled" },
            { label: "Missed Slots", value: 2, status: "Pending" },
            { label: "Extra Classes", value: 15, status: "Logged" }
        ]
    },
    {
        id: "teacher_workload",
        title: "Teacher Workload Audit",
        description: "Detailed report on period distribution, subject allocation, and class-teacher responsibilities.",
        icon: Users,
        color: "text-orange-600",
        bg: "bg-orange-50",
        stats: "18 Periods/Week Avg",
        tag: "HR-ACADEMIC",
        data: [
            { label: "Senior Staff", value: 22 },
            { label: "Junior Staff", value: 18 },
            { label: "Part-time", value: 12 },
            { label: "HODs", value: 14 }
        ]
    }
]

export default function AcademicReportPage() {
    const [previewReport, setPreviewReport] = useState<any>(null)
    const [isDownloading, setIsDownloading] = useState<string | null>(null)
    const [isGeneratingAudit, setIsGeneratingAudit] = useState(false)

    const handlePreview = (report: any) => {
        setPreviewReport(report)
    }

    const generatePDF = (report: any) => {
        const doc = new jsPDF()

        // Header
        doc.setFillColor(40, 53, 147) // #283593 (Deep Indigo)
        doc.rect(0, 0, 210, 45, 'F')

        doc.setTextColor(255, 255, 255)
        doc.setFontSize(24)
        doc.setFont("helvetica", "bold")
        doc.text("MODERN SCHOOL ERP", 20, 20)

        doc.setFontSize(10)
        doc.setFont("helvetica", "normal")
        doc.text("Academic Excellence Module | Annual Session 2023-24", 20, 32)
        doc.text(`Report Type: ${report.tag} ANALYSIS`, 20, 38)

        // Title
        doc.setTextColor(33, 33, 33)
        doc.setFontSize(18)
        doc.setFont("helvetica", "bold")
        doc.text(report.title.toUpperCase(), 20, 65)

        doc.setDrawColor(40, 53, 147)
        doc.setLineWidth(1)
        doc.line(20, 70, 190, 70)

        // Meta
        doc.setFontSize(11)
        doc.setFont("helvetica", "normal")
        doc.text(`Generation Date: ${new Date().toLocaleString()}`, 20, 80)
        doc.text(`Current Aggregate: ${report.stats}`, 20, 87)

        // Data
        const tableBody = report.data.map((item: any) => {
            if (report.id === "timetable_compliance") {
                return [item.label, item.value, item.status]
            }
            return [item.label, item.value]
        })

        const head = report.id === "timetable_compliance"
            ? [["Operational Metric", "Volume", "Current Status"]]
            : [["Academic Indicator", "Measured Value"]]

        autoTable(doc, {
            startY: 100,
            head: head,
            body: tableBody,
            headStyles: {
                fillColor: [40, 53, 147],
                textColor: [255, 255, 255]
            },
            theme: 'grid',
            margin: { left: 20, right: 20 }
        })

        // Footer
        const pageCount = (doc as any).internal.getNumberOfPages()
        doc.setFontSize(8)
        doc.setTextColor(150, 150, 150)
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i)
            doc.text(`OFFICIAL ACADEMIC RECORD | SYSTEM GENERATED | Page ${i} of ${pageCount}`, 105, 285, { align: 'center' })
        }

        doc.save(`${report.id}_academic_report.pdf`)
    }

    const handleDownload = (report: any) => {
        setIsDownloading(report.id)
        setTimeout(() => {
            try {
                generatePDF(report)
                setIsDownloading(null)
                toast.success(`${report.title} PDF Exported`, {
                    description: "Academic data has been summarized into a professional PDF.",
                    icon: <FileCheck className="h-4 w-4 text-emerald-500" />
                })
            } catch (err) {
                setIsDownloading(null)
                toast.error("Generation Failed")
            }
        }, 1500)
    }

    const handleGenerateSessionAudit = () => {
        setIsGeneratingAudit(true)
        setTimeout(() => {
            const doc = new jsPDF()

            doc.setFillColor(40, 53, 147)
            doc.rect(0, 0, 210, 60, 'F')
            doc.setTextColor(255, 255, 255)
            doc.setFontSize(28)
            doc.text("ANNUAL ACADEMIC AUDIT", 20, 30)
            doc.setFontSize(12)
            doc.text("FULL SESSION PERFORMANCE REVIEW 2023-24", 20, 45)

            autoTable(doc, {
                startY: 80,
                head: [["KPI", "ACHIEVED", "TARGET", "STATUS"]],
                body: [
                    ["Curriculum Completion", "98%", "100%", "Excellent"],
                    ["Average Student CGPA", "8.4", "8.0", "Above Target"],
                    ["Periods Delivered", "48,200", "50,000", "On Track"],
                    ["Result Improvement", "+4.2%", "+5.0%", "Satisfactory"]
                ],
                headStyles: { fillColor: [40, 53, 147] }
            })

            doc.save("Annual_Academic_Audit_Report_2024.pdf")
            setIsGeneratingAudit(false)
            toast.success("Academic Audit PDF Ready", {
                icon: <ShieldCheck className="h-4 w-4 text-blue-500" />
            })
        }, 2500)
    }

    return (
        <DashboardLayout title="Academic Intelligence Reports">
            <div className="space-y-6 max-w-full pb-10">
                <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border-l-[6px] border-l-[#283593]">
                    <div>
                        <h1 className="text-2xl font-black text-gray-800 tracking-tighter">Academic Analytics</h1>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Curriculum & Performance Intelligence Dashboard</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {ACADEMIC_REPORTS.map((report, idx) => (
                        <Card key={idx} className="group hover:border-[#283593]/20 transition-all cursor-pointer overflow-hidden shadow-sm hover:shadow-2xl border-gray-100">
                            <CardContent className="p-0">
                                <div className="p-6" onClick={() => handlePreview(report)}>
                                    <div className={`h-14 w-14 rounded-2xl ${report.bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-all shadow-sm`}>
                                        <report.icon className={`h-7 w-7 ${report.color}`} />
                                    </div>
                                    <h3 className="font-black text-gray-800 text-sm mb-2 group-hover:text-[#283593] transition-colors uppercase tracking-tight">{report.title}</h3>
                                    <p className="text-[11px] text-gray-400 leading-relaxed mb-6 min-h-[45px] font-medium">{report.description}</p>
                                    <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100 flex items-center justify-between">
                                        <span className="text-[10px] font-black text-[#283593] uppercase tracking-tighter">{report.stats}</span>
                                        <div className="h-1.5 w-16 bg-gray-200 rounded-full overflow-hidden">
                                            <div className="h-full bg-[#283593] w-3/4"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-6 py-4 bg-gray-50/50 border-t flex items-center justify-between group-hover:bg-indigo-50/30 transition-colors">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 text-[10px] font-black text-gray-500 hover:text-[#283593] p-0 tracking-widest uppercase"
                                        onClick={() => handlePreview(report)}
                                    >
                                        Inspect Data <ArrowRight className="h-3.5 w-3.5 ml-2" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        disabled={isDownloading === report.id}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDownload(report);
                                        }}
                                        className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-white shadow-sm"
                                    >
                                        {isDownloading === report.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4.5 w-4.5" />}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card className="bg-[#283593] text-white overflow-hidden relative border-none shadow-2xl rounded-3xl">
                    <div className="absolute right-0 top-0 opacity-10 p-12 rotate-12 scale-150">
                        <BookOpen className="h-64 w-64" />
                    </div>
                    <CardContent className="p-12 relative z-10 flex flex-col md:flex-row items-center gap-12">
                        <div className="flex-1 space-y-6 text-center md:text-left">
                            <div className="bg-white/10 w-fit px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-4">Institutional Audit</div>
                            <h2 className="text-4xl font-black tracking-tighter text-white m-0 uppercase leading-none">Comprehensive Academic Audit</h2>
                            <p className="text-base text-indigo-100 opacity-90 leading-relaxed max-w-2xl font-medium">
                                Synthesize school-wide academic metrics into a formal audit report. Includes curriculum coverage tracking, GPA trends, and teacher workload distribution for executive review.
                            </p>
                            <Button
                                onClick={handleGenerateSessionAudit}
                                disabled={isGeneratingAudit}
                                size="lg"
                                className="bg-white text-[#283593] hover:bg-indigo-50 font-black uppercase text-[12px] tracking-[0.2em] px-12 h-14 shadow-2xl group rounded-2xl"
                            >
                                {isGeneratingAudit ? <Loader2 className="animate-spin mr-3 h-5 w-5" /> : <ShieldCheck className="h-6 w-6 mr-3 group-hover:rotate-12 transition-transform" />}
                                {isGeneratingAudit ? "Aggregating Session Results..." : "Download Session Audit PDF"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Dialog open={!!previewReport} onOpenChange={() => setPreviewReport(null)}>
                    <DialogContent className="max-w-3xl border-t-[8px] border-t-[#283593] p-0 rounded-3xl overflow-hidden shadow-2xl">
                        <DialogHeader className="p-8 bg-gray-50 border-b">
                            <div className="flex justify-between items-start">
                                <div>
                                    <DialogTitle className="flex items-center gap-4 text-gray-800 uppercase tracking-tighter font-black text-2xl">
                                        {previewReport?.icon && <previewReport.icon className={`h-8 w-8 ${previewReport.color}`} />}
                                        {previewReport?.title}
                                    </DialogTitle>
                                    <DialogDescription className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2 flex items-center gap-2">
                                        Data Simulation <ArrowRight className="h-3 w-3" /> <span className="text-[#283593]">{previewReport?.tag} Matrix</span>
                                    </DialogDescription>
                                </div>
                                <div className="bg-[#283593] text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">
                                    LIVE FEED
                                </div>
                            </div>
                        </DialogHeader>

                        <div className="p-10 space-y-8 bg-white">
                            {previewReport?.id === "class_performance" && (
                                <div className="p-6 bg-indigo-50 rounded-3xl border-2 border-indigo-100/50">
                                    <div className="grid grid-cols-4 gap-6">
                                        {previewReport.data.map((item: any, i: number) => (
                                            <div key={i} className="bg-white p-5 rounded-2xl text-center shadow-sm border hover:border-indigo-500 transition-colors">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{item.label}</p>
                                                <p className="text-3xl font-black text-gray-800">{item.value}</p>
                                                <div className={`h-2 w-full ${item.color} mt-4 rounded-full opacity-40`} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {previewReport?.id === "subject_distribution" && (
                                <div className="space-y-5">
                                    {previewReport.data.map((item: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between p-5 border-2 hover:border-indigo-100 rounded-2xl bg-white transition-all shadow-sm">
                                            <span className="text-xs font-black text-gray-600 uppercase tracking-[0.1em]">{item.label}</span>
                                            <div className="flex items-center gap-8 flex-1 max-w-[350px] ml-4">
                                                <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden border">
                                                    <div className="h-full bg-[#283593] shadow-lg" style={{ width: item.value }} />
                                                </div>
                                                <span className={`text-sm font-black min-w-[60px] text-right ${item.color}`}>{item.value}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {previewReport?.id === "timetable_compliance" && (
                                <div className="border-2 border-gray-100 rounded-3xl overflow-hidden shadow-lg bg-white">
                                    <table className="w-full text-left">
                                        <thead className="bg-[#283593] text-[10px] font-black text-white uppercase tracking-[0.2em]">
                                            <tr>
                                                <th className="p-5">MEASUREMENT POINT</th>
                                                <th className="p-5">VOLUME</th>
                                                <th className="p-5 text-right">AUDIT STATUS</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-xs divide-y bg-white">
                                            {previewReport.data.map((item: any, i: number) => (
                                                <tr key={i} className="hover:bg-indigo-50/50 transition-colors">
                                                    <td className="p-5 font-black text-gray-700 tracking-tight flex items-center gap-3">
                                                        <CheckCircle2 className="h-4 w-4 text-emerald-500" /> {item.label}
                                                    </td>
                                                    <td className="p-5 font-black text-[#283593]">{item.value.toLocaleString()}</td>
                                                    <td className="p-5 text-right">
                                                        <span className={`text-[9px] font-black uppercase px-4 py-1.5 rounded-full border-2 ${item.status === 'Complete' || item.status === 'Handled' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                                                            }`}>
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {previewReport?.id === "teacher_workload" && (
                                <div className="p-10 border-4 border-dashed border-indigo-100 bg-white rounded-[2rem] relative h-[280px] flex items-end justify-around gap-10">
                                    <div className="absolute top-8 left-8 flex items-center gap-3">
                                        <div className="h-4 w-4 rounded-full bg-[#283593] animate-ping" />
                                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest italic">Period-Allocation Frequency</p>
                                    </div>
                                    {previewReport.data.map((item: any, i: number) => (
                                        <div key={i} className="flex flex-col items-center gap-4 group w-full">
                                            <div
                                                className="w-16 bg-gradient-to-t from-[#283593] to-indigo-400 group-hover:from-indigo-600 group-hover:to-purple-500 transition-all duration-700 rounded-2xl relative shadow-xl group-hover:-translate-y-2"
                                                style={{ height: `${item.value * 7}px` }}
                                            >
                                                <span className="absolute -top-10 left-1/2 -translate-x-1/2 text-sm font-black text-[#283593]">{item.value}</span>
                                            </div>
                                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{item.label}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between items-center bg-gray-50 p-8 border-t">
                            <div className="flex items-center gap-4 text-xs font-black text-gray-400 uppercase tracking-tighter">
                                <Info className="h-5 w-5 text-indigo-500" />
                                Generated: {new Date().toLocaleDateString()}
                            </div>
                            <div className="flex gap-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setPreviewReport(null)}
                                    className="h-12 text-[11px] uppercase font-black tracking-widest border-2 rounded-xl hover:bg-white"
                                >
                                    Dismiss
                                </Button>
                                <Button
                                    className="bg-[#283593] hover:bg-[#1a237e] font-black text-[11px] uppercase tracking-widest h-12 px-10 shadow-2xl rounded-xl"
                                    onClick={() => {
                                        handleDownload(previewReport);
                                        setPreviewReport(null);
                                    }}
                                >
                                    Export PDF Report
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

            </div>
        </DashboardLayout>
    )
}
