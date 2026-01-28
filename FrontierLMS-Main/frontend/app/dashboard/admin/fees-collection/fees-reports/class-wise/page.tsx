"use client"

import { useState } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Layers,
    Search,
    Database,
    Printer,
    Download,
    PieChart,
    Calendar,
    TrendingUp,
    ArrowUpRight,
    Loader2,
    Users,
    Filter
} from "lucide-react"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const rows = [
    { id: "1", class: "Grade 10", section: "A", expected: 450000, collected: 425000, percentage: "94.4%" },
    { id: "2", class: "Grade 10", section: "B", expected: 420000, collected: 380000, percentage: "90.5%" },
    { id: "3", class: "Grade 9", section: "A", expected: 380000, collected: 340000, percentage: "89.5%" },
    { id: "4", class: "Grade 9", section: "B", expected: 360000, collected: 310000, percentage: "86.1%" },
    { id: "5", class: "Grade 8", section: "A", expected: 340000, collected: 320000, percentage: "94.1%" },
]

export default function ClassWiseReport() {
    const [loading, setLoading] = useState(false)

    const columns = [
        {
            key: "class",
            label: "Academic Hierarchy",
            render: (val: string, row: any) => (
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
                        <Layers size={16} />
                    </div>
                    <div>
                        <span className="font-black text-gray-900 tracking-tight uppercase">{val}</span>
                        <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mt-0.5">Division {row.section}</div>
                    </div>
                </div>
            )
        },
        {
            key: "expected",
            label: "Projected Inflow",
            render: (val: number) => (
                <div className="font-medium text-gray-400 italic">
                    ₹{val?.toLocaleString()}
                </div>
            )
        },
        {
            key: "collected",
            label: "Synchronized Capital",
            render: (val: number) => (
                <div className="font-black text-indigo-700">
                    ₹{val?.toLocaleString()}
                </div>
            )
        },
        {
            key: "percentage",
            label: "Collection Health",
            render: (val: string) => {
                const num = parseFloat(val)
                return (
                    <div className="flex items-center gap-3">
                        <div className={`text-xs font-black ${num > 90 ? 'text-emerald-600' : 'text-amber-600'}`}>{val}</div>
                        <div className="h-1.5 w-16 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full ${num > 90 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: val }} />
                        </div>
                    </div>
                )
            }
        },
        {
            key: "actions",
            label: "Control",
            render: () => (
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-indigo-600 rounded-lg">
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
        <DashboardLayout title="Institutional Audit: Hierarchical Stratification">
            <div className="max-w-[1600px] mx-auto space-y-8 pb-10">

                {/* Header Context */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                            <div className="h-12 w-12 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl flex items-center justify-center shadow-xl text-white">
                                <PieChart size={24} />
                            </div>
                            Unit Collection Stratification
                        </h1>
                        <p className="text-gray-500 mt-2 text-lg italic font-medium">Granular revenue segmentation across individual academic units and hierarchies</p>
                    </div>

                    <div className="flex gap-3">
                        <Button variant="outline" className="h-12 border-gray-200 shadow-sm gap-2 rounded-2xl bg-white px-6 font-black text-xs uppercase tracking-widest text-gray-600 transition-all hover:bg-gray-50">
                            <Users size={18} /> Participation Map
                        </Button>
                    </div>
                </div>

                {/* Analytical Scanner Card */}
                <Card className="border-none shadow-2xl ring-1 ring-black/5 overflow-hidden rounded-[2rem] bg-white">
                    <CardHeader className="bg-gradient-to-r from-indigo-50/50 via-white to-transparent border-b border-gray-100/50 p-8">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                                <Filter size={24} />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-black text-indigo-900 uppercase tracking-tight">Segment Isolation</CardTitle>
                                <p className="text-xs text-indigo-400 font-bold uppercase tracking-[0.2em] mt-0.5">Academic hierarchy selection protocol</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-10 flex flex-col md:flex-row gap-8 items-end">
                        <div className="flex-1 space-y-2">
                            <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Target Dimension</Label>
                            <Select>
                                <SelectTrigger className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 rounded-2xl focus:ring-indigo-500 font-black text-indigo-900">
                                    <SelectValue placeholder="Unified Institution" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-none shadow-2xl">
                                    <SelectItem value="all" className="rounded-xl font-bold py-3 uppercase">Global Academy</SelectItem>
                                    <SelectItem value="primary" className="rounded-xl font-bold py-3 uppercase">Primary Wing</SelectItem>
                                    <SelectItem value="senior" className="rounded-xl font-bold py-3 uppercase">Senior Academy</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            onClick={() => {
                                setLoading(true)
                                setTimeout(() => setLoading(false), 1000)
                            }}
                            className="bg-indigo-600 hover:bg-black text-white h-14 px-12 rounded-2xl shadow-xl shadow-indigo-100 font-black text-xs uppercase tracking-[0.2em] gap-3 transition-all hover:scale-105 active:scale-95"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
                            Execute Scope Scan
                        </Button>
                    </CardContent>
                </Card>

                {/* Audit Intelligence Section */}
                <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
                    <AdvancedTable
                        title="Validated Hierarchical Ledger"
                        columns={columns}
                        data={rows}
                        loading={loading}
                        pagination
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className="border-none shadow-xl bg-white p-8 rounded-[2.5rem] ring-1 ring-black/5 flex items-center gap-6">
                        <div className="h-16 w-16 bg-emerald-50 text-emerald-600 rounded-[1.5rem] flex items-center justify-center border border-emerald-100 italic">
                            94%
                        </div>
                        <div>
                            <h4 className="font-black text-gray-900 uppercase">Peak Performance Unit</h4>
                            <p className="text-sm text-gray-400 italic">Grade 10 - Division A is currently leading institutional collection health.</p>
                        </div>
                    </Card>
                    <Card className="border-none shadow-xl bg-white p-8 rounded-[2.5rem] ring-1 ring-black/5 flex items-center gap-6">
                        <div className="h-16 w-16 bg-rose-50 text-rose-600 rounded-[1.5rem] flex items-center justify-center border border-rose-100 italic">
                            84%
                        </div>
                        <div>
                            <h4 className="font-black text-gray-900 uppercase">Attention Required</h4>
                            <p className="text-sm text-gray-400 italic">Grade 9 - Division B shows a collection delta that warrants strategic follow-up.</p>
                        </div>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    )
}
