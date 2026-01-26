"use client"

import { useState, useEffect } from "react"
import { API_URL } from "@/lib/api-config"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { WalletMinimal, Loader2, Search, TrendingUp, TrendingDown } from "lucide-react"
import { toast } from "sonner"

interface Transaction {
    txId: string
    type: "credit" | "debit"
    category: string
    amount: number
    description?: string
    date: string
    balanceAfter: number
    referenceId?: string
}

export default function WalletTransactions() {
    const [students, setStudents] = useState<any[]>([])
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)
    const [searching, setSearching] = useState(false)
    const [filters, setFilters] = useState({
        studentId: "",
        type: "all"
    })
    const [walletBalance, setWalletBalance] = useState<number | null>(null)

    useEffect(() => {
        fetchStudents()
    }, [])

    const fetchStudents = async () => {
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/students`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.success && Array.isArray(data.data)) {
                setStudents(data.data)
            }
        } catch (err) {
            toast.error("Failed to load students")
        } finally {
            setLoading(false)
        }
    }

    const fetchTransactions = async () => {
        if (!filters.studentId) {
            toast.error("Please select a student")
            return
        }

        try {
            setSearching(true)
            const token = localStorage.getItem("token")

            // Fetch wallet balance
            const walletRes = await fetch(`${API_URL}/api/wallet?studentId=${filters.studentId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const walletData = await walletRes.json()
            if (walletData.balance !== undefined) {
                setWalletBalance(walletData.balance)
            }

            // Fetch transactions
            const res = await fetch(`${API_URL}/api/wallet/transactions?studentId=${filters.studentId}&limit=100`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const data = await res.json()

            if (data.transactions && Array.isArray(data.transactions)) {
                let txns = data.transactions

                // Apply type filter
                if (filters.type && filters.type !== "all") {
                    txns = txns.filter((t: Transaction) => t.type === filters.type)
                }

                setTransactions(txns)
            }
        } catch (err) {
            toast.error("Failed to load transactions")
        } finally {
            setSearching(false)
        }
    }

    const totalCredit = transactions
        .filter(t => t.type === "credit")
        .reduce((sum, t) => sum + t.amount, 0)

    const totalDebit = transactions
        .filter(t => t.type === "debit")
        .reduce((sum, t) => sum + t.amount, 0)

    return (
        <DashboardLayout title="Wallet Transactions">
            <div className="space-y-6">
                {/* Balance Summary */}
                {walletBalance !== null && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm text-gray-500">Current Balance</div>
                                        <div className="text-2xl font-bold text-blue-600">₹{walletBalance.toFixed(2)}</div>
                                    </div>
                                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                                        <WalletMinimal className="h-6 w-6 text-blue-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm text-gray-500">Total Credit</div>
                                        <div className="text-2xl font-bold text-green-600">₹{totalCredit.toFixed(2)}</div>
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
                                        <div className="text-2xl font-bold text-red-600">₹{totalDebit.toFixed(2)}</div>
                                    </div>
                                    <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                                        <TrendingDown className="h-6 w-6 text-red-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Filters */}
                <Card>
                    <CardHeader className="bg-pink-50 border-b border-pink-100">
                        <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                            <WalletMinimal className="h-5 w-5" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label className="text-red-500">Student *</Label>
                                <Select value={filters.studentId} onValueChange={(v) => setFilters({ ...filters, studentId: v })}>
                                    <SelectTrigger className="bg-white border-gray-200">
                                        <SelectValue placeholder="Select student" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {students.map((student) => (
                                            <SelectItem key={student._id} value={student._id}>
                                                {student.firstName} {student.lastName} ({student.rollNumber})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Transaction Type</Label>
                                <Select value={filters.type} onValueChange={(v) => setFilters({ ...filters, type: v })}>
                                    <SelectTrigger className="bg-white border-gray-200">
                                        <SelectValue placeholder="All" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="credit">Credit</SelectItem>
                                        <SelectItem value="debit">Debit</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-end">
                                <Button onClick={fetchTransactions} disabled={searching} className="bg-blue-900 hover:bg-blue-800 w-full">
                                    {searching ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                                    Search
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Transactions Table */}
                <Card>
                    <CardHeader className="bg-pink-50 border-b border-pink-100">
                        <CardTitle className="text-lg text-gray-800">Transaction History ({transactions.length})</CardTitle>
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
                                            <TableHead className="font-bold text-gray-700 uppercase">Type</TableHead>
                                            <TableHead className="font-bold text-gray-700 uppercase">Category</TableHead>
                                            <TableHead className="font-bold text-gray-700 uppercase">Description</TableHead>
                                            <TableHead className="font-bold text-gray-700 uppercase text-right">Amount</TableHead>
                                            <TableHead className="font-bold text-gray-700 uppercase text-right">Balance After</TableHead>
                                            <TableHead className="font-bold text-gray-700 uppercase">Date</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {transactions.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                                    No transactions found. Select a student and click Search.
                                                </TableCell>
                                            </TableRow>
                                        ) : transactions.map((txn) => (
                                            <TableRow key={txn.txId}>
                                                <TableCell className="font-mono text-xs">{txn.txId}</TableCell>
                                                <TableCell>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${txn.type === "credit"
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-red-100 text-red-800"
                                                        }`}>
                                                        {txn.type.toUpperCase()}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="capitalize">{txn.category.replace('_', ' ')}</TableCell>
                                                <TableCell className="text-sm">{txn.description || '-'}</TableCell>
                                                <TableCell className={`text-right font-semibold ${txn.type === "credit" ? "text-green-600" : "text-red-600"
                                                    }`}>
                                                    {txn.type === "credit" ? "+" : "-"}₹{txn.amount.toFixed(2)}
                                                </TableCell>
                                                <TableCell className="text-right font-bold">₹{txn.balanceAfter.toFixed(2)}</TableCell>
                                                <TableCell>{new Date(txn.date).toLocaleDateString()}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
