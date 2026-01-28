"use client"

import { useState, useEffect } from "react"
import { API_URL } from "@/lib/api-config"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
    BookOpen,
    Calendar,
    FileText,
    PenTool,
    ClipboardList,
    BarChart3,
    ArrowRight,
    Sparkles,
    Target,
    Clock,
    TrendingUp,
    Users,
    CheckCircle2,
    Loader2
} from "lucide-react"

export default function LessonPlannerDashboard() {
    const [stats, setStats] = useState({
        totalPlans: 0,
        completedPlans: 0,
        inProgressPlans: 0,
        pendingPlans: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/lesson-planner`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const result = await res.json()
            if (result.success && Array.isArray(result.data)) {
                const plans = result.data
                setStats({
                    totalPlans: plans.length,
                    completedPlans: plans.filter((p: any) => p.status === 'completed').length,
                    inProgressPlans: plans.filter((p: any) => p.status === 'in-progress').length,
                    pendingPlans: plans.filter((p: any) => p.status === 'planned').length
                })
            }
        } catch { } finally {
            setLoading(false)
        }
    }

    const modules = [
        {
            title: "Lesson Plans",
            description: "View and manage all lesson plans by class and subject",
            icon: BookOpen,
            href: "/dashboard/admin/lesson-planner/lesson",
            gradient: "from-blue-500 to-indigo-600",
            bgGlow: "bg-blue-500/20"
        },
        {
            title: "Topics",
            description: "Browse and organize topics for each subject",
            icon: FileText,
            href: "/dashboard/admin/lesson-planner/topic",
            gradient: "from-emerald-500 to-teal-600",
            bgGlow: "bg-emerald-500/20"
        },
        {
            title: "Manage Planner",
            description: "Create and edit lesson plans for teachers",
            icon: PenTool,
            href: "/dashboard/admin/lesson-planner/manage",
            gradient: "from-violet-500 to-purple-600",
            bgGlow: "bg-violet-500/20"
        },
        {
            title: "Reports",
            description: "Generate insights and analytics on lesson progress",
            icon: BarChart3,
            href: "/dashboard/admin/lesson-planner/report",
            gradient: "from-orange-500 to-red-500",
            bgGlow: "bg-orange-500/20"
        },
        {
            title: "Topic Reports",
            description: "Analyze topic coverage and completion rates",
            icon: ClipboardList,
            href: "/dashboard/admin/lesson-planner/topic-report",
            gradient: "from-pink-500 to-rose-600",
            bgGlow: "bg-pink-500/20"
        }
    ]

    return (
        <DashboardLayout title="Lesson Planner">
            <div className="space-y-8 max-w-7xl mx-auto">
                {/* Hero Section */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8 md:p-12">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                                    <Sparkles className="h-8 w-8 text-white" />
                                </div>
                                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                                    Lesson Planner
                                </h1>
                            </div>
                            <p className="text-white/80 text-lg max-w-xl">
                                Plan, organize, and track your curriculum efficiently. Create structured lesson plans
                                that enhance teaching effectiveness.
                            </p>
                        </div>
                        <Link href="/dashboard/admin/lesson-planner/manage">
                            <Button size="lg" className="bg-white text-purple-600 hover:bg-white/90 shadow-xl h-14 px-8 text-base font-semibold rounded-2xl gap-2">
                                <PenTool className="h-5 w-5" />
                                Create New Plan
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-50 to-white">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-100 rounded-2xl">
                                    <Target className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Total Plans</p>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.totalPlans}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-white">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-emerald-100 rounded-2xl">
                                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Completed</p>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.completedPlans}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-amber-50 to-white">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-amber-100 rounded-2xl">
                                    <Clock className="h-6 w-6 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">In Progress</p>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.inProgressPlans}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-50 to-white">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-purple-100 rounded-2xl">
                                    <TrendingUp className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Pending</p>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.pendingPlans}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Modules Grid */}
                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Access</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {modules.map((module, index) => (
                            <Link key={index} href={module.href}>
                                <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer h-full bg-white hover:-translate-y-1">
                                    <div className={`absolute inset-0 ${module.bgGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`} />
                                    <CardContent className="relative p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className={`p-4 rounded-2xl bg-gradient-to-br ${module.gradient} shadow-lg`}>
                                                <module.icon className="h-6 w-6 text-white" />
                                            </div>
                                            <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">{module.title}</h3>
                                        <p className="text-sm text-gray-500 leading-relaxed">{module.description}</p>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Quick Tips */}
                <Card className="border-0 shadow-lg bg-gradient-to-r from-slate-50 to-slate-100">
                    <CardHeader className="border-b border-slate-200/50">
                        <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-amber-500" />
                            Quick Tips
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold">1</div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-1">Plan Ahead</h4>
                                    <p className="text-sm text-gray-500">Create lesson plans at least a week in advance</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 font-bold">2</div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-1">Set Objectives</h4>
                                    <p className="text-sm text-gray-500">Define clear learning outcomes for each lesson</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 font-bold">3</div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-1">Track Progress</h4>
                                    <p className="text-sm text-gray-500">Review reports regularly to monitor completion</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
