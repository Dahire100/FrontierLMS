"use client"

import { API_URL } from "@/lib/api-config"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { StatCard } from "@/components/super-admin/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Book, Calendar, Clock, RotateCcw, Users, ChevronDown } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

export default function ParentLibrary() {
    const [selectedChild, setSelectedChild] = useState<string>("")
    const [children, setChildren] = useState<any[]>([])
    const [libraryData, setLibraryData] = useState<any>({ current: [], history: [] })
    const [loading, setLoading] = useState(true)

    // Fetch children on mount
    useEffect(() => {
        const fetchChildren = async () => {
            try {
                const token = localStorage.getItem('token')
                const res = await fetch(`${API_URL}/api/parent/dashboard`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                const data = await res.json()
                if (data.success && data.data.children.length > 0) {
                    setChildren(data.data.children)
                    setSelectedChild(data.data.children[0]._id)
                } else {
                    setLoading(false)
                }
            } catch (error) {
                console.error("Failed to fetch children", error)
                setLoading(false)
            }
        }
        fetchChildren()
    }, [])

    // Fetch library data when selected child changes
    useEffect(() => {
        if (!selectedChild) return

        const fetchLibrary = async () => {
            try {
                const token = localStorage.getItem('token')
                const res = await fetch(`${API_URL}/api/parent/child/${selectedChild}/library/history`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                const data = await res.json()

                if (data.success) {
                    const allRecords = Array.isArray(data.data) ? data.data : []
                    const current = allRecords.filter((r: any) => !r.returnDate && (r.status === 'issued' || r.status === 'overdue'))
                    const history = allRecords.filter((r: any) => r.returnDate || r.status === 'returned')

                    setLibraryData({ current, history })
                } else {
                    setLibraryData({ current: [], history: [] })
                }
            } catch (error) {
                console.error("Failed to fetch library data", error)
                setLibraryData({ current: [], history: [] })
            } finally {
                setLoading(false)
            }
        }
        fetchLibrary()
    }, [selectedChild])


    const getSelectedChildName = () => {
        const child = children.find(c => c._id === selectedChild)
        return child ? `${child.firstName} ${child.lastName}` : "Loading..."
    }

    if (loading) {
        return (
            <DashboardLayout title="Library">
                <div className="flex h-screen items-center justify-center">Loading...</div>
            </DashboardLayout>
        )
    }

    const { current, history } = libraryData

    return (
        <DashboardLayout title="Library">
            <div className="space-y-6 animate-in fade-in-50 duration-500">
                {/* Header with Child Selector */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Library Activity
                        </h2>
                        <p className="text-muted-foreground mt-1">
                            Books issued to {getSelectedChildName()}
                        </p>
                    </div>

                    {children.length > 0 && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="min-w-[180px] justify-between shadow-sm">
                                    <span className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-blue-600" />
                                        {getSelectedChildName()}
                                    </span>
                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[200px]">
                                {children.map(child => (
                                    <DropdownMenuItem key={child._id} onClick={() => setSelectedChild(child._id)}>
                                        {child.firstName} {child.lastName}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard
                        title="Currently Issued"
                        value={current.length.toString()}
                        icon={Book}
                        iconColor="text-blue-600"
                        iconBgColor="bg-blue-100"
                    />
                    <StatCard
                        title="Returned This Year"
                        value={history.length.toString()}
                        icon={RotateCcw}
                        iconColor="text-green-600"
                        iconBgColor="bg-green-100"
                    />
                    <StatCard
                        title="Fine Due"
                        value="₹0" // Backend doesn't provide fine explicitly in simple list usually
                        icon={Clock}
                        iconColor="text-red-600"
                        iconBgColor="bg-red-100"
                    />
                </div>

                <Card className="border-none shadow-md">
                    <CardHeader>
                        <CardTitle>Library Records</CardTitle>
                        <CardDescription>View current and past library activity</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="current">
                            <TabsList className="grid w-full grid-cols-2 mb-6">
                                <TabsTrigger value="current">Currently Issued</TabsTrigger>
                                <TabsTrigger value="history">History</TabsTrigger>
                            </TabsList>

                            <TabsContent value="current" className="space-y-4">
                                {current.length > 0 ? current.map((book: any, index: number) => (
                                    <div key={book._id || index} className="p-4 border rounded-xl hover:shadow-md transition-all flex item-start gap-4">
                                        <div className="h-16 w-12 bg-gray-200 rounded flex items-center justify-center text-gray-400">
                                            <Book className="h-6 w-6" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-900">{book.bookId?.title || "Unknown Title"}</h4>
                                            <p className="text-sm text-gray-500">{book.bookId?.author || "Unknown Author"}</p>
                                            <div className="flex items-center gap-4 mt-2 text-xs font-medium">
                                                <span className="text-green-600 bg-green-50 px-2 py-1 rounded">
                                                    Issued: {new Date(book.issueDate).toLocaleDateString()}
                                                </span>
                                                <span className="text-red-600 bg-red-50 px-2 py-1 rounded">
                                                    Due: {new Date(book.dueDate).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-8 text-gray-500">No books currently issued.</div>
                                )}
                            </TabsContent>

                            <TabsContent value="history" className="space-y-4">
                                {history.length > 0 ? history.map((book: any, index: number) => (
                                    <div key={book._id || index} className="p-4 border rounded-xl hover:shadow-sm transition-all flex item-start gap-4 bg-gray-50/50">
                                        <div className="h-16 w-12 bg-gray-200 rounded flex items-center justify-center text-gray-400">
                                            <Book className="h-6 w-6" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-700">{book.bookId?.title || "Unknown Title"}</h4>
                                            <p className="text-sm text-gray-500">{book.bookId?.author || "Unknown Author"}</p>
                                            <div className="flex items-center gap-4 mt-2 text-xs font-medium">
                                                <span className="text-gray-600">Returned: {new Date(book.returnDate).toLocaleDateString()}</span>
                                                <span className={`px-2 py-1 rounded ${book.fine > 0 ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'}`}>
                                                    {book.fine > 0 ? `Late (Fine: ₹${book.fine})` : 'Returned on time'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-8 text-gray-500">No history available.</div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
