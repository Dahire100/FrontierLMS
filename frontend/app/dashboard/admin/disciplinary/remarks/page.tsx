"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MessageSquareQuote, Search, Loader2, Home, User } from "lucide-react"
import { API_URL } from "@/lib/api-config"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"

export default function RemarksPage() {
  const [incidents, setIncidents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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
      toast.error("Failed to load records")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateRemarks = async (id: string, remarks: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/disciplinary/incidents/${id}`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ remarks })
      })
      if (response.ok) toast.success("Remarks updated")
    } catch (error) {
      toast.error("Update failed")
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
      label: "LOG DATE",
      render: (v: string) => <span className="text-[10px] text-gray-400 font-mono">{new Date(v).toLocaleDateString()}</span>
    },
    {
      key: "description",
      label: "ASSOCIATED INCIDENT",
      render: (v: string) => <p className="text-[10px] text-gray-500 max-w-[200px] truncate">{v}</p>
    },
    {
      key: "remarks",
      label: "OFFICIAL REMARKS / NOTES",
      render: (v: string, row: any) => (
        <Input
          placeholder="Enter official remarks..."
          defaultValue={v}
          onBlur={(e) => handleUpdateRemarks(row._id, e.target.value)}
          className="h-8 text-[11px] font-medium border-pink-100"
        />
      )
    }
  ]

  return (
    <DashboardLayout title="Behavioural Remarks & Notes">
      <div className="space-y-6 max-w-full pb-10">
        <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border-l-4 border-l-pink-500">
          <div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">Observer Remarks</h1>
            <p className="text-xs text-gray-500 font-medium">Record additional observations and qualitative notes for student behaviour logs.</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b bg-gray-50/50 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest flex items-center gap-2">
              <MessageSquareQuote className="h-4 w-4 text-pink-500" /> Disciplinary Notes Register
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
                <MessageSquareQuote className="h-8 w-8 mx-auto opacity-20" />
                <p className="text-xs font-bold uppercase tracking-widest">No Remarks Required</p>
              </div>
            }
          />
        </div>
      </div>
    </DashboardLayout>
  )
}
