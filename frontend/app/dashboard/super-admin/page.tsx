"use client"

import { API_URL } from "@/lib/api-config"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { ProtectedRoute } from "@/components/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Building2,
  Users,
  TrendingUp,
  IndianRupee,
  CheckCircle,
  Settings,
  Eye,
  AlertCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Plus,
  FileText,
  CreditCard
} from "lucide-react"
import Link from "next/link"

export default function SuperAdminDashboard() {
  return (
    <ProtectedRoute allowedRoles={["super_admin"]}>
      <SuperAdminDashboardContent />
    </ProtectedRoute>
  )
}

function SuperAdminDashboardContent() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/api/dashboard`, {          headers: { 'Authorization': `Bearer ${token}` }
        })
        const result = await res.json()
        if (result.stats) {
          setData(result)
        }
      } catch (error) {
        console.error("Failed to fetch super admin dashboard", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>
  if (!data) return <div className="p-8 text-center">Failed to load data</div>

  // Mock data with trends
  const stats = [
    {
      title: "Total Schools",
      value: data.stats.totalSchools || "0",
      change: "+12.5%",
      isPositive: true,
      icon: Building2,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-100",
      description: "3 new this month"
    },
    {
      title: "Total Students",
      value: data.stats.totalStudents || "0",
      change: "+8.2%",
      isPositive: true,
      icon: Users,
      iconColor: "text-green-600",
      iconBg: "bg-green-100",
      description: "Across all schools"
    },
    {
      title: "Active Subscriptions",
      value: data.stats.activeSubscriptions || "0",
      change: "+4.3%",
      isPositive: true,
      icon: CheckCircle,
      iconColor: "text-purple-600",
      iconBg: "bg-purple-100",
      description: "3 expiring soon"
    },
    {
      title: "Monthly Revenue",
      value: `₹${data.stats.monthlyRevenue || 0}`,
      change: "+15.8%",
      isPositive: true,
      icon: IndianRupee,
      iconColor: "text-orange-600",
      iconBg: "bg-orange-100",
      description: "Last 30 days"
    },
  ]

  const schools = data.schools || []

  const recentActivity = data.recentActivity ? data.recentActivity.map((activity: any) => ({
    type: "new",
    title: activity.title,
    message: activity.message,
    time: new Date(activity.time).toLocaleDateString(),
    icon: Building2, // Default icon or map based on type
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600"
  })) : []

  const quickActions = [
    {
      title: "Manage Schools",
      description: "View and manage all schools",
      icon: Building2,
      href: "/dashboard/super-admin/institute-management",
      color: "blue"
    },
    {
      title: "SaaS Plans",
      description: "Manage subscription plans",
      icon: TrendingUp,
      href: "/dashboard/super-admin/saas-plans",
      color: "purple"
    },
    {
      title: "Billing",
      description: "View revenue and invoices",
      icon: IndianRupee,
      href: "/dashboard/super-admin/billing",
      color: "green"
    },
    {
      title: "Support",
      description: "Handle support tickets",
      icon: AlertCircle,
      href: "/dashboard/super-admin/support-tickets",
      color: "orange"
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'inactive':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getPlanColor = (plan: string) => {
    switch (plan.toLowerCase()) {
      case 'enterprise':
        return 'bg-purple-100 text-purple-700'
      case 'premium':
        return 'bg-blue-100 text-blue-700'
      case 'basic':
        return 'bg-gray-100 text-gray-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <DashboardLayout title="Super Admin Dashboard">
      <div className="space-y-8 animate-in fade-in-50 duration-500">

        {/* Welcome Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-gray-900 via-slate-800 to-gray-900 p-8 text-white shadow-2xl">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl"></div>

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">System Overview</h2>
              <p className="text-gray-300 text-lg max-w-2xl">
                Monitor performance, manage institutions, and oversee platform-wide activity from a centralized command center.
              </p>
            </div>
            <div className="flex gap-3">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-blue-500/25 transition-all duration-300">
                <FileText className="w-4 h-4 mr-2" /> Generate Report
              </Button>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-white/10 pt-6">
            <div>
              <p className="text-gray-400 text-sm">System Status</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="font-semibold text-white">Operational</span>
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Last Backup</p>
              <p className="font-semibold text-white mt-1">2 hours ago</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Server Load</p>
              <p className="font-semibold text-white mt-1">12% (Healthy)</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Active Sessions</p>
              <p className="font-semibold text-white mt-1">1,204</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group bg-white/50 backdrop-blur-sm">
              <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-10 transition-opacity group-hover:opacity-20 ${stat.iconBg.replace('bg-', 'bg-')}`}></div>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</h3>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.iconBg} group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className={`flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${stat.isPositive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {stat.isPositive ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                    {stat.change}
                  </span>
                  <span className="text-xs text-gray-500">{stat.description}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border hover:border-blue-200 h-full">
                  <CardContent className="p-5 flex flex-col h-full justify-between">
                    <div className="flex items-start justify-between">
                      <div className={`p-3 rounded-xl bg-${action.color}-50 group-hover:bg-${action.color}-100 transition-colors`}>
                        <action.icon className={`w-6 h-6 text-${action.color}-600`} />
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <div className="mt-4">
                      <p className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{action.title}</p>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{action.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Schools Management */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-lg border-0 overflow-hidden">
              <CardHeader className="bg-white border-b px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Recent Institutions</CardTitle>
                      <CardDescription>Overview of recently registered schools</CardDescription>
                    </div>
                  </div>
                  <Link href="/dashboard/super-admin/institute-management">
                    <Button size="sm" variant="default" className="bg-gray-900 hover:bg-gray-800 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Add New
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {schools.map((school: any) => (
                    <div key={school.id} className="p-5 hover:bg-gray-50/80 transition-all duration-200 group">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                          <AvatarImage src={school.logo} alt={school.name} />
                          <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-sm">
                            {(school.name || "SC").substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                          <div className="md:col-span-2">
                            <p className="font-bold text-gray-900 truncate">{school.name || "Unknown School"}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs font-normal bg-gray-100 text-gray-600">{school.plan}</Badge>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-500">{school.students} Students</span>
                            </div>
                          </div>

                          <div className="hidden md:block">
                            <div className="flex flex-col items-start">
                              <span className="text-xs text-gray-400 mb-1">Status</span>
                              <Badge className={`${getStatusColor(school.status)} px-2 py-0.5 rounded-md`}>
                                {school.status}
                              </Badge>
                            </div>
                          </div>

                          <div className="hidden md:flex flex-col items-end">
                            <div className="flex items-center gap-1 font-semibold text-gray-900">
                              <IndianRupee className="w-3 h-3 text-gray-400" />
                              {school.revenue}
                            </div>
                            <div className={`text-xs mt-1 font-medium ${(school.growth || "").startsWith('+') ? 'text-green-600' : 'text-red-500'}`}>
                              {school.growth} growth
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-900 hover:bg-gray-100">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {schools.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                      No schools found.
                    </div>
                  )}
                </div>
                <div className="p-4 border-t bg-gray-50/50 text-center">
                  <Link href="/dashboard/super-admin/institute-management" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                    View Complete Directory <ArrowUpRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity & Support */}
          <div className="space-y-6">
            <Card className="shadow-lg border-0">
              <CardHeader className="border-b px-6 py-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-400" />
                  Activity Log
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                  {recentActivity.length > 0 ? recentActivity.map((activity: any, index: number) => (
                    <div key={index} className="flex gap-4 p-4 hover:bg-gray-50 transition-colors border-b last:border-0 border-gray-50">
                      <div className="flex-shrink-0">
                        <div className={`h-2 w-2 mt-2 rounded-full ${activity.type === 'new' ? 'bg-blue-500' : 'bg-orange-500'}`}></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{activity.message}</p>
                        <p className="text-[10px] text-gray-400 mt-1.5 uppercase tracking-wide">{activity.time}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="p-6 text-center text-sm text-muted-foreground">No recent activity</div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-gradient-to-br from-indigo-600 to-violet-700 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 h-32 w-32 bg-white/10 rounded-full blur-2xl"></div>
              <CardHeader>
                <CardTitle className="text-white relative z-10">Admin Support</CardTitle>
                <CardDescription className="text-indigo-100 relative z-10">Resources and documentation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 relative z-10">
                <Button variant="secondary" className="w-full justify-between bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-sm transition-all">
                  <span className="flex items-center"><FileText className="w-4 h-4 mr-2" /> Documentation</span>
                  <ArrowUpRight className="w-3 h-3 opacity-50" />
                </Button>
                <Button variant="secondary" className="w-full justify-between bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-sm transition-all">
                  <span className="flex items-center"><AlertCircle className="w-4 h-4 mr-2" /> Support Center</span>
                  <ArrowUpRight className="w-3 h-3 opacity-50" />
                </Button>
                <Button variant="secondary" className="w-full justify-between bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-sm transition-all">
                  <span className="flex items-center"><Settings className="w-4 h-4 mr-2" /> System Settings</span>
                  <ArrowUpRight className="w-3 h-3 opacity-50" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
