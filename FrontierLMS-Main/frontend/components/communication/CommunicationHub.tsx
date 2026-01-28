"use client"

import { useState, useEffect } from "react"
import { API_URL } from "@/lib/api-config"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Inbox, Send, Loader2, Mail, MailOpen, Trash2, Eye, MessageSquare } from "lucide-react"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

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

interface CommunicationHubProps {
    role: "admin" | "teacher" | "student" | "parent" | "super_admin"
}

export default function CommunicationHub({ role }: CommunicationHubProps) {
    const [inboxMessages, setInboxMessages] = useState<Message[]>([])
    const [sentMessages, setSentMessages] = useState<Message[]>([])
    const [loading, setLoading] = useState(true)
    const [unreadCount, setUnreadCount] = useState(0)
    const [activeTab, setActiveTab] = useState("inbox")

    const basePath = `/dashboard/${role === "super_admin" ? "super-admin" : role}`

    useEffect(() => {
        fetchInbox()
        fetchSent()
    }, [])

    const fetchInbox = async () => {
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/messages/inbox`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const data = await res.json()

            if (data.success && Array.isArray(data.data)) {
                setInboxMessages(data.data)
                setUnreadCount(data.data.filter((m: Message) => !m.isRead).length)
            }
        } catch (err) {
            console.error("Failed to load inbox")
        } finally {
            setLoading(false)
        }
    }

    const fetchSent = async () => {
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/messages/sent`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const data = await res.json()

            if (data.success && Array.isArray(data.data)) {
                setSentMessages(data.data)
            }
        } catch (err) {
            console.error("Failed to load sent messages")
        }
    }

    const handleMarkAsRead = async (id: string) => {
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/messages/${id}/read`, {
                method: "PATCH",
                headers: { "Authorization": `Bearer ${token}` }
            })

            if (res.ok) {
                setInboxMessages(prev => prev.map(m => m._id === id ? { ...m, isRead: true } : m))
                setUnreadCount(prev => Math.max(0, prev - 1))
                toast.success("Message marked as read")
            }
        } catch (err) {
            toast.error("Failed to update message")
        }
    }

    const handleDelete = async (id: string, type: "inbox" | "sent") => {
        if (!confirm("Are you sure you want to delete this message?")) return

        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/messages/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            })

            if (res.ok) {
                if (type === "inbox") {
                    setInboxMessages(prev => prev.filter(m => m._id !== id))
                } else {
                    setSentMessages(prev => prev.filter(m => m._id !== id))
                }
                toast.success("Message deleted")
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

    const MessageTable = ({ messages, type }: { messages: Message[], type: "inbox" | "sent" }) => (
        <Table>
            <TableHeader>
                <TableRow className="bg-pink-50 hover:bg-pink-50">
                    {type === "inbox" && <TableHead className="font-bold text-gray-700 uppercase w-12"></TableHead>}
                    <TableHead className="font-bold text-gray-700 uppercase">
                        {type === "inbox" ? "From" : "To"}
                    </TableHead>
                    <TableHead className="font-bold text-gray-700 uppercase">Subject</TableHead>
                    <TableHead className="font-bold text-gray-700 uppercase">Priority</TableHead>
                    <TableHead className="font-bold text-gray-700 uppercase">Time</TableHead>
                    <TableHead className="font-bold text-gray-700 uppercase text-center">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {messages.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={type === "inbox" ? 6 : 5} className="text-center py-8 text-gray-500">
                            <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            No messages found
                        </TableCell>
                    </TableRow>
                ) : (
                    messages.map((message) => (
                        <TableRow
                            key={message._id}
                            className={`${type === "inbox" && !message.isRead ? 'bg-blue-50 font-semibold' : ''} hover:bg-gray-50`}
                        >
                            {type === "inbox" && (
                                <TableCell>
                                    {!message.isRead ? (
                                        <Mail className="h-4 w-4 text-blue-600" />
                                    ) : (
                                        <MailOpen className="h-4 w-4 text-gray-400" />
                                    )}
                                </TableCell>
                            )}
                            <TableCell>
                                <div>
                                    <div className="font-medium">
                                        {type === "inbox"
                                            ? `${message.senderId?.firstName} ${message.senderId?.lastName}`
                                            : `${message.recipientId?.firstName} ${message.recipientId?.lastName}`
                                        }
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {type === "inbox" ? message.senderId?.email : message.recipientId?.email}
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="max-w-md truncate">{message.subject}</div>
                                {message.attachments && message.attachments.length > 0 && (
                                    <div className="text-xs text-gray-500 mt-1">
                                        📎 {message.attachments.length} attachment(s)
                                    </div>
                                )}
                            </TableCell>
                            <TableCell>{getPriorityBadge(message.priority)}</TableCell>
                            <TableCell className="text-sm text-gray-600">
                                {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                            </TableCell>
                            <TableCell>
                                <div className="flex gap-2 justify-center">
                                    <Link href={`${basePath}/communication/message/${message._id}`}>
                                        <Button size="sm" variant="outline">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                    {type === "inbox" && !message.isRead && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleMarkAsRead(message._id)}
                                        >
                                            <MailOpen className="h-4 w-4" />
                                        </Button>
                                    )}
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => handleDelete(message._id, type)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    )

    return (
        <DashboardLayout title="Messages">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">Messages</h2>
                        <p className="text-gray-500">You have {unreadCount} unread messages</p>
                    </div>
                    <Link href={`${basePath}/communication/compose`}>
                        <Button className="bg-blue-900 hover:bg-blue-800">
                            <Mail className="h-4 w-4 mr-2" />
                            Compose
                        </Button>
                    </Link>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full max-w-md grid-cols-2">
                        <TabsTrigger value="inbox">
                            <Inbox className="h-4 w-4 mr-2" />
                            Inbox ({inboxMessages.length})
                        </TabsTrigger>
                        <TabsTrigger value="sent">
                            <Send className="h-4 w-4 mr-2" />
                            Sent ({sentMessages.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="inbox">
                        <Card>
                            <CardHeader className="bg-pink-50 border-b border-pink-100">
                                <CardTitle className="flex items-center gap-2 text-gray-800">
                                    <Inbox className="h-5 w-5" />
                                    Inbox Messages
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {loading ? (
                                    <div className="flex justify-center p-8">
                                        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <MessageTable messages={inboxMessages} type="inbox" />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="sent">
                        <Card>
                            <CardHeader className="bg-pink-50 border-b border-pink-100">
                                <CardTitle className="flex items-center gap-2 text-gray-800">
                                    <Send className="h-5 w-5" />
                                    Sent Messages
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {loading ? (
                                    <div className="flex justify-center p-8">
                                        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <MessageTable messages={sentMessages} type="sent" />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    )
}
