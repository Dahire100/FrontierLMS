"use client"

import { API_URL } from "@/lib/api-config"
import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useRouter } from "next/navigation"
import { Bell, Check, Trash2, Info, AlertTriangle, CheckCircle, AlertCircle, Clock, Filter, Archive, ExternalLink, Search, X } from "lucide-react"
import { toast } from "sonner"
import { formatDistanceToNow, isToday, isYesterday } from "date-fns"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"

interface Notification {
    _id: string
    title: string
    message: string
    type: 'info' | 'warning' | 'success' | 'error' | 'alert'
    isRead: boolean
    createdAt: string
    link?: string
    sender?: {
        name: string
        role: string
    }
}

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
            <p className="text-gray-500 mt-2 max-w-sm">You have no new notifications at the moment.</p>
        </div>
    )

    const handleNotificationClick = (notification: any) => {
        // Mark as read immediately when clicked
        if (!notification.isRead) {
            onRead(notification._id)
        }

        if (notification.link) {
            router.push(notification.link);
        }
    }

    return (
        <div className="space-y-8">
            {Object.entries(groups).map(([label, items]: [string, any]) => (
                items.length > 0 && (
                    <div key={label} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-1 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> {label}
                        </h3>
                        <div className="space-y-3">
                            {items.map((notification: any) => (
                                <div
                                    key={notification._id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`group relative overflow-hidden rounded-xl border transition-all duration-200 hover:shadow-md ${notification.isRead ? 'bg-white border-gray-100' : 'bg-blue-50/40 border-blue-100 shadow-sm'} ${notification.link ? 'cursor-pointer hover:border-blue-300' : ''}`}
                                >
                                    {!notification.isRead && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                                    )}
                                    <div className="p-4 sm:p-5 flex gap-4">
                                        <div className={`mt-1 h-10 w-10 shrink-0 rounded-full flex items-center justify-center ${notification.isRead ? 'bg-gray-100' : 'bg-white shadow-sm ring-1 ring-gray-100'}`}>
                                            {getIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="w-full">
                                                    <div className="flex justify-between items-start">
                                                        <h4 className={`text-sm font-semibold ${notification.isRead ? 'text-gray-900' : 'text-blue-900'} flex items-center gap-2`}>
                                                            {notification.title}
                                                            {notification.link && <ExternalLink className="h-3 w-3 opacity-50" />}
                                                        </h4>
                                                        <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                                                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                        </span>
                                                    </div>
                                                    <p className={`mt-1 text-sm ${notification.isRead ? 'text-gray-500' : 'text-gray-700'} line-clamp-2`}>
                                                        {notification.message}
                                                    </p>

                                                    {notification.sender && (
                                                        <p className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                                                            From: <span className="font-medium text-gray-600">{notification.sender.name || 'System'}</span>
                                                            <span className="px-1.5 py-0.5 bg-gray-100 rounded text-[9px] uppercase tracking-wider border border-gray-200">{notification.sender.role || 'Admin'}</span>
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 top-4 bg-white/80 backdrop-blur-sm p-1 rounded-lg border shadow-sm">
                                            {!notification.isRead && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={(e) => { e.stopPropagation(); onRead(notification._id); }}
                                                    title="Mark as read"
                                                    className="h-7 w-7 text-blue-600 hover:bg-blue-50 rounded"
                                                >
                                                    <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => { e.stopPropagation(); onDelete(notification._id); }}
                                                title="Delete"
                                                className="h-7 w-7 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
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

export default function NotificationsPage({ role }: { role: string }) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)
    const [unreadCount, setUnreadCount] = useState(0)
    const [activeTab, setActiveTab] = useState("all")

    // Filters
    const [searchQuery, setSearchQuery] = useState("")
    const [typeFilter, setTypeFilter] = useState<string[]>(['all']) // all, info, warning, success, error

    // Fetch notifications
    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token')
            const targetUrl = `${API_URL}/api/notifications`;

            const res = await fetch(targetUrl, {
                headers: { 'Authorization': `Bearer ${token}` }
            })

            if (res.ok) {
                const data = await res.json()
                setNotifications(data.notifications || [])
                setUnreadCount(data.unreadCount || 0)
            }
        } catch (error) {
            console.error("Error fetching notifications", error)
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

            if (res.ok) {
                setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n))
                setUnreadCount(prev => Math.max(0, prev - 1))
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

            if (res.ok) {
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
                setUnreadCount(0)
                toast.success("All notifications marked as read")
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
                // Re-calc unread count if we deleted an unread one
                // Ideally backend should return new count, but we can approx
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to delete notification")
        }
    }

    const handleClearAll = async () => {
        if (!confirm("Are you sure you want to delete ALL notifications?")) return;

        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`${API_URL}/api/notifications/clear-all`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            })

            if (res.ok) {
                setNotifications([])
                setUnreadCount(0)
                toast.success("All notifications cleared")
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to clear notifications")
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
        let filtered = notifications;

        // Tab filter
        if (activeTab === 'unread') {
            filtered = filtered.filter(n => !n.isRead);
        }

        // Type filter
        if (!typeFilter.includes('all')) {
            filtered = filtered.filter(n => typeFilter.includes(n.type));
        }

        // Search filter
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(n =>
                n.title.toLowerCase().includes(q) ||
                n.message.toLowerCase().includes(q)
            );
        }

        return filtered;
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

    // Calculate counts for filters
    const getTypeCount = (type: string) => notifications.filter(n => type === 'all' ? true : n.type === type).length;

    return (
        <DashboardLayout title="Notifications">
            <div className="space-y-6 max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Notifications</h2>
                        <p className="text-muted-foreground mt-1 flex items-center gap-2">
                            <Bell className="h-4 w-4" />
                            {unreadCount > 0 ? `You have ${unreadCount} unread notifications` : 'No new notifications'}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {unreadCount > 0 && (
                            <Button onClick={handleMarkAllRead} variant="outline" className="flex items-center gap-2">
                                <Check className="h-4 w-4" /> Mark all read
                            </Button>
                        )}
                        {notifications.length > 0 && (
                            <Button onClick={handleClearAll} variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center gap-2">
                                <Trash2 className="h-4 w-4" /> Clear all
                            </Button>
                        )}
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-center justify-between sticky top-0 z-10 bg-white/80 backdrop-blur-md p-2 rounded-lg border shadow-sm">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search notifications..."
                            className="pl-9 bg-white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="gap-2 w-full md:w-auto">
                                    <Filter className="h-4 w-4" />
                                    Filter by Type
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>Notification Types</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuCheckboxItem
                                    checked={typeFilter.includes('all')}
                                    onCheckedChange={() => setTypeFilter(['all'])}
                                >
                                    All Types ({notifications.length})
                                </DropdownMenuCheckboxItem>
                                {['info', 'success', 'warning', 'error', 'alert'].map(type => (
                                    <DropdownMenuCheckboxItem
                                        key={type}
                                        checked={typeFilter.includes(type) && !typeFilter.includes('all')}
                                        onCheckedChange={(checked) => {
                                            if (checked) {
                                                setTypeFilter(prev => prev.filter(t => t !== 'all').concat(type))
                                            } else {
                                                const newFilters = typeFilter.filter(t => t !== type);
                                                setTypeFilter(newFilters.length ? newFilters : ['all'])
                                            }
                                        }}
                                        className="capitalize"
                                    >
                                        <div className="flex items-center gap-2">
                                            {getIcon(type)}
                                            {type}
                                            <span className="ml-auto text-xs text-muted-foreground">({getTypeCount(type)})</span>
                                        </div>
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
                    <TabsList className="bg-gray-100/80 p-1 w-full justify-start">
                        <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-6">All</TabsTrigger>
                        <TabsTrigger value="unread" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-6">
                            Unread
                            {unreadCount > 0 && <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold bg-red-100 text-red-600 rounded-full">{unreadCount}</span>}
                        </TabsTrigger>
                    </TabsList>

                    <div className="mt-6">
                        <TabsContent value="all" className="m-0">
                            <NotificationList groups={grouped} loading={loading} onDelete={handleDelete} onRead={handleMarkAsRead} getIcon={getIcon} />
                        </TabsContent>
                        <TabsContent value="unread" className="m-0">
                            <NotificationList groups={grouped} loading={loading} onDelete={handleDelete} onRead={handleMarkAsRead} getIcon={getIcon} />
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </DashboardLayout>
    )
}
