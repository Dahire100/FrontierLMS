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
import {
    Edit,
    Printer,
    FileText,
    Download,
    List,
    Loader2,
    Search,
    Trash2,
    RefreshCcw,
    Database,
    CreditCard,
    MoreVertical,
    Calendar,
    Banknote
} from "lucide-react"
import { toast } from "sonner"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { apiFetch, API_ENDPOINTS } from "@/lib/api-config"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import { format } from "date-fns"

interface ChequeItem {
    _id: string
    student: string
    chequeNo: string
    bankName: string
    amount: number
    date: string
    status: string
}

export default function Cheques() {
    const [searchTerm, setSearchTerm] = useState("")
    const [cheques, setCheques] = useState<ChequeItem[]>([])
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const [formData, setFormData] = useState({
        student: "",
        chequeNo: "",
        bankName: "",
        amount: "",
        date: "",
        status: "Pending"
    })

    const fetchCheques = useCallback(async () => {
        setLoading(true)
        try {
            const res = await apiFetch(`${API_ENDPOINTS.FEES.BASE}/cheques`)
            if (res.ok) {
                const data = await res.json()
                setCheques(Array.isArray(data) ? data : data.data || [])
            } else {
                toast.error("Failed to fetch cheques")
            }
        } catch (error) {
            toast.error("Network error")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchCheques()
    }, [fetchCheques])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.student || !formData.chequeNo || !formData.bankName || !formData.amount || !formData.date || !formData.status) {
            toast.error("Please fill all required fields")
            return
        }

        setSubmitting(true)
        try {
            const res = await apiFetch(`${API_ENDPOINTS.FEES.BASE}/cheques`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    student: formData.student,
                    chequeNo: formData.chequeNo,
                    bankName: formData.bankName,
                    amount: parseFloat(formData.amount),
                    date: formData.date,
                    status: formData.status
                })
            })

            if (res.ok) {
                toast.success("Cheque record added successfully")
                setFormData({ student: "", chequeNo: "", bankName: "", amount: "", date: "", status: "Pending" })
                fetchCheques()
            } else {
                const err = await res.json()
                toast.error(err.message || "Failed to add cheque")
            }
        } catch (error) {
            toast.error("Failed to add cheque")
        } finally {
            setSubmitting(false)
        }
    }

    const columns = [
        {
            key: "student",
            label: "Issuing Stakeholder",
            render: (val: string) => (
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-sm">
                        {val?.[0]}
                    </div>
                    <span className="font-bold text-gray-900 tracking-tight">{val}</span>
                </div>
            )
        },
        {
            key: "chequeNo",
            label: "Instrument ID",
            render: (val: string) => (
                <div className="font-mono text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded border border-gray-200">
                    {val}
                </div>
            )
        },
        {
            key: "bankName",
            label: "Drawee Bank",
            render: (val: string) => (
                <div className="flex items-center gap-2 text-gray-600 font-medium italic overflow-hidden text-ellipsis whitespace-nowrap max-w-[150px]">
                    <Banknote size={12} className="text-gray-400" /> {val}
                </div>
            )
        },
        {
            key: "amount",
            label: "Valuation",
            render: (val: number) => (
                <div className="font-black text-indigo-600">
                    ₹{val.toLocaleString()}
                </div>
            )
        },
        {
            key: "date",
            label: "Dated On",
            render: (val: string) => (
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                    <Calendar size={12} /> {val ? format(new Date(val), 'dd MMM yyyy') : '-'}
                </div>
            )
        },
        {
            key: "status",
            label: "Protocol Status",
            render: (val: string) => {
                const colors: Record<string, string> = {
                    Cleared: "bg-emerald-100 text-emerald-700 border-emerald-200",
                    Bounced: "bg-rose-100 text-rose-700 border-rose-200",
                    Cancelled: "bg-gray-100 text-gray-700 border-gray-200",
                    Pending: "bg-amber-100 text-amber-700 border-amber-200"
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
            render: (_: any, cheque: any) => (
                <div className="flex justify-end">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full">
                                <MoreVertical className="h-4 w-4 text-gray-400" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem className="gap-2 cursor-pointer font-medium">
                                <Edit size={14} className="text-indigo-600" /> Modify Record
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 cursor-pointer text-rose-600 font-medium">
                                <Trash2 size={14} /> Purge Entry
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        }
    ]

    const filteredCheques = cheques.filter(c =>
        c.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.chequeNo.includes(searchTerm) ||
        c.bankName.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <DashboardLayout title="Institutional Instrument Registry">
            <div className="max-w-[1600px] mx-auto space-y-8 pb-10">

                {/* Header Context */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2 uppercase">
                            <div className="h-10 w-10 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg text-white">
                                <CreditCard size={22} />
                            </div>
                            Cheque Inventory Manager
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Holistic monitoring and governance of physical financial instruments</p>
                    </div>

                    <div className="flex gap-3">
                        <Button variant="outline" className="h-10 border-gray-200 shadow-sm gap-2 rounded-xl text-xs font-bold uppercase tracking-widest">
                            <Printer size={16} /> Audit Path
                        </Button>
                        <Button variant="outline" className="h-10 border-gray-200 shadow-sm gap-2 rounded-xl text-xs font-bold uppercase tracking-widest">
                            <Download size={16} /> Data Export
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Add Form */}
                    <div className="lg:col-span-4 transition-all duration-500">
                        <Card className="border-none shadow-2xl ring-1 ring-black/5 overflow-hidden sticky top-8">
                            <CardHeader className="bg-gradient-to-r from-indigo-50 to-white border-b border-indigo-100">
                                <CardTitle className="text-[10px] flex items-center gap-2 text-indigo-900 uppercase tracking-[0.2em] font-black">
                                    <Edit size={14} className="text-indigo-600" /> Register Instrument
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-8">
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Stakeholder Ref <span className="text-rose-500">*</span></Label>
                                        <Input
                                            placeholder="Student Name or ID"
                                            value={formData.student}
                                            onChange={(e) => setFormData({ ...formData, student: e.target.value })}
                                            className="bg-gray-50/50 border-indigo-100 h-11 focus:ring-indigo-500 font-bold"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Instrument # <span className="text-rose-500">*</span></Label>
                                            <Input
                                                placeholder="Cheque No"
                                                value={formData.chequeNo}
                                                onChange={(e) => setFormData({ ...formData, chequeNo: e.target.value })}
                                                className="bg-gray-50/50 border-indigo-100 h-11 focus:ring-indigo-500 font-mono"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Valuation <span className="text-rose-500">*</span></Label>
                                            <Input
                                                type="number"
                                                placeholder="₹ Amount"
                                                value={formData.amount}
                                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                                className="bg-gray-50/50 border-indigo-100 h-11 focus:ring-indigo-500 font-black"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Drawee Bank <span className="text-rose-500">*</span></Label>
                                        <Input
                                            placeholder="Institution Name"
                                            value={formData.bankName}
                                            onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                            className="bg-gray-50/50 border-indigo-100 h-11 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Effective Date <span className="text-rose-500">*</span></Label>
                                        <Input
                                            type="date"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            className="bg-gray-50/50 border-indigo-100 h-11 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Protocol Status <span className="text-rose-500">*</span></Label>
                                        <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
                                            <SelectTrigger className="bg-gray-50/50 border-indigo-100 h-11 focus:ring-indigo-500 rounded-xl">
                                                <SelectValue placeholder="Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Pending">Process Pending</SelectItem>
                                                <SelectItem value="Cleared">Cleared Status</SelectItem>
                                                <SelectItem value="Bounced">Instrument Bounced</SelectItem>
                                                <SelectItem value="Cancelled">Void / Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 shadow-xl shadow-indigo-100 font-black text-xs uppercase tracking-widest transition-all hover:scale-[1.02] flex items-center gap-2 rounded-xl"
                                    >
                                        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database size={16} />}
                                        Register Cheque
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* List Panel */}
                    <div className="lg:col-span-8">
                        <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="relative flex-1 max-w-md group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                                <Input
                                    className="pl-10 h-11 bg-white border-gray-200 shadow-sm focus:ring-2 focus:ring-indigo-100 rounded-xl"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Scout by stakeholder, bank, or instrument #..."
                                />
                            </div>
                            <Button variant="outline" size="sm" onClick={fetchCheques} className="gap-2 border-gray-200 hover:bg-white shadow-sm h-11 px-6 rounded-xl">
                                <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} /> Sync Registry
                            </Button>
                        </div>

                        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                            <AdvancedTable
                                title="Validated Instrument Registry"
                                columns={columns}
                                data={filteredCheques}
                                loading={loading}
                                pagination
                            />
                        </div>

                        {filteredCheques.length === 0 && !loading && (
                            <div className="mt-10 flex flex-col items-center justify-center p-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl">
                                <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center shadow-lg mb-4">
                                    <List size={32} className="text-gray-300" />
                                </div>
                                <h3 className="text-gray-900 font-black text-xs uppercase tracking-widest">Inventory Clean</h3>
                                <p className="text-gray-500 text-xs mt-1">No instruments detected matching your search protocol.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
