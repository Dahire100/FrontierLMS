"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Search, Download, Video, Play, Eye, Trash2, Calendar, Clock } from "lucide-react"
import { toast } from "sonner"
import { apiFetch, API_ENDPOINTS } from "@/lib/api-config"

export default function VideosPage() {
    const [videos, setVideos] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [filters, setFilters] = useState({ classId: "", section: "", subject: "" })

    useEffect(() => {
        fetchVideos()
    }, [])

    const fetchVideos = async () => {
        try {
            const res = await apiFetch(API_ENDPOINTS.VIDEOS || '/api/videos')
            if (res.ok) {
                const data = await res.json()
                setVideos(data.data || [])
            } else {
                console.error('Failed to fetch videos:', res.status)
                toast.error(`Failed to fetch videos: ${res.status}`)
            }
        } catch (error) {
            console.error("Failed to fetch videos:", error)
            toast.error('Backend server is not running. Start it: cd backend && npm start')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this video?")) return
        
        try {
            const res = await apiFetch(`${API_ENDPOINTS.VIDEOS || '/api/videos'}/${id}`, {
                method: "DELETE"
            })

            if (res.ok) {
                toast.success("Video deleted")
                fetchVideos()
            } else {
                toast.error("Failed to delete")
            }
        } catch (error) {
            toast.error("Error deleting video")
        }
    }

    const filteredVideos = videos.filter(video =>
        video.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.subject?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <DashboardLayout title="Download Center / Videos">
            <div className="space-y-6 animate-in fade-in duration-500">
                {/* Header with gradient */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-red-500 via-pink-500 to-rose-600 p-8 text-white shadow-2xl">
                    <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
                    <div className="relative flex items-center gap-4">
                        <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                            <Video className="h-8 w-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Video Library</h1>
                            <p className="mt-1 text-red-50">Educational videos and tutorials</p>
                        </div>
                    </div>
                </div>

                {/* Select Criteria */}
                <Card className="border-red-200 shadow-lg">
                    <CardHeader className="bg-gradient-to-br from-red-50 to-pink-50 border-b border-red-200">
                        <CardTitle className="text-base font-bold flex items-center gap-2 text-red-900">
                            <Search className="h-5 w-5" /> Search Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Class</Label>
                                <Select value={filters.classId} onValueChange={(value) => setFilters({...filters, classId: value})}>
                                    <SelectTrigger className="border-red-200">
                                        <SelectValue placeholder="Select Class" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Classes</SelectItem>
                                        <SelectItem value="1">Class 1</SelectItem>
                                        <SelectItem value="2">Class 2</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Section</Label>
                                <Select value={filters.section} onValueChange={(value) => setFilters({...filters, section: value})}>
                                    <SelectTrigger className="border-red-200">
                                        <SelectValue placeholder="Select Section" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Sections</SelectItem>
                                        <SelectItem value="A">Section A</SelectItem>
                                        <SelectItem value="B">Section B</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Subject</Label>
                                <Select value={filters.subject} onValueChange={(value) => setFilters({...filters, subject: value})}>
                                    <SelectTrigger className="border-red-200">
                                        <SelectValue placeholder="Select Subject" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Subjects</SelectItem>
                                        <SelectItem value="maths">Maths</SelectItem>
                                        <SelectItem value="english">English</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 gap-2 shadow-lg">
                                <Search className="h-4 w-4" /> Apply Filters
                            </Button>
                            <Button variant="outline" onClick={() => setFilters({ classId: "", section: "", subject: "" })}>
                                Clear
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Videos List */}
                <Card className="border-red-200 shadow-lg">
                    <CardHeader className="bg-gradient-to-br from-red-50 to-pink-50 border-b border-red-200">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-bold flex items-center gap-2 text-red-900">
                                <Play className="h-5 w-5" /> 
                                <span>Video Collection</span>
                                <Badge variant="secondary" className="bg-red-100 text-red-700">
                                    {filteredVideos.length} videos
                                </Badge>
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input 
                                placeholder="Search videos..." 
                                className="pl-10 border-red-200 focus:border-red-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="rounded-lg border border-red-200 overflow-hidden">
                            <Table>
                                <TableHeader className="bg-gradient-to-r from-red-50 to-pink-50">
                                    <TableRow className="hover:bg-red-50/50">
                                        <TableHead className="font-bold text-red-900">TITLE</TableHead>
                                        <TableHead className="font-bold text-red-900">TYPE</TableHead>
                                        <TableHead className="font-bold text-red-900">SUBJECT</TableHead>
                                        <TableHead className="font-bold text-red-900">VIEWS</TableHead>
                                        <TableHead className="font-bold text-red-900">DATE</TableHead>
                                        <TableHead className="text-right font-bold text-red-900">ACTIONS</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                                Loading videos...
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredVideos.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                                No videos found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredVideos.map((video: any) => (
                                            <TableRow key={video._id} className="hover:bg-red-50/50 transition-colors">
                                                <TableCell className="font-medium">{video.title}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                                        {video.videoType}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{video.subject || 'N/A'}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                                        <Eye className="h-3 w-3" />
                                                        {video.viewCount || 0}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Calendar className="h-3 w-3" />
                                                        {new Date(video.createdAt).toLocaleDateString()}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button 
                                                            size="icon" 
                                                            variant="ghost" 
                                                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            onClick={() => window.open(video.videoUrl, '_blank')}
                                                        >
                                                            <Play className="h-4 w-4" />
                                                        </Button>
                                                        <Button 
                                                            size="icon" 
                                                            variant="ghost" 
                                                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            onClick={() => handleDelete(video._id)}
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
        </DashboardLayout>
    )
}
