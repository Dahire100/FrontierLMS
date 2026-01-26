"use client"

import { API_URL } from "@/lib/api-config"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { StatCard } from "@/components/super-admin/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Video, Calendar, Clock, PlayCircle, Users, ExternalLink, Filter } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

export default function StudentOnlineClass() {
  const [activeTab, setActiveTab] = useState("live")
  const [loading, setLoading] = useState(true)
  const [liveClasses, setLiveClasses] = useState<any[]>([])
  const [recordings, setRecordings] = useState<any[]>([])

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`${API_URL}/api/student/online-classes`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await res.json()
        if (data.success) {
          // Determine status logic: Live if now is between start and end time?
          // Or use explicit 'status' field from backend if reliable.
          // Assuming backend 'status': 'scheduled', 'ongoing', 'completed'
          const now = new Date()

          const live = data.data.filter((c: any) => c.status !== "completed").map((c: any) => {
            let status = "Scheduled"
            const start = new Date(c.scheduledDate + ' ' + c.startTime)
            // Note: Date parsing depends on backend format. Assuming simplified check for now or using c.status directly
            if (c.status === 'ongoing') status = "Live Now"
            else if (c.status === 'scheduled') status = "Upcoming" // Simplified

            return {
              id: c._id,
              subject: c.subject || "General",
              topic: c.title || c.description || "Class Session",
              teacher: c.teacherId ? `${c.teacherId.firstName} ${c.teacherId.lastName}` : "Teacher",
              time: c.startTime || "N/A",
              date: c.scheduledDate,
              duration: c.duration ? `${c.duration} min` : "45 min",
              status: status,
              participants: 0, // Not available in basic endpoint
              link: c.joinUrl || "#"
            }
          })
          setLiveClasses(live)

          const past = data.data.filter((c: any) => c.status === "completed").map((c: any) => ({
            id: c._id,
            subject: c.subject || "General",
            topic: c.title || "Class Session",
            teacher: c.teacherId ? `${c.teacherId.firstName} ${c.teacherId.lastName}` : "Teacher",
            date: c.scheduledDate,
            duration: c.duration ? `${c.duration} min` : "45 min",
            views: 0,
            link: c.joinUrl || "#" // Might be recording link if supported
          }))
          setRecordings(past)
        }
      } catch (error) {
        console.error("Failed to fetch online classes", error)
        toast.error("Failed to load classes")
      } finally {
        setLoading(false)
      }
    }
    fetchClasses()
  }, [])

  const liveNow = liveClasses.filter(c => c.status === "Live Now").length
  const upcoming = liveClasses.filter(c => c.status === "Upcoming" || c.status === "Scheduled").length

  const handleJoin = (link: string) => {
    if (link && link !== "#") {
      window.open(link, "_blank")
      toast.success("Joining class...", { description: "Redirecting to video platform." })
    } else {
      toast.error("Invalid Link", { description: "Class link is not available." })
    }
  }

  if (loading) {
    return <div className="p-8 text-center">Loading Online Classes...</div>
  }

  return (
    <DashboardLayout title="Online Class">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Online Classes
          </h2>
          <p className="text-muted-foreground mt-1">
            Join live classes and watch recordings
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Live Now"
            value={liveNow.toString()}
            icon={Video}
            iconColor="text-red-600"
            iconBgColor="bg-red-100"
          />
          <StatCard
            title="Upcoming"
            value={upcoming.toString()}
            icon={Calendar}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
          />
          <StatCard
            title="Recordings"
            value={recordings.length.toString()}
            icon={PlayCircle}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-100"
          />
          <StatCard
            title="Attended"
            value="-" // Placeholder
            icon={Users}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
          />
        </div>

        <Tabs defaultValue="live" className="w-full" onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="live" className="gap-2"><Video className="h-4 w-4" /> Live & Upcoming</TabsTrigger>
              <TabsTrigger value="recordings" className="gap-2"><PlayCircle className="h-4 w-4" /> Recordings</TabsTrigger>
            </TabsList>
            <div className="hidden md:flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => toast.info("Filter Options", { description: "Advanced filters coming soon." })}>
                <Filter className="mr-2 h-4 w-4" /> Filter
              </Button>
            </div>
          </div>

          <TabsContent value="live" className="space-y-4">
            {liveClasses.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">No live or upcoming classes found.</div>
            ) : liveClasses.map((classItem) => (
              <div key={classItem.id} className="p-4 border rounded-xl hover:shadow-md transition-shadow bg-white">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`p-3 rounded-full ${classItem.status === "Live Now" ? "bg-red-100 animate-pulse" :
                      classItem.status === "Upcoming" ? "bg-blue-100" : "bg-gray-100"
                      }`}>
                      <Video className={`h-6 w-6 ${classItem.status === "Live Now" ? "text-red-600" :
                        classItem.status === "Upcoming" ? "text-blue-600" : "text-gray-600"
                        }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg">{classItem.subject}</h3>
                        <Badge variant={classItem.status === "Live Now" ? "destructive" : "secondary"}>
                          {classItem.status}
                        </Badge>
                        <span className="text-sm font-medium text-gray-500">• {classItem.topic}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {classItem.teacher}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {classItem.time}</span>
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(classItem.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    {classItem.status === "Live Now" ? (
                      <Button className="bg-red-600 hover:bg-red-700 w-full md:w-auto" onClick={() => handleJoin(classItem.link)}>
                        <PlayCircle className="mr-2 h-4 w-4" /> Join Class
                      </Button>
                    ) : (
                      <Button variant="outline" className="w-full md:w-auto" disabled={classItem.status === "Scheduled"}>
                        {classItem.status === "Upcoming" ? "Join Waiting Room" : "Not Started"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="recordings" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recordings.length === 0 ? (
                <div className="col-span-2 text-center py-10 text-muted-foreground">No past recordings found.</div>
              ) : recordings.map((recording) => (
                <Card key={recording.id} className="hover:shadow-md transition-all cursor-pointer group">
                  <CardContent className="p-4 flex gap-4">
                    <div className="relative h-24 w-40 bg-gray-900 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <PlayCircle className="h-8 w-8 text-white z-10 opacity-80 group-hover:scale-110 transition-transform" />
                      <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 text-white text-[10px] rounded">
                        {recording.duration}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-base line-clamp-1">{recording.topic}</h4>
                      <p className="text-sm text-blue-600 font-medium mb-1">{recording.subject}</p>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>{recording.teacher}</p>
                        <p>{new Date(recording.date).toLocaleDateString()} • {recording.views} views</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

      </div>
    </DashboardLayout>
  )
}
