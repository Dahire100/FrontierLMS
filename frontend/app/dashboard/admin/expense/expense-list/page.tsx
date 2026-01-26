"use client"

import { useState, useEffect, useCallback } from "react"
import { apiFetch, API_ENDPOINTS } from "@/lib/api-config"
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
import { ClipboardList, Plus, Search, Filter, Calendar } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import Link from "next/link"

export default function ExpenseList() {
    const [expenses, setExpenses] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filters, setFilters] = useState({
        category: "all",
        startDate: "",
        endDate: "",
        search: ""
    })

    const fetchExpenses = useCallback(async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams()
            if (filters.category !== "all") params.append("category", filters.category)
            if (filters.startDate) params.append("startDate", filters.startDate)
            if (filters.endDate) params.append("endDate", filters.endDate)
            if (filters.search) params.append("search", filters.search)

            const res = await apiFetch(`${API_ENDPOINTS.EXPENSES.BASE}?${params.toString()}`)
            if (!res.ok) throw new Error("Fetch failed")
            const data = await res.json()
            setExpenses(data.data || [])
        } catch (error) {
            toast.error("Failed to load records")
        } finally {
            setLoading(false)
        }
    }, [filters])

    useEffect(() => {
        fetchExpenses()
    }, [fetchExpenses])

    const columns = [
        {
            key: "receiptNumber",
            label: "Voucher",
            render: (val: string) => <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">#{val || '---'}</span>
        },
        {
            key: "category",
            label: "Head",
            render: (val: string) => <span className="capitalize text-xs font-semibold px-2 py-1 bg-pink-50 text-pink-700 rounded-full border border-pink-100">{val}</span>
        },
        { key: "paidTo", label: "Payee", className: "font-medium text-gray-700" },
        {
            key: "expenseDate",
            label: "Date",
            render: (val: string) => val ? format(new Date(val), "dd MMM yyyy") : "-"
        },
        {
            key: "amount",
            label: "Amount",
            className: "text-right font-bold text-gray-900",
            render: (val: number) => `₹${val.toLocaleString()}`
        },
        {
            key: "status",
            label: "Status",
            render: (val: string) => (
                <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-black ${val === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                    {val || 'paid'}
                </span>
            )
        }
    ]

    return (
        <DashboardLayout title="Expense Ledger">
            <div className="space-y-6 max-w-[1400px] mx-auto pb-10">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                            <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg text-white">
                                <ClipboardList size={20} />
                            </div>
                            Expense Records
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Detailed audit trail of all institutional disbursements</p>
                    </div>
                    <Link href="/dashboard/admin/expense/add-expense">
                        <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-md flex items-center gap-2 font-semibold">
                            <Plus size={18} /> Record New Expense
                        </Button>
                    </Link>
                </div>

                {/* Filter Toolbar */}
                <Card className="border-none shadow-xl ring-1 ring-black/5 overflow-hidden bg-white/50 backdrop-blur-sm">
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Category</Label>
                                <Select
                                    value={filters.category}
                                    onValueChange={(v) => setFilters({ ...filters, category: v })}
                                >
                                    <SelectTrigger className="bg-white border-gray-200">
                                        <Filter className="w-3 h-3 mr-2 text-gray-400" />
                                        <SelectValue placeholder="All Categories" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Heads</SelectItem>
                                        <SelectItem value="salary">Payroll</SelectItem>
                                        <SelectItem value="utilities">Utilities</SelectItem>
                                        <SelectItem value="maintenance">Maintenance</SelectItem>
                                        <SelectItem value="supplies">Inventory</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">From</Label>
                                <div className="relative">
                                    <Input
                                        type="date"
                                        className="bg-white border-gray-200 pl-10"
                                        value={filters.startDate}
                                        onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                                    />
                                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">To</Label>
                                <div className="relative">
                                    <Input
                                        type="date"
                                        className="bg-white border-gray-200 pl-10"
                                        value={filters.endDate}
                                        onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                                    />
                                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Global Search</Label>
                                <div className="relative">
                                    <Input
                                        placeholder="Payee / Voucher..."
                                        className="bg-white border-gray-200 pl-10"
                                        value={filters.search}
                                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                    />
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <AdvancedTable
                    title="Audit Journal"
                    columns={columns}
                    data={expenses}
                    loading={loading}
                    pagination
                    searchable
                />
            </div>
        </DashboardLayout>
    )
}

