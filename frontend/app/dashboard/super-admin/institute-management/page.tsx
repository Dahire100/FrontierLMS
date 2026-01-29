"use client"

import { API_URL } from "@/lib/api-config"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Building2,
  Users,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ArrowRight,
  MoreHorizontal,
  Filter,
  Download,
  RefreshCw,
  ShieldCheck,
  AlertTriangle
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"

interface School {
  _id: string
  schoolName: string
  email: string
  contactNumber: string
  address: string
  city: string
  state: string
  country: string
  pinCode: string
  principalName: string
  principalEmail: string
  principalPhone: string
  schoolType: string
  boardType: string
  establishmentYear: string
  description: string
  totalStudents?: string
  totalTeachers?: string
  status: 'pending' | 'approved' | 'rejected' | 'active'
  adminEmail?: string
  createdAt: string
  updatedAt: string
}

export default function InstituteManagement() {
  const [schools, setSchools] = useState<School[]>([])
  const [filteredSchools, setFilteredSchools] = useState<School[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)

  // Fetch schools from backend
  const fetchSchools = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('token')

      // Using the correct endpoint that returns all schools
      const response = await fetch(`${API_URL}/api/schools/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        // Handle both array directly or { schools: [...] } format
        const schoolList = Array.isArray(data) ? data : (data.schools || [])
        setSchools(schoolList)
        setFilteredSchools(schoolList)
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Failed to fetch schools:", response.status, response.statusText, errorData);
        toast.error(`Failed to load institutes: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      console.error('Error fetching schools:', error)
      toast.error("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSchools()
  }, [])

  // Filter logic
  useEffect(() => {
    let result = schools

    // Filter by tab
    if (activeTab === "pending") {
      result = result.filter(s => s.status === 'pending')
    } else if (activeTab === "active") {
      result = result.filter(s => s.status === 'approved' || s.status === 'active')
    } else if (activeTab === "rejected") {
      result = result.filter(s => s.status === 'rejected')
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(s =>
        s.schoolName.toLowerCase().includes(query) ||
        s.email.toLowerCase().includes(query) ||
        s.city.toLowerCase().includes(query) ||
        s.principalName.toLowerCase().includes(query)
      )
    }

    setFilteredSchools(result)
  }, [schools, activeTab, searchQuery])

  const handleApprove = async (schoolId: string) => {
    try {
      setProcessingId(schoolId)
      const token = localStorage.getItem('token')

      const response = await fetch(`${API_URL}/api/schools/${schoolId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("School Approved Successfully", {
          description: "Login credentials have been sent to the administrator."
        })
        fetchSchools()
      } else {
        toast.error("Approval Failed", {
          description: data.error || "Something went wrong."
        })
      }
    } catch (error) {
      console.error('Error approving school:', error)
      toast.error("System Error", {
        description: "Failed to connect to the server."
      })
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (schoolId: string) => {
    const reason = prompt('Please enter the reason for rejection:')
    if (!reason) return

    try {
      setProcessingId(schoolId)
      const token = localStorage.getItem('token')

      const response = await fetch(`${API_URL}/api/schools/${schoolId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      })

      if (response.ok) {
        toast.success("School Rejected")
        fetchSchools()
      } else {
        toast.error("Rejection Failed")
      }
    } catch (error) {
      console.error('Error rejecting school:', error)
      toast.error("System Error")
    } finally {
      setProcessingId(null)
    }
  }

  const handleView = (school: School) => {
    setSelectedSchool(school)
    setIsViewOpen(true)
  }

  const handleEdit = (school: School) => {
    // setSelectedSchool(school)
    // setIsEditOpen(true)
    toast.info("Edit Functionality", {
      description: "This feature is coming soon."
    })
  }

  const handleSuspend = async (schoolId: string) => {
    if (!confirm("Are you sure you want to suspend this school's access?")) return

    try {
      setProcessingId(schoolId)
      const token = localStorage.getItem('token')

      const response = await fetch(`${API_URL}/api/schools/${schoolId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'suspended' })
      })

      if (response.ok) {
        toast.success("School Suspended")
        fetchSchools()
      } else {
        const data = await response.json()
        toast.error("Suspension Failed", { description: data.error })
      }
    } catch (error) {
      console.error('Error suspending school:', error)
      toast.error("System Error")
    } finally {
      setProcessingId(null)
    }
  }

  // Stats for the top cards
  const stats = {
    total: schools.length,
    active: schools.filter(s => s.status === 'approved' || s.status === 'active').length,
    pending: schools.filter(s => s.status === 'pending').length,
    rejected: schools.filter(s => s.status === 'rejected').length
  }

  const pendingSchools = schools.filter(s => s.status === 'pending')

  return (
    <DashboardLayout title="Institute Management">
      <div className="space-y-8 max-w-7xl mx-auto pb-10">

        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Institutes"
            value={stats.total}
            icon={<Building2 className="h-5 w-5 text-blue-600" />}
            bg="bg-blue-50"
            trend="+12% from last month"
          />
          <StatsCard
            title="Active Schools"
            value={stats.active}
            icon={<CheckCircle className="h-5 w-5 text-emerald-600" />}
            bg="bg-emerald-50"
            trend="98% uptime"
          />
          <StatsCard
            title="Pending Approval"
            value={stats.pending}
            icon={<Clock className="h-5 w-5 text-amber-600" />}
            bg="bg-amber-50"
            trend="Action required"
            highlight={stats.pending > 0}
          />
          <StatsCard
            title="Rejected"
            value={stats.rejected}
            icon={<XCircle className="h-5 w-5 text-red-600" />}
            bg="bg-red-50"
            trend="Due to policy violations"
          />
        </div>

        {/* Pending Approvals Section - Only shows if there are pending schools */}
        {pendingSchools.length > 0 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Pending Approvals
                <Badge variant="secondary" className="ml-2 bg-amber-100 text-amber-700 hover:bg-amber-100">
                  {pendingSchools.length} Requires Action
                </Badge>
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {pendingSchools.map((school) => (
                <Card key={school._id} className="border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-all">
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-4">
                        <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                          <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-500 text-white font-bold">
                            {school.schoolName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">{school.schoolName}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {school.city}, {school.state}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                            <Mail className="h-3.5 w-3.5" />
                            {school.email}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        Pending Review
                      </Badge>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm bg-gray-50 p-3 rounded-lg">
                      <div>
                        <span className="text-gray-500 block text-xs uppercase tracking-wider">Principal</span>
                        <span className="font-medium text-gray-900">{school.principalName}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-xs uppercase tracking-wider">Established</span>
                        <span className="font-medium text-gray-900">{school.establishmentYear}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-xs uppercase tracking-wider">Type</span>
                        <span className="font-medium text-gray-900">{school.schoolType} ({school.boardType})</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-xs uppercase tracking-wider">Applied</span>
                        <span className="font-medium text-gray-900">{new Date(school.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-5">
                      <Button
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                        onClick={() => handleApprove(school._id)}
                        disabled={processingId === school._id}
                      >
                        {processingId === school._id ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        Approve & Onboard
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => handleReject(school._id)}
                        disabled={processingId === school._id}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900">All Institutes</h2>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search institutes..."
                  className="pl-9 bg-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4 text-gray-600" />
              </Button>
              <Button variant="outline" size="icon" onClick={fetchSchools}>
                <RefreshCw className={`h-4 w-4 text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="px-6 pt-6 border-b">
                <TabsList className="bg-transparent p-0 h-auto space-x-6">
                  <TabTrigger value="all" label="All Institutes" count={stats.total} />
                  <TabTrigger value="active" label="Active" count={stats.active} activeColor="text-emerald-600" />
                  <TabTrigger value="pending" label="Pending" count={stats.pending} activeColor="text-amber-600" />
                  <TabTrigger value="rejected" label="Rejected" count={stats.rejected} activeColor="text-red-600" />
                </TabsList>
              </div>

              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                    <RefreshCw className="h-8 w-8 animate-spin mb-2 text-blue-500" />
                    <p>Loading institutes...</p>
                  </div>
                ) : filteredSchools.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                    <div className="bg-gray-100 p-4 rounded-full mb-4">
                      <Building2 className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No institutes found</h3>
                    <p className="text-sm max-w-sm text-center mt-1">
                      {searchQuery ? `No results matching "${searchQuery}"` : "Get started by registering a new school."}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50/50 text-gray-500 font-medium border-b">
                        <tr>
                          <th className="px-6 py-4">Institute Name</th>
                          <th className="px-6 py-4">Location</th>
                          <th className="px-6 py-4">Principal</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4">Joined</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredSchools.map((school) => (
                          <tr key={school._id} className="hover:bg-gray-50/50 transition-colors group">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9 border border-gray-200">
                                  <AvatarFallback className="bg-gray-100 text-gray-600 text-xs font-medium">
                                    {school.schoolName.substring(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-gray-900">{school.schoolName}</p>
                                  <p className="text-xs text-gray-500">{school.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-gray-600">
                              {school.city}, {school.state}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="text-gray-900">{school.principalName}</span>
                                <span className="text-xs text-gray-500">{school.principalPhone}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <StatusBadge status={school.status} />
                            </td>
                            <td className="px-6 py-4 text-gray-500">
                              {new Date(school.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => handleView(school)}>
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleEdit(school)}>
                                    Edit Information
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  {school.status === 'pending' && (
                                    <>
                                      <DropdownMenuItem onClick={() => handleApprove(school._id)} className="text-emerald-600">
                                        Approve Registration
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleReject(school._id)} className="text-red-600">
                                        Reject Registration
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  {school.status === 'approved' && (
                                    <DropdownMenuItem onClick={() => handleSuspend(school._id)} className="text-red-600">
                                      Suspend Access
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </div>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Institute Details</DialogTitle>
            <DialogDescription>
              Complete information for {selectedSchool?.schoolName}
            </DialogDescription>
          </DialogHeader>

          {selectedSchool && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-gray-500 uppercase">General Information</h3>
                <div className="grid gap-2 text-sm">
                  <div className="grid grid-cols-3">
                    <span className="font-medium">Name:</span>
                    <span className="col-span-2">{selectedSchool.schoolName}</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="font-medium">Email:</span>
                    <span className="col-span-2">{selectedSchool.email}</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="font-medium">Contact:</span>
                    <span className="col-span-2">{selectedSchool.contactNumber}</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="font-medium">Address:</span>
                    <span className="col-span-2">{selectedSchool.address}, {selectedSchool.city}, {selectedSchool.state} - {selectedSchool.pinCode}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-gray-500 uppercase">Academic Details</h3>
                <div className="grid gap-2 text-sm">
                  <div className="grid grid-cols-3">
                    <span className="font-medium">Principal:</span>
                    <span className="col-span-2">{selectedSchool.principalName}</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="font-medium">Board:</span>
                    <span className="col-span-2">{selectedSchool.boardType}</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="font-medium">Type:</span>
                    <span className="col-span-2">{selectedSchool.schoolType}</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="font-medium">Status:</span>
                    <span className="col-span-2 capitalize">{selectedSchool.status}</span>
                  </div>
                </div>
              </div>

              <div className="col-span-2 mt-4 space-y-2">
                <h3 className="font-semibold text-sm text-gray-500 uppercase">Description</h3>
                <p className="text-sm bg-gray-50 p-3 rounded-md">
                  {selectedSchool.description || "No description provided."}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setIsViewOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}

// Helper Components

function StatsCard({ title, value, icon, bg, trend, highlight = false }: any) {
  return (
    <Card className={`border-none shadow-sm transition-all hover:shadow-md ${highlight ? 'ring-2 ring-amber-500 ring-offset-2' : ''}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-2 rounded-lg ${bg}`}>
            {icon}
          </div>
          <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
            {trend}
          </span>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
        </div>
      </CardContent>
    </Card>
  )
}

function TabTrigger({ value, label, count, activeColor = "text-blue-600" }: any) {
  return (
    <TabsTrigger
      value={value}
      className={`
        relative pb-4 rounded-none border-b-2 border-transparent 
        data-[state=active]:border-blue-600 data-[state=active]:bg-transparent 
        data-[state=active]:shadow-none px-0 font-medium text-gray-500 
        hover:text-gray-700 transition-all
        data-[state=active]:${activeColor}
      `}
    >
      {label}
      <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
        {count}
      </span>
    </TabsTrigger>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
    suspended: "bg-gray-100 text-gray-700 border-gray-200"
  }

  const icons = {
    pending: <Clock className="h-3 w-3 mr-1" />,
    approved: <CheckCircle className="h-3 w-3 mr-1" />,
    active: <ShieldCheck className="h-3 w-3 mr-1" />,
    rejected: <XCircle className="h-3 w-3 mr-1" />,
    suspended: <AlertTriangle className="h-3 w-3 mr-1" />
  }

  const key = status.toLowerCase() as keyof typeof styles

  return (
    <Badge variant="outline" className={`${styles[key] || styles.suspended} font-normal`}>
      {icons[key]}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}
