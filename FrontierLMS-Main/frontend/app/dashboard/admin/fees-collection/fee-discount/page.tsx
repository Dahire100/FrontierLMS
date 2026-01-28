"use client"

import { useState, useEffect, useCallback } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Edit, List, Trash2, Loader2, RefreshCcw } from "lucide-react"
import { toast } from "sonner"
import { apiFetch, API_ENDPOINTS } from "@/lib/api-config"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface FeeDiscount {
    _id: string
    name: string
    discountCode: string
    amount: number
    description: string
}

import { AdvancedTable } from "@/components/super-admin/advanced-table"
import { Tag, Search, AlertCircle, Percent } from "lucide-react"

export default function FeeDiscount() {
    const [searchTerm, setSearchTerm] = useState("")
    const [discounts, setDiscounts] = useState<FeeDiscount[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        name: "",
        discountCode: "",
        amount: "",
        description: ""
    })

    const fetchDiscounts = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const res = await apiFetch(API_ENDPOINTS.FEES.DISCOUNTS)
            if (res.ok) {
                const data = await res.json()
                setDiscounts(data)
            } else {
                setError("Failed to fetch discounts")
            }
        } catch (err) {
            setError("Network error")
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchDiscounts()
    }, [fetchDiscounts])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.name || !formData.discountCode || !formData.amount) {
            toast.error("Please fill all required fields")
            return
        }

        setIsSubmitting(true)
        try {
            const res = await apiFetch(API_ENDPOINTS.FEES.DISCOUNTS, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                toast.success("Discount added successfully")
                setFormData({ name: "", discountCode: "", amount: "", description: "" })
                fetchDiscounts()
            } else {
                toast.error("Failed to add discount")
            }
        } catch (err) {
            toast.error("Error occurred")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return
        try {
            const res = await apiFetch(`${API_ENDPOINTS.FEES.DISCOUNTS}/${id}`, {
                method: "DELETE"
            })
            if (res.ok) {
                toast.success("Deleted successfully")
                setDiscounts(discounts.filter(d => d._id !== id))
            }
        } catch (err) {
            toast.error("Delete failed")
        }
    }

    const columns = [
        {
            key: "name",
            label: "Entitlement Name",
            render: (val: string) => (
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-rose-50 rounded-lg flex items-center justify-center text-rose-600">
                        <Percent size={16} />
                    </div>
                    <span className="font-bold text-gray-900">{val}</span>
                </div>
            )
        },
        {
            key: "discountCode",
            label: "Authorization Code",
            render: (val: string) => (
                <div className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-mono font-bold text-gray-600 border border-gray-200 uppercase w-fit">
                    {val}
                </div>
            )
        },
        {
            key: "amount",
            label: "Grant Value",
            render: (val: number) => (
                <div className="font-black text-emerald-600 text-sm">
                    ₹{val.toLocaleString()}
                </div>
            )
        },
        {
            key: "actions",
            label: "Operations",
            render: (_: any, discount: any) => (
                <div className="flex justify-end gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full"
                        onClick={() => handleDelete(discount._id)}
                    >
                        <Trash2 size={14} />
                    </Button>
                </div>
            )
        }
    ]

    const filteredDiscounts = discounts.filter(d =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.discountCode.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <DashboardLayout title="Incentive & Discount Registry">
            <div className="max-w-[1600px] mx-auto space-y-8 pb-10">

                {/* Header Context */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                            <div className="h-10 w-10 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg text-white">
                                <Tag size={22} />
                            </div>
                            Subsidy & Grants Hub
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Configure and manage financial relief packages for students</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Definition Panel */}
                    <div className="lg:col-span-4">
                        <Card className="border-none shadow-xl ring-1 ring-black/5 overflow-hidden sticky top-8">
                            <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                                <CardTitle className="text-xs flex items-center gap-2 text-rose-800 uppercase tracking-widest font-black">
                                    <Edit size={14} /> Subsidy definition
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-8">
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Grant Nomenclature <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="name"
                                            placeholder="e.g. Academic Excellence Scholarship"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="bg-gray-50/50 border-gray-200 h-11 focus:ring-rose-500"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Universal Discount Code <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="discountCode"
                                            placeholder="e.g. EXCELLENCE-2025"
                                            value={formData.discountCode}
                                            onChange={(e) => setFormData({ ...formData, discountCode: e.target.value })}
                                            className="bg-gray-50/50 border-gray-200 h-11 focus:ring-rose-500 font-mono uppercase"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Monetary Value (₹) <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="amount"
                                            type="number"
                                            placeholder="5000.00"
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                            className="bg-gray-50/50 border-gray-200 h-11 focus:ring-rose-500 font-bold"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Narrative Description</Label>
                                        <Textarea
                                            id="description"
                                            placeholder="Eligibilty criteria or purpose..."
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="bg-gray-50/50 border-gray-200 focus:ring-rose-500"
                                            rows={3}
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full bg-rose-600 hover:bg-rose-700 h-12 shadow-lg shadow-rose-100 font-bold group transition-all"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                Enact Grant <RefreshCcw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                                            </div>
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Registry Panel */}
                    <div className="lg:col-span-8">
                        {error && (
                            <Alert variant="destructive" className="mb-6 shadow-lg border-none bg-red-50 text-red-600">
                                <AlertDescription className="font-bold flex items-center gap-2">
                                    <AlertCircle size={16} /> {error}
                                </AlertDescription>
                            </Alert>
                        )}

                        <div className="mb-6 flex flex-col md:flex-row gap-4 items-center">
                            <div className="relative flex-1 group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-rose-500 transition-colors" />
                                <Input
                                    className="pl-10 h-11 bg-white border-gray-200 shadow-sm focus:ring-2 focus:ring-rose-100"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search by grant name or code..."
                                />
                            </div>
                            <Button
                                variant="outline"
                                onClick={fetchDiscounts}
                                className="h-11 px-4 border-gray-200 hover:bg-gray-50 flex items-center gap-2 shadow-sm"
                            >
                                <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Sync Registry
                            </Button>
                        </div>

                        <AdvancedTable
                            title="Active Subsidies"
                            columns={columns}
                            data={filteredDiscounts}
                            loading={isLoading}
                            pagination
                        />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
