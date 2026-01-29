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
    ArrowRightCircle,
    User,
    Package,
    Calendar,
    RefreshCcw,
    Search,
    Loader2,
    Database,
    Tag
} from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import { API_URL } from "@/lib/api-config"

export default function IssueItemPage() {
    const [issues, setIssues] = useState<any[]>([])
    const [items, setItems] = useState<any[]>([])
    const [users, setUsers] = useState<any[]>([])
    const [stores, setStores] = useState<any[]>([])

    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    const [form, setForm] = useState({
        items: [{ item: "", quantity: 1 }],
        issueTo: "staff",
        recipientName: "",
        store: "",
        issueDate: new Date().toISOString().split('T')[0],
        notes: ""
    })

    const fetchData = useCallback(async () => {
        try {
            setFetching(true)
            const token = localStorage.getItem("token")
            const headers = { "Authorization": `Bearer ${token}` }

            const [issuesRes, itemsRes, storesRes] = await Promise.all([
                fetch(`${API_URL}/api/inventory/issues`, { headers }),
                fetch(`${API_URL}/api/inventory`, { headers }),
                fetch(`${API_URL}/api/inventory/stores`, { headers })
            ])

            const issuesData = await issuesRes.json()
            const itemsData = await itemsRes.json()
            const storesData = await storesRes.json()

            if (Array.isArray(issuesData)) setIssues(issuesData)
            if (itemsData.items) setItems(itemsData.items)
            if (Array.isArray(storesData)) setStores(storesData)

        } catch (error) {
            console.error(error)
            toast.error("Failed to sync issuance ledger")
        } finally {
            setFetching(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleIssue = async () => {
        if (!form.store || !form.recipientName || !form.items[0].item) {
            toast.error("Resource target, recipient and storage hub are required")
            return
        }

        try {
            setLoading(true)
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/inventory/issues`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(form)
            })

            const result = await res.json()
            if (!res.ok) throw new Error(result.error || "Failed to commit issuance")

            toast.success("Logistical issuance protocol completed")
            setForm({
                items: [{ item: "", quantity: 1 }],
                issueTo: "staff",
                recipientName: "",
                store: "",
                issueDate: new Date().toISOString().split('T')[0],
                notes: ""
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
            key: "items",
            label: "Resource Payload",
            render: (val: any[]) => (
                <div className="space-y-1">
                    {val.map((v, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                            <Package size={12} className="text-gray-400" />
                            <span className="text-xs font-black text-gray-700 uppercase">{v.item?.itemName}</span>
                            <span className="text-[10px] font-bold text-indigo-500">x{v.quantity}</span>
                        </div>
                    ))}
                </div>
            )
        },
        {
            key: "recipientName",
            label: "Beneficiary",
            render: (val: string, row: any) => (
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 border border-gray-100 font-black text-[10px]">
                        {val ? val[0] : 'U'}
                    </div>
                    <div>
                        <span className="font-black text-gray-900 tracking-tight uppercase leading-none">{val}</span>
                        <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">{row.issueTo}</div>
                    </div>
                </div>
            )
        },
        {
            key: "issueDate",
            label: "Issuance Stamp",
            render: (val: string) => (
                <div className="flex items-center gap-2">
                    <Calendar size={12} className="text-gray-300" />
                    <span className="text-xs font-black text-gray-600">{new Date(val).toLocaleDateString()}</span>
                </div>
            )
        },
        {
            key: "status",
            label: "Operational State",
            render: (val: string) => (
                <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${val === 'returned' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-indigo-100 text-indigo-700 border-indigo-200'
                    }`}>
                    {val}
                </span>
            )
        }
    ]

    return (
        <DashboardLayout title="Logistics Strategy: Item Issuance">
            <div className="max-w-[1700px] mx-auto space-y-10 pb-20">

                {/* Header Strategy */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-4 uppercase">
                            <div className="h-12 w-12 bg-indigo-900 rounded-2xl flex items-center justify-center shadow-xl text-white">
                                <ArrowRightCircle size={24} />
                            </div>
                            Asset Issuance Protocol
                        </h1>
                        <p className="text-gray-500 mt-2 text-lg italic font-medium">Orchestrate internal resource distribution and track institutional asset dispersion</p>
                    </div>

                    <Button variant="outline" onClick={fetchData} className="h-12 border-gray-200 shadow-sm gap-2 rounded-2xl bg-white px-6 font-black text-xs uppercase tracking-widest text-gray-600 hover:bg-gray-50">
                        <RefreshCcw size={18} className={fetching ? 'animate-spin' : ''} /> Synchronize Ledger
                    </Button>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
                    {/* Execution Panel */}
                    <div className="xl:col-span-4">
                        <Card className="border-none shadow-2xl ring-1 ring-black/5 overflow-hidden sticky top-8 rounded-[2.5rem] bg-white">
                            <CardHeader className="bg-gradient-to-r from-indigo-50 to-white border-b border-gray-100/50 p-8">
                                <CardTitle className="text-[10px] flex items-center gap-3 text-indigo-900 uppercase tracking-[0.3em] font-black">
                                    <Tag size={18} className="text-indigo-600" /> Dispatch Initialization
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Integrated Asset <span className="text-rose-500">*</span></Label>
                                        <Select
                                            value={form.items[0].item}
                                            onValueChange={(v) => {
                                                const newItems = [...form.items]
                                                newItems[0].item = v
                                                setForm({ ...form, items: newItems })
                                            }}
                                        >
                                            <SelectTrigger className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 rounded-2xl focus:ring-indigo-500 font-bold">
                                                <SelectValue placeholder="Identify Resource" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                                                {items.map((i: any) => (
                                                    <SelectItem key={i._id} value={i._id} className="rounded-xl font-bold py-2.5 uppercase">{i.itemName} ({i.quantity} available)</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Payload volume <span className="text-rose-500">*</span></Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={form.items[0].quantity}
                                                onChange={(e) => {
                                                    const newItems = [...form.items]
                                                    newItems[0].quantity = parseInt(e.target.value) || 1
                                                    setForm({ ...form, items: newItems })
                                                }}
                                                className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 px-5 rounded-2xl focus:ring-indigo-500 font-black text-lg"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Target Storage <span className="text-rose-500">*</span></Label>
                                            <Select value={form.store} onValueChange={(v) => setForm({ ...form, store: v })}>
                                                <SelectTrigger className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 rounded-2xl focus:ring-indigo-500 font-black">
                                                    <SelectValue placeholder="Source" />
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
                                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Beneficiary Identifier <span className="text-rose-500">*</span></Label>
                                        <div className="relative group">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transision-colors" size={16} />
                                            <Input
                                                value={form.recipientName}
                                                onChange={(e) => setForm({ ...form, recipientName: e.target.value })}
                                                placeholder="Recipient Full Identity"
                                                className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 pl-12 rounded-2xl focus:ring-indigo-500 font-bold"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Beneficiary Sector <span className="text-rose-500">*</span></Label>
                                        <Select value={form.issueTo} onValueChange={(v) => setForm({ ...form, issueTo: v })}>
                                            <SelectTrigger className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 rounded-2xl focus:ring-indigo-500 font-black">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                                                <SelectItem value="student" className="rounded-xl font-bold py-2.5">Academic/Student Cluster</SelectItem>
                                                <SelectItem value="teacher" className="rounded-xl font-bold py-2.5">Faculty Vector</SelectItem>
                                                <SelectItem value="staff" className="rounded-xl font-bold py-2.5">Internal/Staff Unit</SelectItem>
                                                <SelectItem value="department" className="rounded-xl font-bold py-2.5">Institutional Department</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Issuance Stamp <span className="text-rose-500">*</span></Label>
                                    <Input value={form.issueDate} onChange={(e) => setForm({ ...form, issueDate: e.target.value })} type="date" className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 px-5 rounded-2xl focus:ring-indigo-500 font-black" />
                                </div>

                                <Button
                                    onClick={handleIssue}
                                    disabled={loading}
                                    className="w-full bg-indigo-900 hover:bg-black text-white h-16 rounded-[1.5rem] shadow-2xl shadow-indigo-100 font-black text-xs uppercase tracking-[0.3em] gap-3 transition-all hover:scale-[1.02] active:scale-95"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Database size={20} />}
                                    Commit Issuance
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Matrix Panel */}
                    <div className="xl:col-span-8 space-y-8">
                        <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                            <div className="relative flex-1 max-w-md group">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-indigo-600 transition-colors" />
                                <Input
                                    className="pl-16 h-16 bg-white border-none ring-1 ring-black/5 shadow-2xl rounded-[1.5rem] focus:ring-2 focus:ring-indigo-500/20 text-lg font-medium"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Query issuance registry..."
                                />
                            </div>
                        </div>

                        <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
                            <AdvancedTable
                                title="Validated Issuance Matrix"
                                columns={columns}
                                data={issues}
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
