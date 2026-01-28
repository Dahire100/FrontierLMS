"use client"

import { useEffect, useState, useCallback } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { History, Loader2, RefreshCcw, Database, User, DollarSign, FileText, Search, TrendingUp, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { apiFetch, API_ENDPOINTS } from "@/lib/api-config"
import { AdvancedTable } from "@/components/super-admin/advanced-table"

interface PreviousBalanceItem {
    _id: string
    student: string
    amount: number
    note?: string
    received?: number
    carried?: number
}

export default function PreviousYearBalance() {
    const [balances, setBalances] = useState<PreviousBalanceItem[]>([])
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")

    const [formData, setFormData] = useState({
        student: "",
        amount: "",
        note: ""
    })

    const fetchBalances = useCallback(async () => {
        setLoading(true)
        try {
            const res = await apiFetch(`${API_ENDPOINTS.FEES.BASE}/previous-year-balance`)
            if (res.ok) {
                const data = await res.json()
                setBalances(Array.isArray(data) ? data : data.data || [])
            } else {
                toast.error("Failed to sync historical ledger")
            }
        } catch (error) {
            toast.error("Network synchronization failure")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchBalances()
    }, [fetchBalances])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.student || !formData.amount) {
            toast.error("Stakeholder ref and valuation are required")
            return
        }

        setSubmitting(true)
        try {
            const res = await apiFetch(`${API_ENDPOINTS.FEES.BASE}/previous-year-balance`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    student: formData.student,
                    amount: parseFloat(formData.amount),
                    note: formData.note
                })
            })

            if (res.ok) {
                toast.success("Legacy balance migration successful")
                setFormData({ student: "", amount: "", note: "" })
                fetchBalances()
            } else {
                const err = await res.json()
                toast.error(err.message || "Migration protocol failure")
            }
        } catch (error) {
            toast.error("Migration protocol failure")
        } finally {
            setSubmitting(false)
        }
    }

    const columns = [
        {
            key: "student",
            label: "Stakeholder Reference",
            render: (val: string) => (
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 shadow-sm border border-slate-200">
                        <User size={16} />
                    </div>
                    <div>
                        <span className="font-black text-gray-900 tracking-tight uppercase">{val}</span>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-1">Institutional Profile</div>
                    </div>
                </div>
            )
        },
        {
            key: "amount",
            label: "Opening Balance (FY)",
            render: (val: number) => (
                <div className="font-black text-slate-400 italic">
                    ₹{val?.toLocaleString()}
                </div>
            )
        },
        {
            key: "received",
            label: "Settled Capital",
            render: (val: number) => (
                <div className="font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100 w-fit">
                    ₹{(val || 0).toLocaleString()}
                </div>
            )
        },
        {
            key: "carried",
            label: "Net Migration",
            render: (val: number, row: any) => (
                <div className="font-black text-orange-600 bg-orange-50 px-3 py-1 rounded-lg border border-orange-100 w-fit shadow-sm">
                    ₹{(val || row.amount).toLocaleString()}
                </div>
            )
        },
        {
            key: "note",
            label: "Audit Narrative",
            render: (val: string) => (
                <div className="text-[11px] text-gray-400 italic max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
                    {val || 'No extended metadata'}
                </div>
            )
        }
    ]

    const filteredBalances = balances.filter(b => b.student.toLowerCase().includes(searchTerm.toLowerCase()))

    return (
        <DashboardLayout title="Financial Migration: Previous Year Balance">
            <div className="max-w-[1600px] mx-auto space-y-8 pb-10">

                {/* Header Context */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                            <div className="h-12 w-12 bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl flex items-center justify-center shadow-xl text-white">
                                <History size={24} />
                            </div>
                            Legacy Ledger Migration
                        </h1>
                        <p className="text-gray-500 mt-2 text-lg italic font-medium">Synchronize and audit carried-forward financial debt from previous academic cycles</p>
                    </div>

                    <div className="flex gap-3">
                        <Button variant="outline" className="h-12 border-gray-200 shadow-sm gap-2 rounded-2xl bg-white px-6 font-black text-xs uppercase tracking-widest text-gray-600 transition-all hover:bg-gray-50">
                            <TrendingUp size={18} /> Audit Strategy
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Migration Panel */}
                    <div className="lg:col-span-4 transition-all duration-500">
                        <Card className="border-none shadow-2xl ring-1 ring-black/5 overflow-hidden sticky top-8 rounded-[2rem]">
                            <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b border-gray-100 p-8">
                                <CardTitle className="text-[10px] flex items-center gap-2 text-slate-800 uppercase tracking-[0.2em] font-black">
                                    <Database size={14} className="text-slate-600" /> Structure Entry
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Stakeholder Ref <span className="text-rose-500">*</span></Label>
                                        <div className="relative group">
                                            <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-slate-600 transition-colors" />
                                            <Input
                                                placeholder="Student ID or Name"
                                                value={formData.student}
                                                onChange={(e) => setFormData({ ...formData, student: e.target.value })}
                                                className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 pl-12 rounded-2xl focus:ring-slate-500 font-bold"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Carried Balance (₹) <span className="text-rose-500">*</span></Label>
                                        <div className="relative group">
                                            <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-slate-600 transition-colors" />
                                            <Input
                                                type="number"
                                                placeholder="0.00"
                                                value={formData.amount}
                                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                                className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 pl-12 rounded-2xl focus:ring-slate-500 font-black text-lg"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Audit Note</Label>
                                        <Input
                                            placeholder="Migration context..."
                                            value={formData.note}
                                            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                            className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 rounded-2xl focus:ring-slate-500 font-medium"
                                        />
                                    </div>
                                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3 text-amber-700">
                                        <AlertCircle size={18} className="shrink-0 mt-0.5" />
                                        <div className="text-[10px] font-bold leading-relaxed uppercase">Manual migration will override existing legacy records for the selected stakeholder.</div>
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full bg-slate-800 hover:bg-black text-white h-14 rounded-2xl shadow-xl shadow-slate-100 font-black text-xs uppercase tracking-[0.2em] gap-3 transition-all hover:scale-[1.02]"
                                    >
                                        {submitting ? <Loader2 className="animate-spin" size={18} /> : <Database size={18} />}
                                        Commit Legacy Migration
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Registry Panel */}
                    <div className="lg:col-span-8">
                        <div className="mb-8 flex flex-col md:flex-row gap-6 items-center justify-between">
                            <div className="relative flex-1 max-w-md group">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-slate-600 transition-colors" />
                                <Input
                                    className="pl-14 h-16 bg-white border-none ring-1 ring-gray-100 shadow-xl rounded-[1.5rem] focus:ring-2 focus:ring-slate-500/20 text-lg font-medium"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Filter by legacy reference..."
                                />
                            </div>
                            <Button variant="outline" size="sm" onClick={fetchBalances} className="gap-2 border-gray-100 hover:bg-white shadow-lg h-16 px-10 rounded-[1.5rem] font-black uppercase tracking-widest text-xs bg-white text-gray-500 group">
                                <RefreshCcw size={18} className={`group-hover:rotate-180 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`} /> Sync Archive
                            </Button>
                        </div>

                        <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
                            <AdvancedTable
                                title="Validated Historical Matrix"
                                columns={columns}
                                data={filteredBalances}
                                loading={loading}
                                pagination
                            />
                        </div>

                        {filteredBalances.length === 0 && !loading && (
                            <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
                                <div className="h-28 w-28 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-inner ring-8 ring-white">
                                    <FileText size={48} className="text-slate-200" />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Archive Clear</h3>
                                <p className="text-gray-400 max-w-sm text-center mt-3 text-sm italic font-medium leading-relaxed">No historical balance records identified in the institutional archive.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
