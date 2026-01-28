"use client"

import { API_URL } from "@/lib/api-config"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Pin, Calendar } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"

export default function StudentNoticeBoard() {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedNotice, setSelectedNotice] = useState<any>(null)
    const [notices, setNotices] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchNotices = async () => {
            try {
                const token = localStorage.getItem('token')
                const res = await fetch(`${API_URL}/api/student/notices`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                const data = await res.json()
                if (data.success) {
                    const formattedNotices = data.data.map((notice: any) => ({
                        id: notice._id,
                        title: notice.title,
                        date: notice.noticeDate,
                        category: "General", // Default as category might not be in basic schema or is 'type'
                        content: notice.message || "",
                        priority: "Medium", // Default
                        pinned: false // Default
                    }))
                    setNotices(formattedNotices)
                }
            } catch (error) {
                console.error("Failed to fetch notices", error)
                toast.error("Failed to load notices")
            } finally {
                setLoading(false)
            }
        }
        fetchNotices()
    }, [])

    const filteredNotices = notices.filter(notice =>
        notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notice.category.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) {
        return <div className="p-8 text-center">Loading Notices...</div>
    }

    return (
        <DashboardLayout title="Notice Board">
            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                        Notice Board
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        Important announcements and circulars
                    </p>
                </div>

                <div className="flex gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search notices..."
                            className="pl-8 bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredNotices.length === 0 ? (
                        <p className="col-span-3 text-center text-muted-foreground py-10">No notices found.</p>
                    ) : filteredNotices.map((notice) => (
                        <Card
                            key={notice.id}
                            className={`hover:shadow-lg transition-all cursor-pointer group bg-white border-l-4 ${notice.priority === "High" ? "border-l-red-500" :
                                notice.priority === "Medium" ? "border-l-yellow-500" : "border-l-blue-500"
                                }`}
                            onClick={() => setSelectedNotice(notice)}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <Badge variant="outline" className="mb-2">{notice.category}</Badge>
                                    {notice.pinned && <Pin className="h-4 w-4 text-gray-400 rotate-45 fill-gray-100" />}
                                </div>
                                <CardTitle className="text-lg line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                                    {notice.title}
                                </CardTitle>
                                <CardDescription className="flex items-center gap-1 text-xs mt-1">
                                    <Calendar className="h-3 w-3" /> {new Date(notice.date).toLocaleDateString()}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground line-clamp-3">
                                    {notice.content}
                                </p>
                                <div className="mt-4 flex items-center text-xs font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                    Read Full Notice →
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Dialog open={!!selectedNotice} onOpenChange={(open) => !open && setSelectedNotice(null)}>
                    <DialogContent className="sm:max-w-[600px]">
                        {selectedNotice && (
                            <>
                                <DialogHeader>
                                    <div className="flex items-center justify-between mb-2">
                                        <Badge>{selectedNotice.category}</Badge>
                                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                                            <Calendar className="h-4 w-4" /> {new Date(selectedNotice.date).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <DialogTitle className="text-xl">{selectedNotice.title}</DialogTitle>
                                </DialogHeader>
                                <div className="mt-4">
                                    <ScrollArea className="h-[300px] pr-4">
                                        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                            {selectedNotice.content}
                                        </div>
                                    </ScrollArea>
                                </div>
                            </>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    )
}
