"use client"

import { API_URL } from "@/lib/api-config"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Book, BookOpen, Clock, Calendar, Loader2, Sparkles, ChevronRight } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Book {
    _id: string;
    title: string;
    author: string;
    category: string;
    status: string;
    cover?: string;
    dueDate?: string;
}

export default function LibraryPage() {
    const [books, setBooks] = useState<Book[]>([])
    const [issuedBooks, setIssuedBooks] = useState<Book[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const { toast } = useToast()

    useEffect(() => {
        fetchLibraryData()
    }, [])

    const fetchLibraryData = async () => {
        try {
            const token = localStorage.getItem('token')
            const [booksRes, issuedRes] = await Promise.all([
                fetch(`${API_URL}/api/teacher/library/books`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_URL}/api/teacher/library/my-books`, { headers: { 'Authorization': `Bearer ${token}` } })
            ])

            const booksData = await booksRes.json()
            const issuedData = await issuedRes.json()

            if (booksData.success) setBooks(booksData.data)
            if (issuedData.success) setIssuedBooks(issuedData.data)
        } catch (err) {
            toast({ title: "Error", description: "Failed to load library repository", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    const filteredBooks = books.filter(b =>
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.author.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading) {
        return (
            <DashboardLayout title="Knowledge Repository">
                <div className="flex items-center justify-center min-h-[50vh]">
                    <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout title="Institutional Library">
            <div className="space-y-8 max-w-[1400px] mx-auto pb-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h2 className="text-4xl font-black text-gray-900 tracking-tight italic uppercase">Bibliographic Vault</h2>
                        <p className="text-muted-foreground font-medium italic">Intellectual assets and academic research publications.</p>
                    </div>
                    <div className="w-full md:w-96 relative group">
                        <Search className="absolute left-4 top-4 h-4 w-4 text-gray-400 font-black group-focus-within:text-indigo-600 transition-colors" />
                        <Input
                            placeholder="Query by title, author, or ISBN..."
                            className="pl-12 h-14 rounded-2xl border-none bg-white shadow-xl shadow-indigo-100/30 focus:ring-4 focus:ring-indigo-100 font-bold transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {issuedBooks.length > 0 && (
                    <section className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-orange-50 rounded-lg">
                                <Clock className="w-5 h-5 text-orange-600" />
                            </div>
                            <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight italic">Active Custodial Records</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {issuedBooks.map((book) => (
                                <Card key={book._id} className="border-none shadow-xl shadow-indigo-100/20 ring-1 ring-orange-100/50 bg-white overflow-hidden group">
                                    <CardContent className="p-6 flex gap-6">
                                        <div className="w-20 h-28 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                                            <BookOpen className="w-8 h-8 text-orange-300" />
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <h4 className="font-black text-gray-900 uppercase tracking-tight italic line-clamp-1">{book.title}</h4>
                                            <p className="text-xs font-bold text-gray-400">{book.author}</p>
                                            <div className="pt-2 flex items-center gap-2 text-[10px] font-black text-red-600 uppercase tracking-widest bg-red-50/50 p-2 rounded-lg w-fit">
                                                <Calendar className="w-3 h-3" />
                                                Due for Return: {book.dueDate ? new Date(book.dueDate).toLocaleDateString() : 'N/A'}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </section>
                )}

                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-indigo-50 rounded-lg">
                                <Book className="w-5 h-5 text-indigo-600" />
                            </div>
                            <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight italic">Full Bibliographic Index</h3>
                        </div>
                        <Sparkles className="h-5 w-5 text-indigo-400 opacity-50" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {filteredBooks.length > 0 ? filteredBooks.map((book) => (
                            <Card key={book._id} className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border-none shadow-xl shadow-indigo-100/30 overflow-hidden bg-white">
                                <div className="h-48 w-full bg-slate-50 flex items-center justify-center relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent"></div>
                                    <Book className="w-16 h-16 text-indigo-100 group-hover:scale-125 transition-transform duration-700" />
                                    <Badge className={`absolute top-4 right-4 h-7 px-4 rounded-lg font-black uppercase text-[9px] border-none shadow-lg ${book.status === 'Available' ? "bg-emerald-500" : "bg-gray-400"
                                        }`}>
                                        {book.status}
                                    </Badge>
                                </div>
                                <CardContent className="p-6 space-y-2">
                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">{book.category}</p>
                                    <h3 className="font-black text-gray-900 text-lg leading-tight italic uppercase line-clamp-2">{book.title}</h3>
                                    <p className="text-sm font-bold text-gray-400 italic">By {book.author}</p>
                                </CardContent>
                                <CardFooter className="p-6 pt-0">
                                    <Button
                                        className="w-full h-12 bg-gray-900 hover:bg-indigo-600 transition-all font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg group-active:scale-95 text-white"
                                        disabled={book.status !== 'Available'}
                                    >
                                        Execute Reservation
                                    </Button>
                                </CardFooter>
                            </Card>
                        )) : (
                            <div className="col-span-full p-20 text-center space-y-4">
                                <div className="h-20 w-20 bg-gray-50 rounded-3xl mx-auto flex items-center justify-center opacity-50">
                                    <Book className="h-10 w-10 text-gray-300" />
                                </div>
                                <p className="text-sm font-black text-gray-400 uppercase tracking-widest italic">No match found in bibliographic index.</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </DashboardLayout>
    )
}
