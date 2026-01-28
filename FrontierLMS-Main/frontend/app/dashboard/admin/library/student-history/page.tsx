"use client"

import { useState, useEffect, useCallback } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  History,
  Loader2,
  RefreshCcw,
  Search,
  User,
  Book,
  Calendar,
  CheckCircle2,
  Clock,
  Database,
  Tag,
  UserCheck,
  Users,
  ArrowRightLeft,
  GraduationCap,
  Download
} from "lucide-react"
import { toast } from "sonner"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import { API_URL } from "@/lib/api-config"

export default function LibraryHistoryPage() {
  const [history, setHistory] = useState<any[]>([])
  const [fetching, setFetching] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  const fetchData = useCallback(async () => {
    try {
      setFetching(true)
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_URL}/api/library/issues`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) setHistory(data.data)
    } catch (error) {
      console.error(error)
      toast.error("Failed to sync historical ledger")
    } finally {
      setFetching(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const columns = [
    {
      key: "issuedTo",
      label: "Beneficiary Vector",
      render: (val: any) => (
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm transition-transform hover:scale-110">
            {val?.userType === 'student' ? <GraduationCap size={18} /> : <Users size={18} />}
          </div>
          <div>
            <span className="font-black text-gray-900 tracking-tight uppercase leading-none">{val?.name}</span>
            <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">{val?.userType}</div>
          </div>
        </div>
      )
    },
    {
      key: "bookId",
      label: "Material Protocol",
      render: (val: any) => (
        <div className="flex flex-col">
          <span className="font-black text-gray-900 tracking-tight uppercase leading-none">{val?.title}</span>
          <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">CODE: {val?.bookNumber}</span>
        </div>
      )
    },
    {
      key: "issueDate",
      label: "Transaction Dates",
      render: (val: string, row: any) => (
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            <span className="text-[10px] font-black text-gray-500 uppercase">Issued: {new Date(val).toLocaleDateString()}</span>
          </div>
          {row.returnDate && (
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-black text-gray-500 uppercase">Return: {new Date(row.returnDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      )
    },
    {
      key: "fineAmount",
      label: "Fiscal Yield",
      render: (val: number) => (
        <div className={`font-black tracking-tighter ${val > 0 ? 'text-rose-600' : 'text-gray-400'}`}>
          {val > 0 ? `₹${val.toLocaleString()}` : 'CLEAN_TRANS'}
        </div>
      )
    },
    {
      key: "status",
      label: "Archival State",
      render: (val: string) => (
        <div className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border transition-all flex items-center gap-2 w-fit ${val === 'returned'
            ? 'bg-emerald-100 text-emerald-700 border-emerald-200 shadow-lg shadow-emerald-50'
            : val === 'overdue'
              ? 'bg-rose-100 text-rose-700 border-rose-200'
              : 'bg-amber-100 text-amber-700 border-amber-200 shadow-lg shadow-amber-50'
          }`}>
          {val === 'returned' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
          {val || 'issued'}
        </div>
      )
    }
  ]

  const filteredHistory = history.filter((h: any) =>
    h.issuedTo?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.bookId?.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <DashboardLayout title="Knowledge Logistics: Archival History">
      <div className="max-w-[1700px] mx-auto space-y-10 pb-20">

        {/* Header Context */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-4 uppercase">
              <div className="h-12 w-12 bg-indigo-950 rounded-2xl flex items-center justify-center shadow-xl text-white transform hover:rotate-12 transition-transform">
                <History size={24} />
              </div>
              Beneficiary Interaction Ledger
            </h1>
            <p className="text-gray-500 mt-2 text-lg italic font-medium">Audit the complete chronological sequence of material interactions and institutional knowledge dispersion events</p>
          </div>

          <div className="flex gap-4">
            <Button variant="outline" className="h-12 border-gray-200 shadow-sm gap-2 rounded-2xl bg-white px-6 font-black text-[10px] uppercase tracking-widest text-gray-600 hover:bg-gray-50">
              <Download size={18} /> Export Archival Data
            </Button>
            <Button variant="outline" onClick={fetchData} className="h-12 border-gray-200 shadow-sm gap-2 rounded-2xl bg-white px-6 font-black text-[10px] uppercase tracking-widest text-gray-600 hover:bg-gray-50 transition-all active:scale-95">
              <RefreshCcw size={18} className={fetching ? 'animate-spin' : ''} /> Sync Ledger
            </Button>
          </div>
        </div>

        <div className="space-y-8">
          {/* Search Vector */}
          <div className="relative max-w-md group">
            <ArrowRightLeft className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-indigo-600 transition-colors" />
            <Input
              className="pl-16 h-16 bg-white border-none ring-1 ring-black/5 shadow-2xl rounded-[1.5rem] focus:ring-2 focus:ring-indigo-500/20 text-lg font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Identify beneficiary or material node..."
            />
          </div>

          {/* Matrix View */}
          <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <AdvancedTable
              title="Validated Archival Matrix"
              columns={columns}
              data={filteredHistory}
              loading={fetching}
              pagination
            />
          </div>

          {/* Security Footnote */}
          <div className="flex items-center gap-4 px-1">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.4em]">Cryptographically Verified Transaction Log • Session 2024-25</span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
