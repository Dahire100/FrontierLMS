"use client"

import { useState } from "react"
import { apiFetch, API_ENDPOINTS } from "@/lib/api-config"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart3, PieChart, Calendar, TrendingDown, IndianRupee, FileBarChart } from "lucide-react"
import { StatCard } from "@/components/super-admin/stat-card"
import { useToast } from "@/components/ui/use-toast"

export default function ExpenseReport() {
    const { toast } = useToast()
    const [reportData, setReportData] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [filters, setFilters] = useState({
        startDate: "",
        endDate: ""
    })

    const generateReport = async () => {
        setLoading(true)
        try {
            const queryParams = new URLSearchParams()
            if (filters.startDate) queryParams.append('startDate', filters.startDate)
            if (filters.endDate) queryParams.append('endDate', filters.endDate)

            const response = await apiFetch(`${API_ENDPOINTS.EXPENSES.STATS}?${queryParams.toString()}`)
            if (response.ok) {
                const result = await response.json()
                setReportData(result.data)
                toast({ title: "Analysis Complete", description: "Spending metrics have been synthesized." })
            }
        } catch (error) {
            toast({ title: "Report Error", description: "Failed to compile financial stats", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    const tableData = reportData ? Object.entries(reportData.categoryBreakdown).map(([head, stats]: [string, any]) => ({
        head,
        count: stats.count,
        amount: stats.amount
    })) : []

    return (
        <DashboardLayout title="Financial Intelligence">
            <div className="space-y-8 max-w-[1400px] mx-auto pb-10">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                            <div className="h-10 w-10 bg-gradient-to-br from-rose-500 to-rose-700 rounded-xl flex items-center justify-center shadow-lg text-white">
                                <BarChart3 size={22} />
                            </div>
                            Expense Analytics
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Deep dive into institutional capital outflows and trends</p>
                    </div>
                </div>

                {/* Filter Section */}
                <Card className="border-none shadow-xl ring-1 ring-black/5 overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-rose-50/50 to-white border-b border-rose-100 pb-3">
                        <CardTitle className="text-xs flex items-center gap-2 text-rose-800 uppercase tracking-widest font-bold">
                            Temporal Analysis Scope
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Analysis Start</Label>
                                <div className="relative">
                                    <Input
                                        type="date"
                                        className="bg-gray-50/50 border-gray-200 pl-10 h-12"
                                        value={filters.startDate}
                                        onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                                    />
                                    <Calendar className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Analysis End</Label>
                                <div className="relative">
                                    <Input
                                        type="date"
                                        className="bg-gray-50/50 border-gray-200 pl-10 h-12"
                                        value={filters.endDate}
                                        onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                                    />
                                    <Calendar className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                                </div>
                            </div>
                            <Button
                                onClick={generateReport}
                                disabled={loading}
                                className="bg-rose-600 hover:bg-rose-700 text-white font-bold h-12 shadow-lg shadow-rose-100 flex items-center gap-2 transition-all group"
                            >
                                {loading ? "Analyzing..." : (
                                    <>
                                        Synthesize Report <FileBarChart size={18} className="group-hover:scale-110 transition-transform" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {reportData && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Summary Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <StatCard
                                title="Cumulative Expenditure"
                                value={`₹${reportData.total.toLocaleString()}`}
                                icon={TrendingDown}
                                iconColor="text-rose-600"
                                iconBgColor="bg-rose-50"
                                description="Total capital outflow in period"
                                trend={{ value: 0, label: "vs last period", isPositive: false }}
                            />
                            <StatCard
                                title="Transaction Volume"
                                value={reportData.count.toString()}
                                icon={IndianRupee}
                                iconColor="text-rose-600"
                                iconBgColor="bg-rose-50"
                                description="Processed disbursements"
                            />
                            <StatCard
                                title="Primary Head"
                                value={tableData.length > 0 ? tableData.sort((a, b) => b.amount - a.amount)[0].head : "N/A"}
                                icon={PieChart}
                                iconColor="text-rose-600"
                                iconBgColor="bg-rose-50"
                                description="Highest spending category"
                            />
                        </div>

                        {/* Summary Table */}
                        <Card className="border-none shadow-xl ring-1 ring-black/5 overflow-hidden">
                            <CardHeader className="bg-gray-50 border-b border-gray-100">
                                <CardTitle className="text-sm font-bold text-gray-600 uppercase tracking-widest">Head-wise Distribution</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                                                <TableHead className="py-4 pl-8 text-xs font-bold text-gray-500 uppercase tracking-widest">Expense Category</TableHead>
                                                <TableHead className="py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">Entry Count</TableHead>
                                                <TableHead className="py-4 pr-8 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">Total Disbursement (₹)</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {tableData.map((row) => (
                                                <TableRow key={row.head} className="hover:bg-rose-50/20 transition-colors border-b">
                                                    <TableCell className="py-5 pl-8 font-semibold text-gray-800 capitalize">{row.head}</TableCell>
                                                    <TableCell className="py-5 text-center font-mono text-gray-500">{row.count}</TableCell>
                                                    <TableCell className="py-5 pr-8 text-right font-bold text-rose-600">
                                                        ₹{row.amount.toLocaleString()}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            <TableRow className="bg-rose-50/30 hover:bg-rose-50/30">
                                                <TableCell className="py-5 pl-8 font-bold text-rose-900">Total institutional Spending</TableCell>
                                                <TableCell className="py-5 text-center font-bold text-rose-900">{reportData.count}</TableCell>
                                                <TableCell className="py-5 pr-8 text-right font-black text-rose-900 text-lg">
                                                    ₹{reportData.total.toLocaleString()}
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}

