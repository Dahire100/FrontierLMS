"use client"

import { useState, useEffect } from "react"
import { API_URL } from "@/lib/api-config"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { PlusCircle, Loader2, Wallet } from "lucide-react"
import { toast } from "sonner"

export default function WalletRecharge() {
    const [students, setStudents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [form, setForm] = useState({
        studentId: "",
        amount: "",
        description: "",
        referenceId: ""
    })
    const [currentBalance, setCurrentBalance] = useState<number | null>(null)
    const [transactions, setTransactions] = useState<any[]>([])

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
            if (Array.isArray(data)) {
                setStudents(data)
            } else if (data.success && Array.isArray(data.data)) {
                setStudents(data.data)
            }
        } catch (err) {
            toast.error("Failed to load students")
        } finally {
            setLoading(false)
        }
    }

    const fetchWalletData = async (studentId: string) => {
        try {
            const token = localStorage.getItem("token")

            // Fetch Balance
            const balanceRes = await fetch(`${API_URL}/api/wallet?studentId=${studentId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const balanceData = await balanceRes.json()
            if (balanceData.balance !== undefined) {
                setCurrentBalance(balanceData.balance)
            }

            // Fetch Transactions
            const txRes = await fetch(`${API_URL}/api/wallet/transactions?studentId=${studentId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            if (txRes.ok) {
                const txData = await txRes.json()
                setTransactions(txData.transactions || [])
            }
        } catch (err) {
            console.error("Failed to fetch wallet data")
        }
    }

    const handleStudentChange = (studentId: string) => {
        setForm({ ...form, studentId })
        setCurrentBalance(null)
        setTransactions([])
        if (studentId) {
            fetchWalletData(studentId)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.studentId || !form.amount) {
            toast.error("Student and amount are required")
            return
        }

        const amount = parseFloat(form.amount)
        if (isNaN(amount) || amount <= 0) {
            toast.error("Please enter a valid amount")
            return
        }

        setSubmitting(true)
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/wallet/add-money`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    studentId: form.studentId,
                    amount: amount,
                    description: form.description || "Wallet Recharge",
                    referenceId: form.referenceId
                })
            })

            const data = await res.json()
            if (data.message || res.ok) {
                toast.success(`Wallet recharged successfully! New balance: ₹${data.newBalance}`)
                setForm({ ...form, amount: "", description: "", referenceId: "" })
                fetchWalletData(form.studentId) // Refresh data
            } else {
                toast.error(data.error || "Failed to recharge wallet")
            }
        } catch (err) {
            toast.error("Failed to recharge wallet")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <DashboardLayout title="Wallet Recharge">
            <div className="space-y-6">
                <Card>
                    <CardHeader className="bg-pink-50 border-b border-pink-100">
                        <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                            <PlusCircle className="h-5 w-5" />
                            Recharge Student Wallet
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-red-500">Student *</Label>
                                    <Select value={form.studentId} onValueChange={handleStudentChange}>
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

                                {currentBalance !== null && (
                                    <div className="space-y-2">
                                        <Label>Current Balance</Label>
                                        <div className="flex items-center gap-2 h-10 px-3 bg-green-50 border border-green-200 rounded-md">
                                            <Wallet className="h-4 w-4 text-green-600" />
                                            <span className="font-bold text-green-700">₹{currentBalance.toFixed(2)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-red-500">Amount *</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={form.amount}
                                        onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                        placeholder="Enter amount"
                                        className="bg-white border-gray-200"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Reference No. (Optional)</Label>
                                    <Input
                                        value={form.referenceId}
                                        onChange={(e) => setForm({ ...form, referenceId: e.target.value })}
                                        placeholder="Transaction / Receipt ID"
                                        className="bg-white border-gray-200"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Description (Optional)</Label>
                                <Textarea
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder="e.g., Monthly allowance, Canteen recharge"
                                    rows={2}
                                    className="bg-white border-gray-200"
                                />
                            </div>

                            <div className="flex justify-end">
                                <Button type="submit" disabled={submitting} className="bg-blue-900 hover:bg-blue-800 px-8">
                                    {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    {submitting ? "Processing..." : "Recharge Wallet"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Transaction History */}
                {form.studentId && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Recent Transactions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="relative w-full overflow-auto">
                                <table className="w-full caption-bottom text-sm text-left">
                                    <thead className="[&_tr]:border-b">
                                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Date</th>
                                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Type</th>
                                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Description</th>
                                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Amount</th>
                                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Balance After</th>
                                        </tr>
                                    </thead>
                                    <tbody className="[&_tr:last-child]:border-0">
                                        {transactions.map((tx: any, i) => (
                                            <tr key={i} className="border-b transition-colors hover:bg-muted/50">
                                                <td className="p-4 align-middle">{new Date(tx.date).toLocaleDateString()}</td>
                                                <td className="p-4 align-middle capitalize">{tx.type}</td>
                                                <td className="p-4 align-middle">{tx.description}</td>
                                                <td className={`p-4 align-middle font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                                                    {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
                                                </td>
                                                <td className="p-4 align-middle">₹{tx.balanceAfter}</td>
                                            </tr>
                                        ))}
                                        {transactions.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="p-4 text-center text-gray-500">No transactions found</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    )
}
