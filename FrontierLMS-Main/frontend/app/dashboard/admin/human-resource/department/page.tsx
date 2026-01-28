"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Edit2, Home, Trash2, Loader2 } from "lucide-react"
import { API_URL } from "@/lib/api-config"
import { toast } from "sonner"
import { ConfirmationDialog } from "@/components/super-admin/confirmation-dialog"

export default function DepartmentPage() {
    const [departments, setDepartments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [name, setName] = useState("")
    const [editId, setEditId] = useState<string | null>(null)
    const [deleteId, setDeleteId] = useState<string | null>(null)

    useEffect(() => {
        fetchDepartments()
    }, [])

    const fetchDepartments = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${API_URL}/api/departments`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (response.ok) {
                const data = await response.json()
                setDepartments(data)
            }
        } catch (error) {
            console.error("Fetch error:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        if (!name.trim()) {
            toast.error("Department name is required")
            return
        }

        setSaving(true)
        try {
            const token = localStorage.getItem('token')
            const url = editId ? `${API_URL}/api/departments/${editId}` : `${API_URL}/api/departments`
            const method = editId ? "PUT" : "POST"

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name })
            })

            if (response.ok) {
                toast.success(editId ? "Department updated" : "Department added")
                setName("")
                setEditId(null)
                fetchDepartments()
            } else {
                const err = await response.json()
                toast.error(err.error || "Failed to save department")
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
            const response = await fetch(`${API_URL}/api/departments/${deleteId}`, {
                method: "DELETE",
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (response.ok) {
                toast.success("Department deleted")
                fetchDepartments()
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
            label: "DEPARTMENT",
            sortable: true,
            render: (value: string) => <span className="text-gray-700 font-medium">{value}</span>
        }
    ]

    return (
        <DashboardLayout title="Department Management">
            <div className="space-y-6 max-w-full">
                <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800 tracking-tight">Department Master</h1>
                        <p className="text-xs text-gray-500">Define and manage organizational departments for internal classification.</p>
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Home className="h-4 w-4" /> Human Resource <span className="mx-1">/</span> <span className="text-pink-600 font-bold">Department</span>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                        <Card className="border-t-4 border-t-pink-500 shadow-sm">
                            <CardHeader className="py-4 bg-pink-50/20 border-b">
                                <CardTitle className="text-lg font-medium flex items-center gap-2">
                                    <Edit2 className="h-4 w-4 text-pink-600" /> {editId ? "Edit" : "Add"} Department
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-gray-700 font-bold">Name <span className="text-red-500">*</span></Label>
                                    <Input
                                        placeholder="Enter department name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="h-11 focus:ring-2 focus:ring-pink-500 transition-all border-gray-200"
                                    />
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    {editId && (
                                        <Button variant="outline" onClick={() => { setEditId(null); setName(""); }}>
                                            Cancel
                                        </Button>
                                    )}
                                    <Button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="bg-[#0b1c48] hover:bg-[#1a2d65] px-8 py-6 h-11 text-base shadow-lg shadow-blue-100"
                                    >
                                        {saving ? <Loader2 className="animate-spin" /> : (editId ? "Update" : "Save")}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="md:col-span-2">
                        <Card className="border-t-4 border-t-pink-500 shadow-sm h-full">
                            <CardHeader className="py-4 bg-pink-50/20 border-b">
                                <CardTitle className="text-lg font-medium">Department List</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <AdvancedTable
                                    columns={columns}
                                    data={departments}
                                    loading={loading}
                                    searchable={true}
                                    searchPlaceholder="Filter departments..."
                                    headerClassName="bg-gray-50 text-gray-600 font-bold uppercase text-xs"
                                    actions={[
                                        {
                                            label: "Edit",
                                            onClick: (row) => {
                                                setEditId(row._id)
                                                setName(row.name)
                                            },
                                            icon: <Edit2 className="h-4 w-4 mr-2" />
                                        },
                                        {
                                            label: "Delete",
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
                    title="Delete Department"
                    description="Are you sure you want to remove this department? This might affect staff records linked to it."
                    onConfirm={handleDelete}
                />
            </div>
        </DashboardLayout>
    )
}

