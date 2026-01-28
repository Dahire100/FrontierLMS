"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LayoutGrid, Plus, Loader2, Edit2, Trash2 } from "lucide-react"
import { API_URL } from "@/lib/api-config"
import { toast } from "sonner"

export default function ParameterPage() {
    const [parameters, setParameters] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [formData, setFormData] = useState({ name: "", description: "" })
    const [editingId, setEditingId] = useState<string | null>(null)

    useEffect(() => {
        fetchParameters()
    }, [])

    const fetchParameters = async () => {
        setLoading(true)
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${API_URL}/api/disciplinary/parameters`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (response.ok) setParameters(await response.json())
        } catch (error) {
            toast.error("Failed to load parameters")
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            const token = localStorage.getItem('token')
            const url = editingId
                ? `${API_URL}/api/disciplinary/parameters/${editingId}`
                : `${API_URL}/api/disciplinary/parameters`

            const response = await fetch(url, {
                method: editingId ? "PUT" : "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            })

            if (response.ok) {
                toast.success(editingId ? "Parameter updated" : "Parameter created")
                setFormData({ name: "", description: "" })
                setEditingId(null)
                fetchParameters()
            }
        } catch (error) {
            toast.error("An error occurred")
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this parameter?")) return
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${API_URL}/api/disciplinary/parameters/${id}`, {
                method: "DELETE",
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (response.ok) {
                toast.success("Parameter deleted")
                fetchParameters()
            }
        } catch (error) {
            toast.error("Failed to delete")
        }
    }

    const editParameter = (param: any) => {
        setFormData({ name: param.name, description: param.description || "" })
        setEditingId(param._id)
    }

    const columns = [
        {
            key: "name",
            label: "PARAMETER NAME",
            render: (v: string) => <span className="font-bold text-gray-800 text-xs uppercase tracking-tight">{v}</span>
        },
        {
            key: "description",
            label: "DESCRIPTION",
            render: (v: string) => <span className="text-[10px] text-gray-500">{v || '-'}</span>
        },
        {
            key: "actions",
            label: "ACTION",
            render: (_: any, row: any) => (
                <div className="flex gap-2 justify-end">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-600" onClick={() => editParameter(row)}>
                        <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600" onClick={() => handleDelete(row._id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            )
        }
    ]

    return (
        <DashboardLayout title="Disciplinary Standards">
            <div className="space-y-6 max-w-full pb-10">
                <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border-l-4 border-l-blue-900">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800 tracking-tight">Behaviour Parameters</h1>
                        <p className="text-xs text-gray-500 font-medium">Define qualitative standards for student disciplinary assessment.</p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-4">
                        <Card className="border-t-4 border-t-[#1a237e] shadow-sm">
                            <CardHeader className="py-4 bg-gray-50/50 border-b">
                                <CardTitle className="text-[10px] font-bold flex items-center gap-2 uppercase tracking-widest text-[#1a237e]">
                                    <LayoutGrid className="h-4 w-4" /> {editingId ? "Edit" : "New"} Parameter
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-5">
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold text-gray-500 uppercase">Parameter Name <span className="text-red-500">*</span></Label>
                                        <Input
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g. Punctuality"
                                            className="h-9 text-xs"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold text-gray-500 uppercase">Description</Label>
                                        <Input
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Brief criteria..."
                                            className="h-9 text-xs"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button type="submit" className="flex-1 bg-[#1a237e] hover:bg-[#283593] font-bold uppercase text-[10px] tracking-widest h-10" disabled={submitting}>
                                            {submitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : editingId ? <Edit2 className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                                            {editingId ? "Update" : "Save"} Parameter
                                        </Button>
                                        {editingId && (
                                            <Button type="button" variant="outline" onClick={() => { setEditingId(null); setFormData({ name: "", description: "" }) }} className="h-10 text-[10px] uppercase font-bold tracking-widest">
                                                Cancel
                                            </Button>
                                        )}
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-4 border-b bg-white flex items-center justify-between">
                                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest">Parameter Ledger</h3>
                                <span className="text-[10px] font-bold text-gray-400 uppercase">{parameters.length} Defined</span>
                            </div>
                            <AdvancedTable
                                columns={columns}
                                data={parameters}
                                loading={loading}
                                searchable={true}
                                headerClassName="bg-gray-50 text-gray-500 font-bold uppercase text-[10px] tracking-widest h-12"
                                emptyMessage={
                                    <div className="p-10 text-center space-y-2 text-gray-400">
                                        <LayoutGrid className="h-8 w-8 mx-auto opacity-20" />
                                        <p className="text-xs font-bold uppercase tracking-widest">No Parameters Defined</p>
                                    </div>
                                }
                            />
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
