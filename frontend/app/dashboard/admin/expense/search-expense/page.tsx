"use client"

import { useState } from "react"
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
import { Search, Receipt, Calendar, Filter, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { AdvancedTable } from "@/components/super-admin/advanced-table"

export default function SearchExpense() {
    const [rows, setRows] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [criteria, setCriteria] = useState({
        voucher: "",
        category: "all",
        startDate: "",
        endDate: ""
    })

    const handleSearch = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (criteria.category && criteria.category !== "all") params.append("category", criteria.category)
            if (criteria.startDate) params.append("startDate", criteria.startDate)
            if (criteria.endDate) params.append("endDate", criteria.endDate)
            if (criteria.voucher) params.append("search", criteria.voucher)

            const res = await apiFetch(`${API_ENDPOINTS.EXPENSES.BASE}?${params.toString()}`)
            if (res.ok) {
                const data = await res.json()
                setRows(data.data || [])
            } else {
                toast.error("Query failed")
            }
        } catch (error) {
            toast.error("Search error")
        } finally {
            setLoading(false)
        }
    }

    const columns = [
        {
            key: "receiptNumber",
            label: "Voucher #",
            render: (val: string) => <span className="font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-xs">#{val || 'N/A'}</span>
        },
        {
            key: "category",
            label: "Category",
            render: (val: string) => <span className="capitalize px-2 py-0.5 rounded-md bg-pink-100 text-pink-700 font-bold text-[10px]">{val}</span>
        },
        { key: "paidTo", label: "Recipient" },
        {
            key: "amount",
            label: "Amount",
            render: (val: number) => <span className="font-bold text-red-600">₹{val.toLocaleString()}</span>
        },
        {
            key: "expenseDate",
            label: "Transaction Date",
            render: (val: string) => new Date(val).toLocaleDateString()
        }
    ]

    return (
        <DashboardLayout title="Expense Verification">
            <div className="space-y-6 max-w-[1400px] mx-auto pb-10">

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                            <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg text-white">
                                <Search size={22} />
                            </div>
                            Voucher Discovery
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Audit and retrieve historical institutional expenses</p>
                    </div>
                </div>

                <Card className="border-none shadow-xl ring-1 ring-black/5 overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 pb-4">
                        <CardTitle className="text-sm flex items-center gap-2 text-gray-600 uppercase tracking-widest font-bold">
                            Search Parameters
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-8 px-8">
                        <form onSubmit={(e) => { e.preventDefault(); handleSearch() }} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Reference Info</Label>
                                    <div className="relative">
                                        <Input
                                            placeholder="Voucher or Receipt #"
                                            className="bg-gray-50/50 border-gray-200 pl-10 h-12"
                                            value={criteria.voucher}
                                            onChange={(e) => setCriteria({ ...criteria, voucher: e.target.value })}
                                        />
                                        <Receipt className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Classification</Label>
                                    <Select
                                        value={criteria.category}
                                        onValueChange={(val) => setCriteria({ ...criteria, category: val })}
                                    >
                                        <SelectTrigger className="bg-gray-50/50 border-gray-200 h-12">
                                            <SelectValue placeholder="All Categories" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Categories</SelectItem>
                                            <SelectItem value="salary">Payroll</SelectItem>
                                            <SelectItem value="maintenance">Maintenance</SelectItem>
                                            <SelectItem value="utilities">Bills & Utilities</SelectItem>
                                            <SelectItem value="supplies">Inventory</SelectItem>
                                            <SelectItem value="transport">Logistics</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Start Timeline</Label>
                                    <div className="relative">
                                        <Input
                                            type="date"
                                            className="bg-gray-50/50 border-gray-200 pl-10 h-12"
                                            value={criteria.startDate}
                                            onChange={(e) => setCriteria({ ...criteria, startDate: e.target.value })}
                                        />
                                        <Calendar className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">End Timeline</Label>
                                    <div className="relative">
                                        <Input
                                            type="date"
                                            className="bg-gray-50/50 border-gray-200 pl-10 h-12"
                                            value={criteria.endDate}
                                            onChange={(e) => setCriteria({ ...criteria, endDate: e.target.value })}
                                        />
                                        <Calendar className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t border-gray-50">
                                <Button
                                    type="submit"
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 px-8 shadow-lg shadow-indigo-100 flex items-center gap-2 group transition-all"
                                    disabled={loading}
                                >
                                    {loading ? "Searching Repository..." : (
                                        <>
                                            Execute Search <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <AdvancedTable
                    title={`Discovered Vouchers (${rows.length})`}
                    columns={columns}
                    data={rows}
                    loading={loading}
                    pagination
                    searchable
                />
            </div>
        </DashboardLayout>
    )
}
