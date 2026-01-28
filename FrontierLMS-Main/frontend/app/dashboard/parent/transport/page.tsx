"use client"

import { API_URL } from "@/lib/api-config"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { StatCard } from "@/components/super-admin/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bus, MapPin, Clock, User, Phone, Navigation, Users, ChevronDown, Locate } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

export default function ParentTransport() {
  const [selectedChild, setSelectedChild] = useState<string>("")
  const [children, setChildren] = useState<any[]>([])
  const [transportData, setTransportData] = useState<any>(null)
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

  // Fetch transport when selected child changes
  useEffect(() => {
    if (!selectedChild) return

    const fetchTransport = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`${API_URL}/api/parent/child/${selectedChild}/transport`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await res.json()

        if (data.success) {
          setTransportData(data.data)
        } else {
          setTransportData(null)
        }
      } catch (error) {
        console.error("Failed to fetch transport", error)
        toast.error("Failed to load transport details")
        setTransportData(null)
      } finally {
        setLoading(false)
      }
    }
    fetchTransport()
  }, [selectedChild])

  const handleTrackBus = () => {
    toast.info("Map Loading", { description: `Opening live tracking for ${transportData?.vehicleNumber || "Bus"}...` })
  }

  const handleContactDriver = () => {
    toast.success("Contact Initiated", { description: `Calling Driver...` })
  }

  const getSelectedChildName = () => {
    const child = children.find(c => c._id === selectedChild)
    return child ? `${child.firstName} ${child.lastName}` : "Loading..."
  }

  if (loading) {
    return (
      <DashboardLayout title="Transport">
        <div className="flex h-screen items-center justify-center">Loading...</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Transport">
      <div className="space-y-6 animate-in fade-in-50 duration-500">
        {/* Header with Child Selector */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Transport Details
            </h2>
            <p className="text-muted-foreground mt-1">
              Bus route and tracking for {getSelectedChildName()}
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

        {!transportData ? (
          <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed">
            <Bus className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <h3 className="text-lg font-medium text-gray-900">No Transport Assigned</h3>
            <p className="text-gray-500">This student is not assigned to any transport route.</p>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard
                title="Bus Number"
                value={transportData.vehicleNumber || "N/A"}
                icon={Bus}
                iconColor="text-blue-600"
                iconBgColor="bg-blue-100"
              />
              <StatCard
                title="Route"
                value={transportData.routeName || "N/A"}
                icon={Navigation}
                iconColor="text-green-600"
                iconBgColor="bg-green-100"
              />
              <StatCard
                title="Pickup Time"
                value={transportData.stops?.[0]?.time || "N/A"} // Assuming first stop is approximate pickup
                icon={Clock}
                iconColor="text-orange-600"
                iconBgColor="bg-orange-100"
              />
              <StatCard
                title="Drop Time"
                value="3:30 PM" // Placeholder or need field in backend
                icon={Clock}
                iconColor="text-purple-600"
                iconBgColor="bg-purple-100"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bus Details */}
              <Card className="border-none shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Bus className="h-5 w-5 text-blue-600" />
                        Bus Information
                      </CardTitle>
                      <CardDescription>Route and schedule details</CardDescription>
                    </div>
                    <Button size="sm" onClick={handleTrackBus} className="bg-blue-600 hover:bg-blue-700">
                      <Locate className="h-4 w-4 mr-1" /> Track Live
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="font-bold text-blue-700">{(transportData.vehicleNumber || "BUS").split('-')[1] || "01"}</span>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Vehicle Number</p>
                        <p className="font-semibold text-gray-900">{transportData.vehicleNumber || "N/A"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <Navigation className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-xs text-muted-foreground">Assigned Route</p>
                        <p className="font-semibold text-gray-900">{transportData.routeName}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 border rounded-lg text-center bg-gray-50">
                        <p className="text-xs text-muted-foreground mb-1">Bus Capacity</p>
                        <p className="text-lg font-bold text-gray-800">{transportData.capacity || 40}</p>
                      </div>
                      <div className="p-3 border rounded-lg text-center bg-gray-50">
                        <p className="text-xs text-muted-foreground mb-1">Current Occupancy</p>
                        <p className="text-lg font-bold text-gray-800">{transportData.students?.length || 0}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Staff Information */}
              <Card className="border-none shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-purple-600" />
                    Transport Staff
                  </CardTitle>
                  <CardDescription>Driver and attendant details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Driver */}
                  <div className="p-4 border rounded-xl hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 mb-1">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold">
                            D
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-gray-900">{transportData.driverName || "Unknown Driver"}</p>
                          <p className="text-xs text-muted-foreground">Driver • {transportData.driverPhone || "No contact"}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={handleContactDriver}>
                        <Phone className="h-3 w-3 mr-1" /> Call
                      </Button>
                    </div>
                  </div>

                  {/* Helper/Attendant - Data might not be in route object, using placeholder if missing or derived from somewhere else */}
                  {transportData.helperName && (
                    <div className="p-4 border rounded-xl hover:shadow-sm transition-shadow">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold">
                            H
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-gray-900">{transportData.helperName}</p>
                          <p className="text-xs text-muted-foreground">Bus Attendant</p>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                            <Phone className="h-3 w-3" /> {transportData.helperPhone || "N/A"}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Route Stops */}
            {transportData.stops && transportData.stops.length > 0 && (
              <Card className="border-none shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-red-600" />
                    Route Timeline
                  </CardTitle>
                  <CardDescription>Complete route with scheduled timings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative border-l-2 border-gray-200 ml-4 space-y-6">
                    {transportData.stops.map((stop: any, index: number) => (
                      <div key={index} className="ml-6 relative">
                        <div className={`absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 border-white shadow-sm ${index === 0 ? "bg-green-500" :
                          index === transportData.stops.length - 1 ? "bg-blue-600" : "bg-gray-300"
                          }`} />
                        <div className="flex items-start justify-between p-3 border rounded-lg bg-white hover:shadow-sm transition-shadow">
                          <div>
                            <p className="font-semibold text-gray-900">{stop.stopName}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${index === 0 ? "bg-green-100 text-green-700" :
                              index === transportData.stops.length - 1 ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                              }`}>
                              {index === 0 ? "Pickup" : index === transportData.stops.length - 1 ? "Arrival" : "Stop"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-sm font-medium text-gray-600">
                            <Clock className="h-3 w-3" />
                            {stop.pickupTime}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
