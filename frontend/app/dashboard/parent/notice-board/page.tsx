"use client"

import { API_URL } from "@/lib/api-config"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { StatCard } from "@/components/super-admin/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, AlertCircle, Calendar, Pin, Download, Users, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

export default function ParentNoticeBoard() {
  const [selectedChild, setSelectedChild] = useState<string>("")
  const [children, setChildren] = useState<any[]>([])
  const [notices, setNotices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch children and initial notices
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token')
        const headers = { 'Authorization': `Bearer ${token}` }

        // Fetch Children
        const childRes = await fetch(`${API_URL}/api/parent/dashboard`, { headers })
        const childData = await childRes.json()
        if (childData.success && childData.data.children.length > 0) {
          setChildren(childData.data.children)
          setSelectedChild(childData.data.children[0]._id)
        }

        // Fetch Notices (General for now, future can include class specific)
        const noticesRes = await fetch(`${API_URL}/api/parent/notices`, { headers })
        const noticesData = await noticesRes.json()
        if (noticesData.success) {
          setNotices(noticesData.data)
        }

      } catch (error) {
        console.error("Failed to fetch data", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Future: Could fetch class specific notices when selectedChild changes
  // But backend /notices typically returns all relevant public notices + class specific 
  // if implemented that way. For now, assuming static list endpoint for user.


  const handleDownload = (attachment: any) => {
    if (attachment && attachment.url) {
      window.open(attachment.url, '_blank')
      toast.success("Downloading Attachment")
    } else {
      toast.info("No attachment", { description: "This notice has no downloadable attachment." })
    }
  }

  const getSelectedChildName = () => {
    const child = children.find(c => c._id === selectedChild)
    return child ? `${child.firstName} ${child.lastName}` : "Loading..."
  }

  const getPriorityInfo = (type: string) => {
    if (type === 'urgent' || type === 'exam') return { color: 'text-red-600', bg: 'bg-red-100', text: 'text-red-700', label: 'High' }
    if (type === 'holiday' || type === 'event') return { color: 'text-purple-600', bg: 'bg-purple-100', text: 'text-purple-700', label: 'Medium' }
    return { color: 'text-blue-600', bg: 'bg-blue-100', text: 'text-blue-700', label: 'Normal' }
  }

  if (loading) {
    return (
      <DashboardLayout title="Notice Board">
        <div className="flex h-screen items-center justify-center">Loading...</div>
      </DashboardLayout>
    )
  }

  const pinnedCount = notices.filter(n => n.isPinned).length
  // Assuming 'urgent' maps to high priority
  const highPriorityCount = notices.filter(n => n.type === 'urgent' || n.type === 'exam').length

  return (
    <DashboardLayout title="Digital Notice Board">
      <div className="space-y-6 animate-in fade-in-50 duration-500">
        {/* Header with Child Selector */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Notice Board
            </h2>
            <p className="text-muted-foreground mt-1">
              Announcements & General Updates
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Notices"
            value={notices.length.toString()}
            icon={Bell}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
          />
          <StatCard
            title="High Priority"
            value={highPriorityCount.toString()}
            icon={AlertCircle}
            iconColor="text-red-600"
            iconBgColor="bg-red-100"
          />
          <StatCard
            title="Pinned"
            value={pinnedCount.toString()}
            icon={Pin}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-100"
          />
          <StatCard
            title="New"
            value="-"
            icon={Calendar}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
          />
        </div>

        {/* Notices List */}
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-600" />
              School Announcements
            </CardTitle>
            <CardDescription>Important notices and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notices.length > 0 ? notices.map((notice) => {
                const priority = getPriorityInfo(notice.type)
                return (
                  <div key={notice._id} className={`p-4 border rounded-xl hover:shadow-md transition-all bg-white group ${notice.isPinned ? "border-l-4 border-l-purple-500 bg-purple-50/20" : ""
                    }`}>
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg shrink-0 ${priority.bg}`}>
                        {notice.type === 'urgent' ? <AlertCircle className={`h-5 w-5 ${priority.color}`} /> : <Bell className={`h-5 w-5 ${priority.color}`} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            {notice.isPinned && <Pin className="h-3 w-3 text-purple-600 fill-current" />}
                            <p className="font-bold text-gray-900">{notice.title}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${priority.bg} ${priority.text}`}>
                              {priority.label}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{notice.description}</p>

                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center gap-3">
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full font-medium capitalize">
                              {notice.type}
                            </span>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(notice.publishedDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                          {notice.attachments && notice.attachments.length > 0 && (
                            <Button variant="ghost" size="sm" className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => handleDownload(notice.attachments[0])}>
                              <Download className="h-4 w-4 mr-1" /> Attachment
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }) : (
                <div className="text-center py-6 text-muted-foreground">No notices found.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
