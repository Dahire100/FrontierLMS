"use client"

import { API_URL } from "@/lib/api-config"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import DashboardLayout from "@/components/dashboard-layout"
import { StatCard } from "@/components/super-admin/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import {
  User,
  Mail,
  Phone,
  Award,
  Calendar,
  DollarSign,
  Edit,
  Save,
  Loader2,
  MapPin,
  Briefcase,
  GraduationCap
} from "lucide-react"

interface TeacherInfo {
  _id: string;
  teacherId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  qualification: string;
  subjects: string[];
  joiningDate: string;
  address: string;
  salary: number;
  profilePicture?: string;
}

export default function TeacherProfile() {
  const [teacherInfo, setTeacherInfo] = useState<TeacherInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editForm, setEditForm] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()
  const { user, setUser } = useAuth()

  useEffect(() => {
    fetchProfile()
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/api/messages/inbox`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      const result = await response.json()
      if (result.success) {
        setMessages(result.data.slice(0, 5)) // Show only latest 5
      }
    } catch (err) {
      console.error("Error fetching messages:", err)
    }
  }

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/api/teacher/profile`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      const result = await response.json()
      if (result.success) {
        setTeacherInfo(result.data)
        setEditForm(result.data)
      } else {
        setError(result.error || "Failed to load profile")
      }
    } catch (err) {
      console.error("Error fetching profile:", err)
      setError("Failed to load profile due to network error")
      toast({ title: "Error", description: "Failed to load profile", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setEditForm(teacherInfo)
    setIsEditModalOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/api/teacher/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      })

      const result = await response.json()
      if (result.success) {
        setTeacherInfo(result.data)
        setIsEditModalOpen(false)

        // Update global user state (Header/Sidebar)
        if (user) {
          const updatedName = `${result.data.firstName} ${result.data.lastName}`;
          const updatedUser = {
            ...user,
            firstName: result.data.firstName,
            lastName: result.data.lastName,
            name: updatedName,
            profilePicture: result.data.profilePicture
          };

          localStorage.setItem("user", JSON.stringify(updatedUser)); // Persist to storage
          setUser(updatedUser); // Update Context immediately
        }

        toast({ title: "Success", description: "Profile updated successfully", className: "bg-green-50 text-green-800 border-green-200" })
      } else {
        toast({ title: "Error", description: result.error || "Failed to update", variant: "destructive" })
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to update profile", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setEditForm({ ...editForm, [field]: value })
  }

  if (loading) {
    return (
      <DashboardLayout title="My Profile">
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout title="My Profile">
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
          <div className="text-red-500 font-bold text-lg">{error}</div>
          <Button variant="outline" onClick={fetchProfile}>Retry</Button>
        </div>
      </DashboardLayout>
    )
  }

  if (!teacherInfo) {
    return (
      <DashboardLayout title="My Profile">
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
          <div className="text-gray-500 font-bold text-lg">No profile information available.</div>
        </div>
      </DashboardLayout>
    )
  }

  const fullName = `${teacherInfo.firstName} ${teacherInfo.lastName}`

  return (
    <DashboardLayout title="Faculty Profile">
      <div className="space-y-8 max-w-[1400px] mx-auto pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Personal Portfolio</h2>
            <p className="text-muted-foreground font-medium">Detailed professional identity and academic credentials.</p>
          </div>
          <Button
            onClick={handleEdit}
            className="bg-indigo-600 hover:bg-indigo-700 h-12 px-8 font-black shadow-xl shadow-indigo-100 rounded-xl"
          >
            <Edit className="h-4 w-4 mr-2" />
            Modify Profile
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column: Essential Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-none shadow-2xl shadow-indigo-100/30 overflow-hidden ring-1 ring-gray-100">
              <CardHeader className="text-center pt-10 pb-6">
                <Avatar className="h-28 w-28 mx-auto ring-4 ring-indigo-50 border-4 border-white shadow-xl">
                  {teacherInfo.profilePicture && (
                    <AvatarImage src={teacherInfo.profilePicture} alt="Profile" className="h-full w-full object-cover" />
                  )}
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-3xl font-black">
                    {teacherInfo.firstName[0]}{teacherInfo.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="mt-4 space-y-1">
                  <CardTitle className="text-xl font-black text-gray-900">{fullName}</CardTitle>
                  <CardDescription className="font-bold text-indigo-600 uppercase tracking-widest text-[10px]">
                    {teacherInfo.department} Specialist
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="p-4 bg-gray-50 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-gray-400">Employee ID</span>
                    <span className="text-gray-900">{teacherInfo.teacherId}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-gray-400">Status</span>
                    <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-widest">Active</span>
                  </div>
                </div>
                <div className="space-y-3 px-2">
                  <div className="flex items-center gap-3 text-sm font-medium text-gray-600">
                    <Mail className="h-4 w-4 text-indigo-500" />
                    <span className="truncate">{teacherInfo.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm font-medium text-gray-600">
                    <Phone className="h-4 w-4 text-indigo-500" />
                    <span>{teacherInfo.phone || 'Not Provided'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm font-medium text-gray-600">
                    <MapPin className="h-4 w-4 text-indigo-500" />
                    <span className="line-clamp-1">{teacherInfo.address || 'Global Campus'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-indigo-600 text-white border-none shadow-xl shadow-indigo-200">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Award className="h-5 w-5 opacity-75" />
                  <p className="text-xs font-black uppercase tracking-widest opacity-80">Credential Level</p>
                </div>
                <p className="text-lg font-black leading-tight italic">"{teacherInfo.qualification}"</p>
                <div className="pt-2 border-t border-white/10">
                  <p className="text-[10px] font-bold opacity-60 uppercase">Joined Institution On</p>
                  <p className="font-black text-sm">{new Date(teacherInfo.joiningDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Key Details & Stats */}
          <div className="lg:col-span-3 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="Tenure"
                value="8 Years"
                icon={Award}
                iconColor="text-indigo-600"
                iconBgColor="bg-indigo-50"
              />
              <StatCard
                title="Total Classes"
                value="4"
                icon={Briefcase}
                iconColor="text-blue-600"
                iconBgColor="bg-blue-50"
              />
              <StatCard
                title="Students"
                value="156"
                icon={User}
                iconColor="text-emerald-600"
                iconBgColor="bg-emerald-50"
              />
            </div>

            <Card className="border-none shadow-2xl shadow-indigo-100/30 overflow-hidden ring-1 ring-gray-100">
              <CardHeader className="bg-gray-50/50 border-b">
                <CardTitle className="flex items-center gap-2 font-black text-gray-800">
                  <GraduationCap className="h-5 w-5 text-indigo-600" />
                  Academic Domains
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 underline decoration-indigo-200 underline-offset-8">Primary Disciplines</h4>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {teacherInfo.subjects && teacherInfo.subjects.length > 0 ? (
                        teacherInfo.subjects.map((sub, i) => (
                          <span key={i} className="px-4 py-2 bg-indigo-50 text-indigo-700 font-black text-xs rounded-xl border border-indigo-100">
                            {sub}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm font-medium text-gray-500 italic">No specific subjects assigned</span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 underline decoration-indigo-200 underline-offset-8">Professional Summary</h4>
                    <p className="text-sm text-gray-600 leading-relaxed font-medium">
                      Dedicated educator focused on driving student success through innovative teaching methodologies and
                      comprehensive academic support in the {teacherInfo.department} department.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-none shadow-xl ring-1 ring-gray-100 hover:shadow-2xl transition-all">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-black uppercase tracking-widest text-gray-500 leading-none">Attendance Rate</CardTitle>
                  <Calendar className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-black text-gray-900 tracking-tighter">98.5%</div>
                  <p className="text-[10px] font-bold text-emerald-600 mt-2">Consistent Presence • Last 30 Days</p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-xl ring-1 ring-gray-100 hover:shadow-2xl transition-all">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-black uppercase tracking-widest text-gray-500 leading-none">Payroll Base</CardTitle>
                  <DollarSign className="h-4 w-4 text-indigo-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-black text-gray-900 tracking-tighter">₹{teacherInfo.salary?.toLocaleString() || '0'}</div>
                  <p className="text-[10px] font-bold text-gray-400 mt-2">Current Monthly Remuneration</p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-none shadow-2xl shadow-indigo-100/30 overflow-hidden ring-1 ring-gray-100">
              <CardHeader className="bg-gray-50/50 border-b flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 font-black text-gray-800">
                    <Mail className="h-5 w-5 text-indigo-600" />
                    Recent Communication
                  </CardTitle>
                </div>
                <Link href="/dashboard/teacher/communicate">
                  <Button variant="ghost" size="sm" className="font-bold text-indigo-600">View All</Button>
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {messages.length > 0 ? (
                    messages.map((msg) => (
                      <div key={msg._id} className="p-4 hover:bg-gray-50/50 transition-all flex items-start gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-indigo-100 text-indigo-600 text-xs font-bold">
                            {(msg.senderId?.firstName || 'U')[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <p className="text-sm font-bold text-gray-900 truncate">
                              {msg.senderId?.firstName} {msg.senderId?.lastName}
                            </p>
                            <p className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                              {new Date(msg.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <p className="text-xs font-bold text-gray-700 truncate">{msg.subject}</p>
                          <p className="text-xs text-gray-500 truncate mt-0.5 italic">{msg.message}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-10 text-center text-sm text-gray-400 font-medium italic">
                      No recent messages detected.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Edit Profile Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-2xl border-none shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-gray-900">Modify Professional Identity</DialogTitle>
              <DialogDescription className="font-medium text-gray-500">Update your contact and professional details for institutional records.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="font-bold text-gray-700">First Name</Label>
                <Input
                  id="firstName"
                  value={editForm?.firstName || ""}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="h-12 rounded-xl focus:ring-4 focus:ring-indigo-100 font-medium"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="font-bold text-gray-700">Last Name</Label>
                <Input
                  id="lastName"
                  value={editForm?.lastName || ""}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="h-12 rounded-xl focus:ring-4 focus:ring-indigo-100 font-medium"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="font-bold text-gray-700">Phone Contact</Label>
                <Input
                  id="phone"
                  value={editForm?.phone || ""}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="h-12 rounded-xl focus:ring-4 focus:ring-indigo-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address" className="font-bold text-gray-700">Current Address</Label>
                <Input
                  id="address"
                  value={editForm?.address || ""}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="h-12 rounded-xl focus:ring-4 focus:ring-indigo-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department" className="font-bold text-gray-700">Department</Label>
                <Input
                  id="department"
                  value={editForm?.department || ""}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  className="h-12 rounded-xl focus:ring-4 focus:ring-indigo-100"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="qualification" className="font-bold text-gray-700">Educational Qualification</Label>
                <Input
                  id="qualification"
                  value={editForm?.qualification || ""}
                  onChange={(e) => handleInputChange('qualification', e.target.value)}
                  className="h-12 rounded-xl focus:ring-4 focus:ring-indigo-100 font-black italic"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="profilePicture" className="font-bold text-gray-700">Profile Picture</Label>
                <div className="flex items-center gap-4">
                  {editForm?.profilePicture && (
                    <img
                      src={editForm.profilePicture}
                      alt="Preview"
                      className="h-12 w-12 rounded-full object-cover border border-gray-200"
                    />
                  )}
                  <Input
                    id="profilePicture"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 1024 * 100) { // 100KB limit
                          toast({ title: "File too large", description: "Image must be under 100KB", variant: "destructive" });
                          return;
                        }
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          handleInputChange('profilePicture', reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="h-12 pt-2 rounded-xl focus:ring-4 focus:ring-indigo-100"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Max size: 100KB. Formats: JPG, PNG</p>
              </div>
            </div>
            <DialogFooter className="bg-gray-50 p-6 -mx-6 -mb-6 rounded-b-lg border-t gap-3">
              <Button variant="ghost" onClick={() => setIsEditModalOpen(false)} className="font-black text-gray-400">Cancel</Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-indigo-600 hover:bg-indigo-700 px-8 font-black shadow-lg shadow-indigo-100"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Persist Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}

