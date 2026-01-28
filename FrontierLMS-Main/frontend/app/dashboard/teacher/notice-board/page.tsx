"use client"

import { API_URL } from "@/lib/api-config"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { StatCard } from "@/components/super-admin/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, AlertCircle, Info, Calendar, Loader2, Sparkles, ChevronRight } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface Notice {
  _id: string;
  title: string;
  message: string;
  publishedDate: string;
  type: string;
  priority: string;
}

export default function TeacherNoticeBoard() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchNotices()
  }, [])

  const fetchNotices = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/api/teacher/notices`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        setNotices(data.data)
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to load notices", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const totalNotices = notices.length
  const highPriority = notices.filter(n => n.priority === "high" || n.type === 'urgent').length
  const urgentCount = notices.filter(n => n.type === 'urgent').length

  if (loading) {
    return (
      <DashboardLayout title="Notice Board">
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Communication Hub">
      <div className="space-y-8 max-w-[1200px] mx-auto pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-4xl font-black text-gray-900 tracking-tight italic uppercase">Institutional Gazettes</h2>
            <p className="text-muted-foreground font-medium italic">Official announcements and administrative directives for the faculty.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Total Gazettes" value={totalNotices.toString()} icon={Bell} iconColor="text-indigo-600" iconBgColor="bg-indigo-50" />
          <StatCard title="Urgent Alerts" value={urgentCount.toString()} icon={AlertCircle} iconColor="text-red-600" iconBgColor="bg-red-50" />
          <StatCard title="Active Directives" value={totalNotices.toString()} icon={Info} iconColor="text-blue-600" iconBgColor="bg-blue-50" />
        </div>

        <Card className="border-none shadow-2xl shadow-indigo-100/30 ring-1 ring-gray-100 overflow-hidden">
          <CardHeader className="bg-gray-50/50 border-b py-6 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 font-black text-gray-800 uppercase tracking-wider italic">
                <Bell className="h-5 w-5 text-indigo-600" />
                Live Broadcasts
              </CardTitle>
              <CardDescription className="italic font-medium">Critical institutional knowledge base.</CardDescription>
            </div>
            <Sparkles className="h-5 w-5 text-indigo-400 opacity-50" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {notices.length > 0 ? notices.map((notice, index) => (
                <div key={notice._id || index} className={`p-6 hover:bg-indigo-50/20 transition-all group flex flex-col md:flex-row md:items-start gap-6 ${notice.priority === "high" || notice.type === 'urgent' ? "bg-red-50/10" : ""
                  }`}>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h4 className="text-xl font-black text-gray-900 group-hover:text-indigo-600 transition-colors italic uppercase">{notice.title}</h4>
                      {notice.type === 'urgent' && <Badge className="bg-red-600 text-white font-black border-none px-3 h-6 rounded-lg uppercase tracking-tighter text-[10px] animate-pulse">URGENT</Badge>}
                      <Badge variant="outline" className="border-indigo-100 bg-white font-black text-indigo-600 h-6 px-3 rounded-lg uppercase tracking-tighter text-[10px]">{notice.type || 'Standard'}</Badge>
                    </div>
                    <p className="text-sm font-medium text-gray-600 leading-relaxed italic">{notice.message}</p>
                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <Calendar className="h-3 w-3" />
                      <span>Release Date: {new Date(notice.publishedDate).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                      <span className="mx-2">•</span>
                      <span>Ref: {notice._id ? notice._id.slice(-8).toUpperCase() : 'BCAST-' + index}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-10 w-10 text-gray-300 group-hover:text-indigo-600 group-hover:bg-indigo-50 rounded-xl">
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              )) : (
                <div className="p-20 text-center space-y-4">
                  <div className="h-20 w-20 bg-gray-50 rounded-3xl mx-auto flex items-center justify-center opacity-50">
                    <Bell className="h-10 w-10 text-gray-300" />
                  </div>
                  <p className="text-sm font-black text-gray-300 uppercase tracking-widest italic">No Institutional Gazettes Issued.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
