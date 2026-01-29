"use client"

import { useState, useEffect } from "react"
import { apiFetch, API_ENDPOINTS } from "@/lib/api-config"
import DashboardLayout from "@/components/dashboard-layout"
import { StatCard } from "@/components/super-admin/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart2, FileText, Download, TrendingUp, Receipt, DollarSign } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface ReportRow {
    head: string
    count: number
    amount: number
}

export default function IncomeReport() {
    const { toast } = useToast()
    const [heads, setHeads] = useState<any[]>([])
    const [report, setReport] = useState<ReportRow[]>([])
    const [loading, setLoading] = useState(false)
    const [filters, setFilters] = useState({
        incomeHead: "all",
        dateFrom: "",
        dateTo: ""
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

    const generateReport = async () => {
        setLoading(true)
        try {
            const queryParams = new URLSearchParams()
            if (filters.incomeHead && filters.incomeHead !== "all") queryParams.append('incomeHead', filters.incomeHead)
            if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom)
            if (filters.dateTo) queryParams.append('dateTo', filters.dateTo)

            const response = await apiFetch(`${API_ENDPOINTS.INCOME.STATS}?${queryParams.toString()}`)
            if (response.ok) {
                const data = await response.json()
                setReport(data.report || [])
                toast({ title: "Success", description: "Report generated successfully" })
            }
        } catch (error) {
            console.error('Error generating report:', error)
        } finally {
            setLoading(false)
        }
    }

    const stats = {
        totalHeads: report.length,
        totalEntries: report.reduce((sum, r) => sum + r.count, 0),
        totalAmount: report.reduce((sum, r) => sum + r.amount, 0)
    }

    return (
        <DashboardLayout title="Income Report">
            <div className="space-y-6 max-w-[1600px] mx-auto pb-10">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="h-10 w-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                            <BarChart2 className="text-white" size={20} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                                Income Analytics Report
                            </h1>
                            <p className="text-sm text-gray-500">Generate comprehensive income summaries and insights</p>
                        </div>
                    </div>
                    {report.length > 0 && (
                        <div className="flex gap-2">
                            <Button variant="outline" className="gap-2">
                                <FileText className="h-4 w-4" /> Export PDF
                            </Button>
                            <Button variant="outline" className="gap-2">
                                <Download className="h-4 w-4" /> Export CSV
                            </Button>
                        </div>
                    )}
                </div>

                {/* Report Generation */}
                <Card>
                    <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
                        <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                            <BarChart2 className="h-5 w-5 text-indigo-600" />
                            Report Parameters
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label>Income Head</Label>
                                <Select value={filters.incomeHead} onValueChange={(val) => setFilters({ ...filters, incomeHead: val })}>
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
                                <Label>Date From</Label>
                                <Input
                                    type="date"
                                    value={filters.dateFrom}
                                    onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                                    className="bg-white border-gray-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Date To</Label>
                                <Input
                                    type="date"
                                    value={filters.dateTo}
                                    onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                                    className="bg-white border-gray-200"
                                />
                            </div>
                            <div className="flex items-end">
                                <Button
                                    onClick={generateReport}
                                    disabled={loading}
                                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 w-full"
                                >
                                    {loading ? "Generating..." : "Generate Report"}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats */}
                {report.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard
                            title="Revenue Categories"
                            value={stats.totalHeads.toString()}
                            icon={Receipt}
                            iconColor="text-indigo-600"
                            iconBgColor="bg-indigo-50"
                            description="Income heads"
                        />
                        <StatCard
                            title="Total Transactions"
                            value={stats.totalEntries.toString()}
                            icon={TrendingUp}
                            iconColor="text-purple-600"
                            iconBgColor="bg-purple-50"
                            description="All entries"
                        />
                        <StatCard
                            title="Cumulative Revenue"
                            value={`₹${stats.totalAmount.toLocaleString()}`}
                            icon={DollarSign}
                            iconColor="text-emerald-600"
                            iconBgColor="bg-emerald-50"
                            description="Total income"
                        />
                    </div>
                )}

                {/* Report Table */}
                {report.length > 0 && (
                    <Card>
                        <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
                            <CardTitle className="text-lg text-gray-800">Summary by Income Head</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-indigo-50 hover:bg-indigo-50">
                                            <TableHead className="font-bold text-gray-700 uppercase">Revenue Category</TableHead>
                                            <TableHead className="font-bold text-gray-700 uppercase text-right">Transaction Count</TableHead>
                                            <TableHead className="font-bold text-gray-700 uppercase text-right">Total Amount</TableHead>
                                            <TableHead className="font-bold text-gray-700 uppercase text-right">Percentage</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {report.map((row) => (
                                            <TableRow key={row.head}>
                                                <TableCell className="font-medium text-gray-900">{row.head}</TableCell>
                                                <TableCell className="text-right text-gray-700">{row.count}</TableCell>
                                                <TableCell className="text-right font-bold text-emerald-700">₹{row.amount.toLocaleString()}</TableCell>
                                                <TableCell className="text-right text-indigo-600 font-semibold">
                                                    {((row.amount / stats.totalAmount) * 100).toFixed(1)}%
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        <TableRow className="bg-gray-50 font-bold">
                                            <TableCell>TOTAL</TableCell>
                                            <TableCell className="text-right">{stats.totalEntries}</TableCell>
                                            <TableCell className="text-right text-emerald-700">₹{stats.totalAmount.toLocaleString()}</TableCell>
                                            <TableCell className="text-right">100%</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {!loading && report.length === 0 && (
                    <Card>
                        <CardContent className="py-20 text-center">
                            <BarChart2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Report Generated</h3>
                            <p className="text-sm text-gray-500">Select your parameters and click "Generate Report" to view income analytics</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    )
}

