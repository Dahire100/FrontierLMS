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
    Package,
    Plus,
    Minus,
    Search,
    Calendar,
    Database,
    RefreshCcw,
    Loader2
} from "lucide-react"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import { API_URL } from "@/lib/api-config"
import { toast } from "sonner"

export default function AddItemStockPage() {
    const [items, setItems] = useState<any[]>([])
    const [suppliers, setSuppliers] = useState<any[]>([])
    const [stores, setStores] = useState<any[]>([])
    const [stocks, setStocks] = useState<any[]>([])

    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [quantity, setQuantity] = useState(0)
    const [price, setPrice] = useState(0)

    const [form, setForm] = useState({
        itemId: "",
        supplierId: "",
        storeId: "",
        date: new Date().toISOString().split('T')[0],
        description: ""
    })

    const fetchData = useCallback(async () => {
        try {
            setFetching(true)
            const token = localStorage.getItem("token")
            const headers = { "Authorization": `Bearer ${token}` }

            // Parallel fetch
            const [itemsRes, supRes, storeRes, stocksRes] = await Promise.all([
                fetch(`${API_URL}/api/inventory?limit=100`, { headers }),
                fetch(`${API_URL}/api/inventory/suppliers`, { headers }),
                fetch(`${API_URL}/api/inventory/stores`, { headers }),
                fetch(`${API_URL}/api/inventory/stocks`, { headers })
            ])

            const itemsData = await itemsRes.json()
            const supData = await supRes.json()
            const storeData = await storeRes.json()
            const stocksData = await stocksRes.json()

            if (itemsData.items) setItems(itemsData.items)
            if (Array.isArray(supData)) setSuppliers(supData)
            if (Array.isArray(storeData)) setStores(storeData)
            if (Array.isArray(stocksData)) setStocks(stocksData)

        } catch (error) {
            console.error(error)
            toast.error("Failed to sync inventory registry")
        } finally {
            setFetching(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleSubmit = async () => {
        if (!form.itemId || quantity <= 0 || !form.storeId || !form.supplierId) {
            toast.error("Asset, quantity, store, and supplier are required")
            return
        }

        try {
            setLoading(true)
            const token = localStorage.getItem("token")

            // Calculate totals
            const total = quantity * price;

            const res = await fetch(`${API_URL}/api/inventory/stocks`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    item: form.itemId,
                    store: form.storeId,
                    supplier: form.supplierId,
                    quantity: Number(quantity),
                    purchasePrice: Number(price),
                    totalAmount: total,
                    netAmount: total, // Simplified for now (no tax/discount logic in UI yet)
                    stockDate: form.date,
                    notes: form.description
                })
            })

            const result = await res.json()
            if (!res.ok) throw new Error(result.error || "Failed to commit stock entry")

            toast.success("Stock inventory synced")
            setQuantity(0)
            setPrice(0)
            setForm({ ...form, itemId: "", description: "" })
            fetchData()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    const columns = [
        {
            key: "item",
            label: "Resource Asset",
            render: (val: any) => (
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
                        <Package size={16} />
                    </div>
                    <div>
                        <span className="font-black text-gray-900 tracking-tight uppercase leading-none">{val?.itemName || 'Unknown'}</span>
                        <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                            {val?.itemCode}
                        </div>
                    </div>
                </div>
            )
        },
        {
            key: "store",
            label: "Storage Hub",
            render: (val: any) => (
                <span className="text-xs font-bold text-gray-600 uppercase">{val?.storeName || '-'}</span>
            )
        },
        {
            key: "quantity",
            label: "Volume Yield",
            render: (val: number) => (
                <div className="font-black text-lg tracking-tighter text-emerald-600">
                    +{val}
                </div>
            )
        },
        {
            key: "stockDate",
            label: "Entry Stamp",
            render: (val: string) => (
                <div className="flex items-center gap-2">
                    <Calendar size={12} className="text-gray-300" />
                    <span className="text-xs font-black text-gray-600">{new Date(val).toLocaleDateString()}</span>
                </div>
            )
        },
        {
            key: "netAmount",
            label: "Fiscal Value",
            render: (val: number) => (
                <span className="text-xs font-black text-indigo-900">₹{val?.toLocaleString()}</span>
            )
        }
    ]

    return (
        <DashboardLayout title="Logistics Strategy: Inventory Accrual">
            <div className="max-w-[1700px] mx-auto space-y-10 pb-20">

                {/* Header Context */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-4 uppercase">
                            <div className="h-12 w-12 bg-indigo-900 rounded-2xl flex items-center justify-center shadow-xl text-white transform hover:scale-110 transition-transform">
                                <Plus size={24} />
                            </div>
                            Asset Accrual Protocol
                        </h1>
                        <p className="text-gray-500 mt-2 text-lg italic font-medium">Initialize resource replenishment and synchronize procurement yields with the institutional grid</p>
                    </div>

                    <div className="flex gap-4">
                        <Button variant="outline" onClick={fetchData} className="h-12 border-gray-200 shadow-sm gap-2 rounded-2xl bg-white px-6 font-black text-xs uppercase tracking-widest text-gray-600 hover:bg-gray-50">
                            <RefreshCcw size={18} className={fetching ? 'animate-spin' : ''} /> Sync Registry
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
                    {/* Entry Form Panel */}
                    <div className="xl:col-span-4">
                        <Card className="border-none shadow-2xl ring-1 ring-black/5 overflow-hidden sticky top-8 rounded-[2.5rem] bg-white">
                            <CardHeader className="bg-gradient-to-r from-indigo-50 to-white border-b border-gray-100/50 p-10">
                                <CardTitle className="text-[10px] flex items-center gap-3 text-indigo-900 uppercase tracking-[0.3em] font-black">
                                    <Pencil size={18} className="text-indigo-600" /> Procurement Entry
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-10 space-y-8">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Target Asset <span className="text-rose-500">*</span></Label>
                                    <Select value={form.itemId} onValueChange={(v) => {
                                        setForm({ ...form, itemId: v })
                                        // Auto-set price from master if available
                                        const selected = items.find(i => i._id === v)
                                        if (selected) setPrice(selected.purchasePrice || 0)
                                    }}>
                                        <SelectTrigger className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 rounded-2xl focus:ring-indigo-500 font-black">
                                            <SelectValue placeholder="Identify Resource" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl shadow-2xl border-none p-2">
                                            {items.map((i: any) => (
                                                <SelectItem key={i._id} value={i._id} className="rounded-xl font-bold py-2.5 uppercase">{i.itemName} ({i.itemCode})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Stakeholder & Hub</Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Select value={form.supplierId} onValueChange={(v) => setForm({ ...form, supplierId: v })}>
                                            <SelectTrigger className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 rounded-2xl focus:ring-indigo-500 font-black">
                                                <SelectValue placeholder="Supplier" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl shadow-2xl border-none p-2">
                                                {suppliers.map((s: any) => (
                                                    <SelectItem key={s._id} value={s._id} className="rounded-xl font-bold py-2.5">{s.supplierName}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Select value={form.storeId} onValueChange={(v) => setForm({ ...form, storeId: v })}>
                                            <SelectTrigger className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 rounded-2xl focus:ring-indigo-500 font-black">
                                                <SelectValue placeholder="Store" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl shadow-2xl border-none p-2">
                                                {stores.map((s: any) => (
                                                    <SelectItem key={s._id} value={s._id} className="rounded-xl font-bold py-2.5">{s.storeName}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center px-2">
                                            <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Volume <span className="text-rose-500">*</span></Label>
                                        </div>
                                        <Input
                                            type="number"
                                            value={quantity}
                                            onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                                            className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 rounded-2xl focus:ring-indigo-500 font-black text-center"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center px-2">
                                            <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Price (₹) <span className="text-rose-500">*</span></Label>
                                        </div>
                                        <Input
                                            type="number"
                                            value={price}
                                            onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                                            className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 rounded-2xl focus:ring-indigo-500 font-black text-center text-indigo-900"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Logistical Stamp <span className="text-rose-500">*</span></Label>
                                    <Input value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} type="date" className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 px-5 rounded-2xl focus:ring-indigo-500 font-black" />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Audit Metadata</Label>
                                    <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-gray-50/50 border-none ring-1 ring-gray-100 min-h-[100px] rounded-3xl focus:ring-indigo-500 font-medium p-5" placeholder="Operational remarks..." />
                                </div>

                                <Button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="w-full bg-indigo-900 hover:bg-black text-white h-16 rounded-[1.5rem] shadow-2xl shadow-indigo-100 font-black text-xs uppercase tracking-[0.3em] gap-3 transition-all hover:scale-[1.02] active:scale-95"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Database size={20} />}
                                    Commit Accrual
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Accrual Ledger Panel */}
                    <div className="xl:col-span-8 space-y-8">
                        <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
                            <AdvancedTable
                                title="Validated Accrual Matrix"
                                columns={columns}
                                data={stocks}
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
