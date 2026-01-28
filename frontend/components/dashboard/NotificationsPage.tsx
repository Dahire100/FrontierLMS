"use client"

import { API_URL } from "@/lib/api-config"
import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useRouter } from "next/navigation"
import { Bell, Check, Trash2, Info, AlertTriangle, CheckCircle, AlertCircle, Clock, Filter, Archive, ExternalLink } from "lucide-react"

// ... (existing code)

function NotificationList({ groups, loading, onDelete, onRead, getIcon }: any) {
    const router = useRouter()

    if (loading) return <div className="py-20 text-center text-gray-500 flex flex-col items-center"><Clock className="h-10 w-10 animate-pulse mb-4 opacity-50" />Loading notifications...</div>

    // Check if empty
    const isEmpty = Object.values(groups).every((arr: any) => arr.length === 0);

    if (isEmpty) return (
        <div className="py-20 text-center flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
            <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Bell className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">All caught up!</h3>
            <p className="text-gray-500 mt-2 max-w-sm">You have no new notifications at the moment. Check back later for updates.</p>
        </div>
    )

    const handleNotificationClick = (notification: any) => {
        if (notification.link) {
            router.push(notification.link);
        } else {
            // If no link, maybe just toggle read status? 
            // For now, doing nothing or maybe toggle read if user requested "open" as in "mark read"
            if (!notification.isRead) {
                onRead(notification._id)
            }
        }
    }

    return (
        <div className="space-y-8">
            {Object.entries(groups).map(([label, items]: [string, any]) => (
                items.length > 0 && (
                    <div key={label} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">{label}</h3>
                        <div className="space-y-3">
                            {items.map((notification: any) => (
                                <div
                                    key={notification._id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`group relative overflow-hidden rounded-xl border transition-all duration-200 hover:shadow-md ${notification.isRead ? 'bg-white border-gray-100' : 'bg-blue-50/50 border-blue-100 shadow-sm ring-1 ring-blue-50'} ${notification.link ? 'cursor-pointer hover:border-blue-300' : ''}`}
                                >
                                    {!notification.isRead && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                                    )}
                                    <div className="p-4 sm:p-5 flex gap-4">
                                        <div className={`mt-1 h-10 w-10 shrink-0 rounded-full flex items-center justify-center ${notification.isRead ? 'bg-gray-100' : 'bg-white shadow-sm'}`}>
                                            {getIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <h4 className={`text-base font-semibold ${notification.isRead ? 'text-gray-900' : 'text-blue-900'} flex items-center gap-2`}>
                                                        {notification.title}
                                                        {notification.link && <ExternalLink className="h-3 w-3 opacity-50" />}
                                                    </h4>
                                                    <p className={`mt-1 text-sm ${notification.isRead ? 'text-gray-500' : 'text-gray-700'}`}>
                                                        {notification.message}
                                                    </p>
                                                    <p className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {!notification.isRead && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={(e) => { e.stopPropagation(); onRead(notification._id); }}
                                                    title="Mark as read"
                                                    className="h-8 w-8 text-blue-600 hover:bg-blue-100 rounded-full"
                                                >
                                                    <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => { e.stopPropagation(); onDelete(notification._id); }}
                                                title="Delete"
                                                className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            ))}
        </div>
    )
}
import { toast } from "sonner"
import { formatDistanceToNow, isToday, isYesterday } from "date-fns"

interface Notification {
    _id: string
    title: string
    message: string
    type: 'info' | 'warning' | 'success' | 'error' | 'alert'
    isRead: boolean
    createdAt: string
    link?: string
}

export default function NotificationsPage({ role }: { role: string }) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)
    const [unreadCount, setUnreadCount] = useState(0)
    const [activeTab, setActiveTab] = useState("all")

    // Fetch notifications
    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token')
            const targetUrl = `${API_URL}/api/notifications`;
            // console.log('Fetching notifications from:', targetUrl)

            const res = await fetch(targetUrl, {
                headers: { 'Authorization': `Bearer ${token}` }
            })

            const contentType = res.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                const data = await res.json()
                if (res.ok) {
                    setNotifications(data.notifications)
                    setUnreadCount(data.unreadCount)
                } else {
                    console.error("Failed to fetch notifications:", data.error)
                }
            } else {
                const text = await res.text();
                console.error(`Received non-JSON response from API at ${targetUrl}. Status: ${res.status}. Body preview: ${text.substring(0, 100)}`);
            }
        } catch (error) {
            console.error("Error fetching notifications. Is the backend server running?", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchNotifications()
    }, [])

    const handleMarkAsRead = async (id: string) => {
        try {
            const token = localStorage.getItem('token')

            const res = await fetch(`${API_URL}/api/notifications/${id}/read`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            })

            const contentType = res.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1 || res.ok) {
                if (res.ok) {
                    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n))
                    setUnreadCount(prev => Math.max(0, prev - 1))
                }
            } else {
                console.error('Non-JSON response for mark read')
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to update notification")
        }
    }

    const handleMarkAllRead = async () => {
        try {
            const token = localStorage.getItem('token')

            const res = await fetch(`${API_URL}/api/notifications/mark-all-read`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            })

            const contentType = res.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1 || res.ok) {
                if (res.ok) {
                    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
                    setUnreadCount(0)
                    toast.success("All notifications marked as read")
                }
            } else {
                console.error('Non-JSON response for mark all read')
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to update notifications")
        }
    }

    const handleDelete = async (id: string) => {
        try {
            const token = localStorage.getItem('token')

            const res = await fetch(`${API_URL}/api/notifications/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            })

            if (res.ok) {
                setNotifications(prev => prev.filter(n => n._id !== id))
                toast.success("Notification deleted")
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to delete notification")
        }
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />
            case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />
            case 'error': return <AlertCircle className="h-5 w-5 text-red-500" />
            case 'alert': return <Bell className="h-5 w-5 text-purple-500" />
            default: return <Info className="h-5 w-5 text-blue-500" />
        }
    }

    const getFilteredNotifications = () => {
        switch (activeTab) {
            case 'unread': return notifications.filter(n => !n.isRead);
            case 'archived': return []; // Placeholder if we had archived state
            default: return notifications;
        }
    }

    const groupNotifications = (notifs: Notification[]) => {
        const groups: { [key: string]: Notification[] } = {
            'Today': [],
            'Yesterday': [],
            'Earlier': []
        };

        notifs.forEach(n => {
            const date = new Date(n.createdAt);
            if (isToday(date)) groups['Today'].push(n);
            else if (isYesterday(date)) groups['Yesterday'].push(n);
            else groups['Earlier'].push(n);
        });

        return groups;
    }

    const filtered = getFilteredNotifications();
    const grouped = groupNotifications(filtered);

    return (
        <DashboardLayout title="Notifications">
            <div className="space-y-6 max-w-5xl mx-auto p-2">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Notifications</h2>
                        <p className="text-muted-foreground mt-1 flex items-center gap-2">
                            <Bell className="h-4 w-4" />
                            You have {unreadCount} unread notifications
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <Button onClick={handleMarkAllRead} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 shadow-sm transition-all hover:scale-105">
                            <Check className="h-4 w-4" /> Mark all read
                        </Button>
                    )}
                </div>

                <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
                    <div className="flex items-center justify-between mb-4">
                        <TabsList className="bg-gray-100/80 p-1">
                            <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">All</TabsTrigger>
                            <TabsTrigger value="unread" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                Unread
                                {unreadCount > 0 && <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold bg-red-100 text-red-600 rounded-full">{unreadCount}</span>}
                            </TabsTrigger>
                        </TabsList>

                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Filter className="h-4 w-4" /> Filter
                        </div>
                    </div>

                    <TabsContent value="all">
                        <NotificationList groups={grouped} loading={loading} onDelete={handleDelete} onRead={handleMarkAsRead} getIcon={getIcon} />
                    </TabsContent>
                    <TabsContent value="unread">
                        <NotificationList groups={grouped} loading={loading} onDelete={handleDelete} onRead={handleMarkAsRead} getIcon={getIcon} />
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    )
}


