"use client"

import { useState } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, PieChart, BarChart, Download, ArrowRight, Home, ShieldCheck, AlertCircle, TrendingUp, Users, Loader2, FileCheck, Info } from "lucide-react"
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

const REPORT_CARDS = [
    {
        id: "incident_analytics",
        title: "Incident Analytics",
        description: "Comprehensive summary of all behavioural incidents, categorized by severity and status.",
        icon: AlertCircle,
        color: "text-red-600",
        bg: "bg-red-50",
        stats: "24 New This Week",
        tag: "INCIDENTS",
        data: [
            { label: "Critical", value: 4, color: "bg-red-500" },
            { label: "High", value: 8, color: "bg-orange-500" },
            { label: "Medium", value: 12, color: "bg-blue-500" },
            { label: "Low", value: 18, color: "bg-gray-400" }
        ]
    },
    {
        id: "assessment_matrix",
        title: "Assessment Matrix",
        description: "Visual breakdown of student scoring across all disciplinary parameters for the current term.",
        icon: BarChart,
        color: "text-blue-600",
        bg: "bg-blue-50",
        stats: "88% Average Score",
        tag: "ASSESSMENT",
        data: [
            { label: "Punctuality", value: "9.2/10", color: "text-emerald-600" },
            { label: "Attitude", value: "8.5/10", color: "text-blue-600" },
            { label: "Ethics", value: "8.8/10", color: "text-purple-600" },
            { label: "Participation", value: "7.9/10", color: "text-orange-600" }
        ]
    },
    {
        id: "enforcement_status",
        title: "Enforcement Status",
        description: "Tracking the effectiveness and completion of all disciplinary actions taken by administration.",
        icon: ShieldCheck,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        stats: "92% Resolution Rate",
        tag: "ENFORCEMENT",
        data: [
            { label: "Suspensions", value: 2, status: "Resolved" },
            { label: "Parent Calls", value: 14, status: "Active" },
            { label: "Detentions", value: 6, status: "Pending" },
            { label: "Written Warnings", value: 22, status: "Resolved" }
        ]
    },
    {
        id: "monthly_trends",
        title: "Monthly Trends",
        description: "Comparative report of disciplinary metrics over time to identify behavioural patterns.",
        icon: TrendingUp,
        color: "text-purple-600",
        bg: "bg-purple-50",
        stats: "+5% Improvement",
        tag: "ANALYTICS",
        data: [
            { label: "January", value: 42 },
            { label: "February", value: 38 },
            { label: "March", value: 45 },
            { label: "April", value: 31 }
        ]
    }
]

