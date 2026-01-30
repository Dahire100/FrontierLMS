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
    DollarSign,
    RefreshCcw,
    CreditCard,
    Calendar,
    Loader2,
    Database,
    Receipt
} from "lucide-react"
import { toast } from "sonner"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import { API_URL } from "@/lib/api-config"

export default function SoldItemPaymentPage() {
    const [payments, setPayments] = useState<any[]>([])
    const [fetching, setFetching] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    const fetchData = useCallback(async () => {
        try {
            setFetching(true)
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/inventory/sold-payments`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const data = await res.json()
            if (Array.isArray(data)) {
                setPayments(data)
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to sync fiscal archives")
        } finally {
            setFetching(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const columns = [
        {
            key: "paymentNumber",
            label: "Receipt No",
            render: (val: string) => (
                <div className="flex items-center gap-3">
                    <Receipt size={16} className="text-indigo-400" />
                    <span className="font-black text-indigo-900 tracking-tighter uppercase">{val || 'TRANS-00'}</span>
                </div>
            )
        },
        {
            key: "sale",
            label: "Beneficiary Vector",
            render: (val: any) => (
                <span className="text-xs font-black text-gray-700 uppercase">{val?.customerName}</span>
            )
        },
        {
            key: "paymentMethod",
            label: "Protocol",
            render: (val: string) => (
                <div className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-indigo-500 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-100 w-fit">
                    <CreditCard size={12} /> {val}
                </div>
            )
        },
        {
            key: "amount",
            label: "Liquidity (₹)",
            render: (val: number) => (
                <div className="font-black text-emerald-700 text-lg tracking-tighter">₹{val?.toLocaleString()}</div>
            )
        },
        {
            key: "paymentDate",
            label: "Operational Stamp",
            render: (val: string) => (
                <div className="flex items-center gap-2 text-gray-400 font-bold text-[10px]">
                    <Calendar size={12} /> {new Date(val).toLocaleDateString()}
                </div>
            )
        }
    ]

    const filteredPayments = payments.filter((p: any) =>
        p.paymentNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sale?.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <DashboardLayout title="Fiscal Logistics: Payment Archives">
            <div className="max-w-[1700px] mx-auto space-y-10 pb-20">

                {/* Header Context */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-4 uppercase">
                            <div className="h-12 w-12 bg-indigo-900 rounded-2xl flex items-center justify-center shadow-xl text-white">
                                <DollarSign size={24} />
                            </div>
                            Sold Asset Compensation Matrix
                        </h1>
                        <p className="text-gray-500 mt-2 text-lg italic font-medium">Verify institutional revenue induction and audit directional liquidity vectors from asset liquidation</p>
                    </div>

                    <Button variant="outline" onClick={fetchData} className="h-12 border-gray-200 shadow-sm gap-2 rounded-2xl bg-white px-6 font-black text-xs uppercase tracking-widest text-gray-600 hover:bg-gray-50">
                        <RefreshCcw size={18} className={fetching ? 'animate-spin' : ''} /> Refresh Fiscal Grid
                    </Button>
                </div>

                {/* Registry Panel */}
                <div className="space-y-8">
                    <div className="relative max-w-md group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-indigo-600 transition-colors" />
                        <Input
                            className="pl-16 h-16 bg-white border-none ring-1 ring-black/5 shadow-2xl rounded-[1.5rem] focus:ring-2 focus:ring-indigo-500/20 text-lg font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Query transaction vault..."
                        />
                    </div>

                    <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
                        <AdvancedTable
                            title="Validated Compensation Matrix"
                            columns={columns}
                            data={filteredPayments}
                            loading={fetching}
                            pagination
                        />
                    </div>

                    <div className="bg-emerald-50/50 p-10 rounded-[3rem] border border-emerald-100 border-dashed flex items-center gap-8">
                        <div className="h-16 w-16 bg-white rounded-3xl flex items-center justify-center shadow-xl border border-emerald-100">
                            <Database size={32} className="text-emerald-600" />
                        </div>
                        <div>
                            <p className="font-black text-xl uppercase tracking-tight text-emerald-900">Cryptographic Verification</p>
                            <p className="text-emerald-600/70 font-medium max-w-lg">All liquidated asset revenues are cryptographically synced with the institutional fiscal core for session 2024-25.</p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
