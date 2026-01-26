"use client"

import { useState, useEffect } from "react"
import { API_URL } from "@/lib/api-config"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Send, Loader2, Mail } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface Recipient {
    _id: string
    firstName?: string
    lastName?: string
    email: string
    role: string
}

interface ComposeMessageProps {
    role: "admin" | "teacher" | "student" | "parent" | "super_admin"
}

export default function ComposeMessage({ role }: ComposeMessageProps) {
    const router = useRouter()
    const [recipients, setRecipients] = useState<Recipient[]>([])
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [form, setForm] = useState({
        recipientId: "",
        recipientType: "",
        subject: "",
        message: "",
        priority: "medium"
    })

    const basePath = `/dashboard/${role === "super_admin" ? "super-admin" : role}`

    const fetchRecipients = async () => {
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/messages/recipients`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const data = await res.json()

            if (data.success && Array.isArray(data.data)) {
                setRecipients(data.data)
            }
        } catch (err) {
            toast.error("Failed to load recipients")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchRecipients()
    }, [])

    const handleRecipientChange = (recipientId: string) => {
        const recipient = recipients.find(r => r._id === recipientId)
        if (recipient) {
            setForm({
                ...form,
                recipientId,
                recipientType: recipient.role
            })
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!form.recipientId || !form.subject || !form.message) {
            toast.error("Please fill in all required fields")
            return
        }

        setSending(true)
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/messages`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(form)
            })

            const data = await res.json()

            if (data.success) {
                toast.success("Message sent successfully!")
                router.push(`${basePath}/communication`)
            } else {
                toast.error(data.error || "Failed to send message")
            }
        } catch (err) {
            toast.error("Failed to send message")
        } finally {
            setSending(false)
        }
    }

    return (
        <DashboardLayout title="Compose Message">
            <div className="space-y-6 max-w-4xl mx-auto">
                <div>
                    <h2 className="text-2xl font-bold">Compose New Message</h2>
                    <p className="text-gray-500">Send a message to teachers, parents, students, or admins</p>
                </div>

                <Card>
                    <CardHeader className="bg-pink-50 border-b border-pink-100">
                        <CardTitle className="flex items-center gap-2 text-gray-800">
                            <Mail className="h-5 w-5" />
                            Message Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-red-500">Recipient *</Label>
                                    <Select
                                        value={form.recipientId}
                                        onValueChange={handleRecipientChange}
                                        disabled={loading}
                                    >
                                        <SelectTrigger className="bg-white border-gray-200">
                                            <SelectValue placeholder={loading ? "Loading..." : "Select recipient"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {recipients.map((recipient) => (
                                                <SelectItem key={recipient._id} value={recipient._id}>
                                                    {recipient.firstName} {recipient.lastName} ({recipient.role}) - {recipient.email}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-red-500">Priority *</Label>
                                    <Select value={form.priority} onValueChange={(val) => setForm({ ...form, priority: val })}>
                                        <SelectTrigger className="bg-white border-gray-200">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-red-500">Subject *</Label>
                                <Input
                                    value={form.subject}
                                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                                    placeholder="Enter message subject"
                                    className="bg-white border-gray-200"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-red-500">Message *</Label>
                                <Textarea
                                    value={form.message}
                                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                                    placeholder="Type your message here..."
                                    rows={10}
                                    className="bg-white border-gray-200"
                                />
                            </div>

                            <div className="flex gap-2 justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.back()}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={sending}
                                    className="bg-blue-900 hover:bg-blue-800"
                                >
                                    {sending ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4 mr-2" />
                                            Send Message
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
