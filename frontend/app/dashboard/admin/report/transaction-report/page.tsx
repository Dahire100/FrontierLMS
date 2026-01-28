"use client"

import { useState } from "react"
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
import { FileText, Search, Loader2, AlertCircle } from "lucide-react"
import { API_ENDPOINTS, apiFetch } from "@/lib/api-config"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function TransactionReport() {
    const [transactions, setTransactions] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [filters, setFilters] = useState({
        startDate: "",
        endDate: "",
        type: "all"
    })

    const fetchTransactions = async () => {
        setLoading(true)
        setError(null)
        try {
            const params = new URLSearchParams(filters)
            const res = await apiFetch(`${API_ENDPOINTS.REPORTS.TRANSACTIONS}?${params}`)
            const data = await res.json()
            if (Array.isArray(data)) {
                setTransactions(data)
                if (data.length === 0) {
                    // Optionally show a toast for no results, but UI handles empty state
                }
            } else {
                setTransactions([])
            }
        } catch (err) {
            console.error(err)
            setError("Failed to search transactions. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <DashboardLayout title="Transaction Report">
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex items-center justify-end text-sm text-gray-500">
                    <span className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-indigo-500" />
                        <span className="text-indigo-900 font-medium">Report</span>
                        <span>/</span>
                        <span>Transaction Report</span>
                    </span>
                </div>

                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="text-2xl font-bold flex items-center gap-2 text-white">
                                    <Search className="h-6 w-6 text-purple-200" />
                                    Search Transactions
                                </CardTitle>
                                <p className="text-purple-100 mt-1">Filter financial records by date and type.</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="space-y-2">
                                <Label className="text-gray-700 font-medium">Transaction Type</Label>
                                <Select value={filters.type} onValueChange={(v) => setFilters({ ...filters, type: v })}>
                                    <SelectTrigger className="bg-gray-50 border-gray-200 focus:ring-purple-500 rounded-lg">
                                        <SelectValue placeholder="All" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Transactions</SelectItem>
                                        <SelectItem value="income">Income Only</SelectItem>
                                        <SelectItem value="expense">Expense Only</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-gray-700 font-medium">Start Date</Label>
                                <Input
                                    type="date"
                                    className="bg-gray-50 border-gray-200 focus:ring-purple-500 rounded-lg"
                                    value={filters.startDate}
                                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-gray-700 font-medium">End Date</Label>
                                <Input
                                    type="date"
                                    className="bg-gray-50 border-gray-200 focus:ring-purple-500 rounded-lg"
                                    value={filters.endDate}
                                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                                />
                            </div>

                            <div className="flex items-end">
                                <Button
                                    onClick={fetchTransactions}
                                    disabled={loading}
                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-200 rounded-lg h-10 transition-all font-medium"
                                >
                                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                                    Search Records
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {transactions.length > 0 && (
                    <Card className="border-0 shadow-lg overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <CardHeader className="bg-gray-50 border-b border-gray-100 p-4">
                            <CardTitle className="text-base text-gray-700 font-semibold uppercase tracking-wide">Results</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-gray-50/50">
                                        <TableRow>
                                            <TableHead className="font-bold text-xs uppercase tracking-wider text-gray-500 w-[150px]">Date</TableHead>
                                            <TableHead className="font-bold text-xs uppercase tracking-wider text-gray-500">Description</TableHead>
                                            <TableHead className="font-bold text-xs uppercase tracking-wider text-gray-500">Party</TableHead>
                                            <TableHead className="font-bold text-xs uppercase tracking-wider text-gray-500">Type</TableHead>
                                            <TableHead className="font-bold text-xs uppercase tracking-wider text-gray-500">Method</TableHead>
                                            <TableHead className="font-bold text-xs uppercase tracking-wider text-gray-500 text-right">Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {transactions.map((t) => (
                                            <TableRow key={t.id} className="hover:bg-purple-50/30 transition-colors">
                                                <TableCell className="text-gray-500 text-xs font-mono">
                                                    {format(new Date(t.date), "MMM d, yyyy")}
                                                </TableCell>
                                                <TableCell className="font-medium text-gray-900">{t.description}</TableCell>
                                                <TableCell className="text-gray-600">{t.party}</TableCell>
                                                <TableCell>
                                                    <Badge variant={t.type === 'Income' ? 'default' : 'destructive'}
                                                        className={t.type === 'Income' ? 'bg-green-100 text-green-700 hover:bg-green-200 border-green-200 shadow-none' : 'bg-red-100 text-red-700 hover:bg-red-200 border-red-200 shadow-none'}>
                                                        {t.type}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="capitalize text-gray-600 text-sm">{t.method}</TableCell>
                                                <TableCell className={`text-right font-bold ${t.type === 'Income' ? 'text-green-600' : 'text-red-600'}`}>
                                                    {t.type === 'Income' ? '+' : '-'} ₹{t.amount?.toLocaleString()}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    )
}
