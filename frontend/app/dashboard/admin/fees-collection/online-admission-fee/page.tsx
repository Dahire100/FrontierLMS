"use client"

import { useEffect, useState, useCallback } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Edit,
    Printer,
    FileText,
    Download,
    List,
    Loader2,
    RefreshCcw,
    Database,
    Globe,
    MoreVertical,
    Trash2,
    Search,
    BookOpen,
    Layers
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

interface AdmissionFeeItem {
    _id: string
    className: string
    amount: number
}

export default function AdmissionFee() {
    const [searchTerm, setSearchTerm] = useState("")
    const [fees, setFees] = useState<AdmissionFeeItem[]>([])
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const [formData, setFormData] = useState({
        className: "",
        amount: ""
    })

    const fetchFees = useCallback(async () => {
        setLoading(true)
        try {
            const res = await apiFetch(`${API_ENDPOINTS.FEES.BASE}/online-admission-fee`)
            if (res.ok) {
                const data = await res.json()
                setFees(Array.isArray(data) ? data : data.data || [])
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
        fetchFees()
    }, [fetchFees])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.className || !formData.amount) {
            toast.error("Please fill all required mechanical parameters")
            return
        }

        setSubmitting(true)
        try {
            const res = await apiFetch(`${API_ENDPOINTS.FEES.BASE}/online-admission-fee`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    className: formData.className,
                    amount: parseFloat(formData.amount)
                })
            })

            if (res.ok) {
                toast.success("Structural entry committed successfully")
                setFormData({ className: "", amount: "" })
                fetchFees()
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
            key: "className",
            label: "Academic Hierarchy",
            render: (val: string) => (
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
                        <Layers size={16} />
                    </div>
                    <span className="font-black text-gray-900 tracking-tight uppercase">Grade {val}</span>
                </div>
            )
        },
        {
            key: "amount",
            label: "Registration Valuation",
            render: (val: number) => (
                <div className="font-black text-indigo-700 bg-indigo-50/50 px-4 py-1.5 rounded-xl border border-indigo-100 w-fit">
                    ₹{val?.toLocaleString()}
                </div>
            )
        },
        {
            key: "actions",
            label: "Control",
            render: (_: any, fee: any) => (
                <div className="flex justify-end">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full">
                                <MoreVertical className="h-4 w-4 text-gray-400" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-2xl border-none ring-1 ring-black/5 p-2">
                            <DropdownMenuItem className="gap-2 cursor-pointer font-bold rounded-lg py-2">
                                <Edit size={14} className="text-indigo-600" /> Modify Struct
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 cursor-pointer text-rose-600 font-bold rounded-lg py-2">
                                <Trash2 size={14} /> Purge Record
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        }
    ]

    const filteredFees = fees.filter(fee => fee.className.toLowerCase().includes(searchTerm.toLowerCase()))

    return (
        <DashboardLayout title="Portal Oversight: Online Admission Fees">
            <div className="max-w-[1600px] mx-auto space-y-8 pb-10">

                {/* Header Context */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                            <div className="h-12 w-12 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl flex items-center justify-center shadow-xl text-white">
                                <Globe size={24} />
                            </div>
                            Admission Portal Governance
                        </h1>
                        <p className="text-gray-500 mt-2 text-lg italic font-medium">Configure and audit entry valuation tokens for digital applicant on-boarding</p>
                    </div>

                    <div className="flex gap-3">
                        <Button variant="outline" className="h-12 border-gray-200 shadow-sm gap-2 rounded-2xl bg-white px-6 font-black text-xs uppercase tracking-widest text-gray-600 transition-all hover:bg-gray-50">
                            <Download size={18} /> Master Export
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Definition Panel */}
                    <div className="lg:col-span-4 transition-all duration-500">
                        <Card className="border-none shadow-2xl ring-1 ring-black/5 overflow-hidden sticky top-8 rounded-[2rem]">
                            <CardHeader className="bg-gradient-to-r from-indigo-50/50 to-white border-b border-gray-100 p-8">
                                <CardTitle className="text-[10px] flex items-center gap-2 text-indigo-900 uppercase tracking-[0.2em] font-black">
                                    <Edit size={14} className="text-indigo-600" /> Structure Definition
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Target Grade <span className="text-rose-500">*</span></Label>
                                        <Input
                                            placeholder="e.g. Nursery, 1, 10..."
                                            value={formData.className}
                                            onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                                            className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 rounded-2xl focus:ring-indigo-500 font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Valuation Token (₹) <span className="text-rose-500">*</span></Label>
                                        <Input
                                            type="number"
                                            placeholder="0.00"
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                            className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 rounded-2xl focus:ring-indigo-500 font-black"
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-black text-white h-14 rounded-2xl shadow-xl shadow-indigo-100 font-black text-xs uppercase tracking-[0.2em] gap-3 transition-all hover:scale-[1.02]"
                                    >
                                        {submitting ? <Loader2 className="animate-spin" size={18} /> : <Database size={18} />}
                                        Commit Structural Entry
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
                                    placeholder="Filter by grade hierarchy..."
                                />
                            </div>
                            <Button variant="outline" size="sm" onClick={fetchFees} className="gap-2 border-gray-100 hover:bg-white shadow-lg h-16 px-10 rounded-[1.5rem] font-black uppercase tracking-widest text-xs bg-white text-gray-500 group">
                                <RefreshCcw size={18} className={`group-hover:rotate-180 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`} /> Sync Registry
                            </Button>
                        </div>

                        <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
                            <AdvancedTable
                                title="Validated Admission Matrix"
                                columns={columns}
                                data={filteredFees}
                                loading={loading}
                                pagination
                            />
                        </div>

                        {filteredFees.length === 0 && !loading && (
                            <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
                                <div className="h-28 w-28 bg-indigo-50 rounded-full flex items-center justify-center mb-6 shadow-inner ring-8 ring-white">
                                    <List size={48} className="text-indigo-200" />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Registry Blank</h3>
                                <p className="text-gray-400 max-w-sm text-center mt-3 text-sm italic font-medium leading-relaxed">No structural entries identified in the institutional archive.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
