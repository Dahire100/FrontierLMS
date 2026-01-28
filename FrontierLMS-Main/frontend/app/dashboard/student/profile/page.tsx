"use client"

import { API_URL } from "@/lib/api-config"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import DashboardLayout from "@/components/dashboard-layout"
import { StatCard } from "@/components/super-admin/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Mail, Phone, MapPin, Calendar, Award, BookOpen, Edit, Save } from "lucide-react"
import { toast } from "sonner"
import { ProtectedRoute } from "@/components/protected-route"

export default function StudentProfile() {
  const { user, setUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [studentInfo, setStudentInfo] = useState({
    name: "",
    rollNo: "",
    class: "",
    email: "",
    phone: "",
    dob: "",
    gender: "",
    bloodGroup: "",
    address: "",
    gpa: 0, // Placeholder
    attendance: 0, // Placeholder
    subjects: 0, // Placeholder
    profilePicture: ""
  })

  // Placeholder for extra parent info not in main Student model or need to be fetched differently
  const [parentInfo, setParentInfo] = useState({
    fatherName: "",
    fatherPhone: "",
    fatherEmail: "",
    motherName: "",
    motherPhone: "",
    motherEmail: ""
  })

  // Placeholder subjects
  const [subjects, setSubjects] = useState<any[]>([])

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editForm, setEditForm] = useState(studentInfo)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token')
        const headers = { 'Authorization': `Bearer ${token}` }

        const [profileRes, attendanceRes, resultsRes] = await Promise.all([
          fetch(`${API_URL}/api/student/profile`, { headers }),
          fetch(`${API_URL}/api/student/attendance`, { headers }),
          fetch(`${API_URL}/api/student/results`, { headers })
        ])

        const profileData = await profileRes.json()
        const attendanceData = await attendanceRes.json()
        const resultsData = await resultsRes.json()

        if (profileData.success) {
          const s = profileData.data
          let attendancePercentage = 0
          if (attendanceData.success && attendanceData.data && attendanceData.data.statistics) {
            attendancePercentage = Number(attendanceData.data.statistics.percentage) || 0
          }

          const realSubjects: any[] = []
          let totalScore = 0
          let count = 0

          if (resultsData.success && Array.isArray(resultsData.data)) {
            // Group by exam/subject or just list latest results
            // Let's map unique subjects from results
            const subjectMap = new Map()
            resultsData.data.forEach((r: any) => {
              if (r.examId && !subjectMap.has(r.examId.name)) {
                const pct = r.score && r.totalMarks ? Math.round((r.score / r.totalMarks) * 100) : 0
                let grade = 'F'
                if (pct >= 90) grade = 'A+'
                else if (pct >= 80) grade = 'A'
                else if (pct >= 70) grade = 'B'
                else if (pct >= 60) grade = 'C'
                else if (pct >= 50) grade = 'D'

                subjectMap.set(r.examId.name, {
                  name: r.examId.name, // Using Exam Name as Subject Proxy if subject not explicit
                  grade: r.grade || grade,
                  percentage: pct
                })
              }
            })
            realSubjects.push(...Array.from(subjectMap.values()))
          }

          // If no real subjects, keep empty or use fallback if desired. 
          // For now, if empty, we might show "No Data" in UI.

          setStudentInfo({
            name: `${s.firstName} ${s.lastName}`,
            rollNo: s.rollNumber || "N/A",
            class: `${s.class} ${s.section}` || "N/A",
            email: s.email || "",
            phone: s.phone || "",
            dob: s.dateOfBirth || "",
            gender: s.gender || "",
            bloodGroup: s.bloodGroup || "N/A",
            address: s.address || "",
            gpa: 0, // GPA calculation is complex, keeping 0 or removing from UI
            attendance: attendancePercentage,
            subjects: realSubjects.length,
            profilePicture: s.profilePicture || ""
          })

          setParentInfo({
            fatherName: s.parentName || "N/A",
            fatherPhone: s.parentPhone || "N/A",
            fatherEmail: s.parentEmail || "",
            motherName: "",
            motherPhone: "",
            motherEmail: ""
          })

          setSubjects(realSubjects)
        }
      } catch (error) {
        console.error("Failed to fetch profile", error)
        toast.error("Failed to load profile")
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  useEffect(() => {
    if (isEditModalOpen) {
      setEditForm(studentInfo)
    }
  }, [isEditModalOpen, studentInfo])


  const handleEdit = () => {
    setEditForm(studentInfo)
    setIsEditModalOpen(true)
  }

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token')
      let newProfilePicture = null;

      // Upload photo if selected
      if (selectedFile) {
        const formData = new FormData()
        formData.append('profilePicture', selectedFile)

        const photoRes = await fetch(`${API_URL}/api/student/profile/picture`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        })
        const photoData = await photoRes.json()
        if (photoData.success) {
          newProfilePicture = photoData.data.profilePicture
        }
      }

      // Update other details
      const res = await fetch(`${API_URL}/api/student/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      })

      const data = await res.json()
      if (data.success) {
        // Update local state
        const updatedStudent = data.data
        const finalProfilePicture = newProfilePicture || updatedStudent.profilePicture

        setStudentInfo(prev => ({
          ...prev,
          ...editForm,
          profilePicture: finalProfilePicture || prev.profilePicture
        }))

        // Update Auth Context & Local Storage
        if (user) {
          const newUser = {
            ...user,
            profilePicture: finalProfilePicture || user.profilePicture
          }
          // Ensure local storage is also updated so refresh keeps it
          localStorage.setItem('user', JSON.stringify(newUser))
          setUser(newUser)
        }

        setIsEditModalOpen(false)
        setSelectedFile(null)
        toast.success("Profile updated successfully")
      } else {
        toast.error(data.error || "Update failed")
      }
    } catch (error) {
      console.error(error)
      toast.error("Update failed")
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setEditForm({ ...editForm, [field]: value })
  }

  if (loading) {
    return <div className="p-8 text-center">Loading profile...</div>
  }

  return (
    <ProtectedRoute allowedRoles={["student"]}>
      <DashboardLayout title="My Profile">
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              My Profile
            </h2>
            <p className="text-muted-foreground mt-1">View and manage your profile information</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard title="GPA" value={studentInfo.gpa.toString()} icon={Award} iconColor="text-green-600" iconBgColor="bg-green-100" />
            <StatCard title="Attendance" value={`${studentInfo.attendance}%`} icon={Calendar} iconColor="text-blue-600" iconBgColor="bg-blue-100" />
            <StatCard title="Subjects" value={studentInfo.subjects.toString()} icon={BookOpen} iconColor="text-purple-600" iconBgColor="bg-purple-100" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={studentInfo.profilePicture ? (studentInfo.profilePicture.startsWith('http') ? studentInfo.profilePicture : `${API_URL}${studentInfo.profilePicture}`) : ""} className="object-cover" />
                      <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-500 text-white text-2xl font-bold">
                        {studentInfo.name.split(' ').map(n => n[0]).join('') || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-2xl">{studentInfo.name}</CardTitle>
                      <CardDescription>Class {studentInfo.class} • Roll No: {studentInfo.rollNo}</CardDescription>
                    </div>
                  </div>
                  <Button onClick={handleEdit} className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium flex items-center gap-2"><Mail className="h-4 w-4" />{studentInfo.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="text-sm font-medium flex items-center gap-2"><Phone className="h-4 w-4" />{studentInfo.phone}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Date of Birth</p>
                    <p className="text-sm font-medium">{studentInfo.dob ? new Date(studentInfo.dob).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Gender</p>
                    <p className="text-sm font-medium">{studentInfo.gender}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Blood Group</p>
                    <p className="text-sm font-medium">{studentInfo.bloodGroup}</p>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <p className="text-xs text-muted-foreground">Address</p>
                    <p className="text-sm font-medium flex items-center gap-2"><MapPin className="h-4 w-4" />{studentInfo.address}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" />Parent/Guardian</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 border rounded-lg">
                  <p className="font-semibold mb-2">{parentInfo.fatherName}</p>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p className="flex items-center gap-2"><Phone className="h-3 w-3" />{parentInfo.fatherPhone}</p>
                    {parentInfo.fatherEmail && <p className="flex items-center gap-2"><Mail className="h-3 w-3" />{parentInfo.fatherEmail}</p>}
                  </div>
                </div>
                {/* Only show mother info if available, or just keeping the structure simple */}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" />Academic Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subjects.map((subject, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{subject.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-green-600">{subject.grade}</span>
                        <span className="text-sm text-muted-foreground">{subject.percentage}%</span>
                      </div>
                    </div>
                    <Progress value={subject.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Edit Profile Modal */}
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  Edit Profile
                </DialogTitle>
                <DialogDescription>
                  Update your profile picture and contact details below.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div className="space-y-2 col-span-2">
                  <Label>Profile Picture</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFile(e.target.files[0])
                      }
                    }}
                  />
                  <p className="text-xs text-muted-foreground">Max 2MB. JPG, PNG, WebP.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={editForm.name} disabled className="bg-gray-100" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={editForm.email} disabled className="bg-gray-100" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={editForm.phone} onChange={(e) => handleInputChange('phone', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" value={editForm.address} onChange={(e) => handleInputChange('address', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bloodGroup">Blood Group</Label>
                  <Input id="bloodGroup" value={editForm.bloodGroup} onChange={(e) => handleInputChange('bloodGroup', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={editForm.gender} onValueChange={(val: string) => handleInputChange('gender', val)}>
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                <Button onClick={handleSave} className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                  <Save className="h-4 w-4 mr-2" />Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
