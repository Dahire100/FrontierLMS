"use client"

import { API_URL } from "@/lib/api-config"
import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Users,
    BookOpen,
    ClipboardList,
    Calendar,
    Bell,
    ArrowRight,
    CheckCircle,
    Clock,
    MessageSquare,
    AlertTriangle,
    Layers,
    BookMarked,
    CalendarDays,
    Settings2
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface DashboardData {
    teacher: {
        name: string;
        employeeId: string;
        department: string;
        email: string;
    };
    stats: {
        totalClasses: number;
        totalStudents: number;
        activeHomework: number;
        pendingSubmissions: number;
    };
    classes: {
        name: string;
        section: string;
        studentCount: number;
        attendancePercentage: number;
    }[];
    todaySchedule: string;
}

export default function TeacherDashboard() {
    const [data, setData] = useState<DashboardData | null>(null)
    const [messages, setMessages] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem("token")
                const response = await fetch(`${API_URL}/api/teacher/dashboard`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                })
                const result = await response.json()
                if (result.success) {
                    setData(result.data)
                }
            } catch (err) {
                console.error("Error fetching dashboard data:", err)
            } finally {
                setLoading(false)
            }
        }

        const fetchMessages = async () => {
            try {
                const token = localStorage.getItem('token')
                const response = await fetch(`${API_URL}/api/messages/inbox`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                const result = await response.json()
                if (result.success) {
                    setMessages(result.data.slice(0, 3))
                }
            } catch (error) {
                console.error("Failed to fetch messages", error)
            }
        }

        fetchDashboardData()
        fetchMessages()
    }, [])

    if (loading) {
        return (
            <DashboardLayout title="Loading Dashboard...">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="h-8 w-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout title="Teacher Overview">
            <div className="max-w-6xl mx-auto space-y-12 pb-20 pt-4">
                {/* Minimal Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between px-2 gap-6">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-medium text-gray-900 tracking-tight">
                            Hello, {data?.teacher.name.split(' ')[0] || "Educator"}
                        </h1>
                        <p className="text-gray-400 font-medium">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            className="h-12 px-6 rounded-2xl font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                            onClick={() => router.push('/dashboard/teacher/settings')}
                        >
                            <Settings2 className="h-4 w-4 mr-2" /> Settings
                        </Button>
                        <Button
                            className="h-12 px-8 bg-gray-900 hover:bg-black text-white rounded-2xl font-bold shadow-2xl shadow-gray-200 transition-all active:scale-[0.98]"
                            onClick={() => router.push('/dashboard/teacher/attendance')}
                        >
                            Mark Attendance
                        </Button>
                    </div>
                </div>

                {/* High-Level Pulse Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-2">
                    {[
                        { label: "Students", val: data?.stats.totalStudents, icon: Users, color: "text-blue-600" },
                        { label: "Active Classes", val: data?.stats.totalClasses, icon: Layers, color: "text-indigo-600" },
                        { label: "Homeworks", val: data?.stats.activeHomework, icon: BookMarked, color: "text-emerald-600" },
                        { label: "Grading", val: data?.stats.pendingSubmissions, icon: Clock, color: "text-rose-600" },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{stat.label}</p>
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-bold text-gray-900">{stat.val || 0}</h3>
                                <stat.icon className={`h-4 w-4 ${stat.color} opacity-40`} />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Primary Focus Area */}
                    <div className="lg:col-span-8 space-y-10">
                        {/* Weekly Agenda Summary */}
                        <section className="space-y-4">
                            <h2 className="text-base font-black uppercase tracking-widest text-gray-400 px-2 flex items-center gap-2">
                                <CalendarDays className="h-4 w-4" /> Academic Timeline
                            </h2>
                            <Card className="border-none bg-white rounded-[2.5rem] shadow-xl shadow-gray-100/50 overflow-hidden">
                                <CardContent className="p-0">
                                    <div className="p-8 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">Today's Schedule</p>
                                            <p className="text-xs text-gray-400">{data?.todaySchedule || "Standard Schedule"}</p>
                                        </div>
                                        <Button variant="outline" size="sm" className="rounded-xl border-gray-200" onClick={() => router.push('/dashboard/teacher/timetable')}>
                                            Full Schedule
                                        </Button>
                                    </div>
                                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Link href="/dashboard/teacher/online-exam">
                                            <div className="p-6 bg-indigo-50/50 hover:bg-indigo-50 rounded-3xl transition-colors group">
                                                <div className="h-10 w-10 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4">
                                                    <Clock className="h-5 w-5 text-indigo-600" />
                                                </div>
                                                <h4 className="font-bold text-gray-900">Online Assessments</h4>
                                                <p className="text-xs text-gray-500 mt-1">Manage digital exams & results</p>
                                                <div className="mt-4 flex items-center text-[10px] font-black uppercase tracking-widest text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Manage <ArrowRight className="h-3 w-3 ml-1" />
                                                </div>
                                            </div>
                                        </Link>
                                        <Link href="/dashboard/teacher/homework">
                                            <div className="p-6 bg-emerald-50/50 hover:bg-emerald-50 rounded-3xl transition-colors group">
                                                <div className="h-10 w-10 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4">
                                                    <BookOpen className="h-5 w-5 text-emerald-600" />
                                                </div>
                                                <h4 className="font-bold text-gray-900">Resource Library</h4>
                                                <p className="text-xs text-gray-500 mt-1">Distribute guides & assignments</p>
                                                <div className="mt-4 flex items-center text-[10px] font-black uppercase tracking-widest text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Library <ArrowRight className="h-3 w-3 ml-1" />
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        </section>

                        {/* Recent Activity / Classes */}
                        <section className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <h2 className="text-base font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                    <Layers className="h-4 w-4" /> Active Portfolios
                                </h2>
                                <Button variant="ghost" size="sm" className="text-xs font-black uppercase text-gray-400 hover:text-gray-900">
                                    Refresh List
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {data?.classes.length ? data.classes.slice(0, 4).map((cls, idx) => (
                                    <div key={idx} className="bg-white p-6 rounded-[2rem] border border-gray-50 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow group">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-2xl bg-gray-50 flex items-center justify-center text-xl font-bold text-gray-900">
                                                {cls.name[0]}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900">Class {cls.name}</h3>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Section {cls.section} • {cls.studentCount} Students</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl text-gray-300 group-hover:text-gray-900 transition-colors">
                                            <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )) : (
                                    <div className="col-span-full p-12 text-center bg-gray-50/50 rounded-[2rem] border-2 border-dashed border-gray-100">
                                        <p className="text-sm font-medium text-gray-400 italic">No specialized class data found.</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Secondary Insights Area */}
                    <div className="lg:col-span-4 space-y-10">
                        {/* Compact Updates */}
                        <section className="space-y-4">
                            <h2 className="text-base font-black uppercase tracking-widest text-gray-400 px-2">Live Status</h2>
                            <div className="space-y-3">
                                <div className="bg-orange-50/50 p-5 rounded-3xl border border-orange-100 flex gap-4">
                                    <div className="h-8 w-8 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-orange-950">Action Block</p>
                                        <p className="text-[10px] text-orange-700 font-medium leading-tight mt-0.5">Attendance is pending for Class 10-B. Ensure marking before 4:00 PM.</p>
                                    </div>
                                </div>
                                <div className="bg-indigo-50/50 p-5 rounded-3xl border border-indigo-100 flex gap-4">
                                    <div className="h-8 w-8 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                                        <MessageSquare className="h-4 w-4 text-indigo-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-indigo-950">Message Inbox</p>
                                        <div className="space-y-2 mt-2">
                                            {messages.length > 0 ? messages.map((m, idx) => (
                                                <div key={idx} className="border-b border-indigo-100/50 pb-1 last:border-0">
                                                    <p className="text-[10px] font-bold text-indigo-900 truncate">{m.senderId?.firstName}: {m.subject}</p>
                                                    <p className="text-[9px] text-indigo-700/70 truncate line-clamp-1 italic">"{m.message}"</p>
                                                </div>
                                            )) : (
                                                <p className="text-[10px] text-indigo-700 font-medium leading-tight">No individual signals detected.</p>
                                            )}
                                        </div>
                                        <Link href="/dashboard/teacher/communicate" className="text-[9px] font-black uppercase text-indigo-600 mt-2 block hover:underline">View All Messages</Link>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Direct Shortcuts grid */}
                        <section className="space-y-4">
                            <h2 className="text-base font-black uppercase tracking-widest text-gray-400 px-2">Navigation</h2>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: "Attendance", icon: CheckCircle, link: "/dashboard/teacher/attendance" },
                                    { label: "Marks Entry", icon: ClipboardList, link: "/dashboard/teacher/marks-entry" },
                                    { label: "Lesson Plan", icon: BookMarked, link: "/dashboard/teacher/lesson-planner" },
                                    { label: "Resources", icon: Layers, link: "/dashboard/teacher/download-center" },
                                ].map((item, idx) => (
                                    <Link key={idx} href={item.link}>
                                        <div className="bg-white p-4 py-5 rounded-3xl border border-gray-100 text-center hover:shadow-lg hover:shadow-gray-100 transition-all active:scale-[0.98]">
                                            <item.icon className="h-5 w-5 mx-auto text-gray-400 mb-2" />
                                            <p className="text-[9px] font-black uppercase tracking-[0.1em] text-gray-500">{item.label}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>

                        {/* System Summary */}
                        <div className="px-6 py-6 bg-gray-50/50 rounded-[2.5rem] border border-gray-100 mt-10">
                            <div className="flex items-center gap-3 text-gray-300 mb-2">
                                <Bell className="h-3 w-3" />
                                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Deployment Info</span>
                            </div>
                            <p className="text-[10px] text-gray-400 leading-relaxed italic">
                                Institutional ERP Interface v2.4. Secured with End-to-End lifecycle management.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
