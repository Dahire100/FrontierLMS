"use client"

import { API_URL } from "@/lib/api-config"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { StatCard } from "@/components/super-admin/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Clock, CheckCircle, AlertCircle, Search, Plus, Book, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

export default function StudentLibrary() {
  const [searchQuery, setSearchQuery] = useState("")
  const [issuedBooks, setIssuedBooks] = useState<any[]>([])
  const [bookRequests, setBookRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [requesting, setRequesting] = useState(false)
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false)

  const [requestForm, setRequestForm] = useState({
    title: "",
    author: ""
  })

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token')
      const headers = { 'Authorization': `Bearer ${token}` }

      const [historyRes, requestsRes] = await Promise.all([
        fetch(`${API_URL}/api/student/library/history`, { headers }),
        fetch(`${API_URL}/api/student/library/requests`, { headers })
      ])

      const historyData = await historyRes.json()
      const requestsData = await requestsRes.json()

      if (historyData.success) {
        const books = historyData.data.map((record: any) => ({
          id: record._id,
          title: record.bookId ? record.bookId.title : "Unknown Book",
          author: record.bookId ? record.bookId.author : "Unknown Author",
          issueDate: record.issueDate,
          dueDate: record.dueDate,
          status: record.status || (record.returnDate ? "Returned" : "Active")
        }))
        setIssuedBooks(books)
      }

      if (requestsData.success) {
        setBookRequests(requestsData.data)
      }
    } catch (error) {
      console.error("Failed to fetch library data", error)
      toast.error("Failed to load library records")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const activeBooks = issuedBooks.filter(b => b.status === "Active" || b.status === "Issued").length
  const overdueBooks = issuedBooks.filter(b => b.status === "Overdue").length

  const handleRequestBook = async (e: React.FormEvent) => {
    e.preventDefault()
    setRequesting(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/api/student/library/request`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestForm)
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Book Requested", { description: "Your request has been submitted." })
        setIsRequestDialogOpen(false)
        setRequestForm({ title: "", author: "" })
        fetchData()
      } else {
        toast.error(data.error || "Failed to submit request")
      }
    } catch (error) {
      console.error("Request book error", error)
      toast.error("An error occurred")
    } finally {
      setRequesting(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-center">Loading Library Details...</div>
  }

  return (
    <DashboardLayout title="Library">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Library
            </h2>
            <p className="text-muted-foreground mt-1">Manage your issued books and find new ones</p>
          </div>
          <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" /> Request New Book
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleRequestBook}>
                <DialogHeader>
                  <DialogTitle>Request a Book</DialogTitle>
                  <DialogDescription>Search the catalog or request a specific title if it's not available.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="reqTitle">Book Title</Label>
                    <Input
                      id="reqTitle"
                      placeholder="Enter book name"
                      required
                      value={requestForm.title}
                      onChange={(e) => setRequestForm({ ...requestForm, title: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="reqAuthor">Author</Label>
                    <Input
                      id="reqAuthor"
                      placeholder="Enter author name"
                      value={requestForm.author}
                      onChange={(e) => setRequestForm({ ...requestForm, author: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={requesting}>
                    {requesting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {requesting ? "Submitting..." : "Submit Request"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="Issued Books" value={issuedBooks.length.toString()} icon={BookOpen} iconColor="text-blue-600" iconBgColor="bg-blue-100" />
          <StatCard title="Active Requests" value={bookRequests.filter(r => r.status === 'pending').length.toString()} icon={Clock} iconColor="text-orange-600" iconBgColor="bg-orange-100" />
          <StatCard title="Overdue" value={overdueBooks.toString()} icon={AlertCircle} iconColor="text-red-600" iconBgColor="bg-red-100" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Currently Issued */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-blue-600" />Issued Books</CardTitle>
                <CardDescription>Manage your current physical books</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {issuedBooks.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No books currently issued.</p>
                  ) : issuedBooks.map((book) => (
                    <div key={book.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${book.status === "Overdue" ? "bg-red-100" : "bg-green-100"}`}>
                          {book.status === "Overdue" ? <AlertCircle className="h-5 w-5 text-red-600" /> : <CheckCircle className="h-5 w-5 text-green-600" />}
                        </div>
                        <div>
                          <p className="font-semibold">{book.title}</p>
                          <p className="text-xs text-muted-foreground">by {book.author}</p>
                        </div>
                      </div>
                      <div className="text-left sm:text-right w-full sm:w-auto">
                        <p className="text-sm font-medium">Due: {new Date(book.dueDate).toLocaleDateString()}</p>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${book.status === "Overdue" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                          {book.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5 text-orange-600" />My Book Requests</CardTitle>
                <CardDescription>Status of titles you've requested</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {bookRequests.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No requests found.</p>
                  ) : bookRequests.map((req) => (
                    <div key={req._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-semibold">{req.bookTitle}</p>
                        <p className="text-xs text-muted-foreground">by {req.author || 'Unknown'}</p>
                      </div>
                      <Badge variant={req.status === 'approved' ? 'default' : (req.status === 'rejected' ? 'destructive' : 'outline')}>
                        {req.status.toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Search */}
          <div>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Search className="h-5 w-5" /> Quick Search</CardTitle>
                <CardDescription>Find books in library</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by title, author, ISBN..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Popular Categories</p>
                  <div className="flex flex-wrap gap-2">
                    {["Science", "Fiction", "History", "Math", "Literature", "Art"].map(cat => (
                      <Button key={cat} variant="outline" size="sm" className="text-xs h-7">{cat}</Button>
                    ))}
                  </div>
                </div>
                <div className="pt-4 border-t text-center">
                  <Book className="h-16 w-16 mx-auto text-gray-200 mb-2" />
                  <p className="text-sm text-gray-500">Search to see results here</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
