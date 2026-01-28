"use client"

import { useState, useCallback } from "react"
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
    Search,
    Download,
    Calendar,
    Loader2,
    RefreshCcw,
    Database,
    Filter,
    Phone,
    Mail,
    MessageSquare,
    Users,
    TrendingDown,
    TrendingUp,
    AlertCircle
} from "lucide-react"
import { apiFetch, API_ENDPOINTS } from "@/lib/api-config"
import { toast } from "sonner"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import { format } from "date-fns"

interface FollowUpRecord {
    _id: string
    studentId: {
        _id: string
        studentId: string
        firstName: string
        lastName: string
        class: string
        section: string
        phone?: string
    }
    totalFees: number
    paidAmount: number
    dueAmount: number
    lastPaymentDate?: string
}

export default function FeeFollowUp() {
    const [classSelect, setClassSelect] = useState("all")
    const [sectionSelect, setSectionSelect] = useState("all")
    const [filterSelect, setFilterSelect] = useState("student-wise")
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [loading, setLoading] = useState(false)
    const [records, setRecords] = useState<FollowUpRecord[]>([])

    const handleSearch = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (classSelect && classSelect !== 'all') params.append('classId', classSelect)
            if (sectionSelect && sectionSelect !== 'all') params.append('section', sectionSelect)
            if (startDate) params.append('startDate', startDate)
            if (endDate) params.append('endDate', endDate)

            const response = await apiFetch(`${API_ENDPOINTS.FEES.DUE_REPORT}?${params.toString()}`)
            if (response.ok) {
                const data = await response.json()
                // Transform data to match FollowUpRecord if necessary
                // In existing logic, it seems DUE_REPORT returns DueFeeItem[]
                // We map it to what the table expects
                const transformed = data.map((item: any) => ({
                    _id: item._id,
                    studentId: item.studentId,
                    totalFees: item.totalAmount,
                    paidAmount: item.paidAmount,
                    dueAmount: item.amount,
                    lastPaymentDate: null // From API it might not be there
                }))
                setRecords(transformed)
                if (data.length === 0) toast.info("No records found for current criteria")
            } else {
                toast.error("Failed to fetch analytical data")
            }
        } catch (error) {
            toast.error("Network synchronization error")
        } finally {
            setLoading(false)
        }
    }, [classSelect, sectionSelect, startDate, endDate])

    const columns = [
        {
            key: "studentId",
            label: "Stakeholder Profile",
            render: (val: any) => (
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black shadow-lg">
                        {val?.firstName?.[0]}{val?.lastName?.[0]}
                    </div>
                    <div>
                        <div className="font-bold text-gray-900 leading-tight">{val?.firstName} {val?.lastName}</div>
                        <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">ID: {val?.studentId}</div>
                    </div>
                </div>
            )
        },
        {
            key: "academic",
            label: "Unit Info",
            render: (_: any, row: any) => (
                <div className="text-sm">
                    <div className="font-bold text-indigo-700">Class {row.studentId?.class}</div>
                    <div className="text-[10px] text-gray-400 uppercase font-black">Division {row.studentId?.section}</div>
                </div>
            )
        },
        {
            key: "totalFees",
            label: "Gross Liability",
            render: (val: number) => (
                <div className="text-right font-medium text-gray-400 italic">₹{val?.toLocaleString()}</div>
            )
        },
        {
            key: "paidAmount",
            label: "Settled Capital",
            render: (val: number) => (
                <div className="text-right font-black text-emerald-600">₹{val?.toLocaleString()}</div>
            )
        },
        {
            key: "dueAmount",
            label: "Outstanding Exposure",
            render: (val: number) => (
                <div className="text-right">
                    <div className="inline-block px-3 py-1 bg-rose-50 text-rose-700 rounded-lg font-black text-base ring-1 ring-rose-100 shadow-sm">
                        ₹{val?.toLocaleString()}
                    </div>
                </div>
            )
        },
        {
            key: "actions",
            label: "Engagement Intelligence",
            render: (_: any, row: any) => (
                <div className="flex justify-end gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8 text-blue-600 border-blue-100 hover:bg-blue-50 rounded-lg shadow-sm">
                        <Phone size={14} />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8 text-indigo-600 border-indigo-100 hover:bg-indigo-50 rounded-lg shadow-sm">
                        <Mail size={14} />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8 text-emerald-600 border-emerald-100 hover:bg-emerald-50 rounded-lg shadow-sm">
                        <MessageSquare size={14} />
                    </Button>
                </div>
            )
        }
    ]

    return (
        <DashboardLayout title="Financial Intelligence: Fee Follow-Up">
            <div className="max-w-[1600px] mx-auto space-y-8 pb-10">

                {/* Header Context */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                            <div className="h-12 w-12 bg-gradient-to-br from-indigo-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-xl text-white">
                                <TrendingUp size={24} />
                            </div>
                            Exposure Follow-Up Hub
                        </h1>
                        <p className="text-gray-500 mt-2 text-lg italic font-medium">Strategic monitoring and proactive collection management console</p>
                    </div>

                    <div className="flex gap-3">
                        <Button variant="outline" className="h-12 px-6 border-gray-200 shadow-sm gap-2 rounded-2xl bg-white font-black text-xs uppercase tracking-widest text-gray-600">
                            <Download size={18} /> Data Export
                        </Button>
                    </div>
                </div>

                {/* Analytical Scanners Card */}
                <Card className="border-none shadow-2xl ring-1 ring-black/5 overflow-hidden rounded-[2rem] bg-white">
                    <CardHeader className="bg-gradient-to-r from-indigo-50/50 via-white to-transparent border-b border-gray-100/50 p-8">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                                <Filter size={24} />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-black text-indigo-900 uppercase tracking-tight">Audit Scanners</CardTitle>
                                <p className="text-xs text-indigo-400 font-bold uppercase tracking-[0.2em] mt-0.5">Filter Protocol Configuration</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Academic Unit</Label>
                                <Select value={classSelect} onValueChange={setClassSelect}>
                                    <SelectTrigger className="bg-gray-50/50 border-gray-200 h-14 rounded-2xl focus:ring-indigo-500 font-bold text-gray-600 border-none ring-1 ring-gray-100">
                                        <SelectValue placeholder="All Categories" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Unified Academy</SelectItem>
                                        {[...Array(12)].map((_, i) => (
                                            <SelectItem key={i} value={(i + 1).toString()}>Grade {i + 1}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Division Protocol</Label>
                                <Select value={sectionSelect} onValueChange={setSectionSelect}>
                                    <SelectTrigger className="bg-gray-50/50 border-gray-200 h-14 rounded-2xl focus:ring-indigo-500 font-bold text-gray-600 border-none ring-1 ring-gray-100">
                                        <SelectValue placeholder="All Sections" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Global Sections</SelectItem>
                                        <SelectItem value="A">Division A</SelectItem>
                                        <SelectItem value="B">Division B</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Analysis Mode</Label>
                                <Select value={filterSelect} onValueChange={setFilterSelect}>
                                    <SelectTrigger className="bg-gray-50/50 border-gray-200 h-14 rounded-2xl focus:ring-indigo-500 font-bold text-indigo-700 border-none ring-1 ring-gray-100">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="student-wise">Direct Stakeholder Mode</SelectItem>
                                        <SelectItem value="parent-wise">Guardian Hierarchy Mode</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-end">
                                <Button
                                    onClick={handleSearch}
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-indigo-600 to-blue-700 hover:from-indigo-700 hover:to-blue-800 text-white h-14 rounded-2xl shadow-xl shadow-indigo-100 font-black text-xs uppercase tracking-[0.2em] gap-3 transition-all hover:scale-[1.02]"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
                                    Execute Risk Scan
                                </Button>
                            </div>
                        </div>

                        {/* Secondary Analytics Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10 mt-10 p-8 bg-gray-50/50 rounded-[2rem] border border-gray-100 border-dashed">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Start Threshold</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400 pointer-events-none" />
                                        <Input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="bg-white border-none ring-1 ring-gray-200 h-12 pl-12 rounded-xl focus:ring-indigo-500 font-bold"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">End Threshold</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400 pointer-events-none" />
                                        <Input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="bg-white border-none ring-1 ring-gray-200 h-12 pl-12 rounded-xl focus:ring-indigo-500 font-bold"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
                                <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                                    <AlertCircle size={20} />
                                </div>
                                <div className="text-xs">
                                    <p className="font-black text-indigo-900 uppercase">Analysis Precision</p>
                                    <p className="text-indigo-600/80 font-medium">Fine-tune temporal parameters for chronic risk identification.</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Audit Intelligence Section */}
                {records.length > 0 && (
                    <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
                        <AdvancedTable
                            title="Validated Exposure Registry"
                            columns={columns}
                            data={records}
                            loading={loading}
                            pagination
                        />
                    </div>
                )}

                {/* Initial Empty State */}
                {records.length === 0 && !loading && (
                    <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
                        <div className="h-28 w-28 bg-indigo-50 rounded-full flex items-center justify-center mb-6 shadow-inner ring-8 ring-white">
                            <Users size={48} className="text-indigo-200" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Awaiting Analytical Scan</h3>
                        <p className="text-gray-400 max-w-sm text-center mt-3 text-sm italic font-medium leading-relaxed">Execute the follow-up protocol to visualize outstanding exposure and initiate engagement actions.</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
