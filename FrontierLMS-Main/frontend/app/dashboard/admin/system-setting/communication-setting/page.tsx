"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    MessageSquare,
    Mail,
    Phone,
    Bell,
    Mic,
    Video,
    Plus,
    Trash2,
    Save,
    Activity,
    Info,
    RefreshCw,
    CheckCircle2,
    XCircle,
    Loader2,
    Lock
} from "lucide-react"
import { toast } from "sonner"
import { API_URL } from "@/lib/api-config"

// Types
interface KeyValue {
    key: string
    value: string
}

interface NotificationMapping {
    module: string
    staffId: string
    notifyClassTeacher: boolean
}

interface StaffItem {
    _id: string
    firstName: string
    lastName: string
    staffId: string
}

const MODULES = [
    "ADMISSION ENQUIRY",
    "AUTHENTICATOR",
    "COMPLAIN",
    "CONTACT US",
    "ONLINE ADMISSION",
    "RECRUITMENT",
    "STAFF LEAVE",
    "STUDENT LEAVE"
]

export default function CommunicationSettingPage() {
    const [activeTab, setActiveTab] = useState("sms")
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [testing, setTesting] = useState(false)
    const [staff, setStaff] = useState<StaffItem[]>([])

    // Detailed State for each section
    const [settings, setSettings] = useState<any>({
        communication: {
            sms: { provider: "", status: "disabled", config: {} },
            email: { host: "", port: "", username: "", password: "", fromEmail: "", fromName: "", security: "tls", status: "disabled" },
            whatsapp: { url: "", status: "disabled", config: {} },
            ivr: { url: "", status: "disabled", config: {} },
            meet: { status: "disabled", config: {} },
            notifications: []
        }
    })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem("token")
            const [settingsRes, staffRes] = await Promise.all([
                fetch(`${API_URL}/api/system-setting`, { headers: { "Authorization": `Bearer ${token}` } }),
                fetch(`${API_URL}/api/staff?limit=1000`, { headers: { "Authorization": `Bearer ${token}` } })
            ])

            const sData = await settingsRes.json()
            const stData = await staffRes.json()

            if (sData.success && sData.data) {
                // Merge fetched data with default structure to avoid undefined errors
                const fetched = sData.data
                setSettings((prev: any) => ({
                    ...prev,
                    communication: {
                        ...prev.communication,
                        ...fetched.communication,
                        notifications: fetched.communication?.notifications || []
                    }
                }))
            }
            if (stData.staff) setStaff(stData.staff)
        } catch (err) {
            toast.error("Failed to load settings")
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (type: string) => {
        try {
            setSaving(true)
            const token = localStorage.getItem("token")
            const response = await fetch(`${API_URL}/api/system-setting`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ communication: settings.communication })
            })
            const result = await response.json()
            if (result.success) {
                toast.success(`${type.toUpperCase()} settings updated successfully`)
                fetchData() // Refresh to mask newly saved values
            } else {
                toast.error(result.error || "Save failed")
            }
        } catch (err) {
            toast.error("An error occurred during save")
        } finally {
            setSaving(false)
        }
    }

    const handleTest = async (type: string, config: any) => {
        try {
            setTesting(true)
            const token = localStorage.getItem("token")
            const response = await fetch(`${API_URL}/api/system-setting/test`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ type, config })
            })
            const result = await response.json()
            if (result.success) {
                toast.success(result.message)
            } else {
                toast.error(result.error || "Test failed")
            }
        } catch (err) {
            toast.error("Connection test failed")
        } finally {
            setTesting(false)
        }
    }

    // Dynamic Fields Management Helper
    const updateConfig = (section: string, key: string, value: string) => {
        setSettings((prev: any) => ({
            ...prev,
            communication: {
                ...prev.communication,
                [section]: {
                    ...prev.communication[section],
                    config: {
                        ...prev.communication[section].config,
                        [key]: value
                    }
                }
            }
        }))
    }

    const removeConfigKey = (section: string, key: string) => {
        const newConfig = { ...settings.communication[section].config }
        delete newConfig[key]
        setSettings((prev: any) => ({
            ...prev,
            communication: {
                ...prev.communication,
                [section]: {
                    ...prev.communication[section],
                    config: newConfig
                }
            }
        }))
    }

    const addConfigKey = (section: string) => {
        const key = prompt("Enter Key Name (e.g., Template_ID, Auth_Token):")
        if (key) updateConfig(section, key, "")
    }

    const renderCommunicationForm = (id: string, label: string) => {
        const section = settings.communication[id] || { config: {}, status: 'disabled' }
        const isEmail = id === 'email'

        return (
            <Card className="border-primary/10">
                <CardHeader className="border-b pb-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="text-lg font-medium flex items-center gap-2">
                                <Plus size={18} className="text-primary" /> {label} Setting
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Configure how {label} messages are sent and processed by the system.
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Label className="text-xs font-bold uppercase">Status</Label>
                            <Select
                                value={section.status}
                                onValueChange={(v) => setSettings({ ...settings, communication: { ...settings.communication, [id]: { ...section, status: v } } })}
                            >
                                <SelectTrigger className="w-32 h-8">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="enabled">Enabled</SelectItem>
                                    <SelectItem value="disabled">Disabled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    {/* Common Header Info */}
                    <div className="bg-blue-50/50 p-3 rounded border border-blue-100 flex gap-3">
                        <Info className="w-5 h-5 text-blue-600 shrink-0" />
                        <div className="text-xs text-blue-700 leading-relaxed">
                            <strong>Storage Notice:</strong> Configuration data is encrypted and stored securely.
                            <strong> Usage:</strong> This gateway will be used for all automated {label} notifications (Admission, Attendance, IDs, etc.).
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {isEmail ? (
                            <>
                                <div className="space-y-2">
                                    <Label>SMTP Host</Label>
                                    <Input
                                        placeholder="e.g. smtp.gmail.com"
                                        value={section.host || ""}
                                        onChange={(e) => setSettings({ ...settings, communication: { ...settings.communication, email: { ...section, host: e.target.value } } })}
                                    />
                                    <p className="text-[10px] text-muted-foreground">URL of your SMTP server</p>
                                </div>
                                <div className="space-y-2">
                                    <Label>SMTP Port</Label>
                                    <Input
                                        placeholder="587"
                                        value={section.port || ""}
                                        onChange={(e) => setSettings({ ...settings, communication: { ...settings.communication, email: { ...section, port: e.target.value } } })}
                                    />
                                    <p className="text-[10px] text-muted-foreground">Standard ports: 587 (TLS), 465 (SSL)</p>
                                </div>
                                <div className="space-y-2">
                                    <Label>Security</Label>
                                    <Select
                                        value={section.security || "tls"}
                                        onValueChange={(v) => setSettings({ ...settings, communication: { ...settings.communication, email: { ...section, security: v } } })}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="tls">TLS</SelectItem>
                                            <SelectItem value="ssl">SSL</SelectItem>
                                            <SelectItem value="none">None</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>User Name</Label>
                                    <Input
                                        placeholder="Email or Username"
                                        value={section.username || ""}
                                        onChange={(e) => setSettings({ ...settings, communication: { ...settings.communication, email: { ...section, username: e.target.value } } })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Password</Label>
                                    <div className="relative">
                                        <Input
                                            type="password"
                                            value={section.password || ""}
                                            onChange={(e) => setSettings({ ...settings, communication: { ...settings.communication, email: { ...section, password: e.target.value } } })}
                                        />
                                        <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">App-specific password is recommended</p>
                                </div>
                                <div className="space-y-2">
                                    <Label>From Name</Label>
                                    <Input
                                        placeholder="e.g. School Admin"
                                        value={section.fromName || ""}
                                        onChange={(e) => setSettings({ ...settings, communication: { ...settings.communication, email: { ...section, fromName: e.target.value } } })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>From Email</Label>
                                    <Input
                                        placeholder="admin@school.com"
                                        value={section.fromEmail || ""}
                                        onChange={(e) => setSettings({ ...settings, communication: { ...settings.communication, email: { ...section, fromEmail: e.target.value } } })}
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="space-y-2 lg:col-span-2">
                                    <Label>API URL / Endpoint</Label>
                                    <Input
                                        placeholder="https://api.provider.com/v1/send"
                                        value={section.url || ""}
                                        onChange={(e) => setSettings({ ...settings, communication: { ...settings.communication, [id]: { ...section, url: e.target.value } } })}
                                    />
                                    <p className="text-[10px] text-muted-foreground">The base URL provided by your service provider</p>
                                </div>
                                {id === 'sms' && (
                                    <div className="space-y-2">
                                        <Label>Provider Name</Label>
                                        <Input
                                            placeholder="e.g. Twilio, MSG91"
                                            value={section.provider || ""}
                                            onChange={(e) => setSettings({ ...settings, communication: { ...settings.communication, sms: { ...section, provider: e.target.value } } })}
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Dynamic Key-Value Pairs */}
                    {!isEmail && (
                        <div className="space-y-4 pt-6 border-t">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-sm font-bold uppercase text-gray-700">Custom Parameters</h3>
                                    <p className="text-[10px] text-muted-foreground italic">Add additional fields required by your API provider (e.g. AuthKey, SID, SenderID)</p>
                                </div>
                                <Button size="sm" variant="outline" onClick={() => addConfigKey(id)} className="h-8 border-dashed border-primary text-primary hover:bg-primary/5">
                                    <Plus size={14} className="mr-1" /> Add Field
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries(section.config || {}).map(([key, value]: [string, any]) => (
                                    <div key={key} className="flex gap-2 group p-2 rounded-lg border border-transparent hover:border-muted hover:bg-muted/5 transition-all">
                                        <div className="w-1/3">
                                            <Label className="text-[10px] text-muted-foreground uppercase">{key}</Label>
                                            <Input value={key} readOnly className="h-8 text-xs bg-muted/30 border-none" />
                                        </div>
                                        <div className="flex-1 relative">
                                            <Label className="text-[10px] text-muted-foreground invisible">_</Label>
                                            <Input
                                                value={value}
                                                onChange={(e) => updateConfig(id, key, e.target.value)}
                                                className="h-8 text-xs pr-8"
                                            />
                                            <Lock className={`absolute right-2 top-[calc(50%+4px)] -translate-y-1/2 w-3 h-3 text-muted-foreground/50 ${value === '********' ? 'block' : 'hidden'}`} />
                                        </div>
                                        <div className="pt-6">
                                            <Button variant="ghost" size="icon" onClick={() => removeConfigKey(id, key)} className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50">
                                                <Trash2 size={14} />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                {Object.keys(section.config || {}).length === 0 && (
                                    <div className="col-span-2 py-4 text-center border border-dashed rounded-lg bg-muted/10 text-xs text-muted-foreground">
                                        No custom parameters added yet.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between items-center border-t pt-4">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={testing}
                            onClick={() => handleTest(id, section)}
                            className="text-xs h-9 border-blue-200 text-blue-700 hover:bg-blue-50"
                        >
                            {testing ? <Loader2 size={14} className="animate-spin mr-2" /> : <RefreshCw size={14} className="mr-2" />}
                            Test Configuration
                        </Button>
                        <Button
                            className="bg-[#1e1b4b] h-9"
                            onClick={() => handleSave(id)}
                            disabled={saving}
                        >
                            {saving ? <Loader2 size={14} className="animate-spin mr-2" /> : <Save size={14} className="mr-2" />}
                            Save {label} Config
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    const renderNotificationContent = () => {
        const currentNotifs = settings.communication.notifications || []

        const handleNotifChange = (module: string, staffId: string) => {
            const newList = [...currentNotifs]
            const idx = newList.findIndex(n => n.module === module)
            if (idx > -1) {
                newList[idx] = { ...newList[idx], staffId }
            } else {
                newList.push({ module, staffId, notifyClassTeacher: false })
            }
            setSettings({ ...settings, communication: { ...settings.communication, notifications: newList } })
        }

        const handleToggleClassTeacher = (module: string) => {
            const newList = [...currentNotifs]
            const idx = newList.findIndex(n => n.module === module)
            if (idx > -1) {
                newList[idx] = { ...newList[idx], notifyClassTeacher: !newList[idx].notifyClassTeacher }
            } else {
                newList.push({ module, staffId: "", notifyClassTeacher: true })
            }
            setSettings({ ...settings, communication: { ...settings.communication, notifications: newList } })
        }

        return (
            <Card className="border-primary/10">
                <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                    <div>
                        <CardTitle className="text-lg font-medium">Notification Routing</CardTitle>
                        <CardDescription className="text-xs">Define which staff members receive notifications for specific system events.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50 hover:bg-muted/50">
                                <TableHead className="font-bold pl-6 text-xs uppercase tracking-wider">Event Module</TableHead>
                                <TableHead className="font-bold text-xs uppercase tracking-wider">Assign Primary Staff</TableHead>
                                <TableHead className="font-bold text-xs uppercase tracking-wider text-center">Class Teacher Copy</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {MODULES.map((module) => {
                                const mapping = currentNotifs.find((n: any) => n.module === module)
                                return (
                                    <TableRow key={module} className="hover:bg-muted/5 transition-colors">
                                        <TableCell className="font-bold text-[11px] pl-6 text-blue-900">{module}</TableCell>
                                        <TableCell>
                                            <Select
                                                value={mapping?.staffId?._id || mapping?.staffId || ""}
                                                onValueChange={(v) => handleNotifChange(module, v)}
                                            >
                                                <SelectTrigger className="w-full max-w-[300px] h-9 text-xs">
                                                    <SelectValue placeholder="Select Staff Member" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {staff.map(s => (
                                                        <SelectItem key={s._id} value={s._id} className="text-xs">
                                                            {s.firstName} {s.lastName} ({s.staffId})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Button
                                                variant={mapping?.notifyClassTeacher ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => handleToggleClassTeacher(module)}
                                                className={`text-[10px] h-7 px-3 ${mapping?.notifyClassTeacher ? 'bg-green-600 hover:bg-green-700' : ''}`}
                                            >
                                                {mapping?.notifyClassTeacher ? "YES (ACTIVE)" : "ENABLE"}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                    <div className="p-4 flex items-center justify-between border-t bg-muted/10">
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase font-bold">
                            <Info size={14} className="text-blue-500" /> Changes apply to all future system alerts
                        </div>
                        <Button className="bg-[#1e1b4b] h-9" onClick={() => handleSave("notification")} disabled={saving}>
                            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save size={14} className="mr-2" />}
                            Save Notifications
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    const renderTabContent = () => {
        if (loading) return (
            <div className="py-20 text-center">
                <Loader2 className="w-10 h-10 animate-spin mx-auto text-primary" />
                <p className="mt-4 text-muted-foreground">Synchronizing settings...</p>
            </div>
        )

        switch (activeTab) {
            case "sms": return renderCommunicationForm("sms", "SMS")
            case "email": return renderCommunicationForm("email", "Email")
            case "whatsapp": return renderCommunicationForm("whatsapp", "WhatsApp")
            case "ivr": return renderCommunicationForm("ivr", "IVR Voice")
            case "meet": return renderCommunicationForm("meet", "Video Meet")
            case "notification": return renderNotificationContent()
            default: return <div className="p-8 text-center text-muted-foreground">Select a setting to configure.</div>
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between bg-muted/50 p-4 rounded-lg">
                <h1 className="text-xl font-bold flex items-center gap-2">
                    <span className="p-2 bg-primary/10 rounded-md">
                        <Activity className="w-5 h-5 text-primary" />
                    </span>
                    Communication Settings
                </h1>
                <div className="text-sm text-muted-foreground">
                    System Setting / Communication Settings
                </div>
            </div>

            {/* Navigation Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                {[
                    { id: "sms", label: "SMS", sub: "Gateway Config", icon: MessageSquare, color: "text-orange-500", bg: "bg-orange-50" },
                    { id: "email", label: "EMAIL", sub: "SMTP Config", icon: Mail, color: "text-red-500", bg: "bg-red-50" },
                    { id: "whatsapp", label: "WHATSAPP", sub: "API Config", icon: Phone, color: "text-green-600", bg: "bg-green-50" },
                    { id: "notification", label: "ALERTS", sub: "Notification Staff", icon: Bell, color: "text-yellow-600", bg: "bg-yellow-50" },
                    { id: "ivr", label: "IVR", sub: "Voice Portal", icon: Mic, color: "text-blue-900", bg: "bg-blue-50" },
                    { id: "meet", label: "MEET", sub: "Virtual Classes", icon: Video, color: "text-blue-500", bg: "bg-cyan-50" },
                ].map((item) => (
                    <div
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`
                            cursor-pointer rounded-xl p-4 flex items-center gap-4 transition-all duration-300 border
                            ${activeTab === item.id
                                ? "bg-white border-2 border-[#1e1b4b] shadow-lg ring-4 ring-[#1e1b4b]/5 transform -translate-y-1"
                                : "bg-white hover:bg-white/80 border-gray-100 hover:shadow-md hover:border-gray-200"}
                        `}
                    >
                        <div className={`p-2.5 rounded-lg ${item.bg}`}>
                            <item.icon className={`w-5 h-5 ${item.color}`} />
                        </div>
                        <div>
                            <div className="font-bold text-xs uppercase tracking-tight text-[#1e1b4b]">{item.label}</div>
                            <div className="text-[10px] text-muted-foreground">{item.sub}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Content Area */}
            <div className="animate-in fade-in duration-500">
                {renderTabContent()}
            </div>
        </div>
    )
}
