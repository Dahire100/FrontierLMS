"use client"

import { useEffect, useState, useCallback } from "react"
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
import { Building2, Loader2, RefreshCcw, Database, User, Bed, Home, DollarSign, Filter, Search } from "lucide-react"
import { toast } from "sonner"
import { apiFetch, API_ENDPOINTS } from "@/lib/api-config"
import { AdvancedTable } from "@/components/super-admin/advanced-table"

interface HostelFeeItem {
    _id: string
    studentId: {
        firstName: string
        lastName: string
    }
    room: string
    bed: string
    charge: number
    status: string
}

export default function HostelFees() {
    const [records, setRecords] = useState<HostelFeeItem[]>([])
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")

    const [formData, setFormData] = useState({
        student: "",
        room: "",
        bed: "",
        charge: "",
        status: ""
    })

    const fetchHostelFees = useCallback(async () => {
        setLoading(true)
        try {
            const res = await apiFetch(`${API_ENDPOINTS.FEES.BASE}/hostel-fees`)
            if (res.ok) {
                const data = await res.json()
                setRecords(Array.isArray(data) ? data : data.data || [])
            } else {
                toast.error("Failed to sync structural data")
            }
        } catch (error) {
            toast.error("Network synchronization failure")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchHostelFees()
    }, [fetchHostelFees])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.student || !formData.room || !formData.charge || !formData.status) {
            toast.error("Please fill all required operational parameters")
            return
        }

        setSubmitting(true)
        try {
            const res = await apiFetch(`${API_ENDPOINTS.FEES.BASE}/hostel-fees`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    studentId: formData.student,
                    room: formData.room,
                    bed: formData.bed,
                    charge: parseFloat(formData.charge),
                    status: formData.status
                })
            })

            if (res.ok) {
                toast.success("Hostel liability recorded successfully")
                setFormData({ student: "", room: "", bed: "", charge: "", status: "" })
                fetchHostelFees()
            } else {
                const err = await res.json()
                toast.error(err.message || "Failed to commit entry")
            }
        } catch (error) {
            toast.error("Failed to commit entry")
        } finally {
            setSubmitting(false)
        }
    }

    const columns = [
        {
            key: "student",
            label: "Stakeholder",
            render: (_: any, row: any) => (
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100 font-black text-xs">
                        {row.studentId?.firstName?.[0]}{row.studentId?.lastName?.[0]}
                    </div>
                    <div>
                        <span className="font-black text-gray-900 tracking-tight text-sm uppercase">{row.studentId?.firstName} {row.studentId?.lastName}</span>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-1">Hostel Resident</div>
                    </div>
                </div>
            )
        },
        {
            key: "location",
            label: "Unit Context",
            render: (_: any, row: any) => (
                <div className="flex items-center gap-4">
                    <div className="text-xs">
                        <div className="text-gray-400 uppercase font-black text-[9px] tracking-widest">Room</div>
                        <div className="font-black text-indigo-900">{row.room}</div>
                    </div>
                    <div className="h-8 w-px bg-gray-100" />
                    <div className="text-xs">
                        <div className="text-gray-400 uppercase font-black text-[9px] tracking-widest">Bed</div>
                        <div className="font-black text-indigo-900">{row.bed || 'Unassigned'}</div>
                    </div>
                </div>
            )
        },
        {
            key: "charge",
            label: "Monthly Valuation",
            render: (val: number) => (
                <div className="font-black text-indigo-700 bg-indigo-50/50 px-3 py-1.5 rounded-xl border border-indigo-100 w-fit">
                    ₹{val?.toLocaleString()}
                </div>
            )
        },
        {
            key: "status",
            label: "Protocol Status",
            render: (val: string) => {
                const isPaid = val === "Paid"
                return (
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-[0.1em] border ${isPaid ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-amber-100 text-amber-700 border-amber-200"
                        }`}>
                        {val}
                    </span>
                )
            }
        }
    ]

    const filteredRecords = records.filter(r =>
        `${r.studentId?.firstName} ${r.studentId?.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.room.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <DashboardLayout title="Universal Audit: Hostel Fee Registry">
            <div className="max-w-[1600px] mx-auto space-y-8 pb-10">

                {/* Header Context */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3 uppercase">
                            <div className="h-12 w-12 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl flex items-center justify-center shadow-xl text-white">
                                <Building2 size={24} />
                            </div>
                            Residential Fee Protocol
                        </h1>
                        <p className="text-gray-500 mt-2 text-lg italic font-medium">Govern residential liabilities and coordinate collection strategies for the institutional hostel hub</p>
                    </div>

                    <Button variant="outline" className="h-12 border-gray-200 shadow-sm gap-2 rounded-2xl bg-white px-6 font-black text-xs uppercase tracking-widest text-gray-600">
                        <Database size={18} /> Master Sync
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Definition Panel */}
                    <div className="lg:col-span-4 transition-all duration-500">
                        <Card className="border-none shadow-2xl ring-1 ring-black/5 overflow-hidden sticky top-8 rounded-[2rem]">
                            <CardHeader className="bg-gradient-to-r from-indigo-50/50 to-white border-b border-gray-100 p-8">
                                <CardTitle className="text-[10px] flex items-center gap-2 text-indigo-900 uppercase tracking-[0.2em] font-black">
                                    <Home size={14} className="text-indigo-600" /> Assessment Strategy
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Resident Ref <span className="text-rose-500">*</span></Label>
                                        <div className="relative group">
                                            <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors" />
                                            <Input
                                                placeholder="Search student ID..."
                                                value={formData.student}
                                                onChange={(e) => setFormData({ ...formData, student: e.target.value })}
                                                className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 pl-12 rounded-2xl focus:ring-indigo-500 font-bold"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Room ID <span className="text-rose-500">*</span></Label>
                                            <Input
                                                placeholder="e.g. 302-A"
                                                value={formData.room}
                                                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                                                className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 rounded-2xl focus:ring-indigo-500 font-bold"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Bed Slot</Label>
                                            <div className="relative group">
                                                <Bed size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                                                <Input
                                                    placeholder="Slot ID"
                                                    value={formData.bed}
                                                    onChange={(e) => setFormData({ ...formData, bed: e.target.value })}
                                                    className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 pl-11 rounded-2xl focus:ring-indigo-500 font-bold"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Cyclic Charge (₹) <span className="text-rose-500">*</span></Label>
                                        <div className="relative group">
                                            <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600 h-4 w-4" />
                                            <Input
                                                type="number"
                                                placeholder="0.00"
                                                value={formData.charge}
                                                onChange={(e) => setFormData({ ...formData, charge: e.target.value })}
                                                className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 pl-11 rounded-2xl focus:ring-indigo-500 font-black text-lg"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Initial Status <span className="text-rose-500">*</span></Label>
                                        <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
                                            <SelectTrigger className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 rounded-2xl focus:ring-indigo-500 font-black">
                                                <SelectValue placeholder="Protocol State" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl shadow-2xl border-none p-2">
                                                <SelectItem value="Pending" className="rounded-xl font-bold py-2.5">Assessment Pending</SelectItem>
                                                <SelectItem value="Paid" className="rounded-xl font-bold py-2.5">Liability Settled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-black text-white h-14 rounded-2xl shadow-xl shadow-indigo-100 font-black text-xs uppercase tracking-[0.2em] gap-3 transition-all hover:scale-[1.02]"
                                    >
                                        {submitting ? <Loader2 className="animate-spin" size={18} /> : <Database size={18} />}
                                        Commit Protocol Entry
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Registry Panel */}
                    <div className="lg:col-span-8">
                        <div className="mb-8 flex flex-col md:flex-row gap-6 items-center justify-between">
                            <div className="relative flex-1 max-w-md group">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-indigo-600 transition-colors" />
                                <Input
                                    className="pl-14 h-16 bg-white border-none ring-1 ring-gray-100 shadow-xl rounded-[1.5rem] focus:ring-2 focus:ring-indigo-500/20 text-lg font-medium"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Filter by resident or unit ID..."
                                />
                            </div>
                            <Button variant="outline" size="sm" onClick={fetchHostelFees} className="gap-2 border-gray-100 hover:bg-white shadow-lg h-16 px-10 rounded-[1.5rem] font-black uppercase tracking-widest text-xs bg-white text-gray-500 group">
                                <RefreshCcw size={18} className={`group-hover:rotate-180 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`} /> Sync Archive
                            </Button>
                        </div>

                        <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
                            <AdvancedTable
                                title="Validated Residential Matrix"
                                columns={columns}
                                data={filteredRecords}
                                loading={loading}
                                pagination
                            />
                        </div>

                        {filteredRecords.length === 0 && !loading && (
                            <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
                                <div className="h-28 w-28 bg-indigo-50 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner ring-8 ring-white">
                                    <Building2 size={48} className="text-indigo-200" />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Registry Clear</h3>
                                <p className="text-gray-400 max-w-sm text-center mt-3 text-sm italic font-medium leading-relaxed">No residential liability records identified in the institutional archive.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
