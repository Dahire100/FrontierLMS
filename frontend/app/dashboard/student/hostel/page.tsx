"use client"

import { API_URL } from "@/lib/api-config"
import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { StatCard } from "@/components/super-admin/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Home, Users, User, Phone, Wrench, LogOut, Clock, Plus } from "lucide-react"

import { toast } from "sonner"

export default function StudentHostel() {
  const [isServiceOpen, setIsServiceOpen] = useState(false)
  const [isOutpassOpen, setIsOutpassOpen] = useState(false)

  const [hostelInfo, setHostelInfo] = useState<any>(null)
  const [outpassHistory, setOutpassHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Forms
  const [outpassForm, setOutpassForm] = useState({ fromDate: "", toDate: "", reason: "", parentContact: "" })
  const [serviceForm, setServiceForm] = useState({ type: "", description: "" })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token')
      const headers = { 'Authorization': `Bearer ${token}` }

      // Parallel fetch
      const [hostelRes, outpassRes] = await Promise.all([
        fetch(`${API_URL}/api/student/hostel`, { headers }),
        fetch(`${API_URL}/api/student/hostel/outpass/history`, { headers })
      ])

      const hostelData = await hostelRes.json()
      const outpassData = await outpassRes.json()

      if (hostelData.success && hostelData.data) {
        setHostelInfo({
          roomNumber: hostelData.data.roomId ? hostelData.data.roomId.roomNumber : "N/A",
          block: hostelData.data.hostelId ? hostelData.data.hostelId.name : "N/A",
          floor: hostelData.data.roomId ? hostelData.data.roomId.floor : "N/A",
          type: hostelData.data.roomId ? hostelData.data.roomId.type : "Standard",
          warden: {
            name: hostelData.data.hostelId?.wardenName || "N/A",
            phone: hostelData.data.hostelId?.wardenPhone || "N/A"
          }
        })
      }

      if (outpassData.success) {
        setOutpassHistory(outpassData.data)
      }

    } catch (error) {
      console.error("Failed to fetch hostel data", error)
      toast.error("Failed to load hostel info")
    } finally {
      setLoading(false)
    }
  }

  const handleServiceRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/api/student/complaints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          complaintType: 'Hostel', // Tagging as Hostel complaint
          subject: `Hostel Service: ${serviceForm.type}`,
          description: serviceForm.description,
          priority: 'medium'
        })
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Request Submitted", { description: "Maintenance team has been notified." })
        setIsServiceOpen(false)
        setServiceForm({ type: "", description: "" })
      } else {
        toast.error("Submission Failed")
      }
    } catch (error) {
      toast.error("Error submitting request")
    } finally {
      setSubmitting(false)
    }
  }

  const handleOutpassApply = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/api/student/hostel/outpass`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(outpassForm)
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Application Submitted", { description: "Waiting for warden approval." })
        setIsOutpassOpen(false)
        setOutpassForm({ fromDate: "", toDate: "", reason: "", parentContact: "" })
        fetchData() // Refresh history
      } else {
        toast.error("Application Failed", { description: data.error })
      }
    } catch (error) {
      toast.error("Error applying outpass")
    } finally {
      setSubmitting(false)
    }
  }

  const mockRoommates = [
    { name: "Alice Student", class: "10-B", rollNo: "2024002", mobile: "+1 555-0123" },
    { name: "Bob Student", class: "10-C", rollNo: "2024003", mobile: "+1 555-0124" },
  ] // Placeholder as API doesn't return roommates yet

  if (loading) {
    return <div className="p-8 text-center">Loading Hostel Details...</div>
  }

  if (!hostelInfo) {
    return (
      <DashboardLayout title="Hostel">
        <div className="p-8 text-center">
          <h2 className="text-xl font-bold">No Hostel Assigned</h2>
          <p className="text-muted-foreground">You are not currently allocated to any hostel room.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Hostel">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Hostel Information
            </h2>
            <p className="text-muted-foreground mt-1">Your room, roommates, and services</p>
          </div>
          <div className="flex gap-2">
            {/* Service Request Dialog */}
            <Dialog open={isServiceOpen} onOpenChange={setIsServiceOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Wrench className="mr-2 h-4 w-4" /> Service Request
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleServiceRequest}>
                  <DialogHeader>
                    <DialogTitle>Raise Service/Maintenance Request</DialogTitle>
                    <DialogDescription>Report issues with your room or facilities.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label>Issue Type</Label>
                      <Select onValueChange={(v) => setServiceForm({ ...serviceForm, type: v })}>
                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="electrical">Electrical</SelectItem>
                          <SelectItem value="plumbing">Plumbing</SelectItem>
                          <SelectItem value="furniture">Furniture</SelectItem>
                          <SelectItem value="cleaning">Cleaning</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Description</Label>
                      <Textarea
                        placeholder="Describe the issue..."
                        required
                        value={serviceForm.description}
                        onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={submitting}>Submit Request</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Outpass Dialog */}
            <Dialog open={isOutpassOpen} onOpenChange={setIsOutpassOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <LogOut className="mr-2 h-4 w-4" /> Apply Outpass
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleOutpassApply}>
                  <DialogHeader>
                    <DialogTitle>Apply for Hostel Outpass</DialogTitle>
                    <DialogDescription>Request permission to leave the hostel premises.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>From Date</Label>
                        <Input type="date" required value={outpassForm.fromDate} onChange={e => setOutpassForm({ ...outpassForm, fromDate: e.target.value })} />
                      </div>
                      <div className="grid gap-2">
                        <Label>To Date</Label>
                        <Input type="date" required value={outpassForm.toDate} onChange={e => setOutpassForm({ ...outpassForm, toDate: e.target.value })} />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label>Reason</Label>
                      <Textarea placeholder="Reason for leaving..." required value={outpassForm.reason} onChange={e => setOutpassForm({ ...outpassForm, reason: e.target.value })} />
                    </div>
                    <div className="grid gap-2">
                      <Label>Parent's Contact</Label>
                      <Input placeholder="+1..." required value={outpassForm.parentContact} onChange={e => setOutpassForm({ ...outpassForm, parentContact: e.target.value })} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={submitting}>Submit Application</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard title="Room Number" value={hostelInfo.roomNumber} icon={Home} iconColor="text-blue-600" iconBgColor="bg-blue-100" />
          <StatCard title="Block" value={hostelInfo.block} icon={Home} iconColor="text-green-600" iconBgColor="bg-green-100" />
          <StatCard title="Floor" value={hostelInfo.floor} icon={Home} iconColor="text-purple-600" iconBgColor="bg-purple-100" />
          <StatCard title="Roommates" value={(mockRoommates.length + 1).toString()} icon={Users} iconColor="text-orange-600" iconBgColor="bg-orange-100" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-indigo-500" />Roommates</CardTitle>
                <CardDescription>People sharing room with you</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockRoommates.map((mate, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 border rounded-xl hover:shadow-md transition-all bg-white">
                      <Avatar className="h-12 w-12 border-2 border-indigo-100">
                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold">
                          {mate.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-gray-900">{mate.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Class {mate.class} • {mate.rollNo}</p>
                        <p className="text-xs text-blue-600 mt-1 flex items-center gap-1"><Phone className="h-3 w-3" /> {mate.mobile}</p>
                      </div>
                    </div>
                  ))}
                  {/* Add yourself placeholder */}
                  <div className="flex items-center gap-4 p-4 border rounded-xl bg-blue-50/50 border-blue-100">
                    <Avatar className="h-12 w-12 border-2 border-blue-200">
                      <AvatarFallback className="bg-blue-600 text-white font-bold">ME</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-gray-900">You</p>
                      <p className="text-xs text-blue-600 mt-1">Room Monitor</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5 text-orange-500" /> Outpass History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {outpassHistory.length === 0 ? <p className="text-muted-foreground text-center">No outpass history</p> :
                    outpassHistory.map((req) => (
                      <div key={req._id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50/50">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${req.status === "approved" ? "bg-green-100 text-green-600" : "bg-purple-100 text-purple-600"}`}>
                            <LogOut className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">Outpass Request</p>
                            <p className="text-xs text-muted-foreground">{new Date(req.fromDate).toLocaleDateString()} - {new Date(req.toDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs px-2 py-1 rounded-full border ${req.status === "approved" ? "bg-green-50 text-green-700 border-green-200" : "bg-yellow-50 text-yellow-700 border-yellow-200"
                            }`}>
                            {req.status}
                          </span>
                          <p className="text-[10px] text-gray-400 mt-1">{new Date(req.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-gray-900 to-gray-800 text-white border-none shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" />Warden Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center mb-6">
                  <Avatar className="h-20 w-20 border-4 border-white/20 mb-3">
                    <AvatarFallback className="bg-gray-700 text-2xl">W</AvatarFallback>
                  </Avatar>
                  <p className="font-bold text-xl">{hostelInfo.warden.name}</p>
                  <p className="text-sm text-gray-400">Head Warden - {hostelInfo.block}</p>
                </div>
                <div className="space-y-3">
                  <a href={`tel:${hostelInfo.warden.phone}`} className="flex items-center gap-3 p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                    <Phone className="h-5 w-5 text-green-400" />
                    <span className="text-sm font-medium">{hostelInfo.warden.phone}</span>
                  </a>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-white/10">
                    <Users className="h-5 w-5 text-blue-400" />
                    <span className="text-sm font-medium">Office Hours: 9 AM - 6 PM</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
