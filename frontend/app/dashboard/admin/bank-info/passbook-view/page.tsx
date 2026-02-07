"use client"

import { useState, useEffect, Suspense } from "react"
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
import { BookOpen, Loader2, TrendingUp, TrendingDown, Printer, Download, RefreshCw } from "lucide-react"
import { API_URL } from "@/lib/api-config"
import { toast } from "sonner"
import { useRouter, useSearchParams } from "next/navigation"

interface BankAccount {
    _id: string
    accountName: string
    bankName: string
    accountNumber: string
    currentBalance: number
}

interface Transaction {
    _id?: string
    date: string
    type: "credit" | "debit"
    amount: number
    description?: string
    reference?: string
    balanceAfter?: number
}

function PassbookContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const initialAccountId = searchParams?.get("id") || ""

    const [banks, setBanks] = useState<BankAccount[]>([])
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(false)
    const [filters, setFilters] = useState({
        accountId: initialAccountId,
        dateFrom: "",
        dateTo: "",
        type: ""
    })

    useEffect(() => {
        if (initialAccountId) {
            setFilters(prev => ({ ...prev, accountId: initialAccountId }))
        }
    }, [initialAccountId])

    const fetchBanks = async () => {
        try {
            const token = localStorage.getItem("token")
            const response = await fetch(`${API_URL}/api/bank-accounts`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const data = await response.json()

            if (data.accounts) {
                setBanks(data.accounts)
            } else if (data.success && data.data) {
                setBanks(data.data)
            }
        } catch (error) {
            console.error("Error fetching banks:", error)
        }
    }

    const fetchTransactions = async () => {
        if (!filters.accountId) {
            toast.error("Please select a bank account")
            return
        }

        try {
            setLoading(true)
            const token = localStorage.getItem("token")
            const response = await fetch(`${API_URL}/api/bank-accounts/${filters.accountId}/transactions`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const data = await response.json()

            if (data.success || Array.isArray(data)) {
                let txns = data.data || data || [] // Handle varying response structure
                if (Array.isArray(data)) txns = data

                // Apply filters
                if (filters.dateFrom) {
                    txns = txns.filter((t: Transaction) => new Date(t.date) >= new Date(filters.dateFrom))
                }
                if (filters.dateTo) {
                    txns = txns.filter((t: Transaction) => new Date(t.date) <= new Date(filters.dateTo))
                }
                if (filters.type) {
                    txns = txns.filter((t: Transaction) => t.type === filters.type)
                }

                setTransactions(txns)
            } else {
                toast.error("Failed to fetch transactions")
            }
        } catch (error) {
            console.error("Error fetching transactions:", error)
            toast.error("Failed to fetch transactions")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchBanks()
    }, [])

    // Auto-fetch if account ID is provided and banks are loaded
    useEffect(() => {
        if (filters.accountId && banks.length > 0 && transactions.length === 0) {
            fetchTransactions()
        }
    }, [banks, filters.accountId])

    const handleClear = () => {
        setFilters({
            accountId: "",
            dateFrom: "",
            dateTo: "",
            type: ""
        })
        setTransactions([])
        router.push('/dashboard/admin/bank-info/passbook-view')
    }

    const handleExportCSV = () => {
        if (transactions.length === 0) {
            toast.error("No data to export")
            return
        }

        const headers = ["Date", "Type", "Amount", "Description", "Reference", "Balance After"]
        const csvContent = [
            headers.join(","),
            ...transactions.map(t => [
                new Date(t.date).toLocaleDateString(),
                t.type,
                t.amount,
                `"${t.description || ""}"`,
                t.reference || "",
                t.balanceAfter || ""
            ].join(","))
        ].join("\n")

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.setAttribute("href", url)
        link.setAttribute("download", `passbook_export_${new Date().toISOString().split('T')[0]}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const handlePrint = () => {
        window.print()
    }

    const selectedAccount = banks.find(b => b._id === filters.accountId)

    const totalCredit = transactions
        .filter(t => t.type === "credit")
        .reduce((sum, t) => sum + t.amount, 0)

    const totalDebit = transactions
        .filter(t => t.type === "debit")
        .reduce((sum, t) => sum + t.amount, 0)

    return (
        <div className="space-y-6">
            {/* Account Summary */}
            {selectedAccount && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 no-print">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-sm text-gray-500">Account Name</div>
                            <div className="text-lg font-bold">{selectedAccount.accountName}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-sm text-gray-500">Bank</div>
                            <div className="text-lg font-bold">{selectedAccount.bankName}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-sm text-gray-500">Current Balance</div>
                            <div className="text-lg font-bold text-green-600">
                                ₹{selectedAccount.currentBalance.toLocaleString()}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-sm text-gray-500">Transactions</div>
                            <div className="text-lg font-bold">{transactions.length}</div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Filters */}
            <Card className="no-print">
                <CardHeader className="bg-pink-50 border-b border-pink-100">
                    <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                        <BookOpen className="h-5 w-5" />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label className="text-red-500">Bank Account *</Label>
                            <Select value={filters.accountId} onValueChange={(value) => setFilters({ ...filters, accountId: value })}>
                                <SelectTrigger className="bg-white border-gray-200">
                                    <SelectValue placeholder="Select bank account" />
                                </SelectTrigger>
                                <SelectContent>
                                    {banks.map((bank) => (
                                        <SelectItem key={bank._id} value={bank._id}>
                                            {bank.accountName} - {bank.bankName}
                                        </SelectItem>
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
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
                                <SelectTrigger className="bg-white border-gray-200">
                                    <SelectValue placeholder="All" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="credit">Credit</SelectItem>
                                    <SelectItem value="debit">Debit</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-500 italic">Select an account to view its transaction history.</p>
                        <div className="flex gap-2">
                            <Button onClick={handleClear} variant="outline" className="border-gray-300">
                                <RefreshCw className="h-4 w-4 mr-2" /> Clear
                            </Button>
                            <Button onClick={fetchTransactions} className="bg-blue-900 hover:bg-blue-800">
                                Search
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Transaction Summary */}
            {transactions.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm text-gray-500">Total Credit</div>
                                    <div className="text-2xl font-bold text-green-600">
                                        ₹{totalCredit.toLocaleString()}
                                    </div>
                                </div>
                                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                                    <TrendingUp className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm text-gray-500">Total Debit</div>
                                    <div className="text-2xl font-bold text-red-600">
                                        ₹{totalDebit.toLocaleString()}
                                    </div>
                                </div>
                                <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                                    <TrendingDown className="h-6 w-6 text-red-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Ledger */}
            <Card className="print-safe">
                <CardHeader className="bg-pink-50 border-b border-pink-100 flex flex-row justify-between items-center">
                    <CardTitle className="text-lg text-gray-800">Ledger</CardTitle>
                    <div className="flex gap-2 no-print">
                        <Button size="sm" variant="outline" onClick={handleExportCSV}>
                            <Download className="h-4 w-4 mr-2" /> Export CSV
                        </Button>
                        <Button size="sm" variant="outline" onClick={handlePrint}>
                            <Printer className="h-4 w-4 mr-2" /> Print
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-900" />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-pink-50 hover:bg-pink-50">
                                        <TableHead className="font-bold text-gray-700 uppercase">Date</TableHead>
                                        <TableHead className="font-bold text-gray-700 uppercase">Type</TableHead>
                                        <TableHead className="font-bold text-gray-700 uppercase text-right">Amount</TableHead>
                                        <TableHead className="font-bold text-gray-700 uppercase">Description</TableHead>
                                        <TableHead className="font-bold text-gray-700 uppercase">Reference</TableHead>
                                        <TableHead className="font-bold text-gray-700 uppercase text-right">Balance After</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transactions.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                                                No transactions found. Select a bank account and click Search.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        transactions.map((row, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{new Date(row.date).toLocaleDateString()}</TableCell>
                                                <TableCell>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.type === "credit"
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-red-100 text-red-800"
                                                        }`}>
                                                        {row.type.toUpperCase()}
                                                    </span>
                                                </TableCell>
                                                <TableCell className={`text-right font-semibold ${row.type === "credit" ? "text-green-600" : "text-red-600"
                                                    }`}>
                                                    {row.type === "credit" ? "+" : "-"}₹{row.amount.toFixed(2)}
                                                </TableCell>
                                                <TableCell>{row.description || "-"}</TableCell>
                                                <TableCell className="font-mono text-xs">{row.reference || "-"}</TableCell>
                                                <TableCell className="text-right font-semibold">
                                                    ₹{row.balanceAfter?.toFixed(2) || "-"}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
            <style jsx global>{`
                    @media print {
                        .no-print { display: none !important; }
                        .print-safe { box-shadow: none !important; border: none !important; }
                    }
                `}</style>
        </div>
    )
}

export default function PassbookView() {
    return (
        <DashboardLayout title="Passbook View">
            <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>}>
                <PassbookContent />
            </Suspense>
        </DashboardLayout>
    )
}
