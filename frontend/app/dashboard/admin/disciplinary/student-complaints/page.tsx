"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MessageSquare, Home, AlertCircle, CheckCircle2, Clock } from "lucide-react"
import { API_URL } from "@/lib/api-config"
import { toast } from "sonner"
import { StatusBadge } from "@/components/super-admin/status-badge"

export default function StudentComplaintsPage() {
  const [complaints, setComplaints] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchComplaints()
  }, [])

  const fetchComplaints = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/disciplinary/complaints`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) setComplaints(await response.json())
    } catch (error) {
      toast.error("Failed to load complaints")
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      key: "complainantName",
      label: "COMPLAINANT",
      render: (_: any, row: any) => (
        <div className="flex flex-col">
          <span className="font-bold text-gray-800 text-xs">{row.complainantName}</span>
          <span className="text-[10px] text-gray-400 font-bold uppercase">{row.complainantType}</span>
        </div>
      )
    },
    {
      key: "subject",
      label: "SUBJECT",
      render: (v: string) => <span className="font-medium text-gray-700 text-xs">{v}</span>
    },
    {
      key: "priority",
      label: "PRIORITY",
      render: (v: string) => (
        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${v === 'urgent' ? 'bg-red-100 text-red-700 border-red-200' :
            v === 'high' ? 'bg-orange-100 text-orange-700 border-orange-200' :
              'bg-blue-100 text-blue-700 border-blue-200'
          }`}>
          {v}
        </span>
      )
    },
    {
      key: "createdAt",
      label: "DATE FILED",
      render: (v: string) => <span className="text-xs text-gray-400 font-mono">{new Date(v).toLocaleDateString()}</span>
    },
    {
      key: "status",
      label: "STATUS",
      render: (v: string) => <StatusBadge status={v} />
    }
  ]

  return (
    <DashboardLayout title="Student Grievance Management">
      <div className="space-y-6 max-w-full pb-10">
        <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border-l-4 border-l-red-500">
          <div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">Student Complaints</h1>
            <p className="text-xs text-gray-500 font-medium">Monitor and resolve disciplinary complaints filed by students or against them.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-5 flex items-center gap-4 bg-red-50/30 border-red-100">
            <div className="p-3 bg-red-100 rounded-xl text-red-600"><AlertCircle className="h-6 w-6" /></div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Open Grievances</p>
              <p className="text-2xl font-bold text-gray-800">{complaints.filter(c => c.status === 'open').length}</p>
            </div>
          </Card>
          <Card className="p-5 flex items-center gap-4 bg-orange-50/30 border-orange-100">
            <div className="p-3 bg-orange-100 rounded-xl text-orange-600"><Clock className="h-6 w-6" /></div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">In Progress</p>
              <p className="text-2xl font-bold text-gray-800">{complaints.filter(c => c.status === 'in-progress').length}</p>
            </div>
          </Card>
          <Card className="p-5 flex items-center gap-4 bg-emerald-50/30 border-emerald-100">
            <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600"><CheckCircle2 className="h-6 w-6" /></div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Resolved</p>
              <p className="text-2xl font-bold text-gray-800">{complaints.filter(c => c.status === 'resolved').length}</p>
            </div>
          </Card>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b bg-white flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-red-500" /> Disciplinary Complaints Ledger
            </h3>
          </div>
          <AdvancedTable
            columns={columns}
            data={complaints}
            loading={loading}
            searchable={true}
            headerClassName="bg-gray-50 text-gray-500 font-bold uppercase text-[10px] tracking-widest h-12"
            emptyMessage={
              <div className="p-10 text-center space-y-2 text-gray-400">
                <MessageSquare className="h-8 w-8 mx-auto opacity-20" />
                <p className="text-xs font-bold uppercase tracking-widest">No Active Complaints</p>
              </div>
            }
          />
        </div>
      </div>
    </DashboardLayout>
  )
}
