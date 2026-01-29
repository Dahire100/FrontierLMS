"use client"

import { useState, useEffect, useCallback } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Bookmark,
  Loader2,
  RefreshCcw,
  Search,
  User,
  Book,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Database,
  Tag,
  Inbox,
  MessageSquare,
  MoreVertical
} from "lucide-react"
import { toast } from "sonner"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import { API_URL } from "@/lib/api-config"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function BookReservationPage() {
  const [requests, setRequests] = useState<any[]>([])
  const [fetching, setFetching] = useState(true)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const fetchData = useCallback(async () => {
    try {
      setFetching(true)
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_URL}/api/library/requests`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) setRequests(data.data)
    } catch (error) {
      console.error(error)
      toast.error("Failed to sync request archives")
    } finally {
      setFetching(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_URL}/api/library/requests/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      })

      if (!res.ok) throw new Error("Failed to update status")

      toast.success(`Request marked as ${status}`)
      fetchData()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      key: "studentId",
      label: "Requesting Beneficiary",
      render: (val: any) => (
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm">
            <User size={18} />
          </div>
          <div>
            <span className="font-black text-gray-900 tracking-tight uppercase leading-none">{val?.firstName} {val?.lastName}</span>
            <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">ID: {val?.admissionNumber}</div>
          </div>
        </div>
      )
    },
    {
      key: "bookTitle",
      label: "Requested Material",
      render: (val: string, row: any) => (
        <div className="flex flex-col">
          <span className="font-black text-gray-900 tracking-tight uppercase leading-none">{val}</span>
          <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">Auth: {row.author || 'GENERIC_MATERIAL'}</span>
        </div>
      )
    },
    {
      key: "createdAt",
      label: "Archival Timestamp",
      render: (val: string) => (
        <div className="flex items-center gap-2 text-gray-400">
          <Calendar size={12} />
          <span className="text-xs font-black uppercase">{new Date(val).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      key: "status",
      label: "Resolution State",
      render: (val: string) => (
        <div className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border transition-all ${val === 'approved'
            ? 'bg-emerald-100 text-emerald-700 border-emerald-200 shadow-lg shadow-emerald-50'
            : val === 'rejected'
              ? 'bg-rose-100 text-rose-700 border-rose-200'
              : val === 'available'
                ? 'bg-blue-100 text-blue-700 border-blue-200'
                : 'bg-amber-100 text-amber-700 border-amber-200'
          }`}>
          {val || 'pending'}
        </div>
      )
    },
    {
      key: "actions",
      label: "Resolution",
      render: (_: any, row: any) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full">
                <MoreVertical className="h-4 w-4 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-2xl shadow-2xl border-none ring-1 ring-black/5 p-2 bg-white">
              <DropdownMenuItem
                onClick={() => handleStatusUpdate(row._id, 'approved')}
                className="gap-3 cursor-pointer font-black text-[10px] uppercase tracking-widest rounded-xl py-3 hover:bg-emerald-50 text-emerald-900"
              >
                <CheckCircle2 size={14} className="text-emerald-600" /> Approve Request
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleStatusUpdate(row._id, 'available')}
                className="gap-3 cursor-pointer font-black text-[10px] uppercase tracking-widest rounded-xl py-3 hover:bg-blue-50 text-blue-900"
              >
                <Tag size={14} className="text-blue-600" /> Mark Available
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleStatusUpdate(row._id, 'rejected')}
                className="gap-3 cursor-pointer text-rose-600 font-black text-[10px] uppercase tracking-widest rounded-xl py-3 hover:bg-rose-50"
              >
                <XCircle size={14} /> Reject Request
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    }
  ]

  const filteredRequests = requests.filter((r: any) =>
    r.bookTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.studentId?.firstName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <DashboardLayout title="Knowledge Logistics: Material Reservations">
      <div className="max-w-[1700px] mx-auto space-y-10 pb-20">

        {/* Header Context */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-4 uppercase">
              <div className="h-12 w-12 bg-indigo-950 rounded-2xl flex items-center justify-center shadow-xl text-white transform hover:rotate-12 transition-transform">
                <Inbox size={24} />
              </div>
              Asset Reservation Queue
            </h1>
            <p className="text-gray-500 mt-2 text-lg italic font-medium">Orchestrate material demand and manage knowledge access requests from the institutional beneficiary grid</p>
          </div>

          <Button variant="outline" onClick={fetchData} className="h-12 border-gray-200 shadow-sm gap-2 rounded-2xl bg-white px-6 font-black text-xs uppercase tracking-widest text-gray-600 hover:bg-gray-50">
            <RefreshCcw size={18} className={fetching ? 'animate-spin' : ''} /> Refresh Demand Matrix
          </Button>
        </div>

        <div className="space-y-8">
          {/* Perspective filters */}
          <div className="relative max-w-md group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-indigo-600 transition-colors" />
            <Input
              className="pl-16 h-16 bg-white border-none ring-1 ring-black/5 shadow-2xl rounded-[1.5rem] focus:ring-2 focus:ring-indigo-500/20 text-lg font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Query reservation registry..."
            />
          </div>

          {/* Matrix View */}
          <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <AdvancedTable
              title="Validated Demand Matrix"
              columns={columns}
              data={filteredRequests}
              loading={fetching}
              pagination
            />
          </div>

          {/* Intelligence Insight */}
          <div className="bg-indigo-50/50 p-10 rounded-[3rem] border border-indigo-100 border-dashed flex items-center gap-8 group">
            <div className="h-16 w-16 bg-white rounded-3xl flex items-center justify-center shadow-xl border border-indigo-100 group-hover:bg-indigo-900 group-hover:text-white transition-all duration-500">
              <MessageSquare size={32} />
            </div>
            <div>
              <p className="font-black text-xl uppercase tracking-tight text-indigo-900">Demand Aggregation</p>
              <p className="text-indigo-600/70 font-medium max-w-lg">Advanced demand aggregation active. Automated notifications will be dispatched to beneficiaries when materials reach the available state.</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
