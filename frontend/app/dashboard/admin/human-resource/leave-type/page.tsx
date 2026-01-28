"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Users, Edit2, Trash2, Loader2, Home } from "lucide-react"
import { API_URL } from "@/lib/api-config"
import { toast } from "sonner"
import { ConfirmationDialog } from "@/components/super-admin/confirmation-dialog"

export default function LeaveTypePage() {
    const [leaveTypes, setLeaveTypes] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [name, setName] = useState("")
    const [allottedDays, setAllottedDays] = useState<number>(0)
    const [editId, setEditId] = useState<string | null>(null)
    const [deleteId, setDeleteId] = useState<string | null>(null)

    useEffect(() => {
        fetchLeaveTypes()
    }, [])

    const fetchLeaveTypes = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${API_URL}/api/leave-types`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (response.ok) {
                const data = await response.json()
                setLeaveTypes(data)
            }
        } catch (error) {
            console.error("Fetch error:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        if (!name.trim()) {
            toast.error("Leave type name is required")
            return
        }

        setSaving(true)
        try {
            const token = localStorage.getItem('token')
            const url = editId ? `${API_URL}/api/leave-types/${editId}` : `${API_URL}/api/leave-types`
            const method = editId ? "PUT" : "POST"

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name, allottedDays })
            })

            if (response.ok) {
                toast.success(editId ? "Leave type updated" : "Leave type added")
                setName("")
                setAllottedDays(0)
                setEditId(null)
                fetchLeaveTypes()
            } else {
                const err = await response.json()
                toast.error(err.error || "Failed to save leave type")
            }
        } catch (error) {
            toast.error("An error occurred")
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteId) return
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${API_URL}/api/leave-types/${deleteId}`, {
                method: "DELETE",
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (response.ok) {
                toast.success("Leave type deleted")
                fetchLeaveTypes()
            }
        } catch (error) {
            toast.error("Failed to delete")
        } finally {
            setDeleteId(null)
        }
    }

    const columns = [
        {
            key: "name",
            label: "LEAVE TYPE",
            sortable: true,
            render: (value: string) => <span className="text-gray-700 font-bold uppercase text-[11px] tracking-wider">{value}</span>
        },
        {
            key: "allottedDays",
            label: "ALLOTTED DAYS",
            render: (value: number) => <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold text-xs">{value} Days</span>
        }
    ]

    return (
        <DashboardLayout title="Leave Type Management">
            <div className="space-y-6 max-w-full pb-10">
                <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border-l-4 border-l-pink-500">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800 tracking-tight">Leave Categories</h1>
                        <p className="text-xs text-gray-500 font-medium">Configure distinct leave types such as Sick, Casual, and Academic leaves.</p>
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Home className="h-4 w-4" /> Human Resource <span className="mx-1">/</span> <span className="text-pink-600 font-bold">Leave Type</span>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                        <Card className="border-t-4 border-t-pink-500 shadow-sm overflow-hidden">
                            <CardHeader className="py-4 bg-gray-50/50 border-b">
                                <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-widest text-gray-600">
                                    <Edit2 className="h-4 w-4 text-pink-500" /> {editId ? "Update" : "Add New"} Category
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-gray-500 uppercase">Category Name <span className="text-red-500">*</span></Label>
                                    <Input
                                        placeholder="e.g., Medical Leave"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="h-11 focus:ring-2 focus:ring-pink-500/10 transition-all border-gray-200"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-gray-500 uppercase">Default Allotted Days</Label>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={allottedDays}
                                        onChange={(e) => setAllottedDays(parseInt(e.target.value) || 0)}
                                        className="h-11 focus:ring-2 focus:ring-pink-500/10 transition-all border-gray-200"
                                    />
                                </div>
                                <div className="flex gap-2 pt-2">
                                    {editId && (
                                        <Button variant="outline" className="flex-1" onClick={() => { setEditId(null); setName(""); setAllottedDays(0); }}>
                                            Cancel
                                        </Button>
                                    )}
                                    <Button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="flex-1 bg-[#0b1c48] hover:bg-[#1a2d65] h-11 text-xs font-bold uppercase tracking-widest shadow-lg shadow-blue-50"
                                    >
                                        {saving ? <Loader2 className="animate-spin" /> : (editId ? "Update" : "Save Record")}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="md:col-span-2">
                        <Card className="border-t-4 border-t-pink-500 shadow-sm h-full overflow-hidden">
                            <CardHeader className="py-4 bg-gray-50/50 border-b">
                                <CardTitle className="text-sm font-bold text-gray-600 uppercase tracking-widest">Defined Leave Categories</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <AdvancedTable
                                    columns={columns}
                                    data={leaveTypes}
                                    loading={loading}
                                    searchable={true}
                                    searchPlaceholder="Filter categories..."
                                    headerClassName="bg-gray-100 text-gray-600 font-bold uppercase text-[10px] tracking-widest h-12"
                                    actions={[
                                        {
                                            label: "Modify",
                                            onClick: (row) => {
                                                setEditId(row._id)
                                                setName(row.name)
                                                setAllottedDays(row.allottedDays || 0)
                                            },
                                            icon: <Edit2 className="h-4 w-4 mr-2" />
                                        },
                                        {
                                            label: "Delete Category",
                                            onClick: (row) => setDeleteId(row._id),
                                            icon: <Trash2 className="h-4 w-4 mr-2 text-red-600" />
                                        }
                                    ]}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <ConfirmationDialog
                    open={!!deleteId}
                    onOpenChange={(open) => !open && setDeleteId(null)}
                    title="Delete Leave Type"
                    description="Are you sure you want to remove this leave type? This may affect pending leave applications."
                    onConfirm={handleDelete}
                />
            </div>
        </DashboardLayout>
    )
}

