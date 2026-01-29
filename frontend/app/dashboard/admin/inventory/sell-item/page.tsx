"use client"

import { useState, useEffect, useCallback } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Search,
    List,
    Download,
    FileText,
    Printer,
    Grid,
    Columns,
    DollarSign,
    RefreshCcw,
    Package,
    User,
    AlertCircle,
    Loader2
} from "lucide-react"
import { toast } from "sonner"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import { API_URL } from "@/lib/api-config"

export default function SellItemPage() {
    const [sales, setSales] = useState<any[]>([])
    const [items, setItems] = useState<any[]>([])
    const [stores, setStores] = useState<any[]>([])

    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    const [form, setForm] = useState({
        items: [{ item: "", quantity: 1, unitPrice: 0, totalPrice: 0 }],
        customerType: "external",
        customerName: "",
        store: "",
        saleDate: new Date().toISOString().split('T')[0],
        paymentMethod: "cash",
        paidAmount: 0
    })

    const fetchData = useCallback(async () => {
        try {
            setFetching(true)
            const token = localStorage.getItem("token")
            const headers = { "Authorization": `Bearer ${token}` }

            const [salesRes, itemsRes, storesRes] = await Promise.all([
                fetch(`${API_URL}/api/inventory/sales`, { headers }),
                fetch(`${API_URL}/api/inventory`, { headers }),
                fetch(`${API_URL}/api/inventory/stores`, { headers })
            ])

            const salesData = await salesRes.json()
            const itemsData = await itemsRes.json()
            const storesData = await storesRes.json()

            if (Array.isArray(salesData)) setSales(salesData)
            if (itemsData.items) setItems(itemsData.items)
            if (Array.isArray(storesData)) setStores(storesData)

        } catch (error) {
            console.error(error)
            toast.error("Failed to sync sales ledger")
        } finally {
            setFetching(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleSale = async () => {
        const item = items.find(i => i._id === form.items[0].item)
        const salePayload = {
            ...form,
            items: [{
                ...form.items[0],
                unitPrice: item?.sellingPrice || 0,
                totalPrice: (item?.sellingPrice || 0) * form.items[0].quantity
            }],
            subtotal: (item?.sellingPrice || 0) * form.items[0].quantity,
            grandTotal: (item?.sellingPrice || 0) * form.items[0].quantity,
            paidAmount: (item?.sellingPrice || 0) * form.items[0].quantity,
            dueAmount: 0,
            paymentStatus: 'paid'
        }

        if (!form.store || !form.customerName || !form.items[0].item) {
            toast.error("Resource target, customer identity and storage hub are required")
            return
        }

        try {
            setLoading(true)
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/inventory/sales`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(salePayload)
            })

            const result = await res.json()
            if (!res.ok) throw new Error(result.error || "Failed to commit sale")

            toast.success("Institutional sale recorded and buffer updated")
            setForm({
                items: [{ item: "", quantity: 1, unitPrice: 0, totalPrice: 0 }],
                customerType: "external",
                customerName: "",
                store: "",
                saleDate: new Date().toISOString().split('T')[0],
                paymentMethod: "cash",
                paidAmount: 0
            })
            fetchData()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    const columns = [
        {
            key: "saleNumber",
            label: "Receipt No",
            render: (val: string) => (
                <div className="font-black text-indigo-900 tracking-tighter uppercase">{val || 'TRANS-00'}</div>
            )
        },
        {
            key: "customerName",
            label: "Client Vector",
            render: (val: string, row: any) => (
                <div>
                    <span className="font-black text-gray-900 tracking-tight uppercase leading-none">{val}</span>
                    <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">{row.customerType}</div>
                </div>
            )
        },
        {
            key: "grandTotal",
            label: "Valuation (₹)",
            render: (val: number) => (
                <div className="font-black text-emerald-700">₹{val?.toLocaleString()}</div>
            )
        },
        {
            key: "paymentStatus",
            label: "Fiscal State",
            render: (val: string) => (
                <Badge className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${val === 'paid' ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-rose-100 text-rose-700 border-rose-200"
                    }`}>
                    {val}
                </Badge>
            )
        },
        {
            key: "saleDate",
            label: "Operational Stamp",
            render: (val: string) => (
                <span className="text-xs font-black text-gray-500">{new Date(val).toLocaleDateString()}</span>
            )
        }
    ]

    return (
        <DashboardLayout title="Revenue Strategy: Item Sales">
            <div className="max-w-[1700px] mx-auto space-y-10 pb-20">

                {/* Header Context */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-4 uppercase">
                            <div className="h-12 w-12 bg-emerald-900 rounded-2xl flex items-center justify-center shadow-xl text-white transform hover:scale-110 transition-transform">
                                <DollarSign size={24} />
                            </div>
                            Asset Liquidation Protocol
                        </h1>
                        <p className="text-gray-500 mt-2 text-lg italic font-medium">Record institutional resource sales and synchronize revenue flows with buffer states</p>
                    </div>

                    <Button variant="outline" onClick={fetchData} className="h-12 border-gray-200 shadow-sm gap-2 rounded-2xl bg-white px-6 font-black text-xs uppercase tracking-widest text-gray-600 hover:bg-gray-50">
                        <RefreshCcw size={18} className={fetching ? 'animate-spin' : ''} /> Sync Revenue Ledger
                    </Button>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
                    {/* Execution Center */}
                    <div className="xl:col-span-4">
                        <Card className="border-none shadow-2xl ring-1 ring-black/5 overflow-hidden sticky top-8 rounded-[2.5rem] bg-white">
                            <CardHeader className="bg-gradient-to-r from-emerald-50 to-white border-b border-gray-100/50 p-8">
                                <CardTitle className="text-[10px] flex items-center gap-3 text-emerald-900 uppercase tracking-[0.3em] font-black">
                                    <Package size={18} className="text-emerald-600" /> Transaction Node
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Integrated Asset <span className="text-rose-500 font-black">*</span></Label>
                                        <Select
                                            value={form.items[0].item}
                                            onValueChange={(v) => {
                                                const newItems = [...form.items]
                                                newItems[0].item = v
                                                setForm({ ...form, items: newItems })
                                            }}
                                        >
                                            <SelectTrigger className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 rounded-2xl focus:ring-emerald-500 font-black">
                                                <SelectValue placeholder="Resource Payload" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                                                {items.map((i: any) => (
                                                    <SelectItem key={i._id} value={i._id} className="rounded-xl font-bold py-2.5 uppercase">{i.itemName} (₹{i.sellingPrice})</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Volume Yield <span className="text-rose-500 font-black">*</span></Label>
                                            <Input
                                                type="number"
                                                value={form.items[0].quantity}
                                                onChange={(e) => {
                                                    const newItems = [...form.items]
                                                    newItems[0].quantity = parseInt(e.target.value) || 1
                                                    setForm({ ...form, items: newItems })
                                                }}
                                                className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 px-5 rounded-2xl focus:ring-emerald-500 font-black text-lg"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Source Hub <span className="text-rose-500 font-black">*</span></Label>
                                            <Select value={form.store} onValueChange={(v) => setForm({ ...form, store: v })}>
                                                <SelectTrigger className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 rounded-2xl focus:ring-emerald-500 font-bold">
                                                    <SelectValue placeholder="Origin" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                                                    {stores.map((s: any) => (
                                                        <SelectItem key={s._id} value={s._id} className="rounded-xl font-bold py-2.5">{s.storeName}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Client Identity <span className="text-rose-500 font-black">*</span></Label>
                                        <Input
                                            value={form.customerName}
                                            onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                                            placeholder="Full Client Nomenclature"
                                            className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 px-5 rounded-2xl focus:ring-emerald-500 font-black"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Payment Protocol</Label>
                                        <Select value={form.paymentMethod} onValueChange={(v) => setForm({ ...form, paymentMethod: v })}>
                                            <SelectTrigger className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 rounded-2xl focus:ring-emerald-500 font-black">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                                                <SelectItem value="cash" className="rounded-xl font-bold py-2.5">CASH_FLOW</SelectItem>
                                                <SelectItem value="upi" className="rounded-xl font-bold py-2.5">DIGITAL_VECTOR</SelectItem>
                                                <SelectItem value="card" className="rounded-xl font-bold py-2.5">CREDIT_TRANS</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleSale}
                                    disabled={loading}
                                    className="w-full bg-emerald-900 hover:bg-black text-white h-16 rounded-[1.5rem] shadow-2xl shadow-emerald-100 font-black text-xs uppercase tracking-[0.3em] gap-3 transition-all hover:scale-[1.02] active:scale-95"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : <DollarSign size={20} />}
                                    Commence Transaction
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Registry Panel */}
                    <div className="xl:col-span-8 space-y-8">
                        <div className="relative max-w-md group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-emerald-600 transition-colors" />
                            <Input
                                className="pl-16 h-16 bg-white border-none ring-1 ring-black/5 shadow-2xl rounded-[1.5rem] focus:ring-2 focus:ring-emerald-500/20 text-lg font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Query revenue archives..."
                            />
                        </div>

                        <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
                            <AdvancedTable
                                title="Validated Revenue Matrix"
                                columns={columns}
                                data={sales}
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
