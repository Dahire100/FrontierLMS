"use client"

import { API_URL } from "@/lib/api-config"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { StatCard } from "@/components/super-admin/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download, File, Search, Users, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

export default function ParentDownloadCenter() {
    const [selectedChild, setSelectedChild] = useState<string>("")
    const [children, setChildren] = useState<any[]>([])
    const [downloads, setDownloads] = useState<any[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [loading, setLoading] = useState(true)

    // Fetch children on mount
    useEffect(() => {
        const fetchChildren = async () => {
            try {
                const token = localStorage.getItem('token')
                const res = await fetch(`${API_URL}/api/parent/dashboard`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                const data = await res.json()
                if (data.success && data.data.children.length > 0) {
                    setChildren(data.data.children)
                    setSelectedChild(data.data.children[0]._id)
                } else {
                    setLoading(false)
                }
            } catch (error) {
                console.error("Failed to fetch children", error)
                setLoading(false)
            }
        }
        fetchChildren()
    }, [])

    // Fetch downloads when selected child changes
    useEffect(() => {
        if (!selectedChild) return

        const fetchDownloads = async () => {
            try {
                const token = localStorage.getItem('token')
                const res = await fetch(`${API_URL}/api/parent/child/${selectedChild}/downloads`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                const data = await res.json()

                if (data.success) {
                    setDownloads(data.data)
                }
            } catch (error) {
                console.error("Failed to fetch downloads", error)
                toast.error("Failed to load study materials")
            } finally {
                setLoading(false)
            }
        }
        fetchDownloads()
    }, [selectedChild])


    const filteredDownloads = downloads.filter((item: any) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.type && item.type.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    const handleDownload = (item: any) => {
        // If fileUrl is present
        if (item.fileUrl) {
            window.open(`${API_URL}${item.fileUrl}`, '_blank')
            toast.success("Download Started", { description: `Downloading ${item.title}...` })
        } else {
            toast.error("File not available")
        }
    }

    const getSelectedChildName = () => {
        const child = children.find(c => c._id === selectedChild)
        return child ? `${child.firstName} ${child.lastName}` : "Loading..."
    }

    if (loading) {
        return (
            <DashboardLayout title="Download Center">
                <div className="flex h-screen items-center justify-center">Loading...</div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout title="Download Center">
            <div className="space-y-6 animate-in fade-in-50 duration-500">

                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Download Center
                        </h2>
                        <p className="text-muted-foreground mt-1">
                            Access study materials for {getSelectedChildName()}
                        </p>
                    </div>

                    {children.length > 0 && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="min-w-[180px] justify-between shadow-sm">
                                    <span className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-blue-600" />
                                        {getSelectedChildName()}
                                    </span>
                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[200px]">
                                {children.map(child => (
                                    <DropdownMenuItem key={child._id} onClick={() => setSelectedChild(child._id)}>
                                        {child.firstName} {child.lastName}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>

                <div className="flex items-center gap-4 bg-white p-4 rounded-xl border shadow-sm">
                    <Search className="h-5 w-5 text-gray-400" />
                    <Input
                        placeholder="Search resources..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border-none shadow-none focus-visible:ring-0 text-base"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredDownloads.map((item: any) => (
                        <Card key={item._id} className="hover:shadow-md transition-all group border-l-4 border-l-blue-500">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <FileText className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{item.title}</h4>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 font-medium">
                                            <span className="bg-gray-100 px-2 py-0.5 rounded-full">{item.type || "Document"}</span>
                                            <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                            {/* Size might not be available in standard schema, ignoring */}
                                        </div>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => handleDownload(item)}>
                                    <Download className="h-5 w-5 text-gray-400 hover:text-blue-600" />
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                    {filteredDownloads.length === 0 && (
                        <div className="col-span-1 md:col-span-2 text-center py-10 text-gray-500">
                            No files found matching your search.
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    )
}
