"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ShieldAlert, Plus, Loader2, Home, Search, Calendar, User } from "lucide-react"
import { API_URL } from "@/lib/api-config"
import { toast } from "sonner"
import { StatusBadge } from "@/components/super-admin/status-badge"

export default function BehaviourLogPage() {
  const [incidents, setIncidents] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    studentId: "",
    location: "",
    incidentDate: new Date().toISOString().split('T')[0],
    severity: "medium",
    description: "",
    remarks: ""
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const [incRes, stuRes] = await Promise.all([
        fetch(`${API_URL}/api/disciplinary/incidents`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/api/students`, { headers: { 'Authorization': `Bearer ${token}` } })
      ])

      if (incRes.ok) {
        const data = await incRes.json()
        setIncidents(data.incidents || data)
      }
      if (stuRes.ok) {
        const data = await stuRes.json()
        setStudents(data.students || data)
      }
    } catch (error) {
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/disciplinary/incidents`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success("Incident recorded")
        setFormData({
          studentId: "",
          location: "",
          incidentDate: new Date().toISOString().split('T')[0],
          severity: "medium",
          description: "",
          remarks: ""
        })
        fetchData()
      }
    } catch (error) {
      toast.error("Failed to save")
    } finally {
      setSubmitting(false)
    }
  }

  const columns = [
    {
      key: "studentId",
      label: "STUDENT",
      render: (v: any) => v ? <span className="font-bold text-gray-800 text-xs">{v.firstName} {v.lastName}</span> : '-'
    },
    {
      key: "incidentDate",
      label: "DATE",
      render: (v: string) => <span className="text-xs text-gray-500">{new Date(v).toLocaleDateString()}</span>
    },
    {
      key: "severity",
      label: "SEVERITY",
      render: (v: string) => (
        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${v === 'critical' ? 'bg-red-100 text-red-700 border-red-200' :
            v === 'high' ? 'bg-orange-100 text-orange-700 border-orange-200' :
              v === 'medium' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                'bg-gray-100 text-gray-700 border-gray-200'
          }`}>
          {v}
        </span>
      )
    },
    {
      key: "description",
      label: "DESCRIPTION",
      render: (v: string) => <span className="text-[10px] text-gray-500 truncate max-w-[200px] inline-block">{v}</span>
    },
    {
      key: "status",
      label: "STATUS",
      render: (v: string) => <StatusBadge status={v} />
    }
  ]

  return (
    <DashboardLayout title="Behaviour Log Management">
      <div className="space-y-6 max-w-full pb-10">
        <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border-l-4 border-l-red-600">
          <div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">Institutional Behaviour Log</h1>
            <p className="text-xs text-gray-500 font-medium">Record and monitor student disciplinary incidents and track resolutions.</p>
          </div>
          <div className="hidden md:flex items-center gap-1 border bg-gray-50 px-3 py-1.5 rounded-full text-xs text-gray-500">
            <Home className="h-3 w-3" /> Disciplinary <span className="mx-1">/</span> <span className="text-red-600 font-bold">Behaviour Log</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 xl:col-span-3">
            <Card className="border-t-4 border-t-red-600 shadow-sm sticky top-6">
              <CardHeader className="py-4 bg-gray-50/50 border-b">
                <CardTitle className="text-[10px] font-bold flex items-center gap-2 uppercase tracking-widest text-gray-600">
                  <ShieldAlert className="h-4 w-4 text-red-500" /> Report Incident
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-gray-500 uppercase">Select Student <span className="text-red-500">*</span></Label>
                    <Select value={formData.studentId} onValueChange={v => setFormData({ ...formData, studentId: v })}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Choose student" />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map(s => (
                          <SelectItem key={s._id} value={s._id}>{s.firstName} {s.lastName} ({s.studentId})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-gray-500 uppercase">Date</Label>
                      <Input type="date" value={formData.incidentDate} onChange={e => setFormData({ ...formData, incidentDate: e.target.value })} className="h-9 text-xs" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-gray-500 uppercase">Severity</Label>
                      <Select value={formData.severity} onValueChange={v => setFormData({ ...formData, severity: v })}>
                        <SelectTrigger className="h-9 text-xs font-bold uppercase">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-gray-500 uppercase">Location <span className="text-red-500">*</span></Label>
                    <Input value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder="e.g. Playground" className="h-9 text-xs" required />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-gray-500 uppercase">Description <span className="text-red-500">*</span></Label>
                    <Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="min-h-[80px] text-xs resize-none" placeholder="Details of incident..." required />
                  </div>

                  <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 font-bold uppercase text-[10px] tracking-widest h-10 shadow-lg shadow-red-50" disabled={submitting}>
                    {submitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Plus className="h-4 w-4 mr-2" />}
                    Post to Log
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-8 xl:col-span-9">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b bg-white flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest">Incident History</h3>
                <div className="text-[10px] font-bold text-gray-400 uppercase">
                  Total: {incidents.length} Records
                </div>
              </div>
              <AdvancedTable
                columns={columns}
                data={incidents}
                loading={loading}
                searchable={true}
                headerClassName="bg-gray-50 text-gray-500 font-bold uppercase text-[10px] tracking-widest h-12"
                emptyMessage={
                  <div className="p-10 text-center space-y-2 text-gray-400">
                    <ShieldAlert className="h-8 w-8 mx-auto opacity-20" />
                    <p className="text-xs font-bold uppercase tracking-widest">Clear Record History</p>
                  </div>
                }
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
