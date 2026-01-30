"use client"

import { useState, useEffect } from "react"
import { apiFetch, API_ENDPOINTS } from "@/lib/api-config"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { List, Search, Building2, CreditCard, Hash } from "lucide-react"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import { toast } from "sonner"

export default function BankList() {
    const [banks, setBanks] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filters, setFilters] = useState({
        bankName: "",
        accountName: "",
        search: ""
    })

    const fetchBanks = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (filters.bankName) params.append("bankName", filters.bankName)
            if (filters.accountName) params.append("accountName", filters.accountName)
            if (filters.search) params.append("search", filters.search)

            const res = await apiFetch(`${API_ENDPOINTS.BANK_ACCOUNTS}?${params.toString()}`)
            if (res.ok) {
                const data = await res.json()
                setBanks(data.accounts || [])
            }
        } catch (error) {
            toast.error("Failed to load bank accounts")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchBanks()
    }, [])

    const handleSearch = () => {
        fetchBanks()
    }

    const columns = [
        {
            key: "bankName",
            label: "Financial Institution",
            render: (val: string) => (
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                        <Building2 size={18} />
                    </div>
                    <span className="font-bold text-gray-900">{val}</span>
                </div>
            )
        },
        {
            key: "accountName",
            label: "Account Label",
            render: (val: string) => (
                <div className="flex items-center gap-2">
                    <CreditCard size={14} className="text-gray-400" />
                    <span className="font-medium text-gray-700">{val}</span>
                </div>
            )
        },
        {
            key: "accountNumber",
            label: "Account Number",
            render: (val: string) => <span className="font-mono text-sm tracking-wider text-gray-600">{val}</span>
        },
        {
            key: "ifscCode",
            label: "IFSC Code",
            render: (val: string) => (
                <div className="flex items-center gap-2">
                    <Hash size={14} className="text-gray-400" />
                    <span className="font-mono text-xs font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">{val}</span>
                </div>
            )
        },
        {
            key: "currentBalance",
            label: "Current Balance",
            render: (val: number) => <span className="font-bold text-emerald-600">₹{val?.toLocaleString() || '0'}</span>
        }
    ]

    return (
        <DashboardLayout title="Institutional Banking Operations">
            <div className="space-y-8 max-w-[1400px] mx-auto pb-10">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                            <div className="h-10 w-10 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-xl flex items-center justify-center shadow-lg text-white">
                                <List size={22} />
                            </div>
                            Banking Directory
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Centralized registry of all institutional bank accounts and balances</p>
                    </div>
                </div>

                <Card className="border-none shadow-xl ring-1 ring-black/5 overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-indigo-50 to-white border-b border-indigo-100">
                        <CardTitle className="text-xs flex items-center gap-2 text-indigo-800 uppercase tracking-widest font-bold">
                            <Search size={14} /> Search Intelligence
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Bank Name</Label>
                                <Input
                                    placeholder="e.g. HDFC Bank"
                                    value={filters.bankName}
                                    onChange={(e) => setFilters({ ...filters, bankName: e.target.value })}
                                    className="bg-gray-50/50 border-gray-200 h-11"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Account Label</Label>
                                <Input
                                    placeholder="e.g. Fees Collection"
                                    value={filters.accountName}
                                    onChange={(e) => setFilters({ ...filters, accountName: e.target.value })}
                                    className="bg-gray-50/50 border-gray-200 h-11"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Global Query</Label>
                                <Input
                                    placeholder="IFSC or Account Number"
                                    value={filters.search}
                                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                    className="bg-gray-50/50 border-gray-200 h-11"
                                />
                            </div>
                            <Button
                                onClick={handleSearch}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 group transition-all"
                            >
                                Filter Directory <Search size={18} className="group-hover:scale-110 transition-transform" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <AdvancedTable
                    title="Verified Accounts"
                    columns={columns}
                    data={banks}
                    loading={loading}
                    pagination
                />
            </div>
        </DashboardLayout>
    )
}

