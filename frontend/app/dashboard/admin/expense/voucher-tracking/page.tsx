"use client"

import { useState, useEffect } from "react"
import { apiFetch, API_ENDPOINTS } from "@/lib/api-config"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Hash, Plus, Trash2, Edit2, CheckCircle2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import { ActionMenu } from "@/components/action-menu"

export default function VoucherTracking() {
    const [settings, setSettings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        prefix: "",
        lastUsed: "0",
        digits: "4",
        description: ""
    })

    const fetchSettings = async () => {
        setLoading(true)
        try {
            const res = await apiFetch(API_ENDPOINTS.EXPENSES.VOUCHER_SETTINGS)
            if (res.ok) {
                const data = await res.json()
                setSettings(data.data || [])
            }
        } catch (error) {
            toast.error("Failed to load voucher settings")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSettings()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.prefix) return toast.error("Prefix is required")

        setIsSubmitting(true)
        try {
            const method = editingId ? "PUT" : "POST"
            const url = editingId
                ? `${API_ENDPOINTS.EXPENSES.VOUCHER_SETTINGS}/${editingId}`
                : API_ENDPOINTS.EXPENSES.VOUCHER_SETTINGS

            const res = await apiFetch(url, {
                method,
                body: JSON.stringify({
                    ...formData,
                    lastUsed: parseInt(formData.lastUsed),
                    digits: parseInt(formData.digits)
                })
            })

            if (res.ok) {
                toast.success(`Voucher series ${editingId ? "updated" : "created"} successfully`)
                setFormData({ prefix: "", lastUsed: "0", digits: "4", description: "" })
                setEditingId(null)
                fetchSettings()
            } else {
                const err = await res.json()
                toast.error(err.message || "Operation failed")
            }
        } catch (error) {
            toast.error("Connection error")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this series?")) return
        try {
            const res = await apiFetch(`${API_ENDPOINTS.EXPENSES.VOUCHER_SETTINGS}/${id}`, { method: "DELETE" })
            if (res.ok) {
                toast.success("Series deleted")
                fetchSettings()
            }
        } catch (error) {
            toast.error("Delete failed")
        }
    }

    const startEdit = (row: any) => {
        setEditingId(row._id)
        setFormData({
            prefix: row.prefix,
            lastUsed: row.lastUsed.toString(),
            digits: row.digits.toString(),
            description: row.description || ""
        })
    }

    const columns = [
        {
            key: "prefix",
            label: "Prefix",
            render: (val: string) => <span className="font-black text-indigo-700 bg-indigo-50 px-3 py-1 rounded-md border border-indigo-100">{val}</span>
        },
        {
            key: "lastUsed",
            label: "Last Used",
            render: (val: number) => <span className="font-mono font-bold text-gray-600">{val}</span>
        },
        {
            key: "digits",
            label: "Format Depth",
            render: (val: number) => <span className="text-xs text-gray-500">{val} Digits</span>
        },
        {
            key: "next",
            label: "Preview Next",
            render: (_: any, row: any) => {
                const nextNo = (row.lastUsed + 1).toString().padStart(row.digits, '0')
                return <span className="font-mono text-emerald-600 font-black">{row.prefix}{nextNo}</span>
            }
        },
        {
            key: "actions",
            label: "Control",
            render: (_: any, row: any) => (
                <ActionMenu
                    onEdit={() => startEdit(row)}
                    onDelete={() => handleDelete(row._id)}
                />
            )
        }
    ]

    return (
        <DashboardLayout title="Sequential Voucher Control">
            <div className="space-y-8 max-w-[1400px] mx-auto pb-10">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                            <div className="h-10 w-10 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-xl flex items-center justify-center shadow-lg text-white">
                                <Hash size={22} />
                            </div>
                            Voucher Series Engine
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Configure automated sequencing for institutional vouchers</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Control Panel */}
                    <Card className="lg:col-span-1 border-none shadow-xl ring-1 ring-black/5 overflow-hidden h-fit">
                        <CardHeader className="bg-gradient-to-r from-indigo-50 to-white border-b border-indigo-100">
                            <CardTitle className="text-sm flex items-center gap-2 text-indigo-800 uppercase tracking-widest font-bold">
                                {editingId ? <Edit2 size={16} /> : <Plus size={16} />}
                                {editingId ? "Modify Sequence" : "Initialize Series"}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Series Prefix *</Label>
                                        <Input
                                            placeholder="e.g. VCH, EXP, FEE"
                                            value={formData.prefix}
                                            onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
                                            disabled={!!editingId}
                                            className="bg-gray-50/50 border-gray-200 h-11 font-bold uppercase"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Last Used No.</Label>
                                            <Input
                                                type="number"
                                                value={formData.lastUsed}
                                                onChange={(e) => setFormData({ ...formData, lastUsed: e.target.value })}
                                                className="bg-gray-50/50 border-gray-200 h-11 font-mono"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Digit Padding</Label>
                                            <Input
                                                type="number"
                                                value={formData.digits}
                                                onChange={(e) => setFormData({ ...formData, digits: e.target.value })}
                                                className="bg-gray-50/50 border-gray-200 h-11"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Series Intent</Label>
                                        <Input
                                            placeholder="e.g. General Expense Vouchers"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="bg-gray-50/50 border-gray-200 h-11"
                                        />
                                    </div>
                                </div>

                                <div className="p-4 bg-amber-50 rounded-lg border border-amber-100 flex gap-3">
                                    <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                                    <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                                        Generated Sequence: <span className="font-bold underline">
                                            {formData.prefix || "[PREFIX]"}{(parseInt(formData.lastUsed) + 1).toString().padStart(parseInt(formData.digits) || 0, '0')}
                                        </span>
                                        <br />
                                        Changing these values affects the next generated voucher number globally.
                                    </p>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    {editingId && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="flex-1 h-11 border-gray-200 font-bold"
                                            onClick={() => {
                                                setEditingId(null)
                                                setFormData({ prefix: "", lastUsed: "0", digits: "4", description: "" })
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                    )}
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 group transition-all"
                                    >
                                        {isSubmitting ? "Syncing..." : (
                                            <>
                                                {editingId ? "Apply Changes" : "Commit Series"}
                                                <CheckCircle2 size={18} className="group-hover:scale-110 transition-transform" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Data Display */}
                    <div className="lg:col-span-2">
                        <AdvancedTable
                            title="Active Sequences"
                            columns={columns}
                            data={settings}
                            loading={loading}
                            pagination
                            searchable
                        />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}

