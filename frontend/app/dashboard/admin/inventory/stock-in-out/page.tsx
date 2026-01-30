"use client"

import { useState, useEffect, useCallback } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  ArrowUpDown,
  Package,
  ArrowUpCircle,
  ArrowDownCircle,
  RefreshCcw,
  Database,
  Search,
  Loader2,
  Layers,
  Calendar
} from "lucide-react"
import { toast } from "sonner"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import { API_URL } from "@/lib/api-config"

export default function StockInOut() {
  const [items, setItems] = useState<any[]>([])
  const [stores, setStores] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [form, setForm] = useState({ itemId: "", storeId: "", type: "purchase", quantity: "", notes: "", date: new Date().toISOString().split('T')[0] })
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  const fetchData = useCallback(async () => {
    try {
      setFetching(true)
      const token = localStorage.getItem("token")
      const headers = { "Authorization": `Bearer ${token}` }

      const [itemsRes, storesRes, transRes] = await Promise.all([
        fetch(`${API_URL}/api/inventory?limit=100`, { headers }),
        fetch(`${API_URL}/api/inventory/stores`, { headers }),
        fetch(`${API_URL}/api/inventory/transactions`, { headers })
      ])

      const itemsData = await itemsRes.json()
      const storesData = await storesRes.json()
      const transData = await transRes.json()

      if (itemsData.items) setItems(itemsData.items)
      if (Array.isArray(storesData)) setStores(storesData)
      if (Array.isArray(transData)) setTransactions(transData)
    } catch (error) {
      console.error(error)
      toast.error("Failed to sync logistical matrix")
    } finally {
      setFetching(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.itemId || !form.storeId || !form.type || !form.quantity || !form.date) {
      toast.error("Resource descriptor, store, vector type, and operational metrics are required")
      return
    }

    try {
      setLoading(true)
      const token = localStorage.getItem("token")

      // Map Type to Backend Fields
      let transactionType = 'in';
      let reason = 'purchase';

      switch (form.type) {
        case 'purchase': transactionType = 'in'; reason = 'purchase'; break;
        case 'issue': transactionType = 'out'; reason = 'transfer'; break; // Assuming issue implies transfer/consumption
        case 'return': transactionType = 'in'; reason = 'return'; break;
        case 'damaged': transactionType = 'out'; reason = 'damage'; break;
        default: transactionType = 'in'; reason = 'other';
      }

      // If 'issue', we might map it to 'manual' or 'transfer' depending on business logic. 
      // 'reason' enum: ['purchase', 'return', 'adjustment', 'transfer', 'damage', 'loss', 'expired', 'donation', 'other']

      const res = await fetch(`${API_URL}/api/inventory/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          item: form.itemId,
          store: form.storeId,
          transactionType,
          reason,
          quantity: Number(form.quantity),
          notes: form.notes,
          transactionDate: form.date,
          transactionNumber: `KV-${Date.now().toString().slice(-6)}` // Auto-gen number for now
        })
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.error || "Failed to commit vector")

      toast.success("Logistical vector entry synchronized")
      setForm({ ...form, quantity: "", notes: "", itemId: "" })
      fetchData()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      key: "item",
      label: "Resource Asset",
      render: (val: any) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600 shadow-sm border border-teal-100">
            <Package size={16} />
          </div>
          <div>
            <span className="font-black text-gray-900 tracking-tight uppercase leading-none">{val?.itemName}</span>
            <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">Ref: {val?.itemCode}</div>
          </div>
        </div>
      )
    },
    {
      key: "transactionType",
      label: "Vector",
      render: (val: string, row: any) => {
        const isInflow = val === 'in'
        return (
          <div className={`flex items-center gap-2 font-black text-[10px] uppercase tracking-widest py-1.5 px-3 rounded-xl border ${isInflow ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
            }`}>
            {isInflow ? <ArrowUpCircle size={14} className="text-emerald-500" /> : <ArrowDownCircle size={14} className="text-rose-500" />}
            {row.reason} ({val})
          </div>
        )
      }
    },
    {
      key: "quantity",
      label: "Volume",
      render: (val: number, row: any) => {
        const isInflow = row.transactionType === 'in'
        return (
          <div className="flex items-center gap-2">
            <span className={`text-xl font-black ${isInflow ? 'text-emerald-600' : 'text-rose-600'} tracking-tighter`}>{val}</span>
            <span className="text-[10px] text-gray-400 font-bold uppercase underline decoration-gray-200 decoration-2 underline-offset-4">Units</span>
          </div>
        )
      }
    },
    {
      key: "transactionDate",
      label: "Logistical Stamp",
      render: (val: string) => (
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.6)]" />
          <span className="text-xs font-black text-gray-700 whitespace-nowrap">{new Date(val).toLocaleDateString()}</span>
        </div>
      )
    }
  ]

  const filteredTransactions = transactions.filter((m: any) =>
    m.item?.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.item?.itemCode?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <DashboardLayout title="Logistics Strategy: Stock Movement">
      <div className="max-w-[1700px] mx-auto space-y-10 pb-20">

        {/* Master Context */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-4 uppercase">
              <div className="h-12 w-12 bg-teal-600 rounded-2xl flex items-center justify-center shadow-xl text-white transform hover:rotate-180 transition-transform duration-700">
                <ArrowUpDown size={24} />
              </div>
              Stock Logistics Engine
            </h1>
            <p className="text-gray-500 mt-2 text-lg italic font-medium">Coordinate directional resource flows and synchronize real-time institutional buffer states</p>
          </div>

          <Button variant="outline" onClick={fetchData} className="h-12 border-gray-200 shadow-sm gap-2 rounded-2xl bg-white px-6 font-black text-xs uppercase tracking-widest text-gray-600 hover:bg-gray-50 transition-all">
            <RefreshCcw size={18} className={fetching ? 'animate-spin' : ''} /> Global Buffer Sync
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Entry Panel */}
          <div className="lg:col-span-4">
            <Card className="border-none shadow-2xl ring-1 ring-black/5 overflow-hidden sticky top-8 rounded-[2.5rem] bg-white">
              <CardHeader className="bg-gradient-to-r from-teal-50 to-white border-b border-gray-100/50 p-8">
                <CardTitle className="text-[10px] flex items-center gap-3 text-teal-900 uppercase tracking-[0.3em] font-black">
                  <Layers size={18} className="text-teal-600" /> Movement Vector entry
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Integrated Asset <span className="text-rose-500">*</span></Label>
                    <Select value={form.itemId} onValueChange={(v) => setForm({ ...form, itemId: v })}>
                      <SelectTrigger className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 rounded-2xl focus:ring-teal-500 font-bold">
                        <SelectValue placeholder="Identify Resource" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                        {items.map((i: any) => (
                          <SelectItem key={i._id} value={i._id} className="rounded-xl font-bold py-2.5 uppercase">{i.itemName} ({i.itemCode})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Store Node <span className="text-rose-500">*</span></Label>
                    <Select value={form.storeId} onValueChange={(v) => setForm({ ...form, storeId: v })}>
                      <SelectTrigger className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 rounded-2xl focus:ring-teal-500 font-bold">
                        <SelectValue placeholder="Target Store" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                        {stores.map((s: any) => (
                          <SelectItem key={s._id} value={s._id} className="rounded-xl font-bold py-2.5 uppercase">{s.storeName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Vector Type <span className="text-rose-500">*</span></Label>
                      <Select value={form.type} onValueChange={(val) => setForm({ ...form, type: val })}>
                        <SelectTrigger className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 rounded-2xl focus:ring-teal-500 font-black">
                          <SelectValue placeholder="Vector" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                          <SelectItem value="purchase" className="rounded-xl font-bold py-2.5 text-emerald-600">PURCHASE (IN)</SelectItem>
                          <SelectItem value="issue" className="rounded-xl font-bold py-2.5 text-rose-600">ISSUE (OUT)</SelectItem>
                          <SelectItem value="return" className="rounded-xl font-bold py-2.5 text-emerald-600">RETURN (IN)</SelectItem>
                          <SelectItem value="damaged" className="rounded-xl font-bold py-2.5 text-rose-600">DAMAGED (OUT)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Volume <span className="text-rose-500">*</span></Label>
                      <Input value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} type="number" placeholder="0" className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 rounded-2xl focus:ring-teal-500 font-black text-lg" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Logistical Stamp <span className="text-rose-500">*</span></Label>
                    <div className="relative group">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-600" size={16} />
                      <Input value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} type="date" className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-14 pl-12 rounded-2xl focus:ring-teal-500 font-bold" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Audit Metadata</Label>
                    <Textarea
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      placeholder="Vector justification and remarks..."
                      className="bg-gray-50/50 border-none ring-1 ring-gray-100 min-h-[100px] rounded-3xl focus:ring-teal-500 font-medium p-5"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-teal-600 hover:bg-black text-white h-16 rounded-[1.5rem] shadow-2xl shadow-teal-100 font-black text-xs uppercase tracking-[0.3em] gap-3 transition-all hover:scale-[1.02] active:scale-95"
                  >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Database size={20} />}
                    Commit Vector Entry
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Matrix Panel */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
              <div className="relative flex-1 max-w-md group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-teal-600 transition-colors" />
                <Input
                  className="pl-16 h-16 bg-white border-none ring-1 ring-black/5 shadow-2xl rounded-[1.5rem] focus:ring-2 focus:ring-teal-500/20 text-lg font-medium"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Identify movement profile..."
                />
              </div>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
              <AdvancedTable
                title="Validated Movement Matrix"
                columns={columns}
                data={filteredTransactions}
                loading={fetching}
                pagination
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
