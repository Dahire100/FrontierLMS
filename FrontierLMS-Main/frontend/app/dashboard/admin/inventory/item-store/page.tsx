"use client"

import { useState, useEffect, useCallback } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Pencil,
    List,
    Download,
    FileText,
    Printer,
    Grid,
    Columns,
    Store,
    Database,
    Search,
    RefreshCcw,
    Trash2,
    Edit,
    MoreVertical,
    Loader2
} from "lucide-react"
import { toast } from "sonner"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { API_URL } from "@/lib/api-config"

export default function ItemStorePage() {
    const [stores, setStores] = useState<any[]>([])
    const [form, setForm] = useState({ storeName: "", stockCode: "", description: "" })
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    const fetchData = useCallback(async () => {
        try {
            setFetching(true)
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/inventory/stores`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const data = await res.json()
            if (Array.isArray(data)) setStores(data)
        } catch (error) {
            console.error(error)
            toast.error("Failed to sync storage hubs")
        } finally {
            setFetching(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleSubmit = async () => {
        if (!form.storeName || !form.stockCode) {
            toast.error("Store nomenclature and stock code are required")
            return
        }

        try {
            setLoading(true)
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/inventory/stores`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(form)
            })

            const result = await res.json()
            if (!res.ok) throw new Error(result.error || "Failed to initialize storage hub")

            toast.success("Storage hub initialized")
            setForm({ storeName: "", stockCode: "", description: "" })
            fetchData()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to purge this storage hub?")) return
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/inventory/stores/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            })
            if (!res.ok) throw new Error("Failed to purge")
            toast.success("Storage hub purged")
            fetchData()
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    const columns = [
        {
            key: "storeName",
            label: "Storage Hub",
            render: (val: string, row: any) => (
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
                        <Store size={18} />
                    </div>
                    <div>
                        <span className="font-black text-gray-900 tracking-tight uppercase leading-none">{val}</span>
                        <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">Code: {row.stockCode}</div>
                    </div>
                </div>
            )
        },
        {
            key: "description",
            label: "Operational Metadata",
            render: (val: string) => (
                <div className="text-xs text-gray-500 font-medium max-w-md truncate italic">
                    {val || 'No technical specifications recorded'}
                </div>
            )
        },
        {
            key: "actions",
            label: "Control",
            render: (_: any, row: any) => (
                <div className="flex justify-end">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full">
                                <MoreVertical className="h-4 w-4 text-gray-400" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-2xl border-none ring-1 ring-black/5 p-2 bg-white">
                            <DropdownMenuItem className="gap-2 cursor-pointer font-bold rounded-lg py-2">
                                <Edit size={14} className="text-indigo-600" /> Modify Hub
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(row._id)} className="gap-2 cursor-pointer text-rose-600 font-bold rounded-lg py-2">
                                <Trash2 size={14} /> Purge Hub
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        }
    ]

    const filteredStores = stores.filter((s: any) =>
        s.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.stockCode.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <DashboardLayout title="Logistics Infrastructure: Storage Hubs">
            <div className="max-w-[1600px] mx-auto space-y-10 pb-20">

                {/* Header Context */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-4 uppercase">
                            <div className="h-12 w-12 bg-indigo-900 rounded-2xl flex items-center justify-center shadow-xl text-white transform hover:rotate-12 transition-transform">
                                <Store size={24} />
                            </div>
                            Institutional Storage Network
                        </h1>
                        <p className="text-gray-500 mt-2 text-lg italic font-medium">Define logistical buffer locations and integrate physical storage nodes with the institutional grid</p>
                    </div>

                    <Button variant="outline" onClick={fetchData} className="h-12 border-gray-200 shadow-sm gap-2 rounded-2xl bg-white px-6 font-black text-xs uppercase tracking-widest text-gray-600 hover:bg-gray-50">
                        <RefreshCcw size={18} className={fetching ? 'animate-spin' : ''} /> Grid Refresh
                    </Button>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
                    {/* Definition Panel */}
                    <div className="xl:col-span-4 transition-all duration-500">
                        <Card className="border-none shadow-2xl ring-1 ring-black/5 overflow-hidden sticky top-8 rounded-[2.5rem] bg-white">
                            <CardHeader className="bg-gradient-to-r from-indigo-50/50 to-white border-b border-gray-100 p-10">
                                <CardTitle className="text-[10px] flex items-center gap-3 text-indigo-900 uppercase tracking-[0.3em] font-black">
                                    <Pencil size={18} className="text-indigo-600" /> Node Definition
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-10 space-y-8">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Store Nomenclature <span className="text-rose-500 font-black">*</span></Label>
                                    <Input
                                        value={form.storeName}
                                        onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                                        placeholder="Identify Storage Hub"
                                        className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 px-5 rounded-2xl focus:ring-indigo-500 font-bold"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Operational Code <span className="text-rose-500 font-black">*</span></Label>
                                    <Input
                                        value={form.stockCode}
                                        onChange={(e) => setForm({ ...form, stockCode: e.target.value })}
                                        placeholder="Vault Core Code"
                                        className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 px-5 rounded-2xl focus:ring-indigo-500 font-black text-indigo-900"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Technical Specifications</Label>
                                    <Textarea
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        className="bg-gray-50/50 border-none ring-1 ring-gray-100 min-h-[120px] rounded-3xl focus:ring-indigo-500 font-medium p-6"
                                        placeholder="Resource capacity and safety protocols..."
                                    />
                                </div>

                                <Button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="w-full bg-indigo-900 hover:bg-black text-white h-16 rounded-[1.5rem] shadow-2xl shadow-indigo-100 font-black text-xs uppercase tracking-[0.3em] gap-3 transition-all hover:scale-[1.02] active:scale-95"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Database size={20} />}
                                    Commit Node Entry
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
                                placeholder="Query node registry..."
                            />
                        </div>

                        <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
                            <AdvancedTable
                                title="Validated Node Matrix"
                                columns={columns}
                                data={filteredStores}
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
