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
import {
    List,
    Download,
    FileText,
    Printer,
    Grid,
    Columns,
    Plus,
    ShoppingCart,
    RefreshCcw,
    Search,
    Calendar,
    BadgeCheck,
    Clock,
    Loader2,
    Database,
    Tag
} from "lucide-react"
import { toast } from "sonner"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import { API_URL } from "@/lib/api-config"

export default function WorkOrderPage() {
    const [workOrders, setWorkOrders] = useState<any[]>([])
    const [vendors, setVendors] = useState<any[]>([])

    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    const [form, setForm] = useState({
        workOrderNumber: "",
        title: "",
        vendor: "",
        workType: "supply",
        grandTotal: 0,
        subtotal: 0
    })

    const fetchData = useCallback(async () => {
        try {
            setFetching(true)
            const token = localStorage.getItem("token")
            const headers = { "Authorization": `Bearer ${token}` }

            const [woRes, venRes] = await Promise.all([
                fetch(`${API_URL}/api/inventory/workorders`, { headers }),
                fetch(`${API_URL}/api/inventory/suppliers`, { headers })
            ])

            const woData = await woRes.json()
            const venData = await venRes.json()

            if (Array.isArray(woData)) setWorkOrders(woData)
            if (Array.isArray(venData)) setVendors(venData)

        } catch (error) {
            console.error(error)
            toast.error("Failed to sync procurement matrix")
        } finally {
            setFetching(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleSubmit = async () => {
        if (!form.workOrderNumber || !form.vendor || !form.title) {
            toast.error("Order UID, title and target vendor are required")
            return
        }

        try {
            setLoading(true)
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/inventory/workorders`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...form,
                    grandTotal: Number(form.grandTotal),
                    subtotal: Number(form.grandTotal),
                    balanceAmount: Number(form.grandTotal)
                })
            })

            if (!res.ok) throw new Error("Failed to commit work order")

            toast.success("Institutional work order synchronized")
            setForm({ workOrderNumber: "", title: "", vendor: "", workType: "supply", grandTotal: 0, subtotal: 0 })
            fetchData()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    const columns = [
        {
            key: "workOrderNumber",
            label: "Ref ID",
            render: (val: string) => (
                <div className="font-black text-indigo-900 tracking-tighter uppercase">{val}</div>
            )
        },
        {
            key: "title",
            label: "Order Logistics",
            render: (val: string, row: any) => (
                <div>
                    <span className="font-black text-gray-900 tracking-tight uppercase leading-none">{val}</span>
                    <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">Type: {row.workType}</div>
                </div>
            )
        },
        {
            key: "vendor",
            label: "Stakeholder",
            render: (val: any) => (
                <span className="text-xs font-bold text-gray-600 uppercase italic">
                    {val?.supplierName || 'Unknown Vendor'}
                </span>
            )
        },
        {
            key: "grandTotal",
            label: "Valuation",
            render: (val: number) => (
                <div className="font-black text-indigo-600">₹{val?.toLocaleString()}</div>
            )
        },
        {
            key: "status",
            label: "State",
            render: (val: string) => (
                <div className={`flex items-center gap-1.5 font-black text-[9px] uppercase tracking-widest py-1 px-3 rounded-full border transition-all ${val === 'completed' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-100 text-amber-700 border-amber-200'
                    }`}>
                    {val === 'completed' ? <BadgeCheck size={12} /> : <Clock size={12} />}
                    {val || 'PENDING'}
                </div>
            )
        }
    ]

    return (
        <DashboardLayout title="Procurement Strategy: Work Orders">
            <div className="max-w-[1700px] mx-auto space-y-10 pb-20">

                {/* Header Context */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-4 uppercase">
                            <div className="h-12 w-12 bg-indigo-900 rounded-2xl flex items-center justify-center shadow-xl text-white transform hover:rotate-12 transition-transform">
                                <Tag size={24} />
                            </div>
                            Institutional Procurement Protocol
                        </h1>
                        <p className="text-gray-500 mt-2 text-lg italic font-medium">Orchestrate supply chain work orders and synchronize vendor engagement with the institutional grid</p>
                    </div>

                    <Button variant="outline" onClick={fetchData} className="h-12 border-gray-200 shadow-sm gap-2 rounded-2xl bg-white px-6 font-black text-xs uppercase tracking-widest text-gray-600 hover:bg-gray-50">
                        <RefreshCcw size={18} className={fetching ? 'animate-spin' : ''} /> Sync Ledger
                    </Button>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
                    {/* Execution Center */}
                    <div className="xl:col-span-4">
                        <Card className="border-none shadow-2xl ring-1 ring-black/5 overflow-hidden sticky top-8 rounded-[2.5rem] bg-white">
                            <CardHeader className="bg-gradient-to-r from-indigo-50/50 to-white border-b border-gray-100 p-8">
                                <CardTitle className="text-[10px] flex items-center gap-3 text-indigo-900 uppercase tracking-[0.3em] font-black">
                                    <Plus size={18} className="text-indigo-600" /> Dispatch Initialization
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Order UID <span className="text-rose-500">*</span></Label>
                                        <Input
                                            value={form.workOrderNumber}
                                            onChange={(e) => setForm({ ...form, workOrderNumber: e.target.value })}
                                            placeholder="Unique Identifier"
                                            className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 px-5 rounded-2xl focus:ring-indigo-500 font-black text-indigo-900"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Order Logistical Title <span className="text-rose-500">*</span></Label>
                                        <Input
                                            value={form.title}
                                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                                            placeholder="Purpose of Order"
                                            className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 px-5 rounded-2xl focus:ring-indigo-500 font-bold"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Target Stakeholder <span className="text-rose-500">*</span></Label>
                                        <Select value={form.vendor} onValueChange={(v) => setForm({ ...form, vendor: v })}>
                                            <SelectTrigger className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 rounded-2xl focus:ring-indigo-500 font-black">
                                                <SelectValue placeholder="Identify Vendor" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                                                {vendors.map((v: any) => (
                                                    <SelectItem key={v._id} value={v._id} className="rounded-xl font-bold py-2.5">{v.supplierName}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Valuation Allocation (₹) <span className="text-rose-500">*</span></Label>
                                        <Input
                                            type="number"
                                            value={form.grandTotal}
                                            onChange={(e) => setForm({ ...form, grandTotal: parseInt(e.target.value) || 0 })}
                                            className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 px-5 rounded-2xl focus:ring-indigo-500 font-black text-lg"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>

                                <Button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="w-full bg-indigo-900 hover:bg-black text-white h-16 rounded-[1.5rem] shadow-2xl shadow-indigo-100 font-black text-xs uppercase tracking-[0.3em] gap-3 transition-all hover:scale-[1.02] active:scale-95"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Database size={20} />}
                                    Commit Dispatch
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Registry Panel */}
                    <div className="xl:col-span-8 space-y-8">
                        <div className="relative max-w-md group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-indigo-600 transition-colors" />
                            <Input
                                className="pl-16 h-16 bg-white border-none ring-1 ring-black/5 shadow-2xl rounded-[1.5rem] focus:ring-2 focus:ring-indigo-500/20 text-lg font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Query procurement archives..."
                            />
                        </div>

                        <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
                            <AdvancedTable
                                title="Validated Procurement Matrix"
                                columns={columns}
                                data={workOrders}
                                loading={fetching}
                                pagination
                            />
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
