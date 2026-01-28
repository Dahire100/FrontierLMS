"use client"

import { API_URL } from "@/lib/api-config"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { StatCard } from "@/components/super-admin/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Home, Users, User, Phone, LogOut, Clock, ChevronDown } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

export default function ParentHostel() {
    const [selectedChild, setSelectedChild] = useState<string>("")
    const [children, setChildren] = useState<any[]>([])
    const [hostelData, setHostelData] = useState<any>(null)
    const [outpasses, setOutpasses] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isOutpassOpen, setIsOutpassOpen] = useState(false)
    const [outpassForm, setOutpassForm] = useState({ fromDate: "", toDate: "", reason: "" })

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

    // Fetch hostel data when selected child changes
    useEffect(() => {
        if (!selectedChild) return

        const fetchHostel = async () => {
            try {
                const token = localStorage.getItem('token')
                const headers = { 'Authorization': `Bearer ${token}` }

                // Fetch Hostel Data
                const res = await fetch(`${API_URL}/api/parent/child/${selectedChild}/hostel`, { headers })
                const data = await res.json()

                if (data.success && data.data) {
                    setHostelData(data.data)
                } else {
                    setHostelData(null)
                }

                // Fetch Outpass History
                const outpassRes = await fetch(`${API_URL}/api/parent/child/${selectedChild}/hostel/outpass`, { headers })
                const outpassData = await outpassRes.json()
                if (outpassData.success) {
                    setOutpasses(outpassData.data)
                }

            } catch (error) {
                console.error("Failed to fetch hostel details", error)
                setHostelData(null)
            } finally {
                setLoading(false)
            }
        }
        fetchHostel()
    }, [selectedChild])

    const handleOutpassApply = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`${API_URL}/api/parent/child/${selectedChild}/hostel/outpass`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(outpassForm)
            })
            const data = await res.json()
            if (data.success) {
                toast.success("Outpass Requested", { description: "Your request has been submitted successfully." })
                setIsOutpassOpen(false)
                setOutpassForm({ fromDate: "", toDate: "", reason: "" })
                // Refresh outpasses
                const outpassRes = await fetch(`${API_URL}/api/parent/child/${selectedChild}/hostel/outpass`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                const outpassData = await outpassRes.json()
                if (outpassData.success) {
                    setOutpasses(outpassData.data)
                }

            } else {
                toast.error("Failed to submit request", { description: data.error })
            }
        } catch (error) {
            toast.error("An error occurred")
        }
    }

    const getSelectedChildName = () => {
        const child = children.find(c => c._id === selectedChild)
        return child ? `${child.firstName} ${child.lastName}` : "Loading..."
    }

    if (loading) {
        return (
            <DashboardLayout title="Hostel">
                <div className="flex h-screen items-center justify-center">Loading...</div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout title="Hostel">
            <div className="space-y-6 animate-in fade-in-50 duration-500">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Hostel Details
                        </h2>
                        <p className="text-muted-foreground mt-1">
                            Accommodation details for {getSelectedChildName()}
                        </p>
                    </div>

                    <div className="flex gap-2">
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

                        {hostelData && (
                            <Dialog open={isOutpassOpen} onOpenChange={setIsOutpassOpen}>
                                <DialogTrigger asChild>
                                    <Button className="bg-blue-600 hover:bg-blue-700">
                                        <LogOut className="mr-2 h-4 w-4" /> Request Outpass
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <form onSubmit={handleOutpassApply}>
                                        <DialogHeader>
                                            <DialogTitle>Request Hostel Outpass</DialogTitle>
                                            <DialogDescription>Request permission for your child to leave the hostel.</DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="grid gap-2">
                                                    <Label>From Date</Label>
                                                    <Input
                                                        type="date"
                                                        required
                                                        value={outpassForm.fromDate}
                                                        onChange={(e) => setOutpassForm({ ...outpassForm, fromDate: e.target.value })}
                                                    />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label>To Date</Label>
                                                    <Input
                                                        type="date"
                                                        required
                                                        value={outpassForm.toDate}
                                                        onChange={(e) => setOutpassForm({ ...outpassForm, toDate: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid gap-2">
                                                <Label>Reason</Label>
                                                <Textarea
                                                    placeholder="Reason for leaving..."
                                                    required
                                                    value={outpassForm.reason}
                                                    onChange={(e) => setOutpassForm({ ...outpassForm, reason: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter><Button type="submit">Submit Request</Button></DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
                </div>

                {!hostelData ? (
                    <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed">
                        <Home className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">No Hostel Assigned</h3>
                        <p className="text-gray-500">This student is not currently allocated to any hostel room.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <StatCard title="Room" value={hostelData.roomId?.roomNumber || "N/A"} icon={Home} iconColor="text-blue-600" iconBgColor="bg-blue-100" />
                            <StatCard title="Hostel" value={hostelData.hostelId?.name || "N/A"} icon={Home} iconColor="text-green-600" iconBgColor="bg-green-100" />
                            <StatCard title="Floor" value={hostelData.roomId?.floor || "N/A"} icon={Home} iconColor="text-purple-600" iconBgColor="bg-purple-100" />
                            <StatCard title="Capacity" value={hostelData.roomId?.capacity?.toString() || "N/A"} icon={Users} iconColor="text-orange-600" iconBgColor="bg-orange-100" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-6">
                                <Card className="border-none shadow-md">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5 text-orange-500" /> Activity</CardTitle>
                                        <CardDescription>Recent outpass requests</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {outpasses.length > 0 ? outpasses.map((outpass, i) => (
                                                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div>
                                                        <p className="font-semibold text-sm">{new Date(outpass.fromDate).toLocaleDateString()} - {new Date(outpass.toDate).toLocaleDateString()}</p>
                                                        <p className="text-xs text-muted-foreground">{outpass.reason}</p>
                                                    </div>
                                                    <span className={`px-2 py-1 text-xs font-bold rounded capitalize ${outpass.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                            outpass.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                                'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {outpass.status}
                                                    </span>
                                                </div>
                                            )) : (
                                                <div className="text-center py-6 text-muted-foreground text-sm">
                                                    No outpass history found.
                                                </div>
                                            )}
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
                                            <p className="font-bold text-xl">{hostelData.hostelId?.wardenName || "Warden"}</p>
                                            <p className="text-sm text-gray-400">Hostel Warden</p>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                                                <Phone className="h-5 w-5 text-green-400" />
                                                <span className="text-sm font-medium">{hostelData.hostelId?.wardenContact || "Not Available"}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </DashboardLayout>
    )
}
