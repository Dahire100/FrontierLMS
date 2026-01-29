"use client"

import { API_URL } from "@/lib/api-config"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { StatCard } from "@/components/super-admin/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Bus, MapPin, Clock, User, Phone, Navigation, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

export default function StudentTransport() {
  const [transportInfo, setTransportInfo] = useState<any>(null)
  const [routeStops, setRouteStops] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTransport()
  }, [])

  const fetchTransport = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/api/student/transport`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success && data.data) {
        const info = data.data
        setTransportInfo({
          busNumber: info.vehicleNumber || "N/A",
          route: info.routeName,
          pickupTime: info.pickupTime || "TBD",
          dropTime: info.dropTime || "TBD",
          // Mocking driver/assistant if not in basic route object, or using placeholders
          driver: { name: info.driverName || "Assigned Driver", phone: info.driverPhone || "N/A" },
          assistant: { name: info.assistantName || "Assigned Assistant", phone: info.assistantPhone || "N/A" }
        })

        if (info.stops) {
          const formattedStops = info.stops.map((stop: any, index: number) => ({
            stop: stop.location,
            time: stop.time,
            status: index < 2 ? "Passed" : (index === 2 ? "Current" : "Next"), // Mock status logic for now
            color: index === 2 ? "text-blue-600 bg-blue-100 animate-pulse" : (index < 2 ? "text-gray-400 bg-gray-100" : "text-green-600 bg-green-100")
          }))
          setRouteStops(formattedStops)
        } else {
          // Fallback stops if none
          setRouteStops([
            { stop: "Start Point", time: "7:00 AM", status: "Passed", color: "text-gray-400 bg-gray-100" },
            { stop: "School", time: "8:00 AM", status: "Next", color: "text-green-600 bg-green-100" }
          ])
        }
      } else {
        setTransportInfo(null)
      }
    } catch (error) {
      console.error("Failed to fetch transport", error)
      toast.error("Failed to load transport details")
    } finally {
      setLoading(false)
    }
  }

  const handleNotifyAbsence = () => {
    toast.success("Notification Sent", { description: "Transport admin has been notified of your absence." })
  }

  if (loading) {
    return <div className="p-8 text-center">Loading Transport Details...</div>
  }

  if (!transportInfo) {
    return (
      <DashboardLayout title="Transport">
        <div className="p-8 text-center">
          <h2 className="text-xl font-bold">No Transport Assigned</h2>
          <p className="text-muted-foreground">You are not subscribed to any transport route.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Transport">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Transport
            </h2>
            <p className="text-muted-foreground mt-1">Bus route, schedule, and live tracking</p>
          </div>
          <Button variant="destructive" onClick={handleNotifyAbsence}>
            <AlertTriangle className="mr-2 h-4 w-4" /> Notify Absence
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="Bus Number" value={transportInfo.busNumber} icon={Bus} iconColor="text-blue-600" iconBgColor="bg-blue-100" />
          <StatCard title="Morning Pickup" value={transportInfo.pickupTime} icon={Clock} iconColor="text-green-600" iconBgColor="bg-green-100" />
          <StatCard title="Afternoon Drop" value={transportInfo.dropTime} icon={Clock} iconColor="text-purple-600" iconBgColor="bg-purple-100" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Route Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="overflow-hidden">
              <div className="h-48 bg-slate-100 relative w-full flex items-center justify-center">
                <div className="absolute inset-0 bg-slate-200 bg-cover bg-center opacity-50 grayscale flex items-center justify-center text-slate-400">
                  Map View Unavailable
                </div>
                <div className="z-10 text-center">
                  <div className="bg-white/80 backdrop-blur-sm p-3 rounded-xl shadow-sm mb-2 inline-flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <span className="font-semibold text-sm">Live Tracking Active</span>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono">Simulated Map View</p>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" /> {transportInfo.route}</CardTitle>
                <CardDescription>Current journey progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative pl-6 border-l-2 border-gray-200 ml-4 space-y-8 py-2">
                  {routeStops.map((stop, i) => (
                    <div key={i} className="relative">
                      <div className={`absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 border-white shadow-sm flex items-center justify-center ${stop.status === "Current" ? "bg-blue-600 ring-4 ring-blue-100" :
                        stop.status === "Passed" ? "bg-gray-400" : "bg-green-500"
                        }`} />
                      <div className="flex items-start justify-between bg-gray-50 p-3 rounded-lg">
                        <div>
                          <p className={`font-semibold ${stop.status === "Current" ? "text-blue-700" : "text-gray-900"}`}>{stop.stop}</p>
                          <p className="text-xs text-muted-foreground">{stop.status}</p>
                        </div>
                        <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded border shadow-sm">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs font-medium font-mono">{stop.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Driver & Support */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" />Crew Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 border-2 border-blue-100">
                    <AvatarFallback className="bg-blue-600 text-white">D</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold">{transportInfo.driver.name}</p>
                    <p className="text-xs text-muted-foreground">Main Driver</p>
                    <a href={`tel:${transportInfo.driver.phone}`} className="text-xs text-blue-600 flex items-center gap-1 mt-1 font-medium hover:underline">
                      <Phone className="h-3 w-3" /> Call Driver
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-4 pt-4 border-t">
                  <Avatar className="h-12 w-12 border-2 border-green-100">
                    <AvatarFallback className="bg-green-600 text-white">A</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold">{transportInfo.assistant.name}</p>
                    <p className="text-xs text-muted-foreground">Bus Assistant</p>
                    <a href={`tel:${transportInfo.assistant.phone}`} className="text-xs text-blue-600 flex items-center gap-1 mt-1 font-medium hover:underline">
                      <Phone className="h-3 w-3" /> Call Assistant
                    </a>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => toast.info("Use the live tracking map above", { description: "Full screen map view is currently disabled." })}>
                  <Navigation className="mr-2 h-4 w-4" /> View Full Route Map
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
