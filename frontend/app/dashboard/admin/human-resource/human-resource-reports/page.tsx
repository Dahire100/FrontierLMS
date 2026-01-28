"use client"

import { useState } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, CalendarRange, BookOpen, ClipboardList, BarChart3, LineChart, Home, Download, ArrowRight, Loader2, FileCheck, Info, ShieldCheck, UserCheck, Briefcase, Users, Clock } from "lucide-react"
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

const REPORTS = [
    {
        id: "attendance",
        title: "Staff Attendance Analysis",
        description: "Monthly attendance logs with late-arrival tracking and institutional compliance metrics.",
        icon: CalendarRange,
        iconColor: "text-rose-500",
        iconBg: "bg-rose-50",
        tag: "ATTENDANCE",
        stats: "94% Attendance Rate",
        data: [
            { label: "Present Today", value: "142", color: "text-emerald-600" },
            { label: "On Leave", value: "8", color: "text-rose-600" },
            { label: "Late Arrival", value: "5", color: "text-amber-600" },
            { label: "Total Staff", value: "155", color: "text-blue-600" }
        ]
    },
    {
        id: "distribution",
        title: "Workforce Distribution",
        description: "Staff distribution across departments and designations with vacancy analysis.",
        icon: Users,
        iconColor: "text-blue-500",
        iconBg: "bg-blue-50",
        tag: "ANALYTICS",
        stats: "12 Departments Active",
        data: [
            { label: "Teaching Staff", value: "98" },
            { label: "Admin Staff", value: "24" },
            { label: "Support Staff", value: "33" },
            { label: "Total Workforce", value: "155" }
        ]
    },
    {
        id: "leaves",
        title: "Leave Utilization Report",
        description: "Track leave patterns, pending balances, and institutional leave trends.",
        icon: BookOpen,
        iconColor: "text-amber-600",
        iconBg: "bg-amber-50",
        tag: "LEAVES",
        stats: "12% Monthly Utilization",
        data: [
            { label: "Sick Leaves", value: "42" },
            { label: "Casual Leaves", value: "18" },
            { label: "Annual Leaves", value: "12" },
            { label: "Unpaid Leaves", value: "4" }
        ]
    },
    {
        id: "payroll",
        title: "Payroll Ledger Summary",
        description: "Financial reporting of salaries, allowances, and statutory deductions for the current month.",
        icon: LineChart,
        iconColor: "text-emerald-600",
        iconBg: "bg-emerald-50",
        tag: "PAYROLL",
        stats: "₹ 42.5L Total Outflow",
        data: [
            { label: "Net Salary", value: "₹ 38.2L" },
            { label: "TDS/Deductions", value: "₹ 4.3L" },
            { label: "Allowances", value: "₹ 1.8L" },
            { label: "Bonuses Paid", value: "₹ 0.5L" }
        ]
    }
]

