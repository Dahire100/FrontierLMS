"use client"

import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    Banknote,
    Receipt,
    Globe,
    AlertCircle,
    ArrowRightCircle,
    Percent,
    Database,
    Users,
    List,
    PhoneCall,
    CreditCard,
    BarChart,
    ArrowRight,
    Home,
    Search,
    TrendingUp,
    CalendarClock,
    FileSearch,
    UserCheck,
    FileX,
    FileStack
} from "lucide-react"
import Link from "next/link"

import { StatCard } from "@/components/super-admin/stat-card"

export default function FeesCollection() {
    const modules = [
        {
            title: "Direct Collection",
            description: "Process and record live student payments",
            icon: Banknote,
            href: "/dashboard/admin/fees-collection/collect-fee",
            gradient: "from-emerald-400 to-teal-600",
            lightColor: "bg-emerald-50",
            iconColor: "text-emerald-600"
        },
        {
            title: "Protocol Receipts",
            description: "Institutional payment documentation",
            icon: Receipt,
            href: "/dashboard/admin/fees-collection/payment-receipt",
            gradient: "from-blue-400 to-indigo-600",
            lightColor: "bg-blue-50",
            iconColor: "text-blue-600"
        },
        {
            title: "Online Admission",
            description: "Remote registration fee governance",
            icon: Globe,
            href: "/dashboard/admin/fees-collection/online-admission-fee",
            gradient: "from-cyan-400 to-blue-500",
            lightColor: "bg-cyan-50",
            iconColor: "text-cyan-600"
        },
        {
            title: "Demand Strategy",
            description: "Issue formal exposure notifications",
            icon: AlertCircle,
            href: "/dashboard/admin/fees-collection/demand-notice",
            gradient: "from-rose-400 to-red-500",
            lightColor: "bg-rose-50",
            iconColor: "text-rose-600"
        },
        {
            title: "Subsidy Hub",
            description: "Manage concessions and grant packages",
            icon: Percent,
            href: "/dashboard/admin/fees-collection/fee-discount",
            gradient: "from-purple-400 to-fuchsia-500",
            lightColor: "bg-purple-50",
            iconColor: "text-purple-600"
        },
        {
            title: "Fee Inventory",
            description: "Architect core fee structures",
            icon: Database,
            href: "/dashboard/admin/fees-collection/fee-master",
            gradient: "from-indigo-400 to-violet-500",
            lightColor: "bg-indigo-50",
            iconColor: "text-indigo-600"
        },
        {
            title: "Classification",
            description: "Manage structural fee groupings",
            icon: Users,
            href: "/dashboard/admin/fees-collection/fees-group",
            gradient: "from-teal-400 to-emerald-500",
            lightColor: "bg-teal-50",
            iconColor: "text-teal-600"
        },
        {
            title: "Nomenclature",
            description: "Define granular inventory types",
            icon: List,
            href: "/dashboard/admin/fees-collection/fees-types",
            gradient: "from-pink-400 to-rose-500",
            lightColor: "bg-pink-50",
            iconColor: "text-pink-600"
        },
        {
            title: "Due Intelligence",
            description: "Analyze outstanding institutional debt",
            icon: FileSearch,
            href: "/dashboard/admin/fees-collection/due-fee-report",
            gradient: "from-amber-400 to-orange-500",
            lightColor: "bg-amber-50",
            iconColor: "text-amber-600"
        },
        {
            title: "Risk Registry",
            description: "Track chronic non-payment profiles",
            icon: UserCheck,
            href: "/dashboard/admin/fees-collection/defaulters-list",
            gradient: "from-red-500 to-rose-700",
            lightColor: "bg-red-50",
            iconColor: "text-red-700"
        },
        {
            title: "Schedules",
            description: "Manage payment installment plans",
            icon: CalendarClock,
            href: "/dashboard/admin/fees-collection/fee-installments",
            gradient: "from-orange-400 to-amber-600",
            lightColor: "bg-orange-50",
            iconColor: "text-orange-600"
        },
        {
            title: "Instrument Log",
            description: "Physical cheque inventory control",
            icon: CreditCard,
            href: "/dashboard/admin/fees-collection/cheques",
            gradient: "from-indigo-500 to-blue-700",
            lightColor: "bg-indigo-50",
            iconColor: "text-indigo-700"
        },
        {
            title: "Bounce Compliance",
            description: "Record dishonored instruments",
            icon: FileX,
            href: "/dashboard/admin/fees-collection/cheque-bounce",
            gradient: "from-rose-600 to-red-800",
            lightColor: "bg-rose-50",
            iconColor: "text-red-800"
        },
        {
            title: "Direct Ledger",
            description: "Student-wise financial mapping",
            icon: FileStack,
            href: "/dashboard/admin/fees-collection/student-wise-fees",
            gradient: "from-slate-500 to-slate-700",
            lightColor: "bg-slate-50",
            iconColor: "text-slate-600"
        },
        {
            title: "Analytical Core",
            description: "Institutional financial reporting",
            icon: BarChart,
            href: "/dashboard/admin/fees-collection/fees-reports",
            gradient: "from-emerald-500 to-teal-700",
            lightColor: "bg-emerald-50",
            iconColor: "text-emerald-700"
        }
    ]

    return (
        <DashboardLayout title="Financial Protocol Command Center">
            <div className="max-w-[1600px] mx-auto space-y-10 pb-20">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-4">
                            <div className="h-14 w-14 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 rounded-2xl flex items-center justify-center shadow-2xl text-white transform hover:rotate-6 transition-transform">
                                <Banknote size={32} />
                            </div>
                            Finance Strategy Hub
                        </h1>
                        <p className="text-gray-500 mt-2 text-xl italic font-medium">Orchestrate your institution's financial ecosystem with precision governance</p>
                    </div>
                </div>

                {/* Quick Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <StatCard
                        title="Inflow Today"
                        value="₹42,500"
                        icon={TrendingUp}
                        iconColor="text-emerald-600"
                        iconBgColor="bg-emerald-50"
                        trend={{ value: 12, isPositive: true }}
                    />
                    <StatCard
                        title="Institutional Exposure"
                        value="₹8.4L"
                        icon={AlertCircle}
                        iconColor="text-rose-600"
                        iconBgColor="bg-rose-50"
                    />
                    <StatCard
                        title="Digital Clearance"
                        value="₹1.2L"
                        icon={Globe}
                        iconColor="text-blue-600"
                        iconBgColor="bg-blue-50"
                    />
                    <StatCard
                        title="Grant Value"
                        value="₹56K"
                        icon={Percent}
                        iconColor="text-purple-600"
                        iconBgColor="bg-purple-50"
                    />
                </div>

                {/* Main Modules Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xxl:grid-cols-5 gap-8">
                    {modules.map((module, index) => (
                        <Link key={index} href={module.href} className="group">
                            <Card className={`h-full border-none shadow-xl hover:shadow-[0_20px_50px_rgba(79,_70,_229,_0.1)] transition-all duration-500 hover:-translate-y-3 overflow-hidden bg-white ring-1 ring-black/5 rounded-[2rem]`}>
                                <div className={`h-2 w-full bg-gradient-to-r ${module.gradient}`} />
                                <CardHeader className="pb-4 pt-8 px-8">
                                    <div className="flex justify-between items-start">
                                        <div className={`p-4 ${module.lightColor} rounded-2xl shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                                            <module.icon className={`h-8 w-8 ${module.iconColor}`} />
                                        </div>
                                        <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-white" />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pb-10 px-8">
                                    <h3 className="text-2xl font-black text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors leading-tight">
                                        {module.title}
                                    </h3>
                                    <p className="text-sm text-gray-400 font-medium leading-relaxed italic">
                                        {module.description}
                                    </p>
                                </CardContent>
                                <div className="px-8 pb-8 mt-auto flex justify-between items-center">
                                    <div className={`text-[10px] font-black uppercase tracking-[0.2em] ${module.iconColor} bg-opacity-10 px-4 py-1.5 rounded-xl bg-current inline-block`}>
                                        Active Unit
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    )
}
