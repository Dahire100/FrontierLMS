"use client"

import { useMemo, useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  CalendarDays,
  ChevronDown,
  Copy,
  Download,
  LayoutList,
  Pencil,
  Printer,
  Search,
  Trash2,
  Calendar,
  Plus,
  Loader2,
} from "lucide-react"
import { API_URL } from "@/lib/api-config"
import { useToast } from "@/components/ui/use-toast"

interface Term {
  _id: string
  termName: string
  termCode: string
  description: string
  startDate: string
  endDate: string
  status: string
}

export default function TermList() {
  const { toast } = useToast()
  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTerm, setEditingTerm] = useState<Term | null>(null)
  const [formData, setFormData] = useState({
    termName: "",
    termCode: "",
    description: "",
    startDate: today,
    endDate: today,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [terms, setTerms] = useState<Term[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchTerms()
  }, [])

  const fetchTerms = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/terms`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setTerms(data)
      } else {
        toast({ title: "Error", description: "Failed to fetch terms", variant: "destructive" })
      }
    } catch (error) {
      console.error(error)
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      termName: "",
      termCode: "",
      description: "",
      startDate: today,
      endDate: today,
    })
    setEditingTerm(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const token = localStorage.getItem('token')
      const url = editingTerm
        ? `${API_URL}/api/terms/${editingTerm._id}`
        : `${API_URL}/api/terms`

      const method = editingTerm ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast({ title: "Success", description: `Term ${editingTerm ? 'updated' : 'added'} successfully` })
        fetchTerms()
        setIsDialogOpen(false)
        resetForm()
      } else {
        const error = await response.json()
        toast({ title: "Error", description: error.error || "Operation failed", variant: "destructive" })
      }
    } catch (error) {
      console.error(error)
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditDialog = (term: Term) => {
    setEditingTerm(term)
    setFormData({
      termName: term.termName,
      termCode: term.termCode,
      description: term.description || "",
      startDate: new Date(term.startDate).toISOString().slice(0, 10),
      endDate: new Date(term.endDate).toISOString().slice(0, 10),
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this term?")) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/terms/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        toast({ title: "Success", description: "Term deleted successfully" })
        setTerms(terms.filter(term => term._id !== id))
      } else {
        toast({ title: "Error", description: "Failed to delete term", variant: "destructive" })
      }
    } catch (error) {
      console.error(error)
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" })
    }
  }

  const filteredTerms = useMemo(() => {
    return terms.filter(term =>
      term.termName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      term.termCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (term.description || "").toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [terms, searchQuery])

  return (
    <DashboardLayout title="Term List">
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Term List</h2>
            <p className="text-muted-foreground mt-1">Manage academic terms and examination sessions.</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) resetForm()
          }}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md">
                <Plus className="w-4 h-4 mr-2" /> Add Term
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingTerm ? 'Edit Term' : 'Add New Term'}</DialogTitle>
                <DialogDescription>
                  Create a new academic term or examination session.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="termName">Term Name *</Label>
                    <Input
                      id="termName"
                      value={formData.termName}
                      onChange={(e) => setFormData({ ...formData, termName: e.target.value })}
                      placeholder="e.g. First Term"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="termCode">Term Code *</Label>
                    <Input
                      id="termCode"
                      value={formData.termCode}
                      onChange={(e) => setFormData({ ...formData, termCode: e.target.value })}
                      placeholder="e.g. TERM-1"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    {editingTerm ? 'Update Term' : 'Save Term'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-gray-100 shadow-md bg-white/50 backdrop-blur-sm">
          <CardHeader className="pb-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium">Academic Terms</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search terms..."
                  className="pl-9 bg-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow>
                  <TableHead>Term Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" />
                    </TableCell>
                  </TableRow>
                ) : filteredTerms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No terms found. Add one to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTerms.map((term) => (
                    <TableRow key={term._id} className="hover:bg-gray-50/50 transition-colors">
                      <TableCell className="font-medium text-gray-900">{term.termName}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-normal border-gray-200">
                          {term.termCode}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          <span>{format(new Date(term.startDate), 'MMM d, yyyy')} - {format(new Date(term.endDate), 'MMM d, yyyy')}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={term.status === 'Active' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-700'}>
                          {term.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="w-8 h-8 text-blue-600 hover:bg-blue-50" onClick={() => openEditDialog(term)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="w-8 h-8 text-red-600 hover:bg-red-50" onClick={() => handleDelete(term._id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
