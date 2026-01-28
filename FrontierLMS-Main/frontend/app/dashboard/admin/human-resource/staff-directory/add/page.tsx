"use client"

import { API_URL } from "@/lib/api-config"

import { useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Loader2, Save, User, Mail, Phone, BookOpen, Calendar, DollarSign, Award, MapPin, Copy, CheckCircle, Home, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"

export default function AddStaffPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [role, setRole] = useState("teacher") // Default to teacher as per request

    // State for credentials dialog
    const [showCredentials, setShowCredentials] = useState(false)
    const [credentials, setCredentials] = useState<any>(null)

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        qualification: "",
        subjects: "",
        joiningDate: "",
        address: "",
        salary: "",
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const token = localStorage.getItem("token")
            const response = await fetch(`${API_URL}/api/staff`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    role,
                    staffId: formData.firstName[0] + formData.lastName[0] + Math.floor(Math.random() * 1000) // Simple front-end fallback if backend is picky
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Failed to add staff member")
            }

            if (data.credentials) {
                setCredentials(data.credentials);
                setShowCredentials(true);
                toast.success("Personnel Registered", { description: "Credential record generated." })
            } else {
                toast.success("Staff Member Added Successfully")
                router.push("/dashboard/admin/human-resource/staff-directory")
            }

        } catch (error) {
            console.error("Error adding staff:", error)
            toast.error(error instanceof Error ? error.message : "An error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        toast.success("Copied to clipboard")
    }

    const handleCloseDialog = () => {
        setShowCredentials(false)
        router.push("/dashboard/admin/human-resource/staff-directory")
    }

    return (
        <DashboardLayout title="Register Institutional Personnel">
            <div className="max-w-4xl mx-auto space-y-6 pb-20">

                {/* Header & Back Button */}
                <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border-l-4 border-l-pink-500">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Link href="/dashboard/admin/human-resource/staff-directory" className="hover:text-pink-600 flex items-center gap-1 font-bold uppercase text-[10px] tracking-widest">
                            <ArrowLeft className="h-4 w-4" /> Back to Directory
                        </Link>
                    </div>
                    <div className="text-sm text-gray-400 font-bold uppercase text-[10px] tracking-widest flex items-center gap-1">
                        <Home className="h-3.5 w-3.5" /> HR <span className="mx-1">/</span> <span className="text-pink-600">Personnel Enrollment</span>
                    </div>
                </div>

                {/* Credentials Dialog */}
                <Dialog open={showCredentials} onOpenChange={setShowCredentials}>
                    <DialogContent className="sm:max-w-md border-t-4 border-t-green-500">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-green-700 font-bold uppercase tracking-widest text-sm">
                                <CheckCircle className="h-5 w-5" />
                                Credentials Authorized
                            </DialogTitle>
                            <DialogDescription className="text-xs font-medium">
                                Account access has been provisioned. Personnel can log in via the institutional portal.
                            </DialogDescription>
                        </DialogHeader>

                        {credentials && (
                            <div className="bg-gray-50 p-6 rounded-lg space-y-4 border border-gray-100 shadow-inner">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Username / Email</Label>
                                    <div className="flex items-center gap-2">
                                        <code className="flex-1 bg-white p-3 rounded-md border border-gray-200 font-mono text-xs font-bold text-gray-700">{credentials.email}</code>
                                        <Button variant="outline" size="icon" className="h-10 w-10 shrink-0" onClick={() => copyToClipboard(credentials.email)}>
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Access Passcode</Label>
                                    <div className="flex items-center gap-2">
                                        <code className="flex-1 bg-white p-3 rounded-md border border-gray-200 font-mono text-sm font-black text-indigo-600 tracking-wider text-center">{credentials.password}</code>
                                        <Button variant="outline" size="icon" className="h-10 w-10 shrink-0" onClick={() => copyToClipboard(credentials.password)}>
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="mt-2 p-3 bg-indigo-50 text-indigo-700 text-[10px] rounded-md border border-indigo-100 font-bold flex items-start gap-2 italic">
                                    <ShieldCheck className="h-4 w-4 shrink-0" />
                                    Sensitive Information: This passcode is only displayed once. Ensure it is transmitted securely to the recipient.
                                </div>
                            </div>
                        )}

                        <DialogFooter className="sm:justify-start">
                            <Button type="button" variant="default" onClick={handleCloseDialog} className="w-full bg-[#0b1c48] font-bold uppercase text-[10px] tracking-widest h-12 shadow-lg shadow-blue-50">
                                Confirm & Initialize Directory
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <form onSubmit={handleSubmit}>
                    <Card className="border-t-4 border-t-pink-500 shadow-lg bg-white/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5 text-pink-600" />
                                Staff Details
                            </CardTitle>
                            <CardDescription>
                                Add a new staff member. Login credentials will be automatically generated and emailed.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">

                            {/* Role Selection */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Staff Role <span className="text-red-500">*</span></Label>
                                    <Select value={role} onValueChange={setRole}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="teacher">Teacher</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                            <SelectItem value="accountant">Accountant</SelectItem>
                                            <SelectItem value="librarian">Librarian</SelectItem>
                                            <SelectItem value="driver">Driver</SelectItem>
                                            <SelectItem value="receptionist">Receptionist</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Personal Info */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider border-b pb-2">Personal Information</h3>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="firstName"
                                                name="firstName"
                                                placeholder="e.g. John"
                                                className="pl-9"
                                                required
                                                value={formData.firstName}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Last Name <span className="text-red-500">*</span></Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="lastName"
                                                name="lastName"
                                                placeholder="e.g. Doe"
                                                className="pl-9"
                                                required
                                                value={formData.lastName}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                placeholder="john.doe@school.com"
                                                className="pl-9"
                                                required
                                                value={formData.email}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="phone"
                                                name="phone"
                                                placeholder="+1 234 567 890"
                                                className="pl-9"
                                                value={formData.phone}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                        <Label htmlFor="address">Current Address</Label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                            <Textarea
                                                id="address"
                                                name="address"
                                                placeholder="123 Main St, City, Country"
                                                className="pl-9 min-h-[80px]"
                                                value={formData.address}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Academic & Professional Info (Teacher specific for now) */}
                            {role === "teacher" && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider border-b pb-2">Academic & Professional Details</h3>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="qualification">Qualification</Label>
                                            <div className="relative">
                                                <Award className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                <Input
                                                    id="qualification"
                                                    name="qualification"
                                                    placeholder="e.g. PhD in Mathematics, B.Ed"
                                                    className="pl-9"
                                                    value={formData.qualification}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="subjects">Subjects (Comma Separated) <span className="text-red-500">*</span></Label>
                                            <div className="relative">
                                                <BookOpen className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                <Input
                                                    id="subjects"
                                                    name="subjects"
                                                    placeholder="e.g. Mathematics, Physics"
                                                    className="pl-9"
                                                    required
                                                    value={formData.subjects}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="joiningDate">Joining Date</Label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                <Input
                                                    id="joiningDate"
                                                    name="joiningDate"
                                                    type="date"
                                                    className="pl-9"
                                                    value={formData.joiningDate}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="salary">Salary</Label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                <Input
                                                    id="salary"
                                                    name="salary"
                                                    type="number"
                                                    placeholder="0.00"
                                                    className="pl-9"
                                                    value={formData.salary}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Submit Button */}
                            <div className="flex justify-end pt-4">
                                <Button
                                    type="submit"
                                    className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white min-w-[150px]"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Save Staff Member
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </DashboardLayout>
    )
}
