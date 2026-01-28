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
import { AlertTriangle, Loader2, Search, Trash2, Edit, RefreshCcw, Database, AlertCircle, FileX } from "lucide-react"
import { toast } from "sonner"
import { apiFetch, API_ENDPOINTS } from "@/lib/api-config"
import { AdvancedTable } from "@/components/super-admin/advanced-table"

interface ChequeBounceItem {
    _id: string
    studentId: {
        _id: string
        firstName: string
        lastName: string
        studentId: string
    }
    chequeNo: string
    penalty: number
    status: string
}

export default function ChequeBounceManagement() {
    const [records, setRecords] = useState<ChequeBounceItem[]>([])
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")

    const [formData, setFormData] = useState({
        student: "",
        chequeNo: "",
        penalty: "",
        status: "Unrecovered"
    })

    const fetchBounceCases = useCallback(async () => {
        setLoading(true)
        try {
            const res = await apiFetch(`${API_ENDPOINTS.FEES.BASE}/cheque-bounce`)
            if (res.ok) {
                const data = await res.json()
                setRecords(Array.isArray(data) ? data : data.data || [])
            } else {
                toast.error("Failed to fetch bounce cases")
            }
        } catch (error) {
            toast.error("Network error")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchBounceCases()
    }, [fetchBounceCases])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.student || !formData.chequeNo || !formData.status) {
            toast.error("Student, cheque no and status are required")
            return
        }

        setSubmitting(true)
        try {
            const res = await apiFetch(`${API_ENDPOINTS.FEES.BASE}/cheque-bounce`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    studentId: formData.student,
                    chequeNo: formData.chequeNo,
                    penalty: parseFloat(formData.penalty || "0"),
                    status: formData.status
                })
            })

            if (res.ok) {
                toast.success("Bounce case recorded successfully")
                setFormData({ student: "", chequeNo: "", penalty: "", status: "Unrecovered" })
                fetchBounceCases()
            } else {
                const err = await res.json()
                toast.error(err.message || "Failed to record bounce case")
            }
        } catch (error) {
            toast.error("Failed to record bounce case")
        } finally {
            setSubmitting(false)
        }
    }

    const columns = [
        {
            key: "studentId",
            label: "Student Profile",
            render: (val: any) => (
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white font-bold shadow-sm">
                        {val?.firstName?.[0]}{val?.lastName?.[0]}
                    </div>
                    <div>
                        <div className="font-bold text-gray-900">{val?.firstName} {val?.lastName}</div>
                        <div className="text-[10px] text-rose-500 font-mono tracking-tighter uppercase">UID: {val?.studentId}</div>
                    </div>
                </div>
            )
        },
        {
            key: "chequeNo",
            label: "Instrument #",
            render: (val: string) => (
                <div className="font-mono text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-100 w-fit">
                    {val}
                </div>
            )
        },
        {
            key: "penalty",
            label: "Penalty Applied",
            render: (val: number) => (
                <div className="font-black text-rose-600">
                    ₹{(val || 0).toLocaleString()}
                </div>
            )
        },
        {
            key: "status",
            label: "Collection Status",
            render: (val: string) => {
                const styles: Record<string, string> = {
                    Recovered: "bg-emerald-100 text-emerald-700 border-emerald-200",
                    Waived: "bg-gray-100 text-gray-700 border-gray-200",
                    Unrecovered: "bg-amber-100 text-amber-700 border-amber-200"
                }
                return (
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[val] || "bg-gray-100 text-gray-700 border-gray-200"}`}>
                        {val}
                    </span>
                )
            }
        },
        {
            key: "actions",
            label: "Control",
            render: (_: any, row: any) => (
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-indigo-600">
                        <Edit size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-rose-600">
                        <Trash2 size={14} />
                    </Button>
                </div>
            )
        }
    ]

    const filteredRecords = records.filter(rec =>
        rec.chequeNo.includes(searchTerm) ||
        `${rec.studentId?.firstName} ${rec.studentId?.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <DashboardLayout title="Operational Risk: Cheque Bounce">
            <div className="max-w-[1600px] mx-auto space-y-8 pb-10">

                {/* Header Context */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2 uppercase">
                            <div className="h-10 w-10 bg-gradient-to-br from-rose-600 to-red-700 rounded-xl flex items-center justify-center shadow-lg text-white">
                                <FileX size={22} />
                            </div>
                            Bounce Compliance Matrix
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Audit and record dishonored financial instruments and associated penalties</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Record Panel */}
                    <div className="lg:col-span-4 transition-all duration-500">
                        <Card className="border-none shadow-2xl ring-1 ring-black/5 overflow-hidden sticky top-8">
                            <CardHeader className="bg-gradient-to-r from-rose-50 to-white border-b border-rose-100">
                                <CardTitle className="text-[10px] flex items-center gap-2 text-rose-800 uppercase tracking-[0.2em] font-black">
                                    <AlertTriangle size={14} className="text-rose-600" /> Compliance Logging
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-8">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Student UID / Ref <span className="text-rose-500">*</span></Label>
                                        <Input
                                            value={formData.student}
                                            onChange={(e) => setFormData({ ...formData, student: e.target.value })}
                                            placeholder="Enter Student ID"
                                            className="bg-gray-50/50 border-rose-100 h-11 focus:ring-rose-500"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Instrument Number <span className="text-rose-500">*</span></Label>
                                        <Input
                                            value={formData.chequeNo}
                                            onChange={(e) => setFormData({ ...formData, chequeNo: e.target.value })}
                                            placeholder="6-digit Cheque No"
                                            className="bg-gray-50/50 border-rose-100 h-11 focus:ring-rose-500 font-mono"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Penalty Valuation (₹)</Label>
                                        <Input
                                            type="number"
                                            value={formData.penalty}
                                            onChange={(e) => setFormData({ ...formData, penalty: e.target.value })}
                                            placeholder="Default: 0.00"
                                            className="bg-gray-50/50 border-rose-100 h-11 focus:ring-rose-500 font-bold"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Resolution Status <span className="text-rose-500">*</span></Label>
                                        <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
                                            <SelectTrigger className="bg-gray-50/50 border-rose-100 h-11 focus:ring-rose-500">
                                                <SelectValue placeholder="Select current status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Unrecovered">Unrecovered</SelectItem>
                                                <SelectItem value="Recovered">Recovered</SelectItem>
                                                <SelectItem value="Waived">Waived</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full bg-rose-600 hover:bg-rose-700 h-12 shadow-xl shadow-rose-100 font-black text-xs uppercase tracking-widest transition-all hover:scale-[1.02] flex items-center gap-2"
                                    >
                                        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database size={16} />}
                                        Commit Case
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Audit Panel */}
                    <div className="lg:col-span-8">
                        <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="relative flex-1 max-w-md group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-rose-500 transition-colors" />
                                <Input
                                    className="pl-10 h-11 bg-white border-gray-200 shadow-sm focus:ring-2 focus:ring-rose-100 rounded-xl"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Scout by cheque # or student..."
                                />
                            </div>
                            <Button variant="outline" size="sm" onClick={fetchBounceCases} className="gap-2 border-gray-200 hover:bg-white shadow-sm h-11 px-6 rounded-xl">
                                <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} /> Sync Audit
                            </Button>
                        </div>

                        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                            <AdvancedTable
                                title="Validated Bounce Registry"
                                columns={columns}
                                data={filteredRecords}
                                loading={loading}
                                pagination
                            />
                        </div>

                        {!loading && filteredRecords.length === 0 && (
                            <div className="mt-10 flex flex-col items-center justify-center p-12 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl">
                                <AlertCircle size={48} className="text-gray-300 mb-4" />
                                <h3 className="text-gray-900 font-bold">Registry Clean</h3>
                                <p className="text-gray-500 text-sm">No dishonored instruments matched your current filters.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
