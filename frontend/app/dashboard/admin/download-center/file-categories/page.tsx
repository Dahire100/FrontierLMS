"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Folder, Search, Trash2, Edit, FolderPlus } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { apiFetch, API_ENDPOINTS } from "@/lib/api-config"

export default function FileCategories() {
    const [rows, setRows] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [form, setForm] = useState({ name: "", description: "", categoryType: "" })
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        try {
            const res = await apiFetch(API_ENDPOINTS.FILE_CATEGORIES || '/api/file-categories')
            if (res.ok) {
                const data = await res.json()
                setRows(data.data || [])
            }
        } catch (error) {
            console.error("Failed to fetch categories:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.name || !form.categoryType) {
            toast.error("Name and category type are required")
            return
        }

        try {
            const res = await apiFetch(API_ENDPOINTS.FILE_CATEGORIES || '/api/file-categories', {
                method: "POST",
                body: JSON.stringify(form)
            })

            if (res.ok) {
                toast.success("Category added successfully")
                setForm({ name: "", description: "", categoryType: "" })
                fetchCategories()
            } else {
                toast.error("Failed to add category")
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Error adding category")
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this category?")) return
        
        try {
            const res = await apiFetch(`${API_ENDPOINTS.FILE_CATEGORIES || '/api/file-categories'}/${id}`, {
                method: "DELETE"
            })

            if (res.ok) {
                toast.success("Category deleted")
                fetchCategories()
            } else {
                toast.error("Failed to delete")
            }
        } catch (error) {
            toast.error("Error deleting category")
        }
    }

    const filteredRows = rows.filter(row =>
        row.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.categoryType?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getCategoryTypeBadge = (type: string) => {
        const colors: any = {
            'assignment': 'bg-blue-100 text-blue-700',
            'study-material': 'bg-green-100 text-green-700',
            'syllabus': 'bg-purple-100 text-purple-700',
            'video': 'bg-red-100 text-red-700',
            'other': 'bg-orange-100 text-orange-700'
        }
        return colors[type] || 'bg-gray-100 text-gray-700'
    }

    return (
        <DashboardLayout title="File Categories">
            <div className="space-y-6 animate-in fade-in duration-500">
                {/* Header with gradient */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-600 p-8 text-white shadow-2xl">
                    <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
                    <div className="relative flex items-center gap-4">
                        <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                            <Folder className="h-8 w-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">File Categories</h1>
                            <p className="mt-1 text-amber-50">Organize content with custom categories</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                        <Card className="border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300">
                            <CardHeader className="bg-gradient-to-br from-amber-50 to-orange-50 border-b border-amber-200">
                                <CardTitle className="text-base font-bold flex items-center gap-2 text-amber-900">
                                    <FolderPlus className="h-5 w-5" />
                                    Add Category
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold after:content-['*'] after:ml-0.5 after:text-red-500">
                                            Category Name
                                        </Label>
                                        <Input
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            placeholder="e.g., Study Material"
                                            className="border-amber-200 focus:border-amber-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold after:content-['*'] after:ml-0.5 after:text-red-500">
                                            Category Type
                                        </Label>
                                        <Select value={form.categoryType} onValueChange={(value) => setForm({ ...form, categoryType: value })}>
                                            <SelectTrigger className="border-amber-200">
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="assignment">Assignment</SelectItem>
                                                <SelectItem value="study-material">Study Material</SelectItem>
                                                <SelectItem value="syllabus">Syllabus</SelectItem>
                                                <SelectItem value="video">Video</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold">Description</Label>
                                        <Input
                                            value={form.description}
                                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                                            placeholder="Category description"
                                            className="border-amber-200 focus:border-amber-500"
                                        />
                                    </div>
                                    <div className="flex justify-end pt-2">
                                        <Button type="submit" className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 w-full gap-2 shadow-lg">
                                            <FolderPlus className="h-4 w-4" />
                                            Add Category
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-2">
                        <Card className="border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300">
                            <CardHeader className="bg-gradient-to-br from-amber-50 to-orange-50 border-b border-amber-200">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base font-bold flex items-center gap-2 text-amber-900">
                                        <Folder className="h-5 w-5" />
                                        <span>Category List</span>
                                        <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                                            {filteredRows.length} categories
                                        </Badge>
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input 
                                        placeholder="Search categories..." 
                                        className="pl-10 border-amber-200 focus:border-amber-500"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                <div className="rounded-lg border border-amber-200 overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
                                            <TableRow className="hover:bg-amber-50/50">
                                                <TableHead className="font-bold text-amber-900">NAME</TableHead>
                                                <TableHead className="font-bold text-amber-900">TYPE</TableHead>
                                                <TableHead className="font-bold text-amber-900">DESCRIPTION</TableHead>
                                                <TableHead className="text-right font-bold text-amber-900">ACTIONS</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {loading ? (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                                                        Loading categories...
                                                    </TableCell>
                                                </TableRow>
                                            ) : filteredRows.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                                                        No categories found
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                filteredRows.map((row: any) => (
                                                    <TableRow key={row._id} className="hover:bg-amber-50/50 transition-colors">
                                                        <TableCell className="font-medium">{row.name}</TableCell>
                                                        <TableCell>
                                                            <Badge className={getCategoryTypeBadge(row.categoryType)}>
                                                                {row.categoryType}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-gray-600">{row.description || 'N/A'}</TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end gap-1">
                                                                <Button 
                                                                    size="icon" 
                                                                    variant="ghost" 
                                                                    className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                                <Button 
                                                                    size="icon" 
                                                                    variant="ghost" 
                                                                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                    onClick={() => handleDelete(row._id)}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
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
            </div>
        </DashboardLayout>
    )
}

