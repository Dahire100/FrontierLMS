"use client"

import { API_URL } from "@/lib/api-config"
import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { StatCard } from "@/components/super-admin/stat-card"
import { StatusBadge } from "@/components/super-admin/status-badge"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import { ConfirmationDialog } from "@/components/super-admin/confirmation-dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, UserCheck, UserX, Building, Mail, Phone, Plus, GraduationCap, BadgeDollarSign, HeartHandshake, ShieldCheck, Home } from "lucide-react"
import FormModal, { FormField } from "@/components/form-modal"
import { toast } from "sonner"

export default function HumanResource() {
  const [staff, setStaff] = useState<any[]>([])
  const [stats, setStats] = useState<any>({
    total: 0,
    active: 0,
    onLeave: 0,
    totalPayroll: 0
  })
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingStaff, setEditingStaff] = useState<any>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const [staffRes, statsRes, leavesRes] = await Promise.all([
        fetch(`${API_URL}/api/staff?limit=100`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/api/staff/statistics`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/api/leaves?status=approved`, { headers: { 'Authorization': `Bearer ${token}` } })
      ])

      if (staffRes.ok && statsRes.ok) {
        const staffData = await staffRes.json()
        const statsData = await statsRes.json()

        let onLeaveCount = 0
        if (leavesRes.ok) {
          const leavesData = await leavesRes.json()
          const today = new Date().toISOString().split('T')[0]
          onLeaveCount = leavesData.data?.filter((l: any) => {
            const start = new Date(l.startDate).toISOString().split('T')[0]
            const end = new Date(l.endDate).toISOString().split('T')[0]
            return today >= start && today <= end
          }).length || 0
        }

        setStaff(staffData.staff || [])
        setStats({
          ...statsData,
          onLeave: onLeaveCount
        })
      }
    } catch (error) {
      console.error('Error fetching HR data:', error)
      toast.error("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/staff/${deleteId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        toast.success("Staff record removed")
        fetchData()
      }
    } catch (error) {
      toast.error("Deletion failed")
    } finally {
      setDeleteId(null)
    }
  }

  const columns = [
    {
      key: "name",
      label: "PERSONNEL PROFILE",
      sortable: true,
      render: (_: any, row: any) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
            <AvatarFallback className="bg-indigo-50 text-indigo-600 font-extrabold text-xs">
              {row.firstName[0]}{row.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-bold text-gray-900 text-sm tracking-tight">{row.firstName} {row.lastName}</p>
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{row.staffId}</span>
              <span className="h-1 w-1 rounded-full bg-gray-300"></span>
              <span className="text-[9px] text-indigo-500 font-bold uppercase">{row.role}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      key: "department",
      label: "ORGANIZATION",
      render: (_: any, row: any) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-700">
            <Building className="h-3 w-3 text-gray-400" />
            <span>{row.department || "N/A"}</span>
          </div>
          <div className="text-[10px] text-gray-400 italic font-medium px-4">
            {row.designation || "-"}
          </div>
        </div>
      )
    },
    {
      key: "contact",
      label: "CONTACT INFO",
      render: (_: any, row: any) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] text-gray-600 font-medium">
            <Mail className="h-3 w-3 text-indigo-300" />
            <span>{row.email}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-gray-600">
            <Phone className="h-3 w-3 text-green-300" />
            <span>{row.mobileNumber || row.phone || "N/A"}</span>
          </div>
        </div>
      )
    },
    {
      key: "salary",
      label: "PAYROLL",
      sortable: true,
      render: (value: any, row: any) => (
        <div className="flex flex-col">
          <span className="font-bold text-gray-900 text-xs">₹{row.salary?.netSalary?.toLocaleString() || "0"}</span>
          <span className="text-[9px] text-gray-400 font-bold uppercase">Net Monthly</span>
        </div>
      )
    },
    {
      key: "status",
      label: "STATUS",
      render: (_: any, row: any) => <StatusBadge status={row.isActive ? "Active" : "Inactive"} />
    },
  ]

  return (
    <DashboardLayout title="Human Resource Dashboard">
      <div className="space-y-6 max-w-full pb-10">

        {/* Top Navigation / Breadcrumb */}
        <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border-l-4 border-l-blue-900">
          <div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
              <HeartHandshake className="text-pink-500" />
              Human Capital Overview
            </h1>
            <p className="text-xs text-gray-500 font-medium">Consolidated monitoring of institutional personnel and payroll.</p>
          </div>
          <div className="text-sm text-gray-500 flex items-center gap-1 bg-gray-50 px-3 py-1.5 rounded-full border">
            <Home className="h-3.5 w-3.5" /> Dashboard <span className="mx-1 text-gray-300">/</span> <span className="text-blue-900 font-bold">Human Resource</span>
          </div>
        </div>

        {/* Improved Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Total Workforce"
            value={stats.total.toString()}
            icon={Users}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-50"
            description="Institutional strength"
          />
          <StatCard
            title="Active Personnel"
            value={stats.active.toString()}
            icon={UserCheck}
            iconColor="text-emerald-600"
            iconBgColor="bg-emerald-50"
            description="Available for duty"
          />
          <StatCard
            title="Current Absentees"
            value={stats.onLeave.toString()}
            icon={UserX}
            iconColor="text-rose-600"
            iconBgColor="bg-rose-50"
            description="On approved leave"
          />
          <StatCard
            title="Monthly Disbursement"
            value={`₹${stats.totalPayroll?.toLocaleString() || "0"}`}
            icon={BadgeDollarSign}
            iconColor="text-indigo-600"
            iconBgColor="bg-indigo-50"
            description="Total payroll volume"
          />
        </div>

        {/* Advanced Table Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between bg-white">
            <h3 className="text-sm font-bold flex items-center gap-2 text-gray-700 uppercase tracking-widest">
              <ShieldCheck className="h-4 w-4 text-blue-900" />
              Personnel Ledger
            </h3>
          </div>
          <AdvancedTable
            columns={columns}
            data={staff}
            loading={loading}
            searchable
            searchPlaceholder="Search by name, ID, or department..."
            pagination
            pageSize={10}
            headerClassName="bg-gray-100 text-gray-600 font-bold uppercase text-[10px] tracking-widest h-12"
            onDelete={(row) => setDeleteId(row._id)}
          />
        </div>

        <ConfirmationDialog
          open={!!deleteId}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
          title="Offboard Staff Member?"
          description="This action will revoke all system access and permanently archive their records. Proceed with extreme caution."
        />
      </div>
    </DashboardLayout>
  )
}

