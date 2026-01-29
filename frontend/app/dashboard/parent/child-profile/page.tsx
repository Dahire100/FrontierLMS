"use client"

import { API_URL } from "@/lib/api-config"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { StatCard } from "@/components/super-admin/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  User,
  BookOpen,
  Award,
  Calendar,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  GraduationCap,
  Edit,
  Save,
  Users,
  ChevronDown
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

function ChildProfileContent() {
  const searchParams = useSearchParams()
  const initialChildId = searchParams.get('id')

  const [selectedChild, setSelectedChild] = useState<string>("")
  const [children, setChildren] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [academicStats, setAcademicStats] = useState<any>({ gpa: "0.0", attendance: 0, rank: "N/A", subjects: [] })
  const [loading, setLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Fetch children list
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
          // Set selected child from URL or default to first
          if (initialChildId && data.data.children.find((c: any) => c._id === initialChildId)) {
            setSelectedChild(initialChildId)
          } else {
            setSelectedChild(data.data.children[0]._id)
          }
        }
      } catch (error) {
        console.error("Failed to fetch children", error)
      }
    }
    fetchChildren()
  }, [initialChildId])

  // Fetch full profile data when selected child changes
  useEffect(() => {
    if (!selectedChild) return

    const fetchProfileData = async () => {
      setLoading(true)
      try {
        const token = localStorage.getItem('token')
        const headers = { 'Authorization': `Bearer ${token}` }

        // Parallel fetch for profile, attendance, and results
        const [profileRes, attendanceRes, resultsRes] = await Promise.all([
          fetch(`${API_URL}/api/parent/child/${selectedChild}`, { headers }),
          fetch(`${API_URL}/api/parent/child/${selectedChild}/attendance`, { headers }),
          fetch(`${API_URL}/api/parent/child/${selectedChild}/results`, { headers })
        ])

        const profileData = await profileRes.json()
        const attendanceData = await attendanceRes.json()
        const resultsData = await resultsRes.json()

        if (profileData.success) {
          setProfile(profileData.data)
        }

        // Process Stats
        let attendancePercentage = 0
        if (attendanceData.success && attendanceData.data.overview) {
          attendancePercentage = parseFloat(attendanceData.data.overview.percentage) || 0
        }

        let calculatedGpa = 0
        let subjectList: any[] = []

        if (resultsData.success && Array.isArray(resultsData.data)) {
          // Simplified GPA calculation logic from marks for now
          const totalPercentage = resultsData.data.reduce((acc: number, curr: any) => acc + (curr.percentage || 0), 0)
          const count = resultsData.data.length
          if (count > 0) {
            const avg = totalPercentage / count
            calculatedGpa = (avg / 20) // Roughly 100% -> 5.0 scale or 25 -> 4.0? Let's use 4.0 scale: (Percentage / 25)
            calculatedGpa = parseFloat((avg / 25).toFixed(1))
          }

          // Map recent results to subjects
          subjectList = resultsData.data.map((r: any) => ({
            name: r.examId?.subject || "Subject",
            grade: r.grade,
            marks: r.obtainedMarks,
            teacher: "N/A" // Teacher not always in result
          })).slice(0, 4) // Show top 4
        }

        setAcademicStats({
          gpa: calculatedGpa.toString(),
          attendance: attendancePercentage,
          rank: "N/A", // Backend doesn't provide rank yet
          subjects: subjectList
        })

      } catch (error) {
        console.error("Failed to fetch profile details", error)
        toast.error("Failed to load full profile")
      } finally {
        setLoading(false)
      }
    }
    fetchProfileData()
  }, [selectedChild])

  const handleSave = async () => {
    if (!selectedFile) {
      toast.error("Please select a file")
      return
    }

    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      formData.append('profilePicture', selectedFile)

      const res = await fetch(`${API_URL}/api/parent/child/${selectedChild}/profile-picture`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })
      const data = await res.json()

      if (data.success) {
        setProfile({ ...profile, profilePicture: data.data.profilePicture })
        // Update children list as well
        const updatedChildren = children.map(c =>
          c._id === selectedChild ? { ...c, profilePicture: data.data.profilePicture } : c
        )
        setChildren(updatedChildren)

        setIsEditModalOpen(false)
        setSelectedFile(null)
        toast.success("Profile Photo Updated", { description: "Child's profile picture has been updated." })
      } else {
        toast.error("Update Failed", { description: "Could not update profile photo." })
      }
    } catch (error) {
      console.error("Profile update error", error)
      toast.error("Network Error", { description: "Please try again later." })
    }
  }


  const getSelectedChildName = () => {
    const child = children.find(c => c._id === selectedChild)
    return child ? `${child.firstName} ${child.lastName}` : "Loading..."
  }

  if (loading && !profile) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  if (!profile) return <div>Profile not found</div>

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      {/* Header with Child Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Student Profile
          </h2>
          <p className="text-muted-foreground mt-1">
            Personal and academic details for {getSelectedChildName()}
          </p>
        </div>

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
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="GPA (Est.)"
          value={academicStats.gpa}
          icon={Award}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
        />
        <StatCard
          title="Attendance"
          value={`${academicStats.attendance}%`}
          icon={Calendar}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
        />
        <StatCard
          title="Class Rank"
          value={academicStats.rank}
          icon={TrendingUp}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
        />
        <StatCard
          title="Results Found"
          value={academicStats.subjects.length.toString()}
          icon={BookOpen}
          iconColor="text-orange-600"
          iconBgColor="bg-orange-100"
        />
      </div>

      {/* Profile Overview */}
      <Card className="border-none shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Personal Information
            </CardTitle>
            <Button onClick={() => setIsEditModalOpen(true)} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex flex-col items-center gap-4 w-full md:w-auto">
              <Avatar className="h-32 w-32 shadow-lg ring-4 ring-white">
                <AvatarImage src={profile.profilePicture ? (profile.profilePicture.startsWith('http') ? profile.profilePicture : `${API_URL}${profile.profilePicture}`) : ""} className="object-cover" />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-3xl font-bold">
                  {profile.firstName?.[0]}{profile.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900">{profile.firstName} {profile.lastName}</h3>
                <div className="flex items-center gap-2 justify-center mt-1">
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                    Class {profile.class?.name || "N/A"}-{profile.class?.section || ""}
                  </span>
                  <span className="text-xs text-gray-500">Roll No: {profile.rollNumber}</span>
                </div>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 w-full">
              <div className="space-y-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Date of Birth</p>
                <p className="font-semibold text-gray-900">{new Date(profile.dateOfBirth).toLocaleDateString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Gender</p>
                <p className="font-semibold text-gray-900">{profile.gender}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Blood Group</p>
                <p className="font-semibold text-gray-900">{profile.bloodGroup || "N/A"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Admission Date</p>
                <p className="font-semibold text-gray-900">{new Date(profile.admissionDate).toLocaleDateString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide flex items-center gap-1">
                  <Mail className="h-3 w-3" /> Email
                </p>
                <p className="font-semibold text-gray-900">{profile.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide flex items-center gap-1">
                  <Phone className="h-3 w-3" /> Phone
                </p>
                <p className="font-semibold text-gray-900">{profile.phone || "N/A"}</p>
              </div>
              <div className="space-y-1 md:col-span-2">
                <p className="text-xs text-gray-500 uppercase tracking-wide flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> Address
                </p>
                <p className="font-semibold text-gray-900">{profile.currentAddress || "N/A"}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Parent Information */}
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-purple-600" />
              Parent/Guardian
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-purple-100 text-purple-700">P</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold text-gray-900">{profile.parentName || "Parent"}</p>
                <p className="text-xs text-gray-500">Primary Guardian</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide flex items-center gap-1">
                  <Phone className="h-3 w-3" /> Phone
                </p>
                <p className="font-medium">{profile.parentPhone || "N/A"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide flex items-center gap-1">
                  <Mail className="h-3 w-3" /> Email
                </p>
                <p className="font-medium text-sm truncate" title={profile.parentEmail}>{profile.parentEmail || "N/A"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Academic Performance */}
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-green-600" />
              Performance Snapshot
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Overall GPA (Est.)</span>
                <span className="text-2xl font-bold text-green-600">{academicStats.gpa}</span>
              </div>
              <Progress value={(parseFloat(academicStats.gpa) / 4) * 100} className="h-2.5 bg-green-100" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Attendance</span>
                <span className="text-lg font-bold">{academicStats.attendance}%</span>
              </div>
              <Progress value={academicStats.attendance} className="h-2.5 bg-blue-100" />
            </div>
            <div className="pt-2 border-t mt-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Class Rank</span>
                <span className="font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-full text-sm">{academicStats.rank}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subject Performance */}
      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-orange-600" />
            Recent Results
          </CardTitle>
          <CardDescription>Performance in recent exams</CardDescription>
        </CardHeader>
        <CardContent>
          {academicStats.subjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {academicStats.subjects.map((subject: any, index: number) => (
                <div key={index} className="p-4 border rounded-xl hover:shadow-sm transition-all bg-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                      {subject.name?.[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{subject.name}</p>
                      {/* Teacher info often not directly in result, so hiding or static */}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">{subject.grade}</p>
                    <p className="text-xs font-medium text-gray-500">{subject.marks} marks</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">No recent results found</div>
          )}
        </CardContent>
      </Card>

      {/* Edit Profile Modal Placeholder */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile Photo</DialogTitle>
            <DialogDescription>
              Update {profile?.firstName}'s profile picture. Other details are restricted.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="photo">Profile Photo</Label>
              <Input
                id="photo"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFile(e.target.files[0])
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">Supported formats: JPG, PNG, WebP. Max 2MB.</p>
            </div>
            <div className="p-3 bg-yellow-50 text-yellow-800 text-xs rounded-md">
              Note: To update personal details like name, date of birth, or contact info, please contact the school administration.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Photo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function ParentChildProfile() {
  return (
    <DashboardLayout title="My Child's Profile">
      <Suspense fallback={<div>Loading...</div>}>
        <ChildProfileContent />
      </Suspense>
    </DashboardLayout>
  )
}