export default function HumanResourceReportsPage() {
    const [previewReport, setPreviewReport] = useState<any>(null)
    const [isDownloading, setIsDownloading] = useState<string | null>(null)
    const [isGeneratingAudit, setIsGeneratingAudit] = useState(false)

    const handlePreview = (report: any) => {
        setPreviewReport(report)
    }

    const generatePDF = (report: any) => {
        const doc = new jsPDF()

        // Header
        doc.setFillColor(190, 18, 60) // Rose 700
        doc.rect(0, 0, 210, 45, 'F')

        doc.setTextColor(255, 255, 255)
        doc.setFontSize(24)
        doc.setFont("helvetica", "bold")
        doc.text("MODERN SCHOOL ERP", 20, 20)

        doc.setFontSize(10)
        doc.setFont("helvetica", "normal")
        doc.text("Human Resource Intelligence | Session 2023-24", 20, 32)
        doc.text(`Official Document: ${report.tag} LEDGER`, 20, 38)

        // Title
        doc.setTextColor(33, 33, 33)
        doc.setFontSize(18)
        doc.setFont("helvetica", "bold")
        doc.text(report.title.toUpperCase(), 20, 65)

        doc.setDrawColor(190, 18, 60)
        doc.setLineWidth(1)
        doc.line(20, 70, 190, 70)

        // Content
        doc.setFontSize(11)
        doc.setFont("helvetica", "normal")
        doc.text(`Report Timestamp: ${new Date().toLocaleString()}`, 20, 80)
        doc.text(`Summary Metric: ${report.stats}`, 20, 87)

        const tableBody = report.data.map((item: any) => [item.label, item.value])

        autoTable(doc, {
            startY: 100,
            head: [["Personnel Parameter", "Calculated Value"]],
            body: tableBody,
            headStyles: { fillColor: [190, 18, 60] },
            theme: 'grid',
            margin: { left: 20, right: 20 }
        })

        doc.save(`${report.id}_hr_report_2024.pdf`)
    }

    const handleDownload = (report: any) => {
        setIsDownloading(report.id)
        setTimeout(() => {
            try {
                generatePDF(report)
                setIsDownloading(null)
                toast.success(`${report.title} Exported`, {
                    description: "Professional personnel report has been saved as PDF.",
                    icon: <FileCheck className="h-4 w-4 text-emerald-500" />
                })
            } catch (err) {
                setIsDownloading(null)
                toast.error("Download Failed")
            }
        }, 1500)
    }

    const handleGenerateAudit = () => {
        setIsGeneratingAudit(true)
        setTimeout(() => {
            const doc = new jsPDF()
            doc.setFillColor(190, 18, 60)
            doc.rect(0, 0, 210, 60, 'F')
            doc.setTextColor(255, 255, 255)
            doc.setFontSize(28)
            doc.text("ANNUAL PERSONNEL AUDIT", 20, 30)
            doc.setFontSize(12)
            doc.text("INSTITUTIONAL WORKFORCE SUMMARY 2023-24", 20, 45)

            autoTable(doc, {
                startY: 80,
                head: [["DEPARTMENT", "TOTAL STAFF", "UTILIZATION", "STATUS"]],
                body: [
                    ["Academic Dept", "98", "94%", "Active"],
                    ["Administration", "24", "98%", "Active"],
                    ["Accounts/Finance", "6", "100%", "Stable"],
                    ["IT & Systems", "4", "92%", "Understaffed"]
                ],
                headStyles: { fillColor: [190, 18, 60] }
            })

            doc.save("Annual_HR_Workforce_Audit_2024.pdf")
            setIsGeneratingAudit(false)
            toast.success("HR Audit PDF Ready")
        }, 2500)
    }

    return (
        <DashboardLayout title="Institutional Intelligence Reports">
            <div className="space-y-6 max-w-full pb-10">

                <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border-l-[6px] border-l-rose-600">
                    <div>
                        <h1 className="text-2xl font-black text-gray-800 tracking-tighter uppercase italic">HR Intelligence</h1>
                        <p className="text-xs text-gray-400 font-black uppercase tracking-widest mt-1">Personnel Metrics & Workforce Analytics Dashboard</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {REPORTS.map((report, idx) => (
                        <Card key={idx} className="group hover:border-rose-200 transition-all cursor-pointer overflow-hidden shadow-sm hover:shadow-2xl border-gray-100">
                            <CardContent className="p-0">
                                <div className="p-6" onClick={() => handlePreview(report)}>
                                    <div className={`h-14 w-14 rounded-2xl ${report.iconBg} flex items-center justify-center mb-5 group-hover:scale-110 transition-all shadow-sm`}>
                                        <report.icon className={`h-7 w-7 ${report.iconColor}`} />
                                    </div>
                                    <h3 className="font-black text-gray-800 text-sm mb-2 group-hover:text-rose-600 transition-colors uppercase tracking-tight">{report.title}</h3>
                                    <p className="text-[11px] text-gray-400 leading-relaxed mb-6 min-h-[45px] font-medium">{report.description}</p>
                                    <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100 flex items-center justify-between">
                                        <span className="text-[10px] font-black text-rose-600 uppercase tracking-tighter">{report.stats}</span>
                                        <div className="h-1.5 w-16 bg-gray-200 rounded-full overflow-hidden">
                                            <div className="h-full bg-rose-600 w-3/4"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-6 py-4 bg-gray-50/50 border-t flex items-center justify-between group-hover:bg-rose-50/30 transition-colors">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 text-[10px] font-black text-gray-500 hover:text-rose-600 p-0 tracking-widest uppercase"
                                        onClick={() => handlePreview(report)}
                                    >
                                        Live Preview <ArrowRight className="h-3.5 w-3.5 ml-2" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        disabled={isDownloading === report.id}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDownload(report);
                                        }}
                                        className="h-8 w-8 text-gray-400 hover:text-rose-600 hover:bg-white shadow-sm"
                                    >
                                        {isDownloading === report.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4.5 w-4.5" />}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card className="bg-rose-600 text-white overflow-hidden relative border-none shadow-2xl rounded-3xl">
                    <div className="absolute right-0 top-0 opacity-10 p-12 rotate-12 scale-150">
                        <UserCheck className="h-64 w-64" />
                    </div>
                    <CardContent className="p-12 relative z-10 flex flex-col md:flex-row items-center gap-12">
                        <div className="flex-1 space-y-6 text-center md:text-left">
                            <div className="bg-white/20 w-fit px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-4">Personnel Oversight</div>
                            <h2 className="text-4xl font-black tracking-tighter text-white m-0 uppercase leading-none">Annual Workforce Audit</h2>
                            <p className="text-base text-rose-100 opacity-90 leading-relaxed max-w-2xl font-medium">
                                Summarize entire institutional personnel data into a formal PDF audit. Tracks department utilization, payroll efficiency, and institutional compliance metrics.
                            </p>
                            <Button
                                onClick={handleGenerateAudit}
                                disabled={isGeneratingAudit}
                                size="lg"
                                className="bg-white text-rose-600 hover:bg-rose-50 font-black uppercase text-[12px] tracking-[0.2em] px-12 h-14 shadow-2xl group rounded-2xl"
                            >
                                {isGeneratingAudit ? <Loader2 className="animate-spin mr-3 h-5 w-5" /> : <ShieldCheck className="h-6 w-6 mr-3 group-hover:scale-110 transition-transform" />}
                                {isGeneratingAudit ? "Compiling Personnel Data..." : "Export Full HR Audit PDF"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Dialog open={!!previewReport} onOpenChange={() => setPreviewReport(null)}>
                    <DialogContent className="max-w-3xl border-t-[8px] border-t-rose-600 p-0 rounded-3xl overflow-hidden shadow-2xl">
                        <DialogHeader className="p-8 bg-gray-50 border-b">
                            <div className="flex justify-between items-start">
                                <div>
                                    <DialogTitle className="flex items-center gap-4 text-gray-800 uppercase tracking-tighter font-black text-2xl">
                                        {previewReport?.icon && <previewReport.icon className={`h-8 w-8 ${previewReport.iconColor}`} />}
                                        {previewReport?.title}
                                    </DialogTitle>
                                    <DialogDescription className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2 flex items-center gap-2">
                                        Data Simulation <ArrowRight className="h-3 w-3" /> <span className="text-rose-600">{previewReport?.tag} Analytics</span>
                                    </DialogDescription>
                                </div>
                                <div className="bg-rose-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">
                                    LIVE FEED
                                </div>
                            </div>
                        </DialogHeader>

                        <div className="p-10 space-y-8 bg-white">
                            <div className="grid grid-cols-2 gap-6">
                                {previewReport?.data.map((item: any, i: number) => (
                                    <div key={i} className="bg-gray-50 p-6 rounded-2xl border-2 border-transparent hover:border-rose-100 transition-all">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{item.label}</p>
                                        <div className="flex items-end justify-between">
                                            <p className="text-3xl font-black text-gray-800 tracking-tighter">{item.value}</p>
                                            <div className="h-2 w-16 bg-rose-200 rounded-full overflow-hidden">
                                                <div className="h-full bg-rose-600 w-2/3"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-blue-50 border-l-4 border-l-blue-500 p-6 rounded-r-2xl flex items-start gap-5">
                                <div className="p-3 bg-blue-100 rounded-2xl text-blue-600 shadow-sm">
                                    <Info className="h-6 w-6" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Administrative Insight</p>
                                    <p className="text-xs text-blue-800 leading-relaxed font-bold italic">
                                        "Institutional workforce health is within optimal range. Attendance has shown a 2.4% uptick following the new biometric integration. High utilization noted in the Academic Block."
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center bg-gray-50 p-8 border-t">
                            <div className="flex items-center gap-4 text-xs font-black text-gray-400 uppercase tracking-tighter">
                                <Clock className="h-5 w-5 text-rose-500" />
                                Updated: {new Date().toLocaleDateString()}
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
                                    className="bg-rose-600 hover:bg-rose-700 font-black text-[11px] uppercase tracking-widest h-12 px-10 shadow-2xl rounded-xl"
                                    onClick={() => {
                                        handleDownload(previewReport);
                                        setPreviewReport(null);
                                    }}
                                >
                                    Generate Official PDF
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

            </div>
        </DashboardLayout>
    )
}
