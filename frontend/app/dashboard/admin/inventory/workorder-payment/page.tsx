"use client"

import { useState, useEffect, useCallback } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Pencil,
    List,
    Download,
    FileText,
    Printer,
    Grid,
    Columns,
    CreditCard,
    Search,
    RefreshCcw,
    Calendar,
    DollarSign,
    ShieldCheck,
    Loader2,
    Database,
    Tag
} from "lucide-react"
import { toast } from "sonner"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import { API_URL } from "@/lib/api-config"

export default function WorkOrderPaymentPage() {
    const [workOrders, setWorkOrders] = useState<any[]>([])
    const [fetching, setFetching] = useState(true)
    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")

    const [paymentForm, setPaymentForm] = useState({
        workOrderId: "",
        amount: 0,
        paymentMode: "cash",
        date: new Date().toISOString().split('T')[0],
        description: ""
    })

    const fetchData = useCallback(async () => {
        try {
            setFetching(true)
            const token = localStorage.getItem("token")
            const headers = { "Authorization": `Bearer ${token}` }

            const res = await fetch(`${API_URL}/api/inventory/workorders`, { headers })
            const data = await res.json()

            if (Array.isArray(data)) setWorkOrders(data)

        } catch (error) {
            console.error(error)
            toast.error("Failed to sync disbursement archives")
        } finally {
            setFetching(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handlePayment = async () => {
        const order = workOrders.find(wo => wo._id === paymentForm.workOrderId)
        if (!order) return

        if (paymentForm.amount <= 0 || !paymentForm.workOrderId) {
            toast.error("Disbursement volume and target order are required")
            return
        }

        try {
            setLoading(true)
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/inventory/workorders/${paymentForm.workOrderId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    paidAmount: (order.paidAmount || 0) + Number(paymentForm.amount),
                    balanceAmount: Math.max(0, order.grandTotal - (order.paidAmount || 0) - Number(paymentForm.amount)),
                    paymentStatus: (order.paidAmount || 0) + Number(paymentForm.amount) >= order.grandTotal ? 'paid' : 'partial'
                })
            })

            if (!res.ok) throw new Error("Failed to commit disbursement")

            toast.success("Disbursement yield synchronized with procurement node")
            setPaymentForm({ workOrderId: "", amount: 0, paymentMode: "cash", date: new Date().toISOString().split('T')[0], description: "" })
            fetchData()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    const selectedOrder = workOrders.find(wo => wo._id === paymentForm.workOrderId)

    const columns = [
        {
            key: "workOrderNumber",
            label: "Order Ref",
            render: (val: string) => (
                <div className="font-black text-indigo-900 tracking-tighter uppercase">{val}</div>
            )
        },
        {
            key: "paidAmount",
            label: "Disbursed",
            render: (val: number) => (
                <div className="font-black text-emerald-600">₹{val?.toLocaleString()}</div>
            )
        },
        {
            key: "balanceAmount",
            label: "Deficit",
            render: (val: number) => (
                <div className="font-black text-rose-600 bg-rose-50 px-3 py-1 rounded-lg w-fit border border-rose-100 italic">
                    ₹{val?.toLocaleString()}
                </div>
            )
        },
        {
            key: "grandTotal",
            label: "Valuation",
            render: (val: number) => (
                <div className="font-black text-gray-500">₹{val?.toLocaleString()}</div>
            )
        },
        {
            key: "paymentStatus",
            label: "Fiscal State",
            render: (val: string) => (
                <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${val === 'paid' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-100 text-amber-700 border-amber-200'
                    }`}>
                    {val || 'pending'}
                </span>
            )
        }
    ]

    return (
        <DashboardLayout title="Fiscal Logistics: Procurement Disbursement">
            <div className="max-w-[1700px] mx-auto space-y-10 pb-20">

                {/* Header Context */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-4 uppercase">
                            <div className="h-12 w-12 bg-indigo-900 rounded-2xl flex items-center justify-center shadow-xl text-white transform hover:scale-110 transition-transform">
                                <CreditCard size={24} />
                            </div>
                            Procurement Disbursement Matrix
                        </h1>
                        <p className="text-gray-500 mt-2 text-lg italic font-medium">Synchronize internal disbursement flows with vendor work orders and institutional logistics</p>
                    </div>

                    <Button variant="outline" onClick={fetchData} className="h-12 border-gray-200 shadow-sm gap-2 rounded-2xl bg-white px-6 font-black text-xs uppercase tracking-widest text-gray-600 hover:bg-gray-50">
                        <RefreshCcw size={18} className={fetching ? 'animate-spin' : ''} /> Sync Fiscal Grid
                    </Button>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
                    {/* execution Center */}
                    <div className="xl:col-span-4">
                        <Card className="border-none shadow-2xl ring-1 ring-black/5 overflow-hidden sticky top-8 rounded-[2.5rem] bg-white">
                            <CardHeader className="bg-gradient-to-r from-indigo-50/50 to-white border-b border-gray-100 p-8">
                                <CardTitle className="text-[10px] flex items-center gap-3 text-indigo-900 uppercase tracking-[0.3em] font-black">
                                    <DollarSign size={18} className="text-indigo-600" /> Disbursement Entry
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 space-y-8">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Target Work Order <span className="text-rose-500 font-black">*</span></Label>
                                    <Select value={paymentForm.workOrderId} onValueChange={(v) => setPaymentForm({ ...paymentForm, workOrderId: v })}>
                                        <SelectTrigger className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 rounded-2xl focus:ring-indigo-500 font-black">
                                            <SelectValue placeholder="Identify Active Order" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                                            {workOrders.map((wo: any) => (
                                                <SelectItem key={wo._id} value={wo._id} className="rounded-xl font-bold py-2.5 uppercase">{wo.workOrderNumber} ({wo.title})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {selectedOrder && (
                                    <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100 flex justify-between items-center group overflow-hidden relative">
                                        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-125 transition-transform duration-700">
                                            <Tag size={80} />
                                        </div>
                                        <div className="relative z-10">
                                            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest leading-none">Institutional Deficit</p>
                                            <p className="text-3xl font-black text-indigo-900 tracking-tighter mt-1">₹ {selectedOrder.balanceAmount?.toLocaleString()}</p>
                                        </div>
                                        <div className="text-right relative z-10">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Total Value</p>
                                            <p className="text-lg font-bold text-gray-600 mt-1">₹ {selectedOrder.grandTotal?.toLocaleString()}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Disbursement Volume <span className="text-rose-500 font-black">*</span></Label>
                                        <Input
                                            type="number"
                                            value={paymentForm.amount}
                                            onChange={(e) => setPaymentForm({ ...paymentForm, amount: parseInt(e.target.value) || 0 })}
                                            className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-16 px-6 rounded-2xl focus:ring-indigo-500 font-black text-xl"
                                            placeholder="₹ 0.00"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Protocol</Label>
                                            <Select value={paymentForm.paymentMode} onValueChange={(v) => setPaymentForm({ ...paymentForm, paymentMode: v })}>
                                                <SelectTrigger className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 rounded-2xl focus:ring-indigo-500 font-bold">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl border-none shadow-2xl p-2 text-xs">
                                                    <SelectItem value="cash" className="rounded-xl font-bold py-2.5">CASH_FLOW</SelectItem>
                                                    <SelectItem value="cheque" className="rounded-xl font-bold py-2.5">CHEQUE_VEC</SelectItem>
                                                    <SelectItem value="online" className="rounded-xl font-bold py-2.5">ONLINE_DIG</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Date</Label>
                                            <Input value={paymentForm.date} onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })} type="date" className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 px-5 rounded-2xl focus:ring-indigo-500 font-black" />
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    onClick={handlePayment}
                                    disabled={loading}
                                    className="w-full bg-indigo-900 hover:bg-black text-white h-16 rounded-[1.5rem] shadow-2xl shadow-indigo-100 font-black text-xs uppercase tracking-[0.3em] gap-3 transition-all hover:scale-[1.02] active:scale-95"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
                                    Authorize Disbursement
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Matrix Panel */}
                    <div className="xl:col-span-8 space-y-8">
                        <div className="relative max-w-md group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-indigo-600 transition-colors" />
                            <Input
                                className="pl-16 h-16 bg-white border-none ring-1 ring-black/5 shadow-2xl rounded-[1.5rem] focus:ring-2 focus:ring-indigo-500/20 text-lg font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Query disbursement archives..."
                            />
                        </div>

                        <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
                            <AdvancedTable
                                title="Validated Disbursement Matrix"
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
