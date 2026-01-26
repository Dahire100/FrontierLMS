"use client"

import { useState } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    CalendarRange,
    Search,
    Database,
    Printer,
    Download,
    LineChart,
    Calendar,
    TrendingUp,
    ArrowUpRight,
    Loader2,
    BarChart3
} from "lucide-react"
import { AdvancedTable } from "@/components/super-admin/advanced-table"

const rows = [
    { id: "1", month: "June 2025", receipts: 842, amount: 1245200, status: "Validated", target: "92%" },
    { id: "2", month: "May 2025", receipts: 712, amount: 1038900, status: "Validated", target: "88%" },
    { id: "3", month: "April 2025", receipts: 941, amount: 1452100, status: "Validated", target: "96%" },
    { id: "4", month: "March 2025", receipts: 619, amount: 922400, status: "Validated", target: "84%" },
    { id: "5", month: "February 2025", receipts: 522, amount: 728600, status: "Validated", target: "78%" },
]

export default function MonthlyReport() {
    const [loading, setLoading] = useState(false)

    const columns = [
        {
            key: "month",
            label: "Fiscal Cycle",
            render: (val: string) => (
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                        <CalendarRange size={16} />
                    </div>
                    <div>
                        <span className="font-black text-gray-900 tracking-tight">{val}</span>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Month Reference</div>
                    </div>
                </div>
            )
        },
        {
            key: "receipts",
            label: "Cycle Volume",
            render: (val: number) => (
                <div className="font-black text-gray-600 bg-gray-100 px-3 py-1 rounded-lg border border-gray-200 w-fit">
                    {val.toLocaleString()} Settlements
                </div>
            )
        },
        {
            key: "amount",
            label: "Accrued Capital",
            render: (val: number) => (
                <div className="font-black text-blue-700 text-lg">
                    ₹{val?.toLocaleString()}
                </div>
            )
        },
        {
            key: "target",
            label: "Projection Alpha",
            render: (val: string) => (
                <div className="flex items-center gap-3">
                    <div className="text-xs font-black text-blue-900">{val}</div>
                    <div className="h-1.5 w-16 bg-blue-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600" style={{ width: val }} />
                    </div>
                </div>
            )
        },
        {
            key: "actions",
            label: "Control",
            render: () => (
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-blue-600 rounded-lg">
                        <Printer size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-indigo-600 rounded-lg">
                        <Download size={14} />
                    </Button>
                </div>
            )
        }
    ]

    return (
        <DashboardLayout title="Institutional Audit: Monthly Revenue Cycle">
            <div className="max-w-[1600px] mx-auto space-y-8 pb-10">

                {/* Header Context */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                            <div className="h-12 w-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-xl text-white">
                                <LineChart size={24} />
                            </div>
                            Monthly Financial Trajectory
                        </h1>
                        <p className="text-gray-500 mt-2 text-lg italic font-medium">Comparative study of cyclic institutional inflows against strategic fiscal projections</p>
                    </div>

                    <div className="flex gap-3">
                        <Button variant="outline" className="h-12 border-gray-200 shadow-sm gap-2 rounded-2xl bg-white px-6 font-black text-xs uppercase tracking-widest text-gray-600 transition-all hover:bg-gray-50">
                            <BarChart3 size={18} /> Trend Analysis
                        </Button>
                    </div>
                </div>

                {/* Analytical Intelligence Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Card className="border-none shadow-xl bg-gradient-to-br from-blue-600 to-blue-800 text-white p-8 rounded-[2rem] relative overflow-hidden group">
                        <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                            <TrendingUp size={160} />
                        </div>
                        <div className="relative z-10 space-y-4">
                            <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Cycle Performance</div>
                            <div className="text-4xl font-black tracking-tighter">₹ 1.24 Cr</div>
                            <p className="text-xs font-medium text-blue-100 italic leading-relaxed">Integrated capital accrued during the current operational month.</p>
                        </div>
                    </Card>
                    <Card className="border-none shadow-xl bg-white p-8 rounded-[2rem] ring-1 ring-black/5 flex flex-col justify-between">
                        <div className="space-y-4">
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Projection Health</div>
                            <div className="text-3xl font-black text-blue-700 tracking-tighter">92.4% Clear</div>
                        </div>
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden mt-6">
                            <div className="h-full bg-blue-600 w-[92%]" />
                        </div>
                    </Card>
                    <Card className="border-none shadow-xl bg-white p-8 rounded-[2rem] ring-1 ring-black/5 flex flex-col justify-between">
                        <div className="space-y-4">
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Diurnal Capture Velocity</div>
                            <div className="text-3xl font-black text-emerald-600 tracking-tighter">₹ 42.5K / Day</div>
                        </div>
                        <div className="flex items-center gap-2 text-emerald-600 text-[10px] font-black uppercase tracking-widest mt-6">
                            <TrendingUp size={14} /> +12% Delta vs Last Cycle
                        </div>
                    </Card>
                </div>

                {/* Audit Intelligence Section */}
                <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
                    <AdvancedTable
                        title="Validated Cyclic Matrix"
                        columns={columns}
                        data={rows}
                        loading={loading}
                        pagination
                    />
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center p-8 bg-blue-50/50 rounded-[2rem] border border-blue-100 border-dashed gap-8">
                    <div className="flex items-center gap-6 text-blue-800">
                        <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-blue-100">
                            <ArrowUpRight size={24} className="text-blue-600" />
                        </div>
                        <div>
                            <p className="font-black text-lg uppercase tracking-tight">Institutional Fiscal Resilience</p>
                            <p className="text-blue-600/70 font-medium text-sm">Monthly cycles are dynamically audited and cross-referenced with institutional benchmarks.</p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
