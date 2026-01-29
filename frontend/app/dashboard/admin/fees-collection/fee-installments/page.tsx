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
    CalendarClock,
    PlusCircle,
    RefreshCcw,
    Database,
    Edit,
    Trash2,
    Calendar,
    DollarSign,
    Layers,
    Tag,
    Clock,
    CheckCircle2,
    Loader2
} from "lucide-react"
import { toast } from "sonner"
import { AdvancedTable } from "@/components/super-admin/advanced-table"

export default function FeeInstallments() {
    const [loading, setLoading] = useState(false)
    const [installments, setInstallments] = useState([
        { id: "1", name: "Q1 - Primary Cycle", amount: 2500, dueDate: "2025-04-05", status: "Active" },
        { id: "2", name: "Q2 - Summer Term", amount: 2500, dueDate: "2025-07-05", status: "Active" },
        { id: "3", name: "Q3 - Autumn Intake", amount: 2500, dueDate: "2025-10-05", status: "Inactive" },
    ])

    const [formData, setFormData] = useState({
        group: "",
        type: "",
        name: "",
        amount: "",
        dueDate: ""
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.group || !formData.type || !formData.name || !formData.amount || !formData.dueDate) {
            toast.error("All structural parameters are required")
            return
        }

        setLoading(true)
        setTimeout(() => {
            setInstallments([
                ...installments,
                {
                    id: Date.now().toString(),
                    name: formData.name,
                    amount: parseFloat(formData.amount),
                    dueDate: formData.dueDate,
                    status: "Active"
                }
            ])
            toast.success("Installment protocol recorded successfully")
            setFormData({ group: "", type: "", name: "", amount: "", dueDate: "" })
            setLoading(false)
        }, 800)
    }

    const columns = [
        {
            key: "name",
            label: "Installment Identity",
            render: (val: string) => (
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg">
                        <Clock size={16} />
                    </div>
                    <span className="font-bold text-gray-900 tracking-tight">{val}</span>
                </div>
            )
        },
        {
            key: "amount",
            label: "Unit Valuation",
            render: (val: number) => (
                <div className="font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-lg border border-amber-100 w-fit">
                    ₹{val.toLocaleString()}
                </div>
            )
        },
        {
            key: "dueDate",
            label: "Maturity Date",
            render: (val: string) => (
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                    <Calendar size={14} className="text-gray-300" /> {val}
                </div>
            )
        },
        {
            key: "status",
            label: "Protocol Status",
            render: (val: string) => {
                const colors: Record<string, string> = {
                    Active: "bg-emerald-100 text-emerald-700 border-emerald-200",
                    Inactive: "bg-gray-100 text-gray-700 border-gray-200"
                }
                return (
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-[0.1em] border ${colors[val]}`}>
                        {val}
                    </span>
                )
            }
        },
        {
            key: "actions",
            label: "Control",
            render: () => (
                <div className="flex justify-end gap-2 text-gray-300">
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-amber-600 hover:bg-amber-50 rounded-lg">
                        <Edit size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-rose-600 hover:bg-rose-50 rounded-lg">
                        <Trash2 size={14} />
                    </Button>
                </div>
            )
        }
    ]

    return (
        <DashboardLayout title="Universal Fee Schedules: Installments">
            <div className="max-w-[1600px] mx-auto space-y-8 pb-10">

                {/* Header Context */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2 uppercase">
                            <div className="h-10 w-10 bg-gradient-to-br from-amber-500 to-amber-700 rounded-xl flex items-center justify-center shadow-lg text-white">
                                <CalendarClock size={22} />
                            </div>
                            Scedule Architecture
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Fragment institutional liabilities into manageable temporal units</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Definition Panel */}
                    <div className="lg:col-span-4 transition-all duration-500">
                        <Card className="border-none shadow-2xl ring-1 ring-black/5 overflow-hidden sticky top-8">
                            <CardHeader className="bg-gradient-to-r from-amber-50 to-white border-b border-amber-100">
                                <CardTitle className="text-[10px] flex items-center gap-2 text-amber-900 uppercase tracking-[0.2em] font-black">
                                    <PlusCircle size={14} className="text-amber-600" /> Structure Entry
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-8">
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Fee Group <span className="text-rose-500">*</span></Label>
                                            <Select value={formData.group} onValueChange={(val) => setFormData({ ...formData, group: val })}>
                                                <SelectTrigger className="bg-gray-50/50 border-amber-100 h-11 focus:ring-amber-500 font-bold rounded-xl">
                                                    <SelectValue placeholder="Unified" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="junior">Junior Wings</SelectItem>
                                                    <SelectItem value="senior">Senior Hub</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Fee Type <span className="text-rose-500">*</span></Label>
                                            <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val })}>
                                                <SelectTrigger className="bg-gray-50/50 border-amber-100 h-11 focus:ring-amber-500 font-bold rounded-xl">
                                                    <SelectValue placeholder="Catalog" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="tuition">Tuition Fee</SelectItem>
                                                    <SelectItem value="transport">Transport</SelectItem>
                                                    <SelectItem value="hostel">Hostel Hub</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Installment Nomenclature <span className="text-rose-500">*</span></Label>
                                        <Input
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g. Phase I Distribution"
                                            className="bg-gray-50/50 border-amber-100 h-11 focus:ring-amber-500 rounded-xl"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Quantum Value (₹) <span className="text-rose-500">*</span></Label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500" />
                                            <Input
                                                value={formData.amount}
                                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                                placeholder="0.00"
                                                className="bg-gray-50/50 border-amber-100 h-11 pl-9 focus:ring-amber-500 rounded-xl font-black"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Maturity Deadline <span className="text-rose-500">*</span></Label>
                                        <Input
                                            type="date"
                                            value={formData.dueDate}
                                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                            className="bg-gray-50/50 border-amber-100 h-11 focus:ring-amber-500 rounded-xl"
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-amber-600 hover:bg-amber-700 h-12 shadow-xl shadow-amber-100 font-black text-xs uppercase tracking-widest rounded-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                                    >
                                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Database size={16} />}
                                        Commit Installment
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Schedule Panel */}
                    <div className="lg:col-span-8">
                        <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="flex gap-4">
                                <Card className="border-none shadow-md bg-white ring-1 ring-black/5 px-4 py-2 rounded-xl flex items-center gap-3">
                                    <div className="h-8 w-8 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
                                        <Layers size={14} />
                                    </div>
                                    <div>
                                        <div className="text-[8px] text-gray-400 font-black uppercase tracking-widest">Total Active</div>
                                        <div className="text-sm font-black text-gray-900">{installments.filter(i => i.status === "Active").length} Units</div>
                                    </div>
                                </Card>
                                <Card className="border-none shadow-md bg-white ring-1 ring-black/5 px-4 py-2 rounded-xl flex items-center gap-3">
                                    <div className="h-8 w-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                                        <CheckCircle2 size={14} />
                                    </div>
                                    <div>
                                        <div className="text-[8px] text-gray-400 font-black uppercase tracking-widest">Configuration Status</div>
                                        <div className="text-sm font-black text-emerald-600 uppercase">Synchronized</div>
                                    </div>
                                </Card>
                            </div>
                            <Button variant="outline" size="sm" className="gap-2 border-gray-200 hover:bg-white shadow-sm h-11 px-6 rounded-xl font-bold uppercase tracking-widest text-[10px]">
                                <RefreshCcw size={14} /> Sync Registry
                            </Button>
                        </div>

                        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                            <AdvancedTable
                                title="Validated Schedule Matrix"
                                columns={columns}
                                data={installments}
                                loading={false}
                                pagination
                            />
                        </div>

                        {installments.length === 0 && (
                            <div className="mt-10 flex flex-col items-center justify-center p-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl text-gray-300 italic">
                                Initialize schedule architecture to visualize installments
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
