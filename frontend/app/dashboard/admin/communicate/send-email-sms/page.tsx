"use client"

import { useState, useEffect } from "react"
import { API_URL } from "@/lib/api-config"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Mail, CheckSquare, Users, User, LayoutGrid, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

const RECIPIENT_GROUPS = [
    "Student", "Teacher", "Parent", "Admin", "Super Admin",
    "Librarian", "Receptionist", "Driver", "Accountant"
]

export default function SendEmailSMSPage() {
    const { toast } = useToast()
    const [activeTab, setActiveTab] = useState("group")
    const [sending, setSending] = useState(false)
    const [classes, setClasses] = useState<any[]>([])

    // Form State
    const [title, setTitle] = useState("")
    const [message, setMessage] = useState("")
    const [channels, setChannels] = useState<{ email: boolean, sms: boolean, ivr: boolean, whatsapp: boolean }>({
        email: true, sms: false, ivr: false, whatsapp: false
    })

    // Recipient Selection State
    const [selectedGroups, setSelectedGroups] = useState<string[]>([])
    const [selectedClass, setSelectedClass] = useState("")
    const [individualEmails, setIndividualEmails] = useState("")

    useEffect(() => {
        if (activeTab === 'class') fetchClasses()
    }, [activeTab])

    const fetchClasses = async () => {
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/classes`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const data = await res.json()
            if (Array.isArray(data)) setClasses(data)
            else if (data.data) setClasses(data.data)
        } catch { }
    }

    const handleSend = async () => {
        // Validation
        if (!title.trim() || !message.trim()) {
            toast({ title: "Error", description: "Title and Message are required", variant: "destructive" })
            return
        }
        if (!Object.values(channels).some(v => v)) {
            toast({ title: "Error", description: "Select at least one channel", variant: "destructive" })
            return
        }

        const payload: any = {
            title,
            message,
            sendThrough: Object.keys(channels).filter(k => (channels as any)[k]),
            criteria: activeTab
        }

        // Recipient Logic based on active tab
        if (activeTab === 'group') {
            if (selectedGroups.length === 0) {
                toast({ title: "Error", description: "Select at least one group", variant: "destructive" })
                return
            }
            payload.selectedRoles = selectedGroups
        } else if (activeTab === 'class') {
            if (!selectedClass) {
                toast({ title: "Error", description: "Select a class", variant: "destructive" })
                return
            }
            payload.classId = selectedClass
        } else if (activeTab === 'individual') {
            if (!individualEmails.trim()) {
                toast({ title: "Error", description: "Enter at least one email", variant: "destructive" })
                return
            }
            payload.specificEmails = individualEmails
        }

        setSending(true)
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/communication/broadcast`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            })

            const data = await res.json()
            if (data.success) {
                toast({ title: "Success", description: data.message || "Message sent successfully" })
                // Reset form
                setTitle("")
                setMessage("")
                setIndividualEmails("")
                setSelectedGroups([])
                setSelectedClass("")
            } else {
                toast({ title: "Error", description: data.error || "Failed to send", variant: "destructive" })
            }
        } catch (err) {
            toast({ title: "Error", description: "Network error", variant: "destructive" })
        } finally {
            setSending(false)
        }
    }

    const toggleGroup = (group: string) => {
        setSelectedGroups(prev =>
            prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]
        )
    }

    const toggleAllGroups = (checked: boolean) => {
        if (checked) setSelectedGroups(RECIPIENT_GROUPS)
        else setSelectedGroups([])
    }

    return (
        <DashboardLayout title="Send Email / SMS">
            <div className="space-y-6">
                <Card className="shadow-sm border-t-4 border-t-pink-500">
                    <CardContent className="pt-6">
                        {/* Tabs Navigation */}
                        <div className="flex flex-wrap gap-4 border-b pb-2 mb-6 text-sm font-bold text-[#1a237e]">
                            <button
                                type="button"
                                onClick={() => setActiveTab('group')}
                                className={`px-4 py-2 flex items-center gap-2 rounded-t-md transition-colors ${activeTab === 'group' ? 'border-b-2 border-pink-500 bg-gray-50' : 'hover:bg-gray-50'}`}
                            >
                                <Users className="h-4 w-4" /> Group
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('individual')}
                                className={`px-4 py-2 flex items-center gap-2 rounded-t-md transition-colors ${activeTab === 'individual' ? 'border-b-2 border-pink-500 bg-gray-50' : 'hover:bg-gray-50'}`}
                            >
                                <User className="h-4 w-4" /> Individual
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('class')}
                                className={`px-4 py-2 flex items-center gap-2 rounded-t-md transition-colors ${activeTab === 'class' ? 'border-b-2 border-pink-500 bg-gray-50' : 'hover:bg-gray-50'}`}
                            >
                                <LayoutGrid className="h-4 w-4" /> Class
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Left Column - Message Details */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-gray-700">Title <span className="text-red-500">*</span></Label>
                                    <Input
                                        className="bg-white border-gray-200"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Message Subject / Title"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-gray-700">Send Through <span className="text-red-500">*</span></Label>
                                    <div className="flex flex-wrap gap-6 pt-2">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="email"
                                                checked={channels.email}
                                                onCheckedChange={(c) => setChannels(prev => ({ ...prev, email: !!c }))}
                                            />
                                            <Label htmlFor="email" className="font-normal cursor-pointer">Email</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="sms"
                                                checked={channels.sms}
                                                onCheckedChange={(c) => setChannels(prev => ({ ...prev, sms: !!c }))}
                                            />
                                            <Label htmlFor="sms" className="font-normal cursor-pointer">SMS</Label>
                                        </div>
                                        <div className="flex items-center space-x-2 opacity-60">
                                            <Checkbox
                                                id="ivr"
                                                disabled
                                                checked={channels.ivr}
                                                onCheckedChange={(c) => setChannels(prev => ({ ...prev, ivr: !!c }))}
                                            />
                                            <Label htmlFor="ivr" className="font-normal cursor-not-allowed">IVR (Coming Soon)</Label>
                                        </div>
                                        <div className="flex items-center space-x-2 opacity-60">
                                            <Checkbox
                                                id="whatsapp"
                                                disabled
                                                checked={channels.whatsapp}
                                                onCheckedChange={(c) => setChannels(prev => ({ ...prev, whatsapp: !!c }))}
                                            />
                                            <Label htmlFor="whatsapp" className="font-normal cursor-not-allowed">WhatsApp (Coming Soon)</Label>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-700">Message <span className="text-red-500">*</span></Label>
                                    <Textarea
                                        className="bg-white border-gray-200 min-h-[150px]"
                                        placeholder="Type your message content here (HTML supported for Email)..."
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Right Column - Recipient Selection */}
                            <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-100">
                                <Label className="text-lg font-semibold text-[#1a237e] flex items-center gap-2">
                                    <CheckSquare className="h-5 w-5" /> Select Recipients
                                </Label>

                                {activeTab === 'group' && (
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <p className="text-sm text-gray-500">Select user roles to broadcast to.</p>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="groups-all"
                                                    checked={selectedGroups.length === RECIPIENT_GROUPS.length}
                                                    onCheckedChange={(c) => toggleAllGroups(!!c)}
                                                />
                                                <Label htmlFor="groups-all" className="text-sm font-bold cursor-pointer">Select All</Label>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            {RECIPIENT_GROUPS.map((role) => (
                                                <div key={role} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`role-${role}`}
                                                        checked={selectedGroups.includes(role)}
                                                        onCheckedChange={() => toggleGroup(role)}
                                                        className="rounded items-center justify-center border-gray-400"
                                                    />
                                                    <Label htmlFor={`role-${role}`} className="font-normal cursor-pointer text-gray-700">{role}</Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'individual' && (
                                    <div className="space-y-4">
                                        <p className="text-sm text-gray-500">Enter email addresses separated by commas.</p>
                                        <Textarea
                                            placeholder="john@example.com, teacher@school.com"
                                            value={individualEmails}
                                            onChange={(e) => setIndividualEmails(e.target.value)}
                                            rows={5}
                                            className="bg-white"
                                        />
                                    </div>
                                )}

                                {activeTab === 'class' && (
                                    <div className="space-y-4">
                                        <p className="text-sm text-gray-500">Send to all students in a specific class.</p>
                                        <div className="space-y-2">
                                            <Label>Select Class</Label>
                                            <Select value={selectedClass} onValueChange={setSelectedClass}>
                                                <SelectTrigger className="bg-white border-gray-200">
                                                    <SelectValue placeholder="Select Class" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {classes.map((cls) => (
                                                        <SelectItem key={cls._id} value={cls._id}>
                                                            Class {cls.name} {cls.section}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end pt-6 mt-6 border-t">
                            <Button
                                onClick={handleSend}
                                disabled={sending}
                                className="bg-[#1a237e] hover:bg-[#1a237e]/90 text-white gap-2 px-8"
                            >
                                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                                Send Broadcast
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
