"use client"

import { useState, useEffect } from "react"
import { API_URL } from "@/lib/api-config"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { History, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function RechargeHistory() {
    const [transactions, setTransactions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searching, setSearching] = useState(false)
    const [filters, setFilters] = useState({
        search: "",
        date: "",
        amount: ""
    })

    const fetchTransactions = async () => {
        try {
            setSearching(true)
            const token = localStorage.getItem("token")

            let url = `${API_URL}/api/wallet/transactions?type=credit&limit=100`
            if (filters.date) {
                url += `&startDate=${filters.date}`
            }

            const res = await fetch(url, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const data = await res.json()

            if (data.transactions && Array.isArray(data.transactions)) {
                let txns = data.transactions

                // Client-side filtering
                if (filters.search) {
                    const lowerSearch = filters.search.toLowerCase()
                    txns = txns.filter((t: any) =>
                        (t.referenceId && t.referenceId.toLowerCase().includes(lowerSearch)) ||
                        (t.description && t.description.toLowerCase().includes(lowerSearch))
                    )
                }

                if (filters.amount) {
                    txns = txns.filter((t: any) => t.amount === parseFloat(filters.amount))
                }

                setTransactions(txns)
            }
        } catch (err) {
            toast.error("Failed to load recharge history")
        } finally {
            setLoading(false)
            setSearching(false)
        }
    }

    useEffect(() => {
        fetchTransactions()
    }, [])

    const handleClear = () => {
        setFilters({ search: "", date: "", amount: "" })
        fetchTransactions()
    }

    const handleExport = () => {
        if (transactions.length === 0) return toast.error("No data to export")
        const headers = ["Tx ID", "Date", "Amount", "Description", "Reference"]
        const csv = [
            headers.join(","),
            ...transactions.map(t => [
                t.txId,
                new Date(t.date).toLocaleDateString(),
                t.amount,
                `"${t.description || ""}"`,
                t.referenceId || ""
            ].join(","))
        ].join("\n")

        const blob = new Blob([csv], { type: "text/csv" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `recharge_history_${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
    }

    const handlePrint = () => {
        window.print()
    }

    return (
        <DashboardLayout title="Recharge History">
            <div className="space-y-6">
                <Card className="no-print">
                    <CardHeader className="bg-pink-50 border-b border-pink-100">
                        <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                            <History className="h-5 w-5" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Search</Label>
                                <Input
                                    placeholder="Ref No / Description"
                                    className="bg-white border-gray-200"
                                    value={filters.search}
                                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Date From</Label>
                                <Input
                                    type="date"
                                    className="bg-white border-gray-200"
                                    value={filters.date}
                                    onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Amount</Label>
                                <Input
                                    type="number"
                                    placeholder="Exact Amount"
                                    className="bg-white border-gray-200"
                                    value={filters.amount}
                                    onChange={(e) => setFilters({ ...filters, amount: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={handleClear}>Clear</Button>
                            <Button onClick={fetchTransactions} className="bg-blue-900 hover:bg-blue-800">
                                {searching ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Search
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="print-safe">
                    <CardHeader className="bg-pink-50 border-b border-pink-100 flex flex-row justify-between items-center">
                        <CardTitle className="text-lg text-gray-800">Recharge Records</CardTitle>
                        <div className="flex gap-2 no-print">
                            <Button size="sm" variant="outline" onClick={handleExport}>Download CSV</Button>
                            <Button size="sm" variant="outline" onClick={handlePrint}>Print</Button>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="overflow-x-auto">
                            {loading ? (
                                <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-pink-50 hover:bg-pink-50">
                                            <TableHead className="font-bold text-gray-700 uppercase">Transaction ID</TableHead>
                                            <TableHead className="font-bold text-gray-700 uppercase text-right">Amount</TableHead>
                                            <TableHead className="font-bold text-gray-700 uppercase">Description</TableHead>
                                            <TableHead className="font-bold text-gray-700 uppercase">Ref</TableHead>
                                            <TableHead className="font-bold text-gray-700 uppercase">Date</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {transactions.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                    No recharge records found.
                                                </TableCell>
                                            </TableRow>
                                        ) : transactions.map((row) => (
                                            <TableRow key={row.txId}>
                                                <TableCell className="font-mono text-xs">{row.txId}</TableCell>
                                                <TableCell className="text-right text-green-700 font-bold">₹{row.amount.toFixed(2)}</TableCell>
                                                <TableCell>{row.description || '-'}</TableCell>
                                                <TableCell className="font-mono text-xs">{row.referenceId || '-'}</TableCell>
                                                <TableCell>{new Date(row.date).toLocaleDateString()}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </div>
                    </CardContent>
                </Card>
                <style jsx global>{`
                    @media print {
                        .no-print { display: none !important; }
                        .print-safe { box-shadow: none !important; border: none !important; }
                    }
                `}</style>
            </div>
        </DashboardLayout>
    )
}