export default function DisciplinaryReportPage() {
    const [previewReport, setPreviewReport] = useState<any>(null)
    const [isDownloading, setIsDownloading] = useState<string | null>(null)
    const [isGeneratingAudit, setIsGeneratingAudit] = useState(false)

    const handlePreview = (report: any) => {
        setPreviewReport(report)
    }

    const generatePDF = (report: any) => {
        const doc = new jsPDF()

        // Header styling
        doc.setFillColor(26, 35, 126) // #1a237e (Navy Blue)
        doc.rect(0, 0, 210, 45, 'F')

        // Branding
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(24)
        doc.setFont("helvetica", "bold")
        doc.text("MODERN SCHOOL ERP", 20, 20)

        doc.setFontSize(10)
        doc.setFont("helvetica", "normal")
        doc.text("Disciplinary Intelligence Module | Session 2023-24", 20, 32)
        doc.text(`Report Type: ${report.tag}`, 20, 38)

        // Report Title section
        doc.setTextColor(33, 33, 33)
        doc.setFontSize(18)
        doc.setFont("helvetica", "bold")
        doc.text(report.title.toUpperCase(), 20, 65)

        doc.setDrawColor(26, 35, 126)
        doc.setLineWidth(1)
        doc.line(20, 70, 190, 70)

        // Meta information
        doc.setFontSize(11)
        doc.setFont("helvetica", "normal")
        doc.text(`Generation Date: ${new Date().toLocaleString()}`, 20, 80)
        doc.text(`Overall Status Summary: ${report.stats}`, 20, 87)

        // Detailed Data Section
        doc.setFontSize(14)
        doc.setFont("helvetica", "bold")
        doc.text("Data Breakdown", 20, 105)

        // Table preparation
        const tableBody = report.data.map((item: any) => {
            if (report.id === "enforcement_status") {
                return [item.label, item.value, item.status]
            }
            return [item.label, item.value]
        })

        const head = report.id === "enforcement_status"
            ? [["Item Discription", "Count", "Resolution Status"]]
            : [["Parameter / Metric", "Current Value"]]

        autoTable(doc, {
            startY: 110,
            head: head,
            body: tableBody,
            headStyles: {
                fillColor: [26, 35, 126],
                textColor: [255, 255, 255],
                fontSize: 10,
                fontStyle: 'bold'
            },
            bodyStyles: {
                fontSize: 9,
                cellPadding: 5
            },
            alternateRowStyles: {
                fillColor: [245, 245, 250]
            },
            theme: 'grid',
            margin: { left: 20, right: 20 }
        })

        // Footer branding
        const pageCount = (doc as any).internal.getNumberOfPages()
        doc.setFontSize(8)
        doc.setTextColor(150, 150, 150)
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i)
            doc.text(`CONFIDENTIAL - THIS IS AN AUTO-GENERATED DISCIPLINARY RECORD | Page ${i} of ${pageCount}`, 105, 285, { align: 'center' })
        }

        doc.save(`${report.id}_official_report_2024.pdf`)
    }

    const handleDownload = (report: any) => {
        setIsDownloading(report.id)

        setTimeout(() => {
            try {
                generatePDF(report)
                setIsDownloading(null)
                toast.success(`${report.title} PDF Ready`, {
                    description: "High-quality PDF report has been generated successfully.",
                    icon: <FileCheck className="h-4 w-4 text-emerald-500" />
                })
            } catch (err) {
                setIsDownloading(null)
                console.error(err)
                toast.error("PDF generation failed. Please try again.")
            }
        }, 1500)
    }

    const handleGenerateAudit = () => {
        setIsGeneratingAudit(true)
        setTimeout(() => {
            const doc = new jsPDF()

            // Executive Header
            doc.setFillColor(13, 71, 161) // Darker Blue
            doc.rect(0, 0, 210, 60, 'F')
            doc.setTextColor(255, 255, 255)
            doc.setFontSize(32)
            doc.setFont("helvetica", "bold")
            doc.text("INSTITUTIONAL AUDIT", 20, 30)
            doc.setFontSize(12)
            doc.setFont("helvetica", "normal")
            doc.text("ANNUAL DISCIPLINARY & BEHAVIOURAL SUMMARY 2023-24", 20, 45)
            doc.text(`AUDIT ID: DSC-AUD-2024-001 | ISSUED: ${new Date().toLocaleDateString()}`, 20, 52)

            // Content Summary
            doc.setTextColor(0, 0, 0)
            doc.setFontSize(16)
            doc.setFont("helvetica", "bold")
            doc.text("1. Executive Summary", 20, 80)

            doc.setFontSize(10)
            doc.setFont("helvetica", "normal")
            const summaryText = "The institutional disciplinary health for the current academic session remains within optimal parameters. There has been a notable improvement in average behavioural scores (up by 5.4%) and a significant reduction in critical incidents (down by 18%). Enforcement status tracking shows a 92% successful resolution rate for all logged cases."
            doc.text(doc.splitTextToSize(summaryText, 170), 20, 90)

            // KPI Table
            autoTable(doc, {
                startY: 110,
                head: [["KEY PERFORMANCE INDICATOR", "CURRENT STATUS (Q3)", "ANNUAL TREND"]],
                body: [
                    ["General Student Conduct", "EXCELLENT (94%)", "POSITIVE"],
                    ["Incident Resolution Efficiency", "OPTIMAL (92%)", "STABLE"],
                    ["Parameter Scoring Average", "HIGH (8.8/10)", "POSITIVE"],
                    ["Staff Engagement In Reporting", "ACTIVE (98%)", "STABLE"],
                    ["Parental Collaboration Index", "GOOD (85%)", "STABLE"]
                ],
                headStyles: { fillColor: [13, 71, 161] },
                bodyStyles: { fontSize: 9 }
            })

            // Recommendation Section
            doc.setFontSize(14)
            doc.setFont("helvetica", "bold")
            doc.text("2. Administrative Review & Conclusion", 20, 180)
            doc.setFontSize(10)
            doc.setFont("helvetica", "normal")
            doc.text("The current policy framework is performing well. We recommend continuing with the existing 'Parameter-Based Scrutiny' system for the following session. Detailed house-wise rankings will be issued in the final term report.", 20, 190)

            doc.save("Official_Institutional_Disciplinary_Audit_2024.pdf")

            setIsGeneratingAudit(false)
            toast.success("Audit PDF Exported", {
                description: "The full institutional review has been downloaded as a PDF.",
                icon: <ShieldCheck className="h-4 w-4 text-emerald-500" />
            })
        }, 2500)
    }

    return (
        <DashboardLayout title="Behavioural Intelligence Reports">
            <div className="space-y-6 max-w-full pb-10">
                <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border-l-4 border-l-[#1a237e]">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800 tracking-tight">Disciplinary Analytics</h1>
                        <p className="text-xs text-gray-500 font-medium font-bold uppercase tracking-widest text-[#1a237e]">Institutional Export Ledger</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {REPORT_CARDS.map((report, idx) => (
                        <Card key={idx} className="group hover:border-[#1a237e]/20 transition-all cursor-pointer overflow-hidden shadow-sm hover:shadow-lg border-gray-100">
                            <CardContent className="p-0">
                                <div className="p-5" onClick={() => handlePreview(report)}>
                                    <div className={`h-12 w-12 rounded-xl ${report.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm`}>
                                        <report.icon className={`h-6 w-6 ${report.color}`} />
                                    </div>
                                    <h3 className="font-bold text-gray-800 text-sm mb-2 group-hover:text-[#1a237e] transition-colors">{report.title}</h3>
                                    <p className="text-[11px] text-gray-400 leading-relaxed mb-4 min-h-[45px] font-medium">{report.description}</p>
                                    <div className="bg-gray-50 p-2 rounded border border-gray-100 flex items-center justify-between">
                                        <span className="text-[9px] font-extrabold text-[#1a237e] uppercase tracking-tighter">{report.stats}</span>
                                        <div className="h-1 w-12 bg-gray-200 rounded-full overflow-hidden">
                                            <div className="h-full bg-[#1a237e] w-2/3"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-5 py-3 bg-gray-50/50 border-t flex items-center justify-between group-hover:bg-blue-50/30 transition-colors">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 text-[10px] font-bold text-gray-500 hover:text-[#1a237e] p-0"
                                        onClick={() => handlePreview(report)}
                                    >
                                        VIEW PREVIEW <ArrowRight className="h-3 w-3 ml-1" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        disabled={isDownloading === report.id}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDownload(report);
                                        }}
                                        className="h-7 w-7 text-gray-400 hover:text-blue-600"
                                    >
                                        {isDownloading === report.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card className="bg-[#1a237e] text-white overflow-hidden relative border-none shadow-2xl">
                    <div className="absolute right-0 top-0 opacity-10 p-10 rotate-12 scale-150">
                        <PieChart className="h-48 w-48" />
                    </div>
                    <CardContent className="p-10 relative z-10 flex flex-col md:flex-row items-center gap-10">
                        <div className="flex-1 space-y-5 text-center md:text-left">
                            <h2 className="text-3xl font-black tracking-tighter text-white m-0 uppercase italic">Annual Performance Audit</h2>
                            <p className="text-sm text-blue-100 opacity-90 leading-relaxed max-w-2xl">
                                Synthesize school-wide behavioural metrics into a formal institutional audit report. This comprehensive PDF includes KPI tracking, incident resolution trends, and executive recommendations for the next session.
                            </p>
                            <Button
                                onClick={handleGenerateAudit}
                                disabled={isGeneratingAudit}
                                size="lg"
                                className="bg-white text-[#1a237e] hover:bg-white/90 font-black uppercase text-[11px] tracking-[0.2em] px-10 h-12 shadow-2xl group"
                            >
                                {isGeneratingAudit ? <Loader2 className="animate-spin mr-3 h-5 w-5" /> : <ShieldCheck className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />}
                                {isGeneratingAudit ? "Processing Institutional Data..." : "Export Full Audit PDF"}
                            </Button>
                        </div>
                        <div className="hidden lg:flex items-center justify-center p-6 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-emerald-500/20 rounded border border-emerald-500/30 text-center">
                                    <p className="text-[10px] font-bold text-emerald-300 uppercase">Health</p>
                                    <p className="text-lg font-black text-white">94%</p>
                                </div>
                                <div className="p-3 bg-blue-500/20 rounded border border-blue-500/30 text-center">
                                    <p className="text-[10px] font-bold text-blue-300 uppercase">Trend</p>
                                    <p className="text-lg font-black text-white">+5%</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Dialog open={!!previewReport} onOpenChange={() => setPreviewReport(null)}>
                    <DialogContent className="max-w-3xl border-t-[6px] border-t-[#1a237e] p-0 overflow-hidden">
                        <DialogHeader className="p-6 bg-gray-50/80 border-b">
                            <div className="flex justify-between items-start">
                                <div>
                                    <DialogTitle className="flex items-center gap-3 text-gray-800 uppercase tracking-tighter font-black text-xl">
                                        {previewReport?.icon && <previewReport.icon className={`h-6 w-6 ${previewReport.color}`} />}
                                        {previewReport?.title}
                                    </DialogTitle>
                                    <DialogDescription className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 flex items-center gap-2">
                                        System Simulation <ArrowRight className="h-3 w-3" /> <span className="text-[#1a237e]">{previewReport?.tag} Analytics</span>
                                    </DialogDescription>
                                </div>
                                <div className="bg-[#1a237e] text-white px-3 py-1 rounded text-[9px] font-black uppercase tracking-widest shadow-lg">
                                    LIVE PREVIEW
                                </div>
                            </div>
                        </DialogHeader>

                        <div className="p-8 space-y-6">
                            {previewReport?.id === "incident_analytics" && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-4 gap-4">
                                        {previewReport.data.map((item: any, i: number) => (
                                            <div key={i} className="bg-white border-2 border-gray-50 p-4 rounded-xl text-center shadow-sm hover:border-[#1a237e]/10 transition-colors">
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">{item.label}</p>
                                                <p className="text-2xl font-black text-gray-800">{item.value}</p>
                                                <div className={`h-1.5 w-full ${item.color} mt-3 rounded-full opacity-80`} />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="bg-blue-50 border-l-4 border-l-blue-500 p-5 rounded-r-lg flex items-start gap-4">
                                        <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                                            <Info className="h-5 w-5" />
                                        </div>
                                        <p className="text-xs text-blue-800 leading-relaxed font-bold italic">
                                            "Automated Insight: Incident frequency has decreased by 12% compared to the previous month. Critical incidents are primarily localized in Senior High School blocks."
                                        </p>
                                    </div>
                                </div>
                            )}

                            {previewReport?.id === "assessment_matrix" && (
                                <div className="space-y-4 bg-gray-50 p-5 rounded-2xl border">
                                    {previewReport.data.map((item: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between p-4 border bg-white rounded-xl shadow-sm">
                                            <span className="text-xs font-black text-gray-600 uppercase tracking-widest">{item.label}</span>
                                            <div className="flex items-center gap-6 flex-1 max-w-[300px] ml-4">
                                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden border">
                                                    <div className="h-full bg-[#1a237e] shadow-[0_0_10px_rgba(26,35,126,0.3)]" style={{ width: `${parseFloat(item.value) * 10}%` }} />
                                                </div>
                                                <span className={`text-xs font-black min-w-[50px] text-right ${item.color}`}>{item.value}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {previewReport?.id === "enforcement_status" && (
                                <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-xl">
                                    <table className="w-full text-left">
                                        <thead className="bg-[#1a237e] text-[9px] font-black text-white uppercase tracking-widest">
                                            <tr>
                                                <th className="p-4">DISCIPLINARY MEASURE</th>
                                                <th className="p-4">FREQUENCY</th>
                                                <th className="p-4 text-right">SYSTEM STATUS</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-xs divide-y bg-white">
                                            {previewReport.data.map((item: any, i: number) => (
                                                <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                                                    <td className="p-4 font-black text-gray-700 tracking-tight uppercase">{item.label}</td>
                                                    <td className="p-4 font-bold text-[#1a237e]">{item.value} Records</td>
                                                    <td className="p-4 text-right">
                                                        <span className={`text-[8px] font-black uppercase px-3 py-1 rounded-full border-2 ${item.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
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

                            {previewReport?.id === "monthly_trends" && (
                                <div className="p-10 border-2 bg-white rounded-3xl shadow-inner relative h-[250px] flex items-end justify-around gap-6">
                                    <div className="absolute top-6 left-6 flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full bg-[#1a237e] animate-pulse" />
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Volume Variation Tracking</p>
                                    </div>
                                    {previewReport.data.map((item: any, i: number) => (
                                        <div key={i} className="flex flex-col items-center gap-3 group w-full">
                                            <div
                                                className="w-16 bg-[#1a237e]/10 group-hover:bg-[#1a237e] transition-all duration-500 rounded-t-xl relative shadow-sm group-hover:shadow-[0_-5px_20px_rgba(26,35,126,0.3)]"
                                                style={{ height: `${item.value * 3.5}px` }}
                                            >
                                                <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[11px] font-black text-[#1a237e] group-hover:scale-125 transition-transform">{item.value}</span>
                                            </div>
                                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">{item.label}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between items-center bg-gray-50 p-6 border-t">
                            <div className="flex items-center gap-3 text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                                <div className="p-1.5 bg-blue-500/10 rounded">
                                    <Info className="h-4 w-4 text-blue-500" />
                                </div>
                                System Compiled: {new Date().toLocaleDateString()}
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setPreviewReport(null)}
                                    className="h-10 text-[10px] uppercase font-black tracking-widest border-2 hover:bg-white"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="bg-[#1a237e] hover:bg-[#0b1c48] font-black text-[10px] uppercase tracking-widest h-10 px-8 shadow-xl"
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
