"use client"

import { API_URL } from "@/lib/api-config"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { StatCard } from "@/components/super-admin/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Laptop, Video, Clock, ExternalLink, Users, ChevronDown, Calendar } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

export default function OnlineClassLinks() {
  const [selectedChild, setSelectedChild] = useState<string>("")
  const [children, setChildren] = useState<any[]>([])
  const [onlineClasses, setOnlineClasses] = useState<any[]>([])
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

  // Fetch online classes when selected child changes
  useEffect(() => {
    if (!selectedChild) return

    const fetchOnlineClasses = async () => {
      // Endpoint assumption based on pattern: /api/parent/child/:id/online-classes
      // If not exist, will fail gracefully to empty list
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`${API_URL}/api/parent/child/${selectedChild}/online-classes`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await res.json()

        if (data.success) {
          setOnlineClasses(data.data)
        } else {
          setOnlineClasses([])
        }
      } catch (error) {
        console.error("Failed to fetch online classes", error)
        setOnlineClasses([])
      } finally {
        setLoading(false)
      }
    }
    fetchOnlineClasses()
  }, [selectedChild])


  const handleJoin = (link: string) => {
    if (link) {
      window.open(link, '_blank')
      toast.success("Joining Class", { description: `Launching meeting...` })
    } else {
      toast.error("Invalid Link", { description: "Meeting link is missing." })
    }
  }

  const getSelectedChildName = () => {
    const child = children.find(c => c._id === selectedChild)
    return child ? `${child.firstName} ${child.lastName}` : "Loading..."
  }

  if (loading) {
    return (
      <DashboardLayout title="Online Class Links">
        <div className="flex h-screen items-center justify-center">Loading...</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Online Class Links">
      <div className="space-y-6 animate-in fade-in-50 duration-500">
        {/* Header with Child Selector */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Online Classes
            </h2>
            <p className="text-muted-foreground mt-1">
              Virtual classroom links for {getSelectedChildName()}
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Today's Classes"
            value={onlineClasses.length.toString()}
            icon={Laptop}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
          />
          <StatCard
            title="Live Now"
            value={onlineClasses.filter(c => c.status === "Live").length.toString()}
            // 'status' field presence depends on backend, assuming it might exist or defaulting
            icon={Video}
            iconColor="text-red-600"
            iconBgColor="bg-red-100"
          />
          <StatCard
            title="Upcoming"
            value={onlineClasses.length.toString()} // Simplified
            icon={Clock}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
          />
        </div>

        {/* Class List */}
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Laptop className="h-5 w-5 text-blue-600" />
              Class Schedule
            </CardTitle>
            <CardDescription>Join your scheduled online sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {onlineClasses.length > 0 ? onlineClasses.map((item, index) => (
                <div key={item._id || index} className="p-4 border rounded-xl hover:shadow-lg transition-all bg-white flex flex-col gap-3 group">
                  <div className="flex justify-between items-start">
                    <div className={`px-2 py-1 rounded text-xs font-bold bg-blue-100 text-blue-600`}>
                      SCHEDULED
                    </div>
                    <div className="p-2 bg-gray-50 rounded-full group-hover:bg-blue-50 transition-colors">
                      <Video className="h-5 w-5 text-gray-500 group-hover:text-blue-600" />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{item.subject}</h3>
                    <p className="text-sm text-gray-500">
                      with {item.teacherId ? `${item.teacherId.firstName} ${item.teacherId.lastName}` : "Class Teacher"}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {item.startTime}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    Platform: <span className="font-medium text-gray-600 uppercase">{item.platform}</span>
                  </div>

                  <Button className={`w-full mt-2 bg-blue-600 hover:bg-blue-700`} onClick={() => handleJoin(item.meetingLink)}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Join Class
                  </Button>
                </div>
              )) : (
                <div className="col-span-full text-center py-10 text-gray-500">No online classes scheduled.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
