"use client"

import { API_URL } from "@/lib/api-config"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard-layout"
import { StatCard } from "@/components/super-admin/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { User, Mail, Phone, Award, Calendar, Shield, Edit, Save, Users, Info, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function SuperAdminProfile() {
    const { user: authUser, setUser: setAuthUser } = useAuth()
    const [loading, setLoading] = useState(true)
    const [adminInfo, setAdminInfo] = useState({
        firstName: "",
        lastName: "",
        name: "",
        employeeId: "", // ID
        email: "",
        phone: "",
        role: "super_admin",
        department: "System Administration",
        joiningDate: "",
        experience: "",
        permissions: "Full System Access",
        profilePicture: ""
    })

    // Edit form state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [editForm, setEditForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
    })

    const [photoUploading, setPhotoUploading] = useState(false)

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem("token")
            const response = await fetch(`${API_URL}/api/profile`, {
                headers: { "Authorization": `Bearer ${token}` },
                cache: 'no-store'
            })
            const result = await response.json()

            if (result.user || result.profile) {
                const userData = result.user || result.profile
                const createdAt = new Date(userData.createdAt || Date.now())
                const yearsExp = new Date().getFullYear() - createdAt.getFullYear()

                setAdminInfo({
                    firstName: userData.firstName || "",
                    lastName: userData.lastName || "",
                    name: `${userData.firstName} ${userData.lastName}`,
                    employeeId: userData._id?.substring(userData._id.length - 8).toUpperCase() || "SYSTEM",
                    email: userData.email || "",
                    phone: userData.phone || "Not set",
                    role: "Super Administrator",
                    department: "System Administration",
                    joiningDate: createdAt.toLocaleDateString(),
                    experience: `${yearsExp} Year${yearsExp !== 1 ? 's' : ''}`,
                    permissions: "Full System Access",
                    profilePicture: userData.profilePicture || ""
                })

                // Sync with global auth state and localStorage
                const updatedAuthUser = {
                    ...authUser,
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    name: `${userData.firstName} ${userData.lastName}`,
                    profilePicture: userData.profilePicture,
                    email: userData.email,
                    role: userData.role,
                }

                localStorage.setItem("user", JSON.stringify(updatedAuthUser))
                if (setAuthUser) setAuthUser(updatedAuthUser as any)

                // Initialize edit form
                setEditForm({
                    firstName: userData.firstName || "",
                    lastName: userData.lastName || "",
                    email: userData.email || "",
                    phone: userData.phone || "",
                })
            }
        } catch (err) {
            console.error("Error fetching profile:", err)
            toast.error("Failed to load profile data")
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = () => {
        // Reset form to current info
        setEditForm({
            firstName: adminInfo.firstName,
            lastName: adminInfo.lastName,
            email: adminInfo.email,
            phone: adminInfo.phone === "Not set" ? "" : adminInfo.phone
        })
        setIsEditModalOpen(true)
    }

    const handleSave = async () => {
        try {
            if (!editForm.firstName || !editForm.lastName || !editForm.email) {
                toast.error("Name and Email are required")
                return
            }

            const token = localStorage.getItem("token")
            const response = await fetch(`${API_URL}/api/profile`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(editForm)
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || "Failed to update profile")
            }

            toast.success("Profile updated successfully")
            setIsEditModalOpen(false)
            fetchProfile() // Refresh data to ensure sync

            // Check if email changed
            if (editForm.email !== adminInfo.email) {
                toast.warning("Email updated. Please verify your new email if required.")
            }

        } catch (err: any) {
            console.error("Error updating profile:", err)
            toast.error(err.message || "Failed to update profile")
        }
    }

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            toast.error("Please upload an image file")
            return
        }
        if (file.size > 2 * 1024 * 1024) {
            toast.error("Image size must be less than 2MB")
            return
        }

        setPhotoUploading(true)
        const formData = new FormData()
        formData.append('photo', file)

        try {
            const token = localStorage.getItem("token")
            const response = await fetch(`${API_URL}/api/profile/upload-photo`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            })

            const result = await response.json()

            if (response.ok) {
                toast.success("Profile photo updated")
                setAdminInfo(prev => ({ ...prev, profilePicture: result.profilePicture }))
                fetchProfile() // Sync with AuthContext/Header/Sidebar
            } else {
                throw new Error(result.error || "Upload failed")
            }
        } catch (err: any) {
            console.error("Photo upload error:", err)
            toast.error(err.message || "Failed to upload photo")
        } finally {
            setPhotoUploading(false)
        }
    }

    const handleInputChange = (field: string, value: string) => {
        setEditForm({ ...editForm, [field]: value })
    }

    if (loading) {
        return <DashboardLayout title="My Profile"><div className="p-8 text-center text-muted-foreground">Loading profile...</div></DashboardLayout>
    }

    return (
        <DashboardLayout title="My Profile">
            <div className="space-y-6 max-w-6xl mx-auto">
                <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Super Admin Profile
                    </h2>
                    <p className="text-muted-foreground mt-1">Manage your system administrator identity</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard title="System Experience" value={adminInfo.experience} icon={Award} iconColor="text-blue-600" iconBgColor="bg-blue-100" />
                    <StatCard title="Role Authority" value={adminInfo.role} icon={Shield} iconColor="text-purple-600" iconBgColor="bg-purple-100" />
                    <StatCard title="Global Permission" value={adminInfo.permissions} icon={Users} iconColor="text-green-600" iconBgColor="bg-green-100" />
                </div>

                <Card className="border-l-4 border-l-blue-600 shadow-md">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="relative group cursor-pointer" onClick={() => document.getElementById('photo-upload')?.click()}>
                                    <Avatar className="h-28 w-28 border-4 border-white shadow-xl overflow-hidden ring-2 ring-blue-100">
                                        {adminInfo.profilePicture ? (
                                            <img
                                                src={`${API_URL}${adminInfo.profilePicture}`}
                                                alt={adminInfo.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-4xl font-bold">
                                                {adminInfo.name ? adminInfo.name.split(' ').map(n => n?.[0]).join('') : 'SA'}
                                            </AvatarFallback>
                                        )}
                                    </Avatar>
                                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Edit className="h-6 w-6 text-white" />
                                    </div>
                                    {photoUploading && (
                                        <div className="absolute inset-0 bg-white/60 rounded-full flex items-center justify-center">
                                            <span className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full"></span>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        id="photo-upload"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handlePhotoUpload}
                                    />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl text-gray-900">{adminInfo.name}</CardTitle>
                                    <CardDescription className="text-base font-medium text-blue-600">{adminInfo.department}</CardDescription>
                                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                                        <Shield className="h-3 w-3" /> System ID: <span className="font-mono bg-gray-100 px-1 rounded">{adminInfo.employeeId}</span>
                                    </div>
                                    <Button
                                        variant="link"
                                        size="sm"
                                        className="p-0 h-auto text-blue-600 text-xs font-bold mt-2"
                                        onClick={() => document.getElementById('photo-upload')?.click()}
                                    >
                                        Change Photo
                                    </Button>
                                </div>
                            </div>
                            <Button onClick={handleEdit} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-200">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Profile
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-4 pt-4 border-t border-gray-100 mt-4">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email Address</p>
                                <p className="text-sm font-medium flex items-center gap-2 text-gray-900"><Mail className="h-4 w-4 text-blue-500" />{adminInfo.email}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact Number</p>
                                <p className="text-sm font-medium flex items-center gap-2 text-gray-900"><Phone className="h-4 w-4 text-green-500" />{adminInfo.phone}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Department</p>
                                <p className="text-sm font-medium flex items-center gap-2 text-gray-900"><Shield className="h-4 w-4 text-purple-500" />{adminInfo.department}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Member Since</p>
                                <p className="text-sm font-medium flex items-center gap-2 text-gray-900"><Calendar className="h-4 w-4 text-orange-500" />{adminInfo.joiningDate}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* System Access Card */}
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div className="space-y-1">
                                <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-purple-600" />System Privileges</CardTitle>
                                <CardDescription>Your global administrative permissions</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {[
                            "School Management", "User Administration", "Financial Oversight", "System Configuration", "Data Export/Import"
                        ].map((perm, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg border border-gray-100">
                                <span className="text-sm font-medium text-gray-700">{perm}</span>
                                <span className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-bold uppercase tracking-wide">Grant Access</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Edit Profile Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Edit Super Admin Profile
                        </DialogTitle>
                        <DialogDescription>
                            Update your system administrator details
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                                id="firstName"
                                value={editForm.firstName}
                                onChange={(e) => handleInputChange('firstName', e.target.value)}
                                placeholder="Enter first name"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                                id="lastName"
                                value={editForm.lastName}
                                onChange={(e) => handleInputChange('lastName', e.target.value)}
                                placeholder="Enter last name"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={editForm.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                placeholder="Enter your email"
                            />
                            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3 text-orange-500" />
                                Critical: Changing this email affects your login.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                value={editForm.phone}
                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                placeholder="Enter your phone"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Input
                                id="role"
                                value={adminInfo.role}
                                disabled
                                className="bg-gray-100 text-gray-500 cursor-not-allowed"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="department">Department</Label>
                            <Input
                                id="department"
                                value={adminInfo.department}
                                disabled
                                className="bg-gray-100 text-gray-500 cursor-not-allowed"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    )
}
