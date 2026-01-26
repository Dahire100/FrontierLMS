"use client"

import { API_URL } from "@/lib/api-config"

import { useState, useEffect } from "react"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard-layout"
import { ProtectedRoute } from "@/components/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getApiUrl, API_ENDPOINTS } from "@/lib/api-config"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import {
  Users,
  BookOpen,
  IndianRupee,
  GraduationCap,
  ArrowRight,
  ClipboardList,
  Library,
  Clock,
  Activity,
  Search,
  Download,
  Bell
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';


interface ActivityItem {
  type: string
  user: string
  action: string
  target: string
  time: string
  avatar: string
}

interface DashboardData {
  stats: {
    totalStudents: number
    totalTeachers: number
    totalClasses: number
    monthlyRevenue: number
    pendingFees: number
  }
  revenueTrend: any[]
  recentActivity: ActivityItem[]
  recentStudents: any[]
  notices: any[]
}

export default function AdminDashboard() {
  return (
    <ProtectedRoute allowedRoles={["school_admin"]}>
      <AdminDashboardContent />
    </ProtectedRoute>
  )
}

function AdminDashboardContent() {
  const { toast } = useToast()
  const [timePeriod, setTimePeriod] = useState("month")
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<DashboardData>({
    stats: {
      totalStudents: 0,
      totalTeachers: 0,
      totalClasses: 0,
      monthlyRevenue: 0,
      pendingFees: 0
    },
    revenueTrend: [],
    recentActivity: [],
    recentStudents: [],
    notices: []
  })

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        
        if (!token) {
          throw new Error('No authentication token found. Please login again.');
        }
        
        if (!user) {
          throw new Error('User data not found. Please login again.');
        }

        const res = await fetch(`${API_URL}/api/dashboard?period=${timePeriod}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          cache: 'no-store'
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          const errorMessage = errorData.error || `HTTP error! status: ${res.status}`;
          throw new Error(`API Error (${res.status}): ${errorMessage}`);
        }

        const result = await res.json();

        if (result && result.stats) {
          setData(result);
        } else {
          // Fallback for empty/malformed response
          console.warn("Received empty or invalid dashboard data structure");
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error("Failed to fetch dashboard data:", errorMessage);
        toast({
          variant: "destructive",
          title: "Authentication or Data Error",
          description: errorMessage
        })
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [timePeriod, toast]);

  const stats = [
    {
      title: "Total Students",
      value: data.stats.totalStudents || "0",
      trend: "Active Learners",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
      gradient: "from-blue-500 to-blue-600"
    },
    {
      title: "Total Teachers",
      value: data.stats.totalTeachers || "0",
      trend: "Faculty Staff",
      icon: GraduationCap,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      gradient: "from-emerald-500 to-emerald-600"
    },
    {
      title: "Total Classes",
      value: data.stats.totalClasses || "0",
      trend: "Academic Groups",
      icon: BookOpen,
      color: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-100",
      gradient: "from-purple-500 to-purple-600"
    },
    {
      title: "Revenue",
      value: `₹${(data.stats.monthlyRevenue || 0).toLocaleString()}`,
      trend: `${data.revenueTrend && data.revenueTrend.length > 1 ? '+Growth' : 'Stable'}`,
      icon: IndianRupee,
      color: "text-orange-600",
      bg: "bg-orange-50",
      border: "border-orange-100",
      gradient: "from-orange-500 to-orange-600"
    },
  ]

  const handleGenerateReport = async () => {
    try {
      toast({
        title: "Generating Report...",
        description: "Please wait while we prepare your download.",
      })

      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/dashboard/report`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error('Failed to generate report');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dashboard-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Report Downloaded",
        description: "Your report has been successfully downloaded.",
      })
    } catch (error) {
      console.error("Report generation failed", error);
      toast({
        variant: "destructive",
        title: "Report Failed",
        description: "Could not generate report. Please try again.",
      })
    }
  }



  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1 h-full overflow-y-auto pb-10">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Overview</h2>
            <p className="text-muted-foreground mt-1">Track your institute's performance and metrics.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search modules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 w-64 rounded-md border border-gray-200 bg-white text-sm outline-none focus:ring-2 focus:ring-[#1e1b4b] transition-all"
              />
            </div>
            <Select value={timePeriod} onValueChange={setTimePeriod}>
              <SelectTrigger className="w-[160px] bg-white">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={handleGenerateReport}
              className="bg-[#1e1b4b] hover:bg-[#1e1b4b]/90 shadow-md">
              <Download className="w-4 h-4 mr-2" /> Report
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <Card key={i} className="border border-gray-100 shadow-sm">
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            ))
          ) : (
            stats.map((stat, index) => (
              <Card key={index} className={`border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group`}>
                <CardContent className="p-0">
                  <div className="p-6 flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                      <h3 className="text-2xl font-bold mt-2 text-gray-900">{stat.value}</h3>
                      <p className={`text-xs mt-1 font-medium ${typeof stat.trend === 'string' && stat.trend.includes('+') ? 'text-green-600' : 'text-gray-500'}`}>
                        {stat.trend}
                      </p>
                    </div>
                    <div className={`p-3 rounded-xl ${stat.bg} group-hover:scale-110 transition-transform duration-300`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                  <div className={`h-1 w-full bg-gradient-to-r ${stat.gradient}`} />
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {loading ? (
                Array(6).fill(0).map((_, i) => (
                  <Card key={i} className="h-full border border-gray-100 shadow-sm">
                    <CardContent className="p-6 flex items-start gap-4">
                      <Skeleton className="h-12 w-12 rounded-2xl" />
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                [
                  { title: "Students", icon: Users, desc: "Manage admissions & details", color: "text-blue-600", bg: "bg-blue-50", href: "/dashboard/admin/student-info" },
                  { title: "Academics", icon: BookOpen, desc: "Classes, subjects & timetable", color: "text-purple-600", bg: "bg-purple-50", href: "/dashboard/admin/academics" },
                  { title: "Fees & Accounts", icon: IndianRupee, desc: "Invoices, payments & dues", color: "text-green-600", bg: "bg-green-50", href: "/dashboard/admin/fees-collection" },
                  { title: "Examinations", icon: ClipboardList, desc: "Schedules & result publications", color: "text-orange-600", bg: "bg-orange-50", href: "/dashboard/admin/examinations" },
                  { title: "Human Resource", icon: GraduationCap, desc: "Staff management & payroll", color: "text-pink-600", bg: "bg-pink-50", href: "/dashboard/admin/human-resource" },
                  { title: "Library", icon: Library, desc: "Books issue & return", color: "text-indigo-600", bg: "bg-indigo-50", href: "/dashboard/admin/library" },
                ]
                  .filter(item =>
                    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.desc.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((item, idx) => (
                    <Link href={item.href} key={idx} className="block group">
                      <Card className="h-full border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                        <CardContent className="p-6 flex items-start gap-4">
                          <div className={`p-3.5 rounded-2xl ${item.bg} ${item.color} group-hover:scale-110 transition-transform`}>
                            <item.icon className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 group-hover:text-[#1e1b4b] transition-colors">{item.title}</h3>
                            <p className="text-sm text-gray-500 mt-1 leading-relaxed">{item.desc}</p>
                          </div>
                          <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0">
                            <ArrowRight className="w-5 h-5 text-gray-400" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))
              )}
            </div>

            {/* Performance Chart */}
            <Card className="border-none shadow-md bg-white text-gray-900 overflow-hidden relative">
              <CardHeader>
                <CardTitle className="flex justify-between items-center text-gray-800">
                  <span>Revenue Analysis</span>
                  <div className="flex bg-gray-100 rounded-lg p-0.5">
                    <Button variant="ghost" size="sm" className="h-7 text-xs bg-white shadow-sm rounded-md">Revenue</Button>
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-gray-500 hover:text-gray-900">Expenses</Button>
                  </div>
                </CardTitle>
                <CardDescription className="text-gray-500">Monthly fee collection trend</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {loading ? (
                  <Skeleton className="h-full w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.revenueTrend && data.revenueTrend.length > 0 ? data.revenueTrend : [{ month: 'No Data', revenue: 0 }]}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1} />
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} tickFormatter={(value) => `₹${value / 1000}k`} />
                      <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value) => [`₹${value}`, "Revenue"]}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar / Right Column */}
          <div className="space-y-8">

            {/* Recent Activity */}
            <Card className="border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-bold">Recent Activity</CardTitle>
                <Button variant="ghost" size="sm" className="h-8 text-xs">View All</Button>
              </CardHeader>
              <CardContent className="px-0">
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <div key={i} className="flex gap-3 px-6 py-4 border-b last:border-0 items-start">
                      <Skeleton className="h-9 w-9 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))
                ) : data.recentActivity && data.recentActivity.length > 0 ? (
                  data.recentActivity.map((activity, i) => (
                    <div key={i} className="flex gap-3 px-6 py-4 hover:bg-gray-50 transition-colors border-b last:border-0 items-start">
                      <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">{activity.avatar}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm text-gray-900">
                          <span className="font-semibold">{activity.user}</span> <span className="text-gray-500">{activity.action}</span> <span className="font-medium text-gray-900">{activity.target}</span>
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {new Date(activity.time).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-500 text-sm">No recent activity</div>
                )}
              </CardContent>
            </Card>

            {/* Notice Board Preview */}
            <Card className="border shadow-sm bg-yellow-50/50">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Bell className="w-5 h-5 text-yellow-600" /> Notice Board
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.notices && data.notices.length > 0 ? (
                  data.notices.map((notice: any, i: number) => (
                    <div key={i} className="bg-white p-3 rounded-lg border border-yellow-100 shadow-sm">
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded capitalize ${notice.type === 'holiday' ? 'text-yellow-700 bg-yellow-100' :
                          notice.type === 'exam' ? 'text-blue-700 bg-blue-100' :
                            notice.type === 'urgent' ? 'text-red-700 bg-red-100' :
                              'text-gray-700 bg-gray-100'
                          }`}>
                          {notice.type}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(notice.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-800">{notice.title}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-sm text-muted-foreground py-4">No recent notices</div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
