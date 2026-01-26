"use client"

import { useState, useEffect } from "react"
import { API_URL } from "@/lib/api-config"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2, Reply, Trash2, User, Calendar, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { useRouter, useParams } from "next/navigation"
import { formatDistanceToNow } from "date-fns"

interface Message {
    _id: string
    senderId: {
        _id: string
        firstName?: string
        lastName?: string
        email: string
    }
    senderType: string
    recipientId: {
        _id: string
        firstName?: string
        lastName?: string
        email: string
    }
    recipientType: string
    subject: string
    message: string
    isRead: boolean
    priority: string
    createdAt: string
    attachments?: any[]
}

interface MessageViewProps {
    role: "admin" | "teacher" | "student" | "parent" | "super_admin"
}

export default function MessageView({ role }: MessageViewProps) {
    const router = useRouter()
    const params = useParams()
    const messageId = params.id as string

    const [message, setMessage] = useState<Message | null>(null)
    const [loading, setLoading] = useState(true)
    const [showReply, setShowReply] = useState(false)
    const [replyText, setReplyText] = useState("")
    const [sending, setSending] = useState(false)

    const basePath = `/dashboard/${role === "super_admin" ? "super-admin" : role}`

    const fetchMessage = async () => {
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/messages/${messageId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const data = await res.json()

            if (data.success) {
                setMessage(data.data)

                // Mark as read if not already
                if (!data.data.isRead) {
                    await fetch(`${API_URL}/api/messages/${messageId}/read`, {
                        method: "PATCH",
                        headers: { "Authorization": `Bearer ${token}` }
                    })
                }
            } else {
                toast.error("Message not found")
                router.back()
            }
        } catch (err) {
            toast.error("Failed to load message")
            router.back()
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (messageId) {
            fetchMessage()
        }
    }, [messageId])

    const handleReply = async () => {
        if (!replyText.trim()) {
            toast.error("Please enter a reply message")
            return
        }

        if (!message) return

        setSending(true)
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/messages`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    recipientId: message.senderId._id,
                    recipientType: message.senderType,
                    subject: `Re: ${message.subject}`,
                    message: replyText,
                    priority: "medium"
                })
            })

            const data = await res.json()

            if (data.success) {
                toast.success("Reply sent successfully!")
                setReplyText("")
                setShowReply(false)
            } else {
                toast.error(data.error || "Failed to send reply")
            }
        } catch (err) {
            toast.error("Failed to send reply")
        } finally {
            setSending(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this message?")) return

        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/messages/${messageId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            })

            if (res.ok) {
                toast.success("Message deleted")
                router.push(`${basePath}/communication`)
            }
        } catch (err) {
            toast.error("Failed to delete message")
        }
    }

    const getPriorityBadge = (priority: string) => {
        const styles = {
            high: "bg-red-100 text-red-800",
            medium: "bg-yellow-100 text-yellow-800",
            low: "bg-green-100 text-green-800"
        }
        return <Badge className={styles[priority as keyof typeof styles] || styles.medium}>{priority}</Badge>
    }

    if (loading) {
        return (
            <DashboardLayout title="Loading...">
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            </DashboardLayout>
        )
    }

    if (!message) {
        return (
            <DashboardLayout title="Message Not Found">
                <div className="text-center py-12">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-500">Message not found</p>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout title="View Message">
            <div className="space-y-6 max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <Button variant="outline" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setShowReply(!showReply)}>
                            <Reply className="h-4 w-4 mr-2" />
                            Reply
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                </div>

                {/* Message Card */}
                <Card>
                    <CardHeader className="bg-pink-50 border-b border-pink-100">
                        <div className="flex items-start justify-between">
                            <CardTitle className="text-xl">{message.subject}</CardTitle>
                            {getPriorityBadge(message.priority)}
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                        {/* Sender Info */}
                        <div className="flex items-start gap-4 pb-4 border-b">
                            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold text-lg">
                                            {message.senderId.firstName} {message.senderId.lastName}
                                        </h3>
                                        <p className="text-sm text-gray-500">{message.senderId.email}</p>
                                        <p className="text-xs text-gray-400 capitalize mt-1">
                                            {message.senderType.replace('_', ' ')}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-1 text-sm text-gray-500">
                                            <Calendar className="h-4 w-4" />
                                            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {new Date(message.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recipient Info */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600">
                                <span className="font-semibold">To:</span> {message.recipientId.firstName} {message.recipientId.lastName} ({message.recipientId.email})
                            </p>
                        </div>

                        {/* Message Content */}
                        <div className="prose max-w-none">
                            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                                {message.message}
                            </div>
                        </div>

                        {/* Attachments */}
                        {message.attachments && message.attachments.length > 0 && (
                            <div className="pt-4 border-t">
                                <h4 className="font-semibold mb-2">Attachments ({message.attachments.length})</h4>
                                <div className="space-y-2">
                                    {message.attachments.map((attachment, index) => (
                                        <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                            <span className="text-sm">📎 {attachment.filename}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Reply Section */}
                {showReply && (
                    <Card>
                        <CardHeader className="bg-blue-50 border-b border-blue-100">
                            <CardTitle className="flex items-center gap-2 text-gray-800">
                                <Reply className="h-5 w-5" />
                                Reply to {message.senderId.firstName}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="space-y-2">
                                <Label>Your Reply</Label>
                                <Textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Type your reply here..."
                                    rows={6}
                                    className="bg-white border-gray-200"
                                />
                            </div>
                            <div className="flex gap-2 justify-end">
                                <Button variant="outline" onClick={() => setShowReply(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleReply}
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
                                            <Reply className="h-4 w-4 mr-2" />
                                            Send Reply
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    )
}
