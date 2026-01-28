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

    const fetchWalletBalance = async (studentId: string) => {
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/wallet?studentId=${studentId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.balance !== undefined) {
                setCurrentBalance(data.balance)
            }
        } catch (err) {
            console.error("Failed to fetch wallet balance")
        }
    }

    const handleStudentChange = (studentId: string) => {
        setForm({ ...form, studentId })
        setCurrentBalance(null)
        if (studentId) {
            fetchWalletBalance(studentId)
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
                setForm({ studentId: "", amount: "", description: "", referenceId: "" })
                setCurrentBalance(null)
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
            </div>
        </DashboardLayout>
    )
}
