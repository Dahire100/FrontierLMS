"use client"

import { useState, useCallback } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    FileText,
    Search,
    Scale,
    CreditCard,
    BarChart,
    Percent,
    Users,
    List,
    Globe,
    ArrowRight,
    Download,
    Loader2,
    FileCheck,
    TrendingUp,
    DollarSign,
    ShieldCheck,
    Info,
    Calendar,
    MousePointer2,
    ChevronRight,
    ArrowUpRight
} from "lucide-react"
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
import Link from "next/link"

const FEE_REPORTS = [
    {
        id: "daily_collection",
        title: "Daily Collection",
        description: "Analyze dynamic revenue inflows with mode-specific analytical breakdown.",
        icon: BarChart,
        color: "text-emerald-500",
        bg: "bg-emerald-50",
        stats: "₹ 1.25L Collected Today",
        tag: "COLLECTION",
        href: "/dashboard/admin/fees-collection/fees-reports/daily",
        data: [
            { label: "Cash Settlement", value: "₹ 45,000" },
            { label: "Digital Transfer", value: "₹ 72,000" },
            { label: "Instrument/DD", value: "₹ 8,000" },
            { label: "UPI Mobility", value: "₹ 5,000" }
        ]
    },
    {
        id: "due_fees",
        title: "Exposure Matrix",
        description: "Holistic vision of outstanding liabilities across institutional units.",
        icon: Scale,
        color: "text-rose-500",
        bg: "bg-rose-50",
        stats: "₹ 8.4L Outstanding",
        tag: "EXPOSURE",
        href: "/dashboard/admin/fees-collection/due-fee-report",
        data: [
            { label: "Tuition Capital", value: "₹ 5.2L" },
            { label: "Logistics Fees", value: "₹ 1.8L" },
            { label: "Compliance Fines", value: "₹ 0.4L" },
            { label: "Misc Accruals", value: "₹ 1.0L" }
        ]
    },
    {
        id: "monthly_summary",
        title: "Monthly Trajectory",
        description: "Comparative velocity mapping against quarterly fiscal projections.",
        icon: TrendingUp,
        color: "text-blue-500",
        bg: "bg-blue-50",
        stats: "82% Projection Clear",
        tag: "TRAJECTORY",
        href: "/dashboard/admin/fees-collection/fees-reports/monthly",
        data: [
            { label: "Current Cycle", value: "₹ 24L" },
            { label: "Previous Cycle", value: "₹ 18L" },
            { label: "Cycle Delta", value: "+33%" },
            { label: "Target Alpha", value: "₹ 30L" }
        ]
    },
    {
        id: "class_wise",
        title: "Unit Stratification",
        description: "Granular revenue capture per academic hierarchy and division.",
        icon: List,
        color: "text-indigo-500",
        bg: "bg-indigo-50",
        stats: "Grade 10: Peak Inflow",
        tag: "STRATIFICATION",
        href: "/dashboard/admin/fees-collection/fees-reports/class-wise",
        data: [
            { label: "Primary Wing", value: "₹ 12L" },
            { label: "Senior Wing", value: "₹ 45L" },
            { label: "Divisional Alpha", value: "78%" },
            { label: "Divisional Beta", value: "62%" }
        ]
    }
]

