"use client"

import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { AlertOctagon, Loader2, RefreshCcw } from "lucide-react"
import { useState, useCallback } from "react"
import { apiFetch, API_ENDPOINTS } from "@/lib/api-config"
import { toast } from "sonner"
import { format, differenceInMonths } from "date-fns"

interface DefaulterItem {
    _id: string
    studentId: {
        _id: string
        studentId: string
        firstName: string
        lastName: string
        class: string
        section: string
        phone: string
    }
    amount: number
    dueDate: string
}

import { AdvancedTable } from "@/components/super-admin/advanced-table"
import { AlertCircle, Search, TrendingDown, Users, Phone } from "lucide-react"

export default function DefaultersList() {
    const [loading, setLoading] = useState(false)
    const [defaulters, setDefaulters] = useState<DefaulterItem[]>([])

    const [classSelect, setClassSelect] = useState("all")
    const [minMonths, setMinMonths] = useState("1")

    const handleSearch = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (classSelect && classSelect !== 'all') params.append('classId', classSelect)

            const res = await apiFetch(`${API_ENDPOINTS.FEES.DUE_REPORT}?${params.toString()}`)

            if (res.ok) {
                const data: DefaulterItem[] = await res.json()
                const now = new Date()
                const monthsThreshold = parseInt(minMonths)

                const filtered = data.filter(item => {
                    const due = new Date(item.dueDate)
                    const diff = differenceInMonths(now, due)
                    return diff >= monthsThreshold
                })

                setDefaulters(filtered)
                if (filtered.length === 0) toast.info("No defaulters found matching criteria")
            } else {
                toast.error("Failed to fetch data")
            }
        } catch (err) {
            toast.error("Network error")
        } finally {
            setLoading(false)
        }
    }, [classSelect, minMonths])

    const columns = [
        {
            key: "studentId",
            label: "Defaulter Profile",
            render: (val: any) => (
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white font-bold shadow-sm">
                        {val?.firstName?.[0]}{val?.lastName?.[0]}
                    </div>
                    <div>
                        <div className="font-bold text-gray-900">{val?.firstName} {val?.lastName}</div>
                        <div className="text-[10px] text-red-500 font-mono tracking-tighter uppercase">UID: {val?.studentId}</div>
                    </div>
                </div>
            )
        },
        {
            key: "class",
            label: "Academic Unit",
            render: (_: any, row: any) => (
                <div className="flex items-center gap-2">
                    <Users size={14} className="text-gray-400" />
                    <span className="font-medium text-gray-700">{row.studentId?.class} - {row.studentId?.section}</span>
                </div>
            )
        },
        {
            key: "feeType",
            label: "Obligation Type",
            render: (val: any, row: any) => (
                <div className="text-sm font-medium text-gray-600 italic">
                    {val || (row as any).feeType || 'General Dues'}
                </div>
            )
        },
        {
            key: "dueDate",
            label: "Maturity",
            render: (val: string) => (
                <div className="text-sm font-semibold text-rose-600">
                    {format(new Date(val), 'dd MMM yyyy')}
                </div>
            )
        },
        {
            key: "months",
            label: "Latency",
            render: (_: any, row: any) => {
                const due = new Date(row.dueDate)
                const months = differenceInMonths(new Date(), due)
                return (
                    <div className="inline-flex items-center px-2 py-0.5 rounded bg-rose-100 text-rose-700 text-[10px] font-black uppercase tracking-widest border border-rose-200">
                        {months} Months Overdue
                    </div>
                )
            }
        },
        {
            key: "amount",
            label: "Pending Capital",
            render: (val: number) => (
                <div className="text-right">
                    <div className="font-black text-red-600 text-base">₹{val.toLocaleString()}</div>
                </div>
            )
        },
        {
            key: "contact",
            label: "Urgent Action",
            render: (_: any, row: any) => (
                <div className="flex justify-end">
                    <Button variant="outline" size="sm" className="h-8 border-rose-200 text-rose-600 hover:bg-rose-50 gap-2">
                        <Phone size={14} /> Contact
                    </Button>
                </div>
            )
        }
    ]

    return (
        <DashboardLayout title="Risk Analysis: Defaulters">
            <div className="max-w-[1600px] mx-auto space-y-8 pb-10">

                {/* Header Context */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                            <div className="h-12 w-12 bg-gradient-to-br from-red-600 to-rose-700 rounded-2xl flex items-center justify-center shadow-xl text-white">
                                <AlertOctagon size={24} />
                            </div>
                            Credit Risk Intelligence
                        </h1>
                        <p className="text-gray-500 mt-2 text-lg">Pinpoint and analyze chronic late payment patterns across hierarchies</p>
                    </div>
                </div>

                {/* Filter Strategy Card */}
                <Card className="border-none shadow-2xl ring-1 ring-black/5 overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-red-50 via-white to-red-50/30 border-b border-red-100/50">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-red-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-200">
                                <Search size={20} />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-bold text-gray-900 italic">Analytical Scanners</CardTitle>
                                <p className="text-sm text-gray-500">Configure parameters to identify high-latency accounts</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-10">
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Hierarchy Filter</Label>
                                <Select value={classSelect} onValueChange={setClassSelect}>
                                    <SelectTrigger className="bg-gray-50/50 border-gray-200 h-12 focus:ring-red-500 focus:border-red-500 text-sm font-bold">
                                        <SelectValue placeholder="All Academic Units" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Global Institution</SelectItem>
                                        {[...Array(12)].map((_, i) => (
                                            <SelectItem key={i} value={(i + 1).toString()}>Class {i + 1}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Latency Threshold</Label>
                                <Select value={minMonths} onValueChange={setMinMonths}>
                                    <SelectTrigger className="bg-gray-50/50 border-gray-200 h-12 focus:ring-red-500 focus:border-red-500 text-sm font-bold">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">1 Month Late</SelectItem>
                                        <SelectItem value="2">2 Months Late</SelectItem>
                                        <SelectItem value="3">3 Months Late</SelectItem>
                                        <SelectItem value="6">Chronic Defaulter (6+ Months)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-end lg:col-span-2">
                                <Button
                                    onClick={handleSearch}
                                    disabled={loading}
                                    className="bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white h-12 px-8 shadow-xl shadow-red-100 font-black uppercase tracking-widest gap-3 w-full"
                                >
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : <TrendingDown size={18} />}
                                    Execute Risk Scan
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Results Section */}
                {defaulters.length > 0 && (
                    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                        <AdvancedTable
                            title="Identified Risk Profiles"
                            columns={columns}
                            data={defaulters}
                            loading={loading}
                            pagination
                        />
                    </div>
                )}

                {defaulters.length === 0 && !loading && (
                    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                        <div className="h-20 w-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                            <Users size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Institutional Health Optimal</h3>
                        <p className="text-gray-400">No high-latency accounts detected for the current parameters.</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
