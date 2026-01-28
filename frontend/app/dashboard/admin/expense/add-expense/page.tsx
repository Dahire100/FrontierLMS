"use client"

import { useState, useEffect } from "react"
import { apiFetch, API_ENDPOINTS } from "@/lib/api-config"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Edit,
    Trash2,
    Receipt,
    TrendingDown,
    Plus,
    Calendar,
    DollarSign,
    User,
    ArrowRight
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { StatCard } from "@/components/super-admin/stat-card"
import { AdvancedTable } from "@/components/super-admin/advanced-table"

interface ExpenseItem {
    id: string
    expenseHead: string
    name: string
    accountName?: string
    invoiceNo: string
    amount: number
    date: string
    description?: string
    createdBy: string
    approvedBy: string
}

export default function AddExpense() {
    const { toast } = useToast()
    const [heads, setHeads] = useState<any[]>([])
    const [expenses, setExpenses] = useState<ExpenseItem[]>([])
    const [loading, setLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [formData, setFormData] = useState({
        expenseHead: "",
        accountType: "",
        accountName: "",
        name: "",
        amount: "",
        invoiceNo: "",
        date: new Date().toISOString().split('T')[0],
        paymentMethod: "",
        description: ""
    })

    useEffect(() => {
        fetchHeads()
        fetchExpenses()
    }, [])

    const fetchHeads = async () => {
        try {
            const res = await apiFetch(API_ENDPOINTS.EXPENSES.HEADS)
            if (res.ok) {
                const data = await res.json()
                setHeads(data.data || [])
            }
        } catch (e) { }
    }

    const fetchExpenses = async () => {
        setLoading(true)
        try {
            const response = await apiFetch(API_ENDPOINTS.EXPENSES.BASE)
            if (response.ok) {
                const result = await response.json()
                const data = Array.isArray(result) ? result : result.data || []
                setExpenses(data.map((item: any) => ({
                    id: item._id,
                    expenseHead: item.category,
                    name: item.title,
                    accountName: item.paymentMethod,
                    invoiceNo: item.receiptNumber,
                    amount: item.amount,
                    date: new Date(item.expenseDate).toLocaleDateString(),
                    description: item.description,
                    createdBy: item.addedBy?.firstName || "N/A",
                    approvedBy: "-"
                })))
            }
        } catch (error) {
            console.error('Error fetching expenses:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            const response = await apiFetch(API_ENDPOINTS.EXPENSES.BASE, {
                method: 'POST',
                body: JSON.stringify({
                    ...formData,
                    amount: parseFloat(formData.amount)
                })
            })
            if (response.ok) {
                toast({ title: "Success", description: "Expense recorded successfully" })
                setFormData({
                    expenseHead: "",
                    accountType: "",
                    accountName: "",
                    name: "",
                    amount: "",
                    invoiceNo: "",
                    date: new Date().toISOString().split('T')[0],
                    paymentMethod: "",
                    description: ""
                })
                fetchExpenses()
            } else {
                toast({ title: "Error", description: "Failed to record expense", variant: "destructive" })
            }
        } catch (error) {
            toast({ title: "Error", description: "Connection error", variant: "destructive" })
        } finally {
            setIsSubmitting(false)
        }
    }

    const columns = [
        {
            key: "expenseHead",
            label: "Expense Head",
            render: (val: string) => (
                <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-pink-100 text-pink-700 font-semibold text-[10px] uppercase">
                        {val}
                    </span>
                </div>
            )
        },
        { key: "name", label: "Merchant/Paid To", sortable: true },
        {
            key: "amount",
            label: "Amount",
            render: (val: number) => (
                <span className="font-bold text-red-600">₹{val.toLocaleString()}</span>
            )
        },
        { key: "date", label: "Date" },
        {
            key: "invoiceNo",
            label: "Invoice",
            render: (val: string) => <span className="text-xs font-mono text-gray-500">#{val}</span>
        },
        {
            key: "createdBy",
            label: "Authored By",
            render: (val: string) => (
                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <User size={12} className="text-gray-400" /> {val}
                </div>
            )
        }
    ]

    return (
        <DashboardLayout title="Expense Management">
            <div className="space-y-6 max-w-[1600px] mx-auto pb-10">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                            <div className="h-10 w-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
                                <TrendingDown className="text-white" size={20} />
                            </div>
                            Expense Ledger
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Track institutional spending and financial outflows</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Add Form */}
                    <div className="lg:col-span-1">
                        <Card className="border-none shadow-xl ring-1 ring-black/5 overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-pink-50 to-white border-b border-pink-100">
                                <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                                    <Plus className="h-5 w-5 text-pink-600" />
                                    New Disbursement
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Expense Category *</Label>
                                            <Select value={formData.expenseHead} onValueChange={(val) => setFormData({ ...formData, expenseHead: val })}>
                                                <SelectTrigger className="bg-gray-50/50 border-gray-200">
                                                    <SelectValue placeholder="Select Category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {heads.length > 0 ? heads.map(h => (
                                                        <SelectItem key={h._id} value={h.name}>{h.name}</SelectItem>
                                                    )) : (
                                                        <>
                                                            <SelectItem value="Salary">Salary</SelectItem>
                                                            <SelectItem value="Maintenance">Maintenance</SelectItem>
                                                            <SelectItem value="Utilities">Utilities</SelectItem>
                                                            <SelectItem value="Other">Other</SelectItem>
                                                        </>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Merchant / Paid To *</Label>
                                            <Input
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="e.g. Utility Co, Staff Name"
                                                className="bg-gray-50/50 border-gray-200"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Amount (₹) *</Label>
                                                <Input
                                                    type="number"
                                                    value={formData.amount}
                                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                                    placeholder="0.00"
                                                    className="bg-gray-50/50 border-gray-200 font-semibold text-pink-700"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Invoice / Ref *</Label>
                                                <Input
                                                    value={formData.invoiceNo}
                                                    onChange={(e) => setFormData({ ...formData, invoiceNo: e.target.value })}
                                                    placeholder="REF-001"
                                                    className="bg-gray-50/50 border-gray-200"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Date *</Label>
                                                <div className="relative">
                                                    <Input
                                                        type="date"
                                                        value={formData.date}
                                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                                        className="bg-gray-50/50 border-gray-200 pl-9"
                                                    />
                                                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Payment Mode *</Label>
                                                <Select value={formData.paymentMethod} onValueChange={(val) => setFormData({ ...formData, paymentMethod: val })}>
                                                    <SelectTrigger className="bg-gray-50/50 border-gray-200">
                                                        <SelectValue placeholder="Method" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="cash">Cash</SelectItem>
                                                        <SelectItem value="bank">Bank</SelectItem>
                                                        <SelectItem value="online">Online</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Description</Label>
                                            <Textarea
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                placeholder="Brief transaction notes..."
                                                className="bg-gray-50/50 border-gray-200"
                                                rows={3}
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        disabled={isSubmitting}
                                        className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-bold h-12 shadow-lg shadow-pink-100 flex items-center justify-center gap-2 group transition-all"
                                    >
                                        {isSubmitting ? "Processing..." : (
                                            <>
                                                Record Disbursement <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Table Section */}
                    <div className="lg:col-span-2">
                        <AdvancedTable
                            title="Transaction History"
                            columns={columns}
                            data={expenses}
                            loading={loading}
                            searchable
                            pagination
                            searchPlaceholder="Search by merchant, invoice or head..."
                        />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