export default function FeesReportsPage() {
    const [previewReport, setPreviewReport] = useState<any>(null)
    const [isDownloading, setIsDownloading] = useState<string | null>(null)
    const [isGeneratingAudit, setIsGeneratingAudit] = useState(false)

    const handlePreview = (report: any) => {
        setPreviewReport(report)
    }

    const generatePDF = (report: any) => {
        const doc = new jsPDF()
        doc.setFillColor(30, 41, 59) // Slate 800
        doc.rect(0, 0, 210, 50, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(28)
        doc.setFont("helvetica", "bold")
        doc.text("INSTITUTIONAL AUDIT", 20, 30)
        doc.setFontSize(10)
        doc.text(`FISCAL YEAR 2024-25 | MODULE: ${report.tag}`, 20, 40)
        doc.setTextColor(33, 33, 33)
        doc.setFontSize(18)
        doc.text(report.title.toUpperCase(), 20, 70)
        doc.setDrawColor(30, 41, 59)
        doc.line(20, 75, 190, 75)
        const tableBody = report.data.map((item: any) => [item.label, item.value])
        autoTable(doc, {
            startY: 90,
            head: [["Financial Component", "Audit Valuation"]],
            body: tableBody,
            headStyles: { fillColor: [30, 41, 59] },
            theme: 'striped'
        })
        doc.save(`${report.id}_audit_protocol.pdf`)
    }

    const handleDownload = (report: any) => {
        setIsDownloading(report.id)
        setTimeout(() => {
            generatePDF(report)
            setIsDownloading(null)
            toast.success("Audit Protocol Generated")
        }, 1200)
    }

    return (
        <DashboardLayout title="Financial Intelligence Matrix">
            <div className="max-w-[1600px] mx-auto space-y-10 pb-20">

                {/* Header Context */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-4 uppercase">
                            <div className="h-14 w-14 bg-gradient-to-br from-indigo-700 to-indigo-900 rounded-2xl flex items-center justify-center shadow-2xl text-white transform hover:rotate-6 transition-transform">
                                <BarChart size={32} />
                            </div>
                            Intelligence Strategy Hub
                        </h1>
                        <p className="text-gray-500 mt-2 text-xl italic font-medium">Coordinate institutional financial oversight across dynamic revenue streams</p>
                    </div>
                </div>

                {/* Analytical Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {FEE_REPORTS.map((report, idx) => (
                        <Card key={idx} className="group border-none shadow-xl hover:shadow-2xl transition-all duration-500 bg-white rounded-[2.5rem] overflow-hidden ring-1 ring-black/5">
                            <CardContent className="p-0">
                                <div className="p-10">
                                    <div className={`h-16 w-16 rounded-[1.5rem] ${report.bg} flex items-center justify-center mb-8 border border-gray-100 group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
                                        <report.icon className={`h-8 w-8 ${report.color}`} />
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tight leading-none">{report.title}</h3>
                                    <p className="text-sm text-gray-400 font-medium leading-relaxed italic mb-8 min-h-[40px] line-clamp-2">{report.description}</p>

                                    <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 flex items-center justify-between mb-8">
                                        <div className="space-y-0.5">
                                            <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Real-time KPI</div>
                                            <div className="text-sm font-black text-gray-900">{report.stats}</div>
                                        </div>
                                        <div className={`h-2 w-12 rounded-full ${report.bg} overflow-hidden font-black`}>
                                            <div className={`h-full ${report.color.replace('text', 'bg')} w-3/4`} />
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <Button
                                            onClick={() => handlePreview(report)}
                                            className="flex-1 h-12 bg-gray-50 hover:bg-indigo-50 text-indigo-700 border-none font-black text-[10px] uppercase tracking-widest rounded-xl transition-all"
                                        >
                                            View Audit
                                        </Button>
                                        <Link href={report.href} className="flex-1">
                                            <Button className="w-full h-12 bg-indigo-600 hover:bg-black text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2">
                                                Open <ArrowUpRight size={14} />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Massive Auditor Card */}
                <Card className="border-none shadow-2xl bg-slate-900 text-white overflow-hidden relative rounded-[3rem] p-4">
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-indigo-500/20 to-transparent pointer-events-none" />
                    <CardContent className="p-16 relative z-10">
                        <div className="flex flex-col lg:flex-row items-center gap-16">
                            <div className="flex-1 space-y-8">
                                <div className="inline-flex items-center gap-3 bg-white/10 px-5 py-2 rounded-full border border-white/10">
                                    <ShieldCheck className="h-5 w-5 text-indigo-400" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Institutional Integrity Protocol</span>
                                </div>
                                <h2 className="text-5xl font-black tracking-tight leading-none uppercase">Full-Spectrum Revenue Audit</h2>
                                <p className="text-lg text-slate-400 font-medium leading-relaxed max-w-3xl italic">
                                    Syndicate all institutional financial data into a comprehensive executive summary. Isolate chronic exposure, project cycle velocity, and audit concessions across all academic hierarchies.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-6 pt-4">
                                    <Button
                                        onClick={() => setIsGeneratingAudit(true)}
                                        className="h-16 px-12 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-[12px] tracking-widest rounded-2xl shadow-2xl shadow-indigo-900 transition-all hover:scale-105"
                                    >
                                        {isGeneratingAudit ? <Loader2 className="animate-spin mr-3" /> : <Download className="mr-3 h-5 w-5" />}
                                        Generate Session Matrix
                                    </Button>
                                    <Button variant="outline" className="h-16 px-10 border-slate-700 hover:bg-slate-800 text-slate-300 font-black uppercase text-[12px] tracking-widest rounded-2xl transition-all">
                                        Security Log
                                    </Button>
                                </div>
                            </div>
                            <div className="hidden lg:flex h-64 w-64 bg-slate-800 rounded-[3rem] items-center justify-center shadow-inner relative border border-slate-700/50">
                                <div className="absolute inset-4 border-2 border-dashed border-slate-700 rounded-[2.5rem] flex items-center justify-center">
                                    <TrendingUp size={80} className="text-indigo-500 animate-pulse" />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Dialog open={!!previewReport} onOpenChange={() => setPreviewReport(null)}>
                    <DialogContent className="max-w-4xl border-none shadow-3xl bg-white p-0 rounded-[2.5rem] overflow-hidden">
                        <div className="grid grid-cols-1 lg:grid-cols-5 h-full">
                            <div className="lg:col-span-2 bg-slate-900 p-12 text-white flex flex-col justify-between">
                                <div className="space-y-8">
                                    <div className={`h-16 w-16 ${previewReport?.bg} rounded-3xl flex items-center justify-center border border-white/10`}>
                                        {previewReport?.icon && <previewReport.icon size={32} className={previewReport.color} />}
                                    </div>
                                    <h2 className="text-3xl font-black uppercase tracking-tight leading-none mt-8">{previewReport?.title}</h2>
                                    <p className="text-slate-400 italic text-sm font-medium leading-relaxed">{previewReport?.description}</p>
                                </div>
                                <div className="space-y-4">
                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Archive Metadata</div>
                                    <div className="flex items-center gap-3 text-sm font-bold text-slate-300">
                                        <ShieldCheck size={18} className="text-indigo-500" />
                                        Validated Protocol
                                    </div>
                                    <div className="flex items-center gap-3 text-sm font-bold text-slate-300">
                                        <Calendar size={18} className="text-indigo-500" />
                                        Cycle: 2024-25
                                    </div>
                                </div>
                            </div>
                            <div className="lg:col-span-3 p-12 space-y-12 bg-white">
                                <div className="flex justify-between items-center bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                                    <div className="space-y-1">
                                        <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Audit Concentration</div>
                                        <div className="text-2xl font-black text-indigo-700">{previewReport?.stats}</div>
                                    </div>
                                    <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                                        <Info size={24} className="text-indigo-300" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                    {previewReport?.data.map((item: any, i: number) => (
                                        <div key={i} className="group relative">
                                            <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2">{item.label}</div>
                                            <div className="text-2xl font-black text-gray-900 bg-gray-50 px-5 py-4 rounded-2xl border border-gray-100 group-hover:bg-indigo-50 transition-colors">{item.value}</div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-4 pt-10 border-t border-gray-100">
                                    <Button
                                        onClick={() => setPreviewReport(null)}
                                        className="h-14 flex-1 bg-gray-50 hover:bg-gray-100 text-gray-400 font-black uppercase text-[10px] tracking-widest rounded-2xl border-none transition-all"
                                    >
                                        Cancel Protocol
                                    </Button>
                                    <Button
                                        onClick={() => handleDownload(previewReport)}
                                        className="h-14 flex-1 bg-indigo-600 hover:bg-black text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl shadow-indigo-100 transition-all gap-2"
                                    >
                                        Deploy Audit Export <Download size={14} />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

            </div>
        </DashboardLayout>
    )
}
