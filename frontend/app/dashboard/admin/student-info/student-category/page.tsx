"use client"

import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Edit, Trash2, Users, Download, Copy, FileText, Printer, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { API_URL } from "@/lib/api-config"
import { toast } from "sonner"

export default function StudentCategory() {
    const [categories, setCategories] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [newCategory, setNewCategory] = useState({ name: "" })

    const fetchCategories = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/student-categories`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            if (!res.ok) throw new Error("Failed to fetch categories")
            const data = await res.json()
            setCategories(data.data || [])
        } catch (error) {
            console.error(error)
            toast.error("Failed to load categories")
        } finally {
            setLoading(false)
        }
    }

    const handleAddCategory = async () => {
        if (!newCategory.name.trim()) return;
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/student-categories`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newCategory)
            })
            if (!res.ok) throw new Error("Failed to add category")
            toast.success("Category added")
            setNewCategory({ name: "" })
            fetchCategories()
        } catch (error) {
            console.error(error)
            toast.error("Failed to add category")
        }
    }

    const handleDeleteCategory = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/student-categories/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            })
            if (!res.ok) throw new Error("Failed to delete")
            toast.success("Category deleted")
            fetchCategories()
        } catch (error) {
            toast.error("Failed to delete")
        }
    }

    useEffect(() => {
        fetchCategories()
    }, [])

    return (
        <DashboardLayout title="Student Category">
            <div className="flex flex-col xl:flex-row gap-6">
                {/* Add Category Form */}
                <Card className="xl:w-1/3 h-fit">
                    <CardHeader className="bg-pink-50 border-b border-pink-100 py-3">
                        <CardTitle className="text-lg flex items-center gap-2 text-gray-800 font-normal">
                            <Edit className="h-5 w-5" /> Add Student Category
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <div className="space-y-2">
                            <Label className="text-red-500">Name *</Label>
                            <Input
                                placeholder="Enter category"
                                className="bg-white border-gray-200"
                                value={newCategory.name}
                                onChange={(e) => setNewCategory({ name: e.target.value })}
                            />
                        </div>
                        <div className="flex justify-end pt-2">
                            <Button
                                className="bg-[#1e1e50] hover:bg-[#151538] text-white"
                                onClick={handleAddCategory}
                                disabled={!newCategory.name.trim()}
                            >
                                Save
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Category List */}
                <Card className="xl:w-2/3">
                    <CardHeader className="bg-pink-50 border-b border-pink-100 py-3">
                        <CardTitle className="text-lg flex items-center gap-2 text-gray-800 font-normal">
                            <Users className="h-5 w-5" /> Student Category List
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
                            <div className="flex gap-2">
                                <Button variant="outline" size="icon" className="h-8 w-8 bg-[#1e1e50] text-white hover:bg-[#151538] border-none" onClick={() => navigator.clipboard.writeText(JSON.stringify(categories))}><Copy className="h-4 w-4" /></Button>
                                <Button variant="outline" size="icon" className="h-8 w-8 bg-[#1e1e50] text-white hover:bg-[#151538] border-none" onClick={() => {
                                    const csv = "ID,Name\n" + categories.map(c => `${c._id},${c.name}`).join("\n");
                                    const blob = new Blob([csv], { type: "text/csv" });
                                    const url = URL.createObjectURL(blob);
                                    const link = document.createElement("a");
                                    link.href = url;
                                    link.download = "categories.csv";
                                    document.body.appendChild(link);
                                    link.click();
                                }}><FileText className="h-4 w-4" /></Button>
                                <Button variant="outline" size="icon" className="h-8 w-8 bg-[#1e1e50] text-white hover:bg-[#151538] border-none" onClick={() => window.print()}><Printer className="h-4 w-4" /></Button>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">Search:</span>
                                <Input className="w-48 h-8" placeholder="Search..." />
                            </div>
                        </div>

                        <div className="overflow-x-auto border rounded-md">
                            <Table>
                                <TableHeader className="bg-pink-50">
                                    <TableRow className="uppercase text-xs font-bold text-gray-700">
                                        <TableHead className="w-16">ID</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center h-24">
                                                <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" />
                                            </TableCell>
                                        </TableRow>
                                    ) : categories.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center h-24 text-gray-500">No categories found</TableCell>
                                        </TableRow>
                                    ) : (
                                        categories.map((category, index) => (
                                            <TableRow key={category._id} className="text-sm hover:bg-gray-50">
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell>{category.name}</TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button size="sm" className="bg-[#1e1e50] text-white hover:bg-[#151538] h-7 px-2">
                                                                Action <span className="ml-1">▼</span>
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem>
                                                                <Edit className="h-4 w-4 mr-2" /> Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteCategory(category._id)}>
                                                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
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
        </DashboardLayout>
    )
}
