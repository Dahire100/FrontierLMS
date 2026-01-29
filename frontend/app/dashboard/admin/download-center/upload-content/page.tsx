"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
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
import { FileUp, Download, Trash2, Pencil, Search, Upload, Eye, Calendar, Users } from "lucide-react"
import { toast } from "sonner"
import { apiFetch, API_ENDPOINTS } from "@/lib/api-config"

export default function UploadContentPage() {
    const [contents, setContents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [formData, setFormData] = useState({
        title: "",
        contentType: "",
        description: "",
        fileUrl: "",
        visibleToRoles: [] as string[],
        uploadDate: new Date().toISOString().split('T')[0]
    })
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedItems, setSelectedItems] = useState<string[]>([])

    useEffect(() => {
        fetchContents()
    }, [])

    const fetchContents = async () => {
        try {
            console.log('[Download Center] Fetching contents from:', API_ENDPOINTS.DOWNLOAD_CONTENT);
            const res = await apiFetch(API_ENDPOINTS.DOWNLOAD_CONTENT)
            if (res.ok) {
                const data = await res.json()
                setContents(data.data || [])
            } else {
                console.error('Failed to fetch contents:', res.status, res.statusText);
                toast.error(`Failed to fetch contents: ${res.status} ${res.statusText}`)
            }
        } catch (error) {
            console.error("Failed to fetch contents:", error)
            toast.error('Backend server is not running. Start it: cd backend && npm start')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.title || !formData.contentType) {
            toast.error("Title and Content Type are required")
            return
        }

        try {
            const res = await apiFetch(API_ENDPOINTS.DOWNLOAD_CONTENT, {
                method: "POST",
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                toast.success("Content uploaded successfully")
                setFormData({
                    title: "",
                    contentType: "",
                    description: "",
                    fileUrl: "",
                    visibleToRoles: [],
                    uploadDate: new Date().toISOString().split('T')[0]
                })
                fetchContents()
            } else {
                toast.error("Failed to upload content")
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Error uploading content")
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this content?")) return
        
        try {
            const res = await apiFetch(`${API_ENDPOINTS.DOWNLOAD_CONTENT}/${id}`, {
                method: "DELETE"
            })

            if (res.ok) {
                toast.success("Content deleted successfully")
                fetchContents()
            } else {
                toast.error("Failed to delete content")
            }
        } catch (error) {
            toast.error("Error deleting content")
        }
    }

    const handleBulkDelete = async () => {
        if (selectedItems.length === 0) {
            toast.error("Please select items to delete")
            return
        }
        if (!confirm(`Delete ${selectedItems.length} selected items?`)) return

        try {
            const res = await apiFetch(`${API_ENDPOINTS.DOWNLOAD_CONTENT}/bulk-delete`, {
                method: "POST",
                body: JSON.stringify({ ids: selectedItems })
            })

            if (res.ok) {
                toast.success("Contents deleted successfully")
                setSelectedItems([])
                fetchContents()
            } else {
                toast.error("Failed to delete contents")
            }
        } catch (error) {
            toast.error("Error deleting contents")
        }
    }

    const filteredContents = contents.filter(content =>
        content.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        content.contentType?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getContentTypeBadge = (type: string) => {
        const colors: any = {
            'assignment': 'bg-blue-100 text-blue-700 hover:bg-blue-100',
            'study-material': 'bg-green-100 text-green-700 hover:bg-green-100',
            'syllabus': 'bg-purple-100 text-purple-700 hover:bg-purple-100',
            'other-download': 'bg-orange-100 text-orange-700 hover:bg-orange-100',
            'video': 'bg-red-100 text-red-700 hover:bg-red-100'
        }
        return colors[type] || 'bg-gray-100 text-gray-700'
    }

    return (
        <DashboardLayout title="Download Center / Upload Content">
            <div className="space-y-6 animate-in fade-in duration-500">
                {/* Header with gradient */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600 p-8 text-white shadow-2xl">
                    <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
                    <div className="relative flex items-center gap-4">
                        <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                            <Upload className="h-8 w-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Upload Content</h1>
                            <p className="mt-1 text-cyan-50">Manage and distribute educational content</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Add Content Form */}
                    <Card className="lg:col-span-1 h-fit border-cyan-200 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardHeader className="bg-gradient-to-br from-cyan-50 to-blue-50 border-b border-cyan-200">
                            <CardTitle className="text-base font-bold flex items-center gap-2 text-cyan-900">
                                <FileUp className="h-5 w-5" /> Add New Content
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold after:content-['*'] after:ml-0.5 after:text-red-500">
                                        Content Title
                                    </Label>
                                    <Input 
                                        value={formData.title}
                                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                                        placeholder="Enter content title"
                                        className="border-cyan-200 focus:border-cyan-500"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold after:content-['*'] after:ml-0.5 after:text-red-500">
                                        Content Type
                                    </Label>
                                    <Select value={formData.contentType} onValueChange={(value) => setFormData({...formData, contentType: value})}>
                                        <SelectTrigger className="border-cyan-200">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="assignment">Assignment</SelectItem>
                                            <SelectItem value="study-material">Study Material</SelectItem>
                                            <SelectItem value="syllabus">Syllabus</SelectItem>
                                            <SelectItem value="other-download">Other Download</SelectItem>
                                            <SelectItem value="video">Video</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">Available For</Label>
                                    <div className="space-y-3 rounded-lg border border-cyan-200 p-3 bg-cyan-50/30">
                                        {['admin', 'teacher', 'student', 'parent'].map((role) => (
                                            <div key={role} className="flex items-center space-x-2">
                                                <Checkbox 
                                                    id={role}
                                                    checked={formData.visibleToRoles.includes(role)}
                                                    onCheckedChange={(checked) => {
                                                        if (checked) {
                                                            setFormData({...formData, visibleToRoles: [...formData.visibleToRoles, role]})
                                                        } else {
                                                            setFormData({...formData, visibleToRoles: formData.visibleToRoles.filter(r => r !== role)})
                                                        }
                                                    }}
                                                />
                                                <label htmlFor={role} className="text-sm font-medium capitalize cursor-pointer">
                                                    {role}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">Upload Date</Label>
                                    <Input 
                                        type="date" 
                                        value={formData.uploadDate}
                                        onChange={(e) => setFormData({...formData, uploadDate: e.target.value})}
                                        className="border-cyan-200"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">Description</Label>
                                    <Textarea 
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        className="min-h-[100px] border-cyan-200"
                                        placeholder="Enter description..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">File URL</Label>
                                    <Input 
                                        type="text"
                                        value={formData.fileUrl}
                                        onChange={(e) => setFormData({...formData, fileUrl: e.target.value})}
                                        placeholder="Enter file URL"
                                        className="border-cyan-200"
                                    />
                                </div>

                                <div className="flex justify-end pt-2">
                                    <Button type="submit" className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 w-full gap-2 shadow-lg">
                                        <Upload className="h-4 w-4" />
                                        Upload Content
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Upload Content List */}
                    <Card className="lg:col-span-2 border-cyan-200 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardHeader className="bg-gradient-to-br from-cyan-50 to-blue-50 border-b border-cyan-200">
                            <CardTitle className="text-base font-bold flex items-center justify-between text-cyan-900">
                                <div className="flex items-center gap-2">
                                    <FileUp className="h-5 w-5" /> 
                                    <span>Content Library</span>
                                    <Badge variant="secondary" className="bg-cyan-100 text-cyan-700">
                                        {filteredContents.length} items
                                    </Badge>
                                </div>
                                <Button 
                                    variant="destructive" 
                                    size="sm"
                                    onClick={handleBulkDelete}
                                    disabled={selectedItems.length === 0}
                                    className="shadow-md"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete ({selectedItems.length})
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input 
                                        placeholder="Search content..." 
                                        className="pl-10 border-cyan-200 focus:border-cyan-500"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="rounded-lg border border-cyan-200 overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-gradient-to-r from-cyan-50 to-blue-50">
                                        <TableRow className="hover:bg-cyan-50/50">
                                            <TableHead className="w-[40px]">
                                                <Checkbox 
                                                    checked={selectedItems.length === filteredContents.length && filteredContents.length > 0}
                                                    onCheckedChange={(checked) => {
                                                        if (checked) {
                                                            setSelectedItems(filteredContents.map(c => c._id))
                                                        } else {
                                                            setSelectedItems([])
                                                        }
                                                    }}
                                                />
                                            </TableHead>
                                            <TableHead className="font-bold text-cyan-900">TITLE</TableHead>
                                            <TableHead className="font-bold text-cyan-900">TYPE</TableHead>
                                            <TableHead className="font-bold text-cyan-900">ROLES</TableHead>
                                            <TableHead className="font-bold text-cyan-900">DATE</TableHead>
                                            <TableHead className="text-right font-bold text-cyan-900">ACTIONS</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                                    Loading content...
                                                </TableCell>
                                            </TableRow>
                                        ) : filteredContents.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                                    No content found
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredContents.map((item: any) => (
                                                <TableRow key={item._id} className="hover:bg-cyan-50/50 transition-colors">
                                                    <TableCell>
                                                        <Checkbox 
                                                            checked={selectedItems.includes(item._id)}
                                                            onCheckedChange={(checked) => {
                                                                if (checked) {
                                                                    setSelectedItems([...selectedItems, item._id])
                                                                } else {
                                                                    setSelectedItems(selectedItems.filter(id => id !== item._id))
                                                                }
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="font-medium">{item.title}</TableCell>
                                                    <TableCell>
                                                        <Badge className={getContentTypeBadge(item.contentType)}>
                                                            {item.contentType}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex gap-1 flex-wrap">
                                                            {item.visibleToRoles?.slice(0, 2).map((role: string) => (
                                                                <Badge key={role} variant="outline" className="text-xs">
                                                                    {role}
                                                                </Badge>
                                                            ))}
                                                            {item.visibleToRoles?.length > 2 && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    +{item.visibleToRoles.length - 2}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <Calendar className="h-3 w-3" />
                                                            {new Date(item.createdAt).toLocaleDateString()}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-1">
                                                            {item.fileUrl && (
                                                                <Button 
                                                                    size="icon" 
                                                                    variant="ghost" 
                                                                    className="h-8 w-8 text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50"
                                                                    onClick={() => window.open(item.fileUrl, '_blank')}
                                                                >
                                                                    <Download className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                            <Button 
                                                                size="icon" 
                                                                variant="ghost" 
                                                                className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                            <Button 
                                                                size="icon" 
                                                                variant="ghost" 
                                                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                onClick={() => handleDelete(item._id)}
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
        </DashboardLayout>
    )
}
