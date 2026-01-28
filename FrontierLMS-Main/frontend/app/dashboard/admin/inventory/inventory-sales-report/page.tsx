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
    Search,
    List,
    Download,
    FileText,
    Printer,
    Grid,
    Columns,
    BarChart3,
    RefreshCcw,
    Filter,
    Calendar,
    Loader2
} from "lucide-react"
import { toast } from "sonner"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import { API_URL } from "@/lib/api-config"

export default function InventorySalesReportPage() {
    const [sales, setSales] = useState<any[]>([])
    const [categories, setCategories] = useState<any[]>([])
    const [fetching, setFetching] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    const fetchData = useCallback(async () => {
        try {
            setFetching(true)
            const token = localStorage.getItem("token")
            const headers = { "Authorization": `Bearer ${token}` }

            const [salesRes, catRes] = await Promise.all([
                fetch(`${API_URL}/api/inventory/sales`, { headers }),
                fetch(`${API_URL}/api/inventory/categories`, { headers })
            ])

            const salesData = await salesRes.json()
            const catData = await catRes.json()

            if (Array.isArray(salesData)) {
                // Flatten items for report view
                const flattened = salesData.flatMap(sale =>
                    sale.items.map((item: any) => ({
                        ...item,
                        customerName: sale.customerName,
                        saleDate: sale.saleDate,
                        soldBy: sale.soldBy?.firstName || 'System',
                        category: item.item?.category || 'General',
                        itemName: item.item?.itemName || 'Unknown',
                        _id: `${sale._id}-${item._id}`
                    }))
                )
                setSales(flattened)
            }
            if (Array.isArray(catData)) setCategories(catData)

        } catch (error) {
            console.error(error)
            toast.error("Failed to sync fiscal intelligence")
        } finally {
            setFetching(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const columns = [
        {
            key: "itemName",
            label: "Resource Asset",
            render: (val: string, row: any) => (
                <div>
                    <span className="font-black text-gray-900 tracking-tight uppercase leading-none">{val}</span>
                    <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">{row.category}</div>
                </div>
            )
        },
        {
            key: "customerName",
            label: "Client Vector",
            render: (val: string) => (
                <span className="text-xs font-bold text-gray-600 uppercase">{val}</span>
            )
        },
        {
            key: "quantity",
            label: "Volume",
            render: (val: number) => (
                <div className="font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg w-fit">
                    {val} Units
                </div>
            )
        },
        {
            key: "totalPrice",
            label: "Revenue (₹)",
            render: (val: number) => (
                <div className="font-black text-emerald-700">₹{val?.toLocaleString()}</div>
            )
        },
        {
            key: "saleDate",
            label: "Fiscal Stamp",
            render: (val: string) => (
                <div className="flex items-center gap-2">
                    <Calendar size={12} className="text-gray-300" />
                    <span className="text-xs font-black text-gray-500">{new Date(val).toLocaleDateString()}</span>
                </div>
            )
        }
    ]

    const filteredSales = sales.filter((s: any) =>
        s.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <DashboardLayout title="Fiscal Analysis: Sales Intelligence">
            <div className="max-w-[1700px] mx-auto space-y-10 pb-20">

                {/* Header Context */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-4 uppercase">
                            <div className="h-12 w-12 bg-indigo-900 rounded-2xl flex items-center justify-center shadow-xl text-white transform hover:rotate-12 transition-transform">
                                <BarChart3 size={24} />
                            </div>
                            Consolidated Revenue Audit
                        </h1>
                        <p className="text-gray-500 mt-2 text-lg italic font-medium">Generate high-fidelity reports on institutional resource liquidation and fiscal performance</p>
                    </div>

                    <Button variant="outline" onClick={fetchData} className="h-12 border-gray-200 shadow-sm gap-2 rounded-2xl bg-white px-6 font-black text-xs uppercase tracking-widest text-gray-600 hover:bg-gray-50">
                        <RefreshCcw size={18} className={fetching ? 'animate-spin' : ''} /> Execute Intelligence Sync
                    </Button>
                </div>

                {/* Strategy Filters */}
                <Card className="border-none shadow-2xl ring-1 ring-black/5 overflow-hidden rounded-[2.5rem] bg-white">
                    <CardHeader className="bg-gradient-to-r from-indigo-50/50 to-white border-b border-gray-100 p-8">
                        <CardTitle className="text-[10px] flex items-center gap-3 text-indigo-900 uppercase tracking-[0.3em] font-black">
                            <Filter size={18} className="text-indigo-600" /> Dimension Scaling
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-10">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Asset Category</Label>
                                <Select>
                                    <SelectTrigger className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 rounded-2xl focus:ring-indigo-500 font-bold">
                                        <SelectValue placeholder="All Domains" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                                        {categories.map((c: any) => (
                                            <SelectItem key={c._id} value={c.categoryName} className="rounded-xl font-bold py-2.5">{c.categoryName}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Archive Query</Label>
                                <div className="relative group">
                                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors" />
                                    <Input
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Identify Nomenclature..."
                                        className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 pl-12 rounded-2xl focus:ring-indigo-500 font-bold"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Intelligence Matrix */}
                <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
                    <AdvancedTable
                        title="Validated Intelligence Matrix"
                        columns={columns}
                        data={filteredSales}
                        loading={fetching}
                        pagination
                    />
                </div>
            </div>
        </DashboardLayout>
    )
}
