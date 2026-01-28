"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Gavel, Search, Loader2, CheckCircle, Clock, AlertTriangle } from "lucide-react"
import { API_URL } from "@/lib/api-config"
import { toast } from "sonner"
import { StatusBadge } from "@/components/super-admin/status-badge"

export default function ActionsTakenPage() {
  const [incidents, setIncidents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    fetchIncidents()
  }, [])

  const fetchIncidents = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/disciplinary/incidents`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setIncidents(data.incidents || data)
      }
    } catch (error) {
      toast.error("Failed to load incidents")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateAction = async (id: string, action: string, status: string) => {
    setUpdating(id)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/disciplinary/incidents/${id}`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ actionTaken: action, status: status })
      })

      if (response.ok) {
        toast.success("Action recorded successfully")
        fetchIncidents()
      }
    } catch (error) {
      toast.error("Failed to update")
    } finally {
      setUpdating(null)
    }
  }

  const columns = [
    {
      key: "studentId",
      label: "STUDENT",
      render: (v: any) => v ? <span className="font-bold text-gray-800 text-xs">{v.firstName} {v.lastName}</span> : '-'
    },
    {
      key: "description",
      label: "INCIDENT",
      render: (v: string) => <p className="text-[10px] text-gray-500 max-w-[150px] truncate">{v}</p>
    },
    {
      key: "severity",
      label: "SEVERITY",
      render: (v: string) => (
        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${v === 'critical' ? 'text-red-600 bg-red-50' : 'text-blue-600 bg-blue-50'
          }`}>
          {v}
        </span>
      )
    },
    {
      key: "actionTaken",
      label: "ENFORCED ACTION",
      render: (v: string, row: any) => (
        <Input
          placeholder="Enter action taken..."
          defaultValue={v}
          onBlur={(e) => handleUpdateAction(row._id, e.target.value, row.status)}
          className="h-8 text-[10px] w-[180px]"
        />
      )
    },
    {
      key: "status",
      label: "RESOLUTION",
      render: (v: string, row: any) => (
        <Select defaultValue={v} onValueChange={(val) => handleUpdateAction(row._id, row.actionTaken, val)}>
          <SelectTrigger className="h-8 text-[10px] w-[120px] font-bold uppercase">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="investigating">Investigating</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="dismissed">Dismissed</SelectItem>
          </SelectContent>
        </Select>
      )
    }
  ]

  return (
    <DashboardLayout title="Disciplinary Actions & Outcomes">
      <div className="space-y-6 max-w-full pb-10">
        <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border-l-4 border-l-purple-600">
          <div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">Institutional Actions Taken</h1>
            <p className="text-xs text-gray-500 font-medium">Manage and record the specific disciplinary measures enforced for logged incidents.</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Card className="p-4 flex flex-col items-center justify-center border-b-4 border-b-amber-500">
            <Clock className="h-5 w-5 text-amber-500 mb-1" />
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Awaiting Action</p>
            <p className="text-xl font-extrabold text-gray-700">{incidents.filter(i => !i.actionTaken).length}</p>
          </Card>
          <Card className="p-4 flex flex-col items-center justify-center border-b-4 border-b-blue-500">
            <AlertTriangle className="h-5 w-5 text-blue-500 mb-1" />
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Under Review</p>
            <p className="text-xl font-extrabold text-gray-700">{incidents.filter(i => i.status === 'investigating').length}</p>
          </Card>
          <Card className="p-4 flex flex-col items-center justify-center border-b-4 border-b-emerald-500">
            <CheckCircle className="h-5 w-5 text-emerald-500 mb-1" />
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Case Resolved</p>
            <p className="text-xl font-extrabold text-gray-700">{incidents.filter(i => i.status === 'resolved').length}</p>
          </Card>
          <Card className="p-4 flex flex-col items-center justify-center border-b-4 border-b-purple-500">
            <Gavel className="h-5 w-5 text-purple-500 mb-1" />
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Total Enforcement</p>
            <p className="text-xl font-extrabold text-gray-700">{incidents.length}</p>
          </Card>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b bg-gray-50/50 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest flex items-center gap-2">
              <Gavel className="h-4 w-4 text-purple-600" /> Disciplinary Action Register
            </h3>
          </div>
          <AdvancedTable
            columns={columns}
            data={incidents}
            loading={loading}
            searchable={true}
            headerClassName="bg-gray-100 text-gray-600 font-bold uppercase text-[10px] tracking-widest h-12"
            emptyMessage={
              <div className="p-10 text-center space-y-2 text-gray-400">
                <Gavel className="h-8 w-8 mx-auto opacity-20" />
                <p className="text-xs font-bold uppercase tracking-widest">No Incident Enforcement Required</p>
              </div>
            }
          />
        </div>
      </div>
    </DashboardLayout>
  )
}
