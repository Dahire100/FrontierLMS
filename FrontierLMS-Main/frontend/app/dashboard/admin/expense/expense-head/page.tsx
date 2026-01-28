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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Edit, Trash2, Layout, Plus, List, ArrowRight } from "lucide-react"
import { ActionMenu } from "@/components/action-menu"
import { useToast } from "@/components/ui/use-toast"

export default function ExpenseHead() {
    const { toast } = useToast()
    const [expenseHeads, setExpenseHeads] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [editingHead, setEditingHead] = useState<any>(null)

    const [formData, setFormData] = useState({
        name: "",
        description: ""
    })

    useEffect(() => {
        fetchHeads()
    }, [])

    const fetchHeads = async () => {
        setLoading(true)
        try {
            const response = await apiFetch(API_ENDPOINTS.EXPENSES.HEADS)
            if (response.ok) {
                const result = await response.json()
                setExpenseHeads(result.data || [])
            }
        } catch (error) {
            console.error('Error fetching heads:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.name) return

        setIsSubmitting(true)
        try {
            const endpoint = editingHead
                ? `${API_ENDPOINTS.EXPENSES.HEADS}/${editingHead._id}`
                : API_ENDPOINTS.EXPENSES.HEADS

            const response = await apiFetch(endpoint, {
                method: editingHead ? 'PUT' : 'POST',
                body: JSON.stringify(formData)
            })

            if (response.ok) {
                toast({ title: "Success", description: `Expense head ${editingHead ? 'updated' : 'created'} successfully` })
                setFormData({ name: "", description: "" })
                setEditingHead(null)
                fetchHeads()
            }
        } catch (error) {
            toast({ title: "Error", description: "Operation failed", variant: "destructive" })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this head?")) return
        try {
            const response = await apiFetch(`${API_ENDPOINTS.EXPENSES.HEADS}/${id}`, {
                method: 'DELETE'
            })
            if (response.ok) {
                toast({ title: "Deleted", description: "Expense head removed" })
                fetchHeads()
            }
        } catch (error) {
            toast({ title: "Error", description: "Delete failed", variant: "destructive" })
        }
    }

    return (
        <DashboardLayout title="Expense Setup">
            <div className="space-y-6 max-w-[1400px] mx-auto pb-10">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                            <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg text-white">
                                <Layout size={20} />
                            </div>
                            Expense Categories
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Manage and define institutional spending heads</p>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Form Section */}
                    <Card className="lg:w-1/3 border-none shadow-xl ring-1 ring-black/5 overflow-hidden h-fit">
                        <CardHeader className="bg-gradient-to-r from-indigo-50 to-white border-b border-indigo-100">
                            <CardTitle className="text-lg flex items-center gap-2 text-indigo-900 font-semibold">
                                {editingHead ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                                {editingHead ? 'Modify Head' : 'Add New Category'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Head Name *</Label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Laboratory Supplies"
                                        className="bg-gray-50/50 border-gray-200"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Description</Label>
                                    <Textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Optional category details..."
                                        className="bg-gray-50/50 border-gray-200"
                                        rows={3}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    {editingHead && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => { setEditingHead(null); setFormData({ name: "", description: "" }) }}
                                            className="flex-1"
                                        >
                                            Cancel
                                        </Button>
                                    )}
                                    <Button
                                        disabled={isSubmitting}
                                        className={`flex-[2] bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold h-11 shadow-md flex items-center justify-center gap-2`}
                                    >
                                        {editingHead ? 'Update Category' : 'Create Category'}
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* List Section */}
                    <Card className="lg:w-2/3 border-none shadow-xl ring-1 ring-black/5 overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-purple-50 to-white border-b border-purple-100">
                            <CardTitle className="text-lg flex items-center gap-2 text-purple-900 font-semibold">
                                <List className="h-4 w-4" />
                                Category Registry
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0 px-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50/80 hover:bg-gray-50/80 border-b border-gray-100">
                                            <TableHead className="py-4 pl-6 text-xs font-bold text-gray-500 uppercase tracking-widest">Category Name</TableHead>
                                            <TableHead className="py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Info</TableHead>
                                            <TableHead className="py-4 pr-6 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">Control</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? (
                                            <TableRow><TableCell colSpan={3} className="text-center py-10 text-gray-400">Loading categories...</TableCell></TableRow>
                                        ) : expenseHeads.length === 0 ? (
                                            <TableRow><TableCell colSpan={3} className="text-center py-10 text-gray-400">No categories defined yet.</TableCell></TableRow>
                                        ) : (
                                            expenseHeads.map((head) => (
                                                <TableRow key={head._id} className="hover:bg-indigo-50/30 transition-colors group">
                                                    <TableCell className="pl-6 py-4">
                                                        <span className="font-semibold text-gray-800">{head.name}</span>
                                                    </TableCell>
                                                    <TableCell className="py-4">
                                                        <span className="text-xs text-gray-500">{head.description || 'No description'}</span>
                                                    </TableCell>
                                                    <TableCell className="pr-6 py-4 text-right">
                                                        <div className="flex justify-end gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-8 w-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-100"
                                                                onClick={() => { setEditingHead(head); setFormData({ name: head.name, description: head.description || "" }) }}
                                                            >
                                                                <Edit size={14} />
                                                            </Button>
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-100"
                                                                onClick={() => handleDelete(head._id)}
                                                            >
                                                                <Trash2 size={14} />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    )
}
