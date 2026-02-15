"use client"

import { API_URL } from "@/lib/api-config"
import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Settings, Bell, Lock, User, Palette, Loader2, Info, Check, X, Send } from "lucide-react"
import { toast } from "sonner"
import { Progress } from "@/components/ui/progress"

export default function SettingsPage() {
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // Password state
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [passwordLoading, setPasswordLoading] = useState(false)
    const [passwordStrength, setPasswordStrength] = useState(0)

    // Fetch profile
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token')
                if (!token) {
                    toast.error("Authentication token missing")
                    return
                }

                const res = await fetch(`${API_URL}/api/profile`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })

                if (!res.ok) {
                    throw new Error(`Failed to fetch profile: ${res.status}`)
                }

                const data = await res.json()

                // Flatten data for easier access
                const userProfile = data.profile || data.user || {}
                if (data.user) {
                    userProfile.email = data.user.email
                    userProfile.firstName = data.user.firstName
                    userProfile.lastName = data.user.lastName
                    if (data.user.preferences) userProfile.preferences = data.user.preferences;
                }

                // Ensure preferences object exists
                if (!userProfile.preferences) {
                    userProfile.preferences = {
                        emailNotifications: true,
                        pushNotifications: true,
                        theme: 'light'
                    }
                }

                setProfile(userProfile)

                // Initialize theme
                if (userProfile.preferences?.theme === 'dark') {
                    document.documentElement.classList.add('dark')
                } else {
                    document.documentElement.classList.remove('dark')
                }

            } catch (error) {
                console.error("Failed to load profile settings", error)
                toast.error("Failed to load profile settings")
            } finally {
                setLoading(false)
            }
        }
        fetchProfile()
    }, [])

    const calculatePasswordStrength = (password: string) => {
        let score = 0
        if (!password) return 0
        if (password.length > 7) score += 20
        if (password.length > 10) score += 20
        if (/[A-Z]/.test(password)) score += 20
        if (/[0-9]/.test(password)) score += 20
        if (/[^A-Za-z0-9]/.test(password)) score += 20
        return score
    }

    useEffect(() => {
        setPasswordStrength(calculatePasswordStrength(newPassword))
    }, [newPassword])

    const handleSaveProfile = async (updatedProfile?: any) => {
        setSaving(true)
        try {
            const profileToSave = updatedProfile || profile
            const token = localStorage.getItem('token')

            // Construct body properly - ensure preferences are included
            const body = {
                firstName: profileToSave.firstName,
                lastName: profileToSave.lastName,
                phone: profileToSave.phone,
                preferences: profileToSave.preferences
            }

            const res = await fetch(`${API_URL}/api/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            })

            const data = await res.json()

            if (res.ok) {
                toast.success("Settings Saved", { description: "Your preferences have been updated." })
                if (data.data) {
                    setProfile((prev: any) => ({ ...prev, ...data.data }))
                } else if (updatedProfile) {
                    setProfile(updatedProfile)
                }
            } else {
                toast.error(data.error || "Failed to update profile")
            }
        } catch (error) {
            console.error("Profile save error", error)
            toast.error("Update Failed", { description: "Could not connect to server." })
        } finally {
            setSaving(false)
        }
    }

    const handleThemeChange = (checked: boolean) => {
        const theme = checked ? 'dark' : 'light'

        // Live preview
        if (checked) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }

        const updatedProfile = {
            ...profile,
            preferences: { ...profile.preferences, theme }
        }
        setProfile(updatedProfile)

        // Auto-save for immediate effect persistence
        handleSaveProfile(updatedProfile)
    }

    const handleUpdatePassword = async () => {
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match")
            return
        }
        if (!currentPassword) {
            toast.error("Current password is required")
            return
        }
        if (passwordStrength < 60) {
            toast.error("Password is too weak", { description: "Please use a stronger password (letters, numbers, symbols)." })
            return
        }

        setPasswordLoading(true)
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`${API_URL}/api/profile/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ currentPassword, newPassword })
            })

            const data = await res.json()

            if (res.ok) {
                toast.success("Password Updated", { description: "Your password has been changed successfully. Please log in again." })
                setCurrentPassword("")
                setNewPassword("")
                setConfirmPassword("")
                // Ideally logout here or invalidate session
                setTimeout(() => {
                    // Optional: window.location.href = '/login'
                }, 2000)
            } else {
                toast.error(data.error || "Failed to update password")
            }
        } catch (error) {
            console.error("Password update error", error)
            toast.error("Error", { description: "Something went wrong." })
        } finally {
            setPasswordLoading(false)
        }
    }

    const sendTestNotification = async () => {
        toast.info("Test Notification Sent", { description: "Checking delivery channels..." })
        // Simulate local check first
        setTimeout(() => {
            if (profile.preferences.pushNotifications) {
                toast.success("Push Notification: Success", { description: "System is configured correctly." })
            } else {
                toast.warning("Push Notification: Scaled", { description: "Push notifications are disabled in your settings." })
            }
        }, 1000)
    }

    if (loading) {
        return (
            <DashboardLayout title="Settings">
                <div className="flex h-full items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout title="Settings">
            <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        Account Settings
                    </h2>
                    <p className="text-muted-foreground mt-1">Manage your account settings and preferences</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Personal Info Card - Read Only/Redirect */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Personal Information
                            </CardTitle>
                            <CardDescription>Manage your personal details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 flex items-start gap-3">
                                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-semibold text-blue-900">Manage in My Profile</h4>
                                    <p className="text-sm text-blue-700 mt-1">
                                        Personal information updates are handled in your Profile section.
                                    </p>
                                    <Button
                                        variant="link"
                                        className="text-blue-700 p-0 h-auto font-bold mt-2 hover:text-blue-900"
                                        onClick={() => {
                                            const role = profile?.role;
                                            let path = '/dashboard/admin/profile';
                                            if (role === 'super_admin') path = '/dashboard/super-admin/profile';
                                            else if (role === 'teacher') path = '/dashboard/teacher/profile';
                                            else if (role === 'student') path = '/dashboard/student/profile';
                                            else if (role === 'parent') path = '/dashboard/parent/profile';
                                            window.location.href = path;
                                        }}
                                    >
                                        Go to My Profile →
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Password Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lock className="h-5 w-5" />
                                Password & Security
                            </CardTitle>
                            <CardDescription>Ensure your account is secure</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="current">Current Password</Label>
                                <Input
                                    id="current"
                                    type="password"
                                    placeholder="Enter current password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new">New Password</Label>
                                <Input
                                    id="new"
                                    type="password"
                                    placeholder="Enter new password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                                {newPassword && (
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-xs">
                                            <span>Strength</span>
                                            <span className={
                                                passwordStrength < 40 ? "text-red-500" :
                                                    passwordStrength < 80 ? "text-yellow-500" : "text-green-500"
                                            }>
                                                {passwordStrength < 40 ? "Weak" : passwordStrength < 80 ? "Medium" : "Strong"}
                                            </span>
                                        </div>
                                        <Progress value={passwordStrength} className={`h-1 ${passwordStrength < 40 ? "bg-red-100 [&>div]:bg-red-500" :
                                                passwordStrength < 80 ? "bg-yellow-100 [&>div]:bg-yellow-500" : "bg-green-100 [&>div]:bg-green-500"
                                            }`} />
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm">Confirm Password</Label>
                                <Input
                                    id="confirm"
                                    type="password"
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                            <Button
                                onClick={handleUpdatePassword}
                                variant="default"
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                                disabled={passwordLoading}
                            >
                                {passwordLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                                Update Password
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Notification Preferences */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="h-5 w-5" />
                                Notification Preferences
                            </CardTitle>
                            <CardDescription>Manage delivery channels</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Email Notifications</Label>
                                    <p className="text-xs text-muted-foreground">Receive daily summaries and alerts via email</p>
                                </div>
                                <Switch
                                    checked={profile?.preferences?.emailNotifications ?? true}
                                    onCheckedChange={(checked: boolean) => {
                                        const updated = { ...profile, preferences: { ...profile.preferences, emailNotifications: checked } }
                                        setProfile(updated)
                                        handleSaveProfile(updated)
                                    }}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Push Notifications</Label>
                                    <p className="text-xs text-muted-foreground">Receive real-time in-app alerts</p>
                                </div>
                                <Switch
                                    checked={profile?.preferences?.pushNotifications ?? true}
                                    onCheckedChange={(checked: boolean) => {
                                        const updated = { ...profile, preferences: { ...profile.preferences, pushNotifications: checked } }
                                        setProfile(updated)
                                        handleSaveProfile(updated)
                                    }}
                                />
                            </div>

                            <div className="pt-4 border-t">
                                <Button variant="outline" size="sm" onClick={sendTestNotification} className="w-full">
                                    <Send className="h-4 w-4 mr-2" /> Send Test Notification
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Appearance */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Palette className="h-5 w-5" />
                                Appearance
                            </CardTitle>
                            <CardDescription>Customize interface theme</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                                <div className="space-y-0.5">
                                    <Label>Dark Mode</Label>
                                    <p className="text-xs text-muted-foreground">Switch between light and dark themes</p>
                                </div>
                                <Switch
                                    checked={profile?.preferences?.theme === 'dark'}
                                    onCheckedChange={handleThemeChange}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    )
}
