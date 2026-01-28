"use client"

import { useState } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    CalendarDays,
    Search,
    Database,
    Printer,
    Download,
    BarChart,
    Calendar,
    TrendingUp,
    ArrowUpRight,
    Loader2
} from "lucide-react"
import { AdvancedTable } from "@/components/super-admin/advanced-table"

const rows = [
    { id: "1", date: "2025-06-12", receipts: 34, amount: 45200, status: "Validated" },
    { id: "2", date: "2025-06-11", receipts: 28, amount: 38900, status: "Validated" },
    { id: "3", date: "2025-06-10", receipts: 41, amount: 52100, status: "Audit Pending" },
    { id: "4", date: "2025-06-09", receipts: 19, amount: 22400, status: "Validated" },
    { id: "5", date: "2025-06-08", receipts: 22, amount: 28600, status: "Validated" },
]

export default function DailyReport() {
    const [loading, setLoading] = useState(false)
    const [selectedDate, setSelectedDate] = useState("")

    const columns = [
        {
            key: "date",
            label: "Fiscal Timeline",
            render: (val: string) => (
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
                        <Calendar size={16} />
                    </div>
                    <div>
                        <span className="font-black text-gray-900 tracking-tight">{val}</span>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Audit Stamp</div>
                    </div>
                </div>
            )
        },
        {
            key: "receipts",
            label: "Instrument Count",
            render: (val: number) => (
                <div className="font-black text-gray-600 bg-gray-100 px-3 py-1 rounded-lg border border-gray-200 w-fit">
                    {val} Receipts
                </div>
            )
        },
        {
            key: "amount",
            label: "Settled Capital",
            render: (val: number) => (
                <div className="font-black text-emerald-600 text-lg">
                    ₹{val?.toLocaleString()}
                </div>
            )
        },
        {
            key: "status",
            label: "Protocol Status",
            render: (val: string) => {
                const colors: Record<string, string> = {
                    Validated: "bg-emerald-100 text-emerald-700 border-emerald-200",
                    "Audit Pending": "bg-amber-100 text-amber-700 border-amber-200"
                }
                return (
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-[0.1em] border ${colors[val] || "bg-gray-100 text-gray-700"}`}>
                        {val}
                    </span>
                )
            }
        },
        {
            key: "actions",
            label: "Control",
            render: () => (
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-emerald-600 rounded-lg">
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
        <DashboardLayout title="Operational Audit: Daily Collection">
            <div className="max-w-[1600px] mx-auto space-y-8 pb-10">

                {/* Header Context */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                            <div className="h-12 w-12 bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-2xl flex items-center justify-center shadow-xl text-white">
                                <BarChart size={24} />
                            </div>
                            Daily Revenue Matrix
                        </h1>
                        <p className="text-gray-500 mt-2 text-lg italic font-medium">Real-time analytical visibility into diurnal institutional inflows</p>
                    </div>

                    <div className="flex gap-3">
                        <Button variant="outline" className="h-12 border-gray-200 shadow-sm gap-2 rounded-2xl bg-white px-6 font-black text-xs uppercase tracking-widest text-gray-600 transition-all hover:bg-gray-50">
                            <TrendingUp size={18} /> Cycle Strategy
                        </Button>
                    </div>
                </div>

                {/* Analytical Scanner Card */}
                <Card className="border-none shadow-2xl ring-1 ring-black/5 overflow-hidden rounded-[2rem] bg-white">
                    <CardHeader className="bg-gradient-to-r from-emerald-50/50 via-white to-transparent border-b border-gray-100/50 p-8">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-100">
                                <CalendarDays size={24} />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-black text-emerald-900 uppercase tracking-tight">Temporal Scanner</CardTitle>
                                <p className="text-xs text-emerald-400 font-bold uppercase tracking-[0.2em] mt-0.5">Timeline segment selection protocol</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-10 flex flex-col md:flex-row gap-8 items-end">
                        <div className="flex-1 space-y-2">
                            <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Target Dimension (YYYY-MM-DD)</Label>
                            <div className="relative group">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600" size={18} />
                                <Input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 pl-12 rounded-2xl focus:ring-emerald-500 font-black text-emerald-900 text-lg shadow-inner"
                                />
                            </div>
                        </div>
                        <Button
                            onClick={() => {
                                setLoading(true)
                                setTimeout(() => setLoading(false), 1000)
                            }}
                            className="bg-emerald-600 hover:bg-black text-white h-14 px-12 rounded-2xl shadow-xl shadow-emerald-100 font-black text-xs uppercase tracking-[0.2em] gap-3 transition-all hover:scale-105 active:scale-95"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <Database size={18} />}
                            Execute Audit Sync
                        </Button>
                    </CardContent>
                </Card>

                {/* Audit Intelligence Section */}
                <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
                    <AdvancedTable
                        title="Validated Diurnal Matrix"
                        columns={columns}
                        data={rows}
                        loading={loading}
                        pagination
                    />
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center p-8 bg-emerald-50/50 rounded-[2rem] border border-emerald-100 border-dashed gap-8">
                    <div className="flex items-center gap-6 text-emerald-800">
                        <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-emerald-100">
                            <ArrowUpRight size={24} className="text-emerald-600" />
                        </div>
                        <div>
                            <p className="font-black text-lg uppercase tracking-tight">Institutional Velocity</p>
                            <p className="text-emerald-600/70 font-medium text-sm"> diurnally synchronized with core institutional treasury protocols.</p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
