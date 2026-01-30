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
    Pencil,
    List,
    Download,
    Search,
    FileText,
    Printer,
    Grid,
    Columns,
    Layers,
    Package,
    RefreshCcw,
    Trash2,
    Edit,
    MoreVertical,
    Loader2,
    Database,
    Boxes
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

export default function ItemSetPage() {
    const [sets, setSets] = useState<any[]>([])
    const [items, setItems] = useState<any[]>([])
    const [form, setForm] = useState({ setName: "", setCode: "", items: [{ item: "", quantity: 1 }] })
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    const fetchData = useCallback(async () => {
        try {
            setFetching(true)
            const token = localStorage.getItem("token")
            const headers = { "Authorization": `Bearer ${token}` }

            const [setsRes, itemsRes] = await Promise.all([
                fetch(`${API_URL}/api/inventory/sets`, { headers }),
                fetch(`${API_URL}/api/inventory`, { headers })
            ])

            const setsData = await setsRes.json()
            const itemsData = await itemsRes.json()

            if (Array.isArray(setsData)) setSets(setsData)
            if (itemsData.items) setItems(itemsData.items)

        } catch (error) {
            console.error(error)
            toast.error("Failed to sync set matrix")
        } finally {
            setFetching(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleSubmit = async () => {
        if (!form.setName || !form.items[0].item) {
            toast.error("Set nomenclature and resource payload are required")
            return
        }

        try {
            setLoading(true)
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/inventory/sets`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(form)
            })

            const result = await res.json()
            if (!res.ok) throw new Error(result.error || "Failed to commit set")

            toast.success("Institutional set strategy committed")
            setForm({ setName: "", setCode: "", items: [{ item: "", quantity: 1 }] })
            fetchData()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to purge this set from the registry?")) return
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/inventory/sets/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            })
            if (!res.ok) throw new Error("Failed to purge")
            toast.success("Set purged from registry")
            fetchData()
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    const columns = [
        {
            key: "setName",
            label: "Asset Set",
            render: (val: string, row: any) => (
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 shadow-sm border border-purple-100">
                        <Layers size={18} />
                    </div>
                    <div>
                        <span className="font-black text-gray-900 tracking-tight uppercase leading-none">{val}</span>
                        <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">{row.items?.length || 0} Unified components</div>
                    </div>
                </div>
            )
        },
        {
            key: "items",
            label: "Component Payload",
            render: (val: any[]) => (
                <div className="space-y-1">
                    {val?.map((v, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                            <Package size={10} className="text-gray-400" />
                            <span className="text-[10px] font-bold text-gray-600 uppercase">{v.item?.itemName || 'Unknown Resource'}</span>
                            <span className="text-[9px] font-black text-purple-500">x{v.quantity}</span>
                        </div>
                    ))}
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
                                <Edit size={14} className="text-purple-600" /> Modify Set
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(row._id)} className="gap-2 cursor-pointer text-rose-600 font-bold rounded-lg py-2">
                                <Trash2 size={14} /> Purge Set
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        }
    ]

    const filteredSets = sets.filter((s: any) => s.setName.toLowerCase().includes(searchTerm.toLowerCase()))

    return (
        <DashboardLayout title="Logistics Strategy: Asset Sets">
            <div className="max-w-[1700px] mx-auto space-y-10 pb-20">

                {/* Header Context */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-4 uppercase">
                            <div className="h-12 w-12 bg-purple-900 rounded-2xl flex items-center justify-center shadow-xl text-white">
                                <Boxes size={24} />
                            </div>
                            Institutional Set Registry
                        </h1>
                        <p className="text-gray-500 mt-2 text-lg italic font-medium">Define composite resource taxonomies and optimize bulk asset deployment matrices</p>
                    </div>

                    <Button variant="outline" onClick={fetchData} className="h-12 border-gray-200 shadow-sm gap-2 rounded-2xl bg-white px-6 font-black text-xs uppercase tracking-widest text-gray-600 hover:bg-gray-50">
                        <RefreshCcw size={18} className={fetching ? 'animate-spin' : ''} /> Synchronize Grid
                    </Button>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
                    {/* Definition Panel */}
                    <div className="xl:col-span-4">
                        <Card className="border-none shadow-2xl ring-1 ring-black/5 overflow-hidden sticky top-8 rounded-[2.5rem] bg-white">
                            <CardHeader className="bg-gradient-to-r from-purple-50/50 to-white border-b border-gray-100 p-8">
                                <CardTitle className="text-[10px] flex items-center gap-3 text-purple-900 uppercase tracking-[0.3em] font-black">
                                    <Pencil size={18} className="text-purple-600" /> Set Configuration
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Set Nomenclature <span className="text-rose-500">*</span></Label>
                                    <Input
                                        value={form.setName}
                                        onChange={(e) => setForm({ ...form, setName: e.target.value })}
                                        placeholder="Identify Institutional Set"
                                        className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 px-5 rounded-2xl focus:ring-purple-500 font-bold"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Set Code <span className="text-rose-500">*</span></Label>
                                    <Input
                                        value={form.setCode}
                                        onChange={(e) => setForm({ ...form, setCode: e.target.value })}
                                        placeholder="Unique Code (e.g. SET-001)"
                                        className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 px-5 rounded-2xl focus:ring-purple-500 font-bold"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Integrated Resource <span className="text-rose-500">*</span></Label>
                                    <div className="space-y-4">
                                        <Select
                                            value={form.items[0].item}
                                            onValueChange={(v) => {
                                                const newItems = [...form.items]
                                                newItems[0].item = v
                                                setForm({ ...form, items: newItems })
                                            }}
                                        >
                                            <SelectTrigger className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 rounded-2xl focus:ring-purple-500 font-bold">
                                                <SelectValue placeholder="Identify Payload" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                                                {items.map((i: any) => (
                                                    <SelectItem key={i._id} value={i._id} className="rounded-xl font-bold py-2.5 uppercase">{i.itemName} ({i.itemCode})</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <div className="flex items-center gap-4">
                                            <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] flex-1">Unit Ratio</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={form.items[0].quantity}
                                                onChange={(e) => {
                                                    const newItems = [...form.items]
                                                    newItems[0].quantity = parseInt(e.target.value) || 1
                                                    setForm({ ...form, items: newItems })
                                                }}
                                                className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-10 w-24 text-center rounded-xl focus:ring-purple-500 font-black"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="w-full bg-purple-900 hover:bg-black text-white h-16 rounded-[1.5rem] shadow-2xl shadow-purple-100 font-black text-xs uppercase tracking-[0.3em] gap-3 transition-all hover:scale-[1.02] active:scale-95"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Database size={20} />}
                                    Commit Set Strategy
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Matrix Panel */}
                    <div className="xl:col-span-8 space-y-8">
                        <div className="relative max-w-md group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-purple-600 transition-colors" />
                            <Input
                                className="pl-16 h-16 bg-white border-none ring-1 ring-black/5 shadow-2xl rounded-[1.5rem] focus:ring-2 focus:ring-purple-500/20 text-lg font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Query set archives..."
                            />
                        </div>

                        <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
                            <AdvancedTable
                                title="Validated Set Matrix"
                                columns={columns}
                                data={filteredSets}
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
