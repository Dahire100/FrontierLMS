"use client"

import { useState, useEffect } from "react"
import { apiFetch, API_ENDPOINTS } from "@/lib/api-config"
import DashboardLayout from "@/components/dashboard-layout"
import { StatCard } from "@/components/super-admin/stat-card"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
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
import { Search, Filter, Calendar, Receipt, DollarSign, TrendingUp } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface SearchResult {
    id: string
    incomeHead: string
    invoiceNo: string
    amount: number
    date: string
    incomeFrom?: string
}

export default function SearchIncome() {
    const { toast } = useToast()
    const [heads, setHeads] = useState<any[]>([])
    const [results, setResults] = useState<SearchResult[]>([])
    const [loading, setLoading] = useState(false)
    const [criteria, setCriteria] = useState({
        incomeHead: "all",
        dateFrom: "",
        dateTo: "",
        search: ""
    })

    useEffect(() => {
        fetchHeads()
    }, [])

    const fetchHeads = async () => {
        try {
            const res = await apiFetch(API_ENDPOINTS.INCOME.HEADS)
            if (res.ok) {
                const data = await res.json()
                setHeads(data.data || [])
            }
        } catch (e) { }
    }

    const handleSearch = async () => {
        setLoading(true)
        try {
            const queryParams = new URLSearchParams()
            if (criteria.incomeHead && criteria.incomeHead !== "all") queryParams.append('category', criteria.incomeHead)
            if (criteria.dateFrom) queryParams.append('dateFrom', criteria.dateFrom)
            if (criteria.dateTo) queryParams.append('dateTo', criteria.dateTo)
            if (criteria.search) queryParams.append('search', criteria.search)

            const response = await apiFetch(`${API_ENDPOINTS.INCOME.SEARCH}?${queryParams.toString()}`)
            if (response.ok) {
                const data = await response.json()
                const mappedArray = Array.isArray(data) ? data : data.data || []
                setResults(mappedArray.map((item: any) => ({
                    id: item._id,
                    incomeHead: item.category || item.incomeHead,
                    invoiceNo: item.receiptNumber || item.invoiceNo,
                    amount: item.amount,
                    date: new Date(item.incomeDate || item.date).toLocaleDateString(),
                    incomeFrom: item.receivedFrom || item.incomeFrom
                })))
                toast({ title: "Success", description: `Found ${mappedArray.length} matching records` })
            }
        } catch (error) {
            console.error('Error searching:', error)
        } finally {
            setLoading(false)
        }
    }

    const columns = [
        {
            key: "invoiceNo",
            label: "Invoice",
            sortable: true,
            render: (value: string) => (
                <div className="flex items-center gap-2">
                    <Receipt className="h-4 w-4 text-orange-600" />
                    <span className="font-bold text-orange-700">{value}</span>
                </div>
            )
        },
        {
            key: "incomeHead",
            label: "Head",
            sortable: true
        },
        {
            key: "incomeFrom",
            label: "Source",
            sortable: true,
            render: (value: string) => <span className="text-xs text-gray-600">{value || "N/A"}</span>
        },
        {
            key: "date",
            label: "Date",
            sortable: true,
            render: (value: string) => (
                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <Calendar size={14} className="text-gray-400" /> {value}
                </div>
            )
        },
        {
            key: "amount",
            label: "Amount",
            sortable: true,
            render: (value: number) => (
                <span className="font-bold text-emerald-700">₹{value.toLocaleString()}</span>
            )
        }
    ]

    const stats = {
        total: results.length,
        totalAmount: results.reduce((sum, r) => sum + r.amount, 0)
    }

    return (
        <DashboardLayout title="Income Search">
            <div className="space-y-6 max-w-[1600px] mx-auto pb-10">

                {/* Header */}
                <div className="flex items-center gap-2">
                    <div className="h-10 w-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Search className="text-white" size={20} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                            Advanced Income Search
                        </h1>
                        <p className="text-sm text-gray-500">Query and filter income transactions with precision</p>
                    </div>
                </div>

                {/* Search Criteria */}
                <Card>
                    <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-100">
                        <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                            <Filter className="h-5 w-5 text-orange-600" />
                            Search Criteria
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="incomeHead">Income Head</Label>
                                <Select value={criteria.incomeHead} onValueChange={(val) => setCriteria({ ...criteria, incomeHead: val })}>
                                    <SelectTrigger className="bg-white border-gray-200">
                                        <SelectValue placeholder="All Heads" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Heads</SelectItem>
                                        {heads.map(h => (
                                            <SelectItem key={h._id} value={h.name}>{h.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dateFrom">Date From</Label>
                                <Input
                                    id="dateFrom"
                                    type="date"
                                    value={criteria.dateFrom}
                                    onChange={(e) => setCriteria({ ...criteria, dateFrom: e.target.value })}
                                    className="bg-white border-gray-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dateTo">Date To</Label>
                                <Input
                                    id="dateTo"
                                    type="date"
                                    value={criteria.dateTo}
                                    onChange={(e) => setCriteria({ ...criteria, dateTo: e.target.value })}
                                    className="bg-white border-gray-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="search">Keyword Search</Label>
                                <Input
                                    id="search"
                                    placeholder="Search by invoice, name..."
                                    value={criteria.search}
                                    onChange={(e) => setCriteria({ ...criteria, search: e.target.value })}
                                    className="bg-white border-gray-200"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-4 mt-6">
                            <Button
                                variant="outline"
                                onClick={() => setCriteria({ incomeHead: "all", dateFrom: "", dateTo: "", search: "" })}
                            >
                                Clear Filters
                            </Button>
                            <Button onClick={handleSearch} className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
                                <Search className="h-4 w-4 mr-2" />
                                Execute Search
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats */}
                {results.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <StatCard
                            title="Results Found"
                            value={stats.total.toString()}
                            icon={Receipt}
                            iconColor="text-orange-600"
                            iconBgColor="bg-orange-50"
                            description="Matching records"
                        />
                        <StatCard
                            title="Total Value"
                            value={`₹${stats.totalAmount.toLocaleString()}`}
                            icon={TrendingUp}
                            iconColor="text-emerald-600"
                            iconBgColor="bg-emerald-50"
                            description="Sum of results"
                        />
                    </div>
                )}

                {/* Results */}
                {results.length > 0 && (
                    <AdvancedTable
                        title="Search Results"
                        columns={columns}
                        data={results}
                        loading={loading}
                        pagination
                    />
                )}

                {!loading && results.length === 0 && (
                    <Card>
                        <CardContent className="py-20 text-center">
                            <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Results Yet</h3>
                            <p className="text-sm text-gray-500">Enter your search criteria and click "Execute Search" to find income records</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    )
}
