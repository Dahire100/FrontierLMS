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
  Book,
  Search,
  Plus,
  RefreshCcw,
  Edit,
  Trash2,
  MoreVertical,
  Loader2,
  Database,
  Library,
  Hash,
  User,
  Layers,
  Bookmark,
  ChevronRight,
  SearchCode,
  BookOpenCheck
} from "lucide-react"
import { toast } from "sonner"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { API_URL } from "@/lib/api-config"

export default function BookCatalogPage() {
  const [books, setBooks] = useState<any[]>([])
  const [fetching, setFetching] = useState(true)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBook, setEditingBook] = useState<any>(null)

  const [form, setForm] = useState({
    title: "",
    author: "",
    isbn: "",
    bookNumber: "",
    category: "fiction",
    publisher: "",
    publishedYear: new Date().getFullYear(),
    quantity: 1,
    rackNumber: "",
    price: 0,
    description: ""
  })

  const fetchData = useCallback(async () => {
    try {
      setFetching(true)
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_URL}/api/library/books`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) setBooks(data.data)
    } catch (error) {
      console.error(error)
      toast.error("Failed to sync knowledge base")
    } finally {
      setFetching(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSubmit = async () => {
    if (!form.title || !form.author || !form.bookNumber) {
      toast.error("Nomenclature, authorship, and identifier code are required")
      return
    }

    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const method = editingBook ? "PUT" : "POST"
      const url = editingBook
        ? `${API_URL}/api/library/books/${editingBook._id}`
        : `${API_URL}/api/library/books`

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(form)
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.error || "Failed to commit knowledge node")

      toast.success(editingBook ? "Knowledge node updated" : "Knowledge node committed to catalog")
      setIsModalOpen(false)
      setEditingBook(null)
      setForm({
        title: "", author: "", isbn: "", bookNumber: "", category: "fiction",
        publisher: "", publishedYear: new Date().getFullYear(),
        quantity: 1, rackNumber: "", price: 0, description: ""
      })
      fetchData()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to purge this knowledge node?")) return
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_URL}/api/library/books/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (!res.ok) throw new Error("Failed to purge")
      toast.success("Knowledge node purged")
      fetchData()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const columns = [
    {
      key: "title",
      label: "Material Nomenclature",
      render: (val: string, row: any) => (
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-100 group-hover:rotate-6 transition-transform">
            <BookOpenCheck size={20} />
          </div>
          <div>
            <span className="font-black text-gray-900 tracking-tight uppercase leading-none">{val}</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{row.author}</span>
              <span className="text-[10px] text-blue-400 font-black px-2 py-0.5 bg-blue-50/50 rounded-full border border-blue-100/50">{row.bookNumber}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      key: "category",
      label: "Taxonomy",
      render: (val: string) => (
        <div className="flex items-center gap-2">
          <Bookmark size={12} className="text-gray-300" />
          <span className="text-xs font-black text-gray-600 uppercase tracking-tighter">{val}</span>
        </div>
      )
    },
    {
      key: "availableQuantity",
      label: "Live Buffer",
      render: (val: number, row: any) => (
        <div className="flex items-center gap-3">
          <div className={`h-2 w-16 rounded-full bg-gray-100 overflow-hidden`}>
            <div
              className={`h-full transition-all duration-1000 ${val > 0 ? 'bg-indigo-500' : 'bg-rose-500'}`}
              style={{ width: `${(val / row.quantity) * 100}%` }}
            />
          </div>
          <span className="text-[10px] font-black text-gray-500 uppercase">
            {val} / {row.quantity} <span className="text-[8px] text-gray-300 ml-1">COPIES</span>
          </span>
        </div>
      )
    },
    {
      key: "rackNumber",
      label: "Coordinates",
      render: (val: string) => (
        <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100/50 w-fit">
          {val || 'GRID_NOT_SET'}
        </div>
      )
    },
    {
      key: "actions",
      label: "Control",
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
                onClick={() => {
                  setEditingBook(row)
                  setForm({ ...row })
                  setIsModalOpen(true)
                }}
                className="gap-3 cursor-pointer font-black text-[10px] uppercase tracking-widest rounded-xl py-3 hover:bg-indigo-50 text-indigo-900"
              >
                <Edit size={14} className="text-indigo-600" /> Modify Metadata
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDelete(row._id)}
                className="gap-3 cursor-pointer text-rose-600 font-black text-[10px] uppercase tracking-widest rounded-xl py-3 hover:bg-rose-50"
              >
                <Trash2 size={14} /> Purge Entry
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    }
  ]

  const filteredBooks = books.filter((b: any) =>
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.bookNumber.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <DashboardLayout title="Knowledge Logistics: Resource Catalog">
      <div className="max-w-[1700px] mx-auto space-y-12 pb-20">

        {/* Header Context */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-8 bg-blue-600 rounded-full" />
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">Integrated Archive System</span>
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-5 uppercase">
              <div className="h-14 w-14 bg-indigo-950 rounded-3xl flex items-center justify-center shadow-2xl text-white transform hover:rotate-12 transition-all">
                <Library size={28} />
              </div>
              Institutional Material Index
            </h1>
            <p className="text-gray-500 mt-3 text-xl italic font-medium max-w-2xl">Orchestrate internal knowledge assets and optimize informational grid density through high-fidelity metadata management</p>
          </div>

          <div className="flex gap-4">
            <Button variant="outline" onClick={fetchData} className="h-14 border-gray-200 shadow-sm gap-3 rounded-2xl bg-white px-8 font-black text-[10px] uppercase tracking-widest text-gray-600 hover:bg-gray-50 transition-all active:scale-95">
              <RefreshCcw size={18} className={fetching ? 'animate-spin' : ''} /> Execute Sync
            </Button>
            <Button
              onClick={() => {
                setEditingBook(null)
                setForm({
                  title: "", author: "", isbn: "", bookNumber: "", category: "fiction",
                  publisher: "", publishedYear: new Date().getFullYear(),
                  quantity: 1, rackNumber: "", price: 0, description: ""
                })
                setIsModalOpen(true)
              }}
              className="h-14 bg-blue-900 hover:bg-black text-white px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest gap-3 shadow-xl shadow-blue-100 transform hover:translate-y-[-2px] transition-all"
            >
              <Plus size={18} /> Catalog New Entry
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
          {/* Perspective filters */}
          <div className="xl:col-span-3 space-y-6">
            <Card className="border-none shadow-2xl ring-1 ring-black/5 overflow-hidden rounded-[2.5rem] bg-white">
              <CardHeader className="p-8 border-b border-gray-50">
                <CardTitle className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-3">
                  <SearchCode size={16} className="text-blue-600" /> Vector Scaling
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Search Registry</Label>
                  <div className="relative group">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors" />
                    <Input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Query title, author..."
                      className="bg-gray-50/50 border-none ring-1 ring-gray-200 h-14 pl-12 rounded-2xl focus:ring-blue-500 font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center px-1">
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Taxonomy Domain</Label>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {['fiction', 'non-fiction', 'science', 'math', 'reference'].map((cat) => (
                      <Button
                        key={cat}
                        variant="ghost"
                        className="justify-between text-[11px] font-black uppercase tracking-widest h-12 rounded-xl hover:bg-blue-50/50 px-4 group"
                      >
                        <span className="flex items-center gap-3">
                          <div className="h-2 w-2 rounded-full bg-blue-200 group-hover:bg-blue-600 transition-colors" />
                          {cat}
                        </span>
                        <ChevronRight size={14} className="text-gray-300 group-hover:text-blue-600" />
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Matrix View */}
          <div className="xl:col-span-9 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <AdvancedTable
              title="Validated Material Matrix"
              columns={columns}
              data={filteredBooks}
              loading={fetching}
              pagination
            />
          </div>
        </div>
      </div>

      {/* Entry Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden ring-1 ring-black/5 bg-white">
          <DialogHeader className="p-10 bg-gradient-to-r from-blue-50/50 to-white border-b border-gray-100">
            <DialogTitle className="text-2xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-4">
              <div className="h-10 w-10 bg-blue-900 rounded-xl flex items-center justify-center text-white">
                <Database size={20} />
              </div>
              {editingBook ? "Modify Metadata" : "Index New Material"}
            </DialogTitle>
          </DialogHeader>

          <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Asset Nomenclature *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="h-14 bg-gray-50/50 border-none ring-1 ring-gray-100 rounded-2xl focus:ring-blue-500 font-bold px-5"
                  placeholder="Full Title"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Authorship *</Label>
                <Input
                  value={form.author}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                  className="h-14 bg-gray-50/50 border-none ring-1 ring-gray-100 rounded-2xl focus:ring-blue-500 font-bold px-5"
                  placeholder="Creator Identity"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Ref ID *</Label>
                <Input
                  value={form.bookNumber}
                  onChange={(e) => setForm({ ...form, bookNumber: e.target.value })}
                  className="h-14 bg-gray-50/50 border-none ring-1 ring-gray-100 rounded-2xl focus:ring-blue-500 font-black text-blue-900"
                  placeholder="BOOK_001"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Taxonomy</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger className="h-14 bg-gray-50/50 border-none ring-1 ring-gray-100 rounded-2xl focus:ring-blue-500 font-black">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                    {['fiction', 'non-fiction', 'science', 'mathematics', 'reference'].map(c => (
                      <SelectItem key={c} value={c} className="rounded-xl font-bold py-2.5 uppercase">{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Volume Quantity</Label>
                <Input
                  type="number"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })}
                  className="h-14 bg-gray-50/50 border-none ring-1 ring-gray-100 rounded-2xl focus:ring-blue-500 font-black"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Grid Coordinates (Rack)</Label>
                <Input
                  value={form.rackNumber}
                  onChange={(e) => setForm({ ...form, rackNumber: e.target.value })}
                  className="h-14 bg-gray-50/50 border-none ring-1 ring-gray-100 rounded-2xl focus:ring-blue-500 font-bold px-5"
                  placeholder="A-12-GRID"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Capital Valuation (₹)</Label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })}
                  className="h-14 bg-gray-50/50 border-none ring-1 ring-gray-100 rounded-2xl focus:ring-blue-500 font-black text-lg"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="p-8 bg-gray-50/50 border-t border-gray-100">
            <div className="flex gap-4 w-full justify-end">
              <Button variant="outline" onClick={() => setIsModalOpen(false)} className="h-14 rounded-2xl px-10 font-black uppercase text-[10px] tracking-widest">
                Discard
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="h-14 bg-blue-900 hover:bg-black text-white px-10 rounded-2xl font-black text-[10px] uppercase tracking-widest gap-3 shadow-xl transform active:scale-95 transition-all"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Database size={18} />}
                {editingBook ? "Verify Updates" : "Commit Node"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
