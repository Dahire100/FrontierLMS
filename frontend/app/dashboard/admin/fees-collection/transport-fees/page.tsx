"use client"

import { useState, useEffect, useCallback } from "react"
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
import { Bus, Loader2, RefreshCcw, Database, User, Route, ShieldCheck, DollarSign, Filter, Search, MapPin } from "lucide-react"
import { toast } from "sonner"
import { apiFetch, API_ENDPOINTS } from "@/lib/api-config"
import { AdvancedTable } from "@/components/super-admin/advanced-table"

interface TransportFee {
    _id: string
    studentId: {
        studentId: string
        firstName: string
        lastName: string
    }
    routeId: {
        name: string
        vehicleNo: string
    }
    amount: number
    status: string
}

export default function TransportFees() {
    const [records, setRecords] = useState<TransportFee[]>([])
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")

    const [formData, setFormData] = useState({
        student: "",
        route: "",
        vehicle: "",
        charge: "",
        status: ""
    })

    const fetchTransportFees = useCallback(async () => {
        setLoading(true)
        try {
            const response = await apiFetch(`${API_ENDPOINTS.FEES.BASE}/transport`)
            if (response.ok) {
                const data = await response.json()
                setRecords(Array.isArray(data) ? data : data.data || [])
            } else {
                toast.error("Failed to sync logistical data")
            }
        } catch (error) {
            toast.error("Network synchronization failure")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchTransportFees()
    }, [fetchTransportFees])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.student || !formData.route || !formData.vehicle || !formData.charge || !formData.status) {
            toast.error("Please fill all required logistical parameters")
            return
        }

        setSubmitting(true)
        try {
            const response = await apiFetch(`${API_ENDPOINTS.FEES.BASE}/transport`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    studentId: formData.student,
                    routeId: formData.route,
                    vehicleNo: formData.vehicle,
                    amount: parseFloat(formData.charge),
                    status: formData.status
                })
            })

            if (response.ok) {
                toast.success("Logistical liability recorded successfully")
                setFormData({ student: "", route: "", vehicle: "", charge: "", status: "" })
                fetchTransportFees()
            } else {
                const error = await response.json()
                toast.error(error.message || "Failed to commit entry")
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
                    <div className="h-9 w-9 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 shadow-sm border border-amber-100 font-black text-xs">
                        {row.studentId?.firstName?.[0]}{row.studentId?.lastName?.[0]}
                    </div>
                    <div>
                        <span className="font-black text-gray-900 tracking-tight text-sm uppercase">{row.studentId?.firstName} {row.studentId?.lastName}</span>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-1">Commuter Profile</div>
                    </div>
                </div>
            )
        },
        {
            key: "logistics",
            label: "Logistics Hub",
            render: (_: any, row: any) => (
                <div className="flex items-center gap-4">
                    <div className="text-xs">
                        <div className="text-gray-400 uppercase font-black text-[9px] tracking-widest">Route</div>
                        <div className="font-black text-amber-900">{row.routeId?.name}</div>
                    </div>
                    <div className="h-8 w-px bg-gray-100" />
                    <div className="text-xs">
                        <div className="text-gray-400 uppercase font-black text-[9px] tracking-widest">Fleet #</div>
                        <div className="font-black text-amber-900">{row.routeId?.vehicleNo || 'Fleet X'}</div>
                    </div>
                </div>
            )
        },
        {
            key: "amount",
            label: "Cyclic Charge",
            render: (val: number) => (
                <div className="font-black text-amber-700 bg-amber-50/50 px-3 py-1.5 rounded-xl border border-amber-100 w-fit">
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
        r.routeId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <DashboardLayout title="Universal Audit: Transport Fee Registry">
            <div className="max-w-[1600px] mx-auto space-y-8 pb-10">

                {/* Header Context */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3 uppercase">
                            <div className="h-12 w-12 bg-gradient-to-br from-amber-500 to-amber-700 rounded-2xl flex items-center justify-center shadow-xl text-white">
                                <Bus size={24} />
                            </div>
                            Fleet Revenue Governance
                        </h1>
                        <p className="text-gray-500 mt-2 text-lg italic font-medium">Coordinate logistical liabilities and audit commuter collections across the institutional transport network</p>
                    </div>

                    <Button variant="outline" className="h-12 border-gray-200 shadow-sm gap-2 rounded-2xl bg-white px-6 font-black text-xs uppercase tracking-widest text-gray-600">
                        <Database size={18} /> Logistics Sync
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Assessment Panel */}
                    <div className="lg:col-span-4 transition-all duration-500">
                        <Card className="border-none shadow-2xl ring-1 ring-black/5 overflow-hidden sticky top-8 rounded-[2rem]">
                            <CardHeader className="bg-gradient-to-r from-amber-50/50 to-white border-b border-gray-100 p-8">
                                <CardTitle className="text-[10px] flex items-center gap-2 text-amber-900 uppercase tracking-[0.2em] font-black">
                                    <MapPin size={14} className="text-amber-600" /> Route Assessment
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-[100px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 text-[10px]">Commuter Ref <span className="text-rose-500">*</span></Label>
                                        <div className="relative group">
                                            <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-amber-600 transition-colors" />
                                            <Input
                                                placeholder="Search student ID..."
                                                value={formData.student}
                                                onChange={(e) => setFormData({ ...formData, student: e.target.value })}
                                                className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 pl-12 rounded-2xl focus:ring-amber-500 font-bold"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Route ID <span className="text-rose-500">*</span></Label>
                                            <Input
                                                placeholder="e.g. North Hub"
                                                value={formData.route}
                                                onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                                                className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 rounded-2xl focus:ring-amber-500 font-bold"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Fleet # <span className="text-rose-500">*</span></Label>
                                            <Input
                                                placeholder="Vehicle ID"
                                                value={formData.vehicle}
                                                onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                                                className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 rounded-2xl focus:ring-amber-500 font-bold"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Logistics Charge (₹) <span className="text-rose-500">*</span></Label>
                                        <div className="relative group">
                                            <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-600 h-4 w-4" />
                                            <Input
                                                type="number"
                                                placeholder="0.00"
                                                value={formData.charge}
                                                onChange={(e) => setFormData({ ...formData, charge: e.target.value })}
                                                className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 pl-11 rounded-2xl focus:ring-amber-500 font-black text-lg"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Current State <span className="text-rose-500">*</span></Label>
                                        <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
                                            <SelectTrigger className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 rounded-2xl focus:ring-amber-500 font-black">
                                                <SelectValue placeholder="Commitment State" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl shadow-2xl border-none p-2">
                                                <SelectItem value="Pending" className="rounded-xl font-bold py-2.5">Inflow Awaited</SelectItem>
                                                <SelectItem value="Paid" className="rounded-xl font-bold py-2.5">Capital Settled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-black text-white h-14 rounded-2xl shadow-xl shadow-amber-100 font-black text-xs uppercase tracking-[0.2em] gap-3 transition-all hover:scale-[1.02]"
                                    >
                                        {submitting ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                                        Commit Logistical Entry
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Registry Panel */}
                    <div className="lg:col-span-8">
                        <div className="mb-8 flex flex-col md:flex-row gap-6 items-center justify-between">
                            <div className="relative flex-1 max-w-md group">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-amber-600 transition-colors" />
                                <Input
                                    className="pl-14 h-16 bg-white border-none ring-1 ring-gray-100 shadow-xl rounded-[1.5rem] focus:ring-2 focus:ring-amber-500/20 text-lg font-medium"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Filter by commuter or route ID..."
                                />
                            </div>
                            <Button variant="outline" size="sm" onClick={fetchTransportFees} className="gap-2 border-gray-100 hover:bg-white shadow-lg h-16 px-10 rounded-[1.5rem] font-black uppercase tracking-widest text-xs bg-white text-gray-500 group">
                                <RefreshCcw size={18} className={`group-hover:rotate-180 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`} /> Sync Archive
                            </Button>
                        </div>

                        <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
                            <AdvancedTable
                                title="Validated Logistical Matrix"
                                columns={columns}
                                data={filteredRecords}
                                loading={loading}
                                pagination
                            />
                        </div>

                        {filteredRecords.length === 0 && !loading && (
                            <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
                                <div className="h-28 w-28 bg-amber-50 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner ring-8 ring-white">
                                    <Route size={48} className="text-amber-200" />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Registry Blank</h3>
                                <p className="text-gray-400 max-w-sm text-center mt-3 text-sm italic font-medium leading-relaxed">No logistical liability records identified in the institutional fleet archive.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
