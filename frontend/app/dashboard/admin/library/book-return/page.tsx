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
  RotateCcw,
  Loader2,
  RefreshCcw,
  Search,
  Book,
  User,
  Calendar,
  ShieldCheck,
  AlertCircle,
  Database,
  Tag,
  Clock,
  CheckCircle2
} from "lucide-react"
import { toast } from "sonner"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import { API_URL } from "@/lib/api-config"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

export default function BookReturnPage() {
  const [issues, setIssues] = useState<any[]>([])
  const [fetching, setFetching] = useState(true)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedIssue, setSelectedIssue] = useState<any>(null)
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false)

  const [returnForm, setReturnForm] = useState({
    fineAmount: 0,
    remarks: ""
  })

  const fetchData = useCallback(async () => {
    try {
      setFetching(true)
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_URL}/api/library/issues?status=issued`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) setIssues(data.data)
    } catch (error) {
      console.error(error)
      toast.error("Failed to sync issuance archives")
    } finally {
      setFetching(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleReturnCommit = async () => {
    if (!selectedIssue) return

    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_URL}/api/library/return/${selectedIssue._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(returnForm)
      })

      if (!res.ok) throw new Error("Failed to commit return protocol")

      toast.success("Knowledge node returned to institutional buffer")
      setIsReturnModalOpen(false)
      setSelectedIssue(null)
      setReturnForm({ fineAmount: 0, remarks: "" })
      fetchData()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      key: "bookId",
      label: "Material Node",
      render: (val: any) => (
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-sm">
            <Book size={18} />
          </div>
          <div>
            <span className="font-black text-gray-900 tracking-tight uppercase leading-none">{val?.title}</span>
            <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">REF: {val?.bookNumber}</div>
          </div>
        </div>
      )
    },
    {
      key: "issuedTo",
      label: "Current Beneficiary",
      render: (val: any) => (
        <div className="flex flex-col">
          <span className="font-black text-gray-900 tracking-tight uppercase leading-none">{val?.name}</span>
          <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">{val?.userType}</span>
        </div>
      )
    },
    {
      key: "dueDate",
      label: "Deadline",
      render: (val: string) => {
        const overdue = new Date(val) < new Date()
        return (
          <div className={`flex items-center gap-2 ${overdue ? 'text-rose-500 font-black' : 'text-gray-500 font-bold'}`}>
            <Calendar size={12} className={overdue ? 'animate-pulse' : 'text-gray-300'} />
            <span className="text-xs uppercase">{new Date(val).toLocaleDateString()}</span>
          </div>
        )
      }
    },
    {
      key: "actions",
      label: "Protocol",
      render: (_: any, row: any) => (
        <div className="flex justify-end">
          <Button
            onClick={() => {
              setSelectedIssue(row)
              setIsReturnModalOpen(true)
            }}
            className="bg-emerald-600 hover:bg-emerald-900 text-white h-10 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest gap-2 transform active:scale-95 transition-all shadow-lg shadow-emerald-100"
          >
            <RotateCcw size={14} /> Commit Return
          </Button>
        </div>
      )
    }
  ]

  return (
    <DashboardLayout title="Knowledge Logistics: Material Recovery">
      <div className="max-w-[1700px] mx-auto space-y-10 pb-20">

        {/* Header Context */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-4 uppercase">
              <div className="h-12 w-12 bg-emerald-950 rounded-2xl flex items-center justify-center shadow-xl text-white transform hover:rotate-12 transition-transform">
                <RotateCcw size={24} />
              </div>
              Asset Recovery Protocol
            </h1>
            <p className="text-gray-500 mt-2 text-lg italic font-medium">Verify knowledge node integrity and synchronize material return to the institutional grid buffer</p>
          </div>

          <Button variant="outline" onClick={fetchData} className="h-12 border-gray-200 shadow-sm gap-2 rounded-2xl bg-white px-6 font-black text-xs uppercase tracking-widest text-gray-600 hover:bg-gray-50">
            <RefreshCcw size={18} className={fetching ? 'animate-spin' : ''} /> Synchronize Grid
          </Button>
        </div>

        <div className="space-y-8">
          {/* Perspective filters */}
          <div className="relative max-w-md group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-emerald-600 transition-colors" />
            <Input
              className="pl-16 h-16 bg-white border-none ring-1 ring-black/5 shadow-2xl rounded-[1.5rem] focus:ring-2 focus:ring-emerald-500/20 text-lg font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Identify material or beneficiary..."
            />
          </div>

          {/* Matrix View */}
          <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <AdvancedTable
              title="Validated Active Dispersion Matrix"
              columns={columns}
              data={issues}
              loading={fetching}
              pagination
            />
          </div>
        </div>
      </div>

      {/* Return Validation Modal */}
      <Dialog open={isReturnModalOpen} onOpenChange={setIsReturnModalOpen}>
        <DialogContent className="max-w-xl rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden ring-1 ring-black/5 bg-white">
          <DialogHeader className="p-10 bg-gradient-to-r from-emerald-50/50 to-white border-b border-gray-100">
            <DialogTitle className="text-2xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-4">
              <div className="h-10 w-10 bg-emerald-900 rounded-xl flex items-center justify-center text-white">
                <CheckCircle2 size={20} />
              </div>
              Validation Process
            </DialogTitle>
          </DialogHeader>

          {selectedIssue && (
            <div className="p-10 space-y-8">
              <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100 flex justify-between items-center relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-125 transition-transform duration-700">
                  <Tag size={80} />
                </div>
                <div className="relative z-10">
                  <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest leading-none mb-2">Material Node</p>
                  <p className="text-xl font-black text-emerald-900 tracking-tighter">{selectedIssue.bookId?.title}</p>
                  <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">Issued to: {selectedIssue.issuedTo?.name}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Fiscal Fine (₹)</Label>
                  <Input
                    type="number"
                    value={returnForm.fineAmount}
                    onChange={(e) => setReturnForm({ ...returnForm, fineAmount: parseInt(e.target.value) || 0 })}
                    className="h-14 bg-gray-50/50 border-none ring-1 ring-gray-100 rounded-2xl focus:ring-emerald-500 font-black text-lg px-5"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Condition Remarks</Label>
                  <Input
                    value={returnForm.remarks}
                    onChange={(e) => setReturnForm({ ...returnForm, remarks: e.target.value })}
                    className="h-14 bg-gray-50/50 border-none ring-1 ring-gray-100 rounded-2xl focus:ring-emerald-500 font-bold px-5"
                    placeholder="Material State..."
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                <Clock size={18} className="text-amber-600" />
                <div className="text-[10px] font-black uppercase text-amber-700 tracking-widest">
                  Deadline: {new Date(selectedIssue.dueDate).toLocaleDateString()}
                  {new Date(selectedIssue.dueDate) < new Date() && " (OVERDUE)"}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="p-8 bg-gray-50/50 border-t border-gray-100">
            <div className="flex gap-4 w-full justify-end">
              <Button variant="outline" onClick={() => setIsReturnModalOpen(false)} className="h-14 rounded-2xl px-10 font-black uppercase text-[10px] tracking-widest">
                Discard
              </Button>
              <Button
                onClick={handleReturnCommit}
                disabled={loading}
                className="h-14 bg-emerald-700 hover:bg-black text-white px-10 rounded-2xl font-black text-[10px] uppercase tracking-widest gap-3 shadow-xl transform active:scale-95 transition-all"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                Authorize Return
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
