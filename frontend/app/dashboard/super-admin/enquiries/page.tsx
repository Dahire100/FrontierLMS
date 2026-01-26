"use client"

import { API_URL } from "@/lib/api-config"
import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { ProtectedRoute } from "@/components/protected-route"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Mail, Phone, Building2, ExternalLink, Calendar, MessageSquare } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

interface Enquiry {
    _id: string
    fullName: string
    email: string
    phone: string
    institute: string
    website?: string
    solution?: string
    message?: string
    status: 'new' | 'contacted' | 'converted' | 'closed'
    createdAt: string
}

export default function EnquiriesPage() {
    return (
        <ProtectedRoute allowedRoles={["super_admin"]}>
            <EnquiriesContent />
        </ProtectedRoute>
    )
}

function EnquiriesContent() {
    const [enquiries, setEnquiries] = useState<Enquiry[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchEnquiries()
    }, [])

    const fetchEnquiries = async () => {
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`${API_URL}/api/sales-enquiry`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setEnquiries(data)
            } else {
                console.error("Failed to fetch enquiries")
                toast.error("Failed to fetch enquiries")
            }
        } catch (error) {
            console.error("Error fetching enquiries", error)
            toast.error("Network error")
        } finally {
            setLoading(false)
        }
    }

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`${API_URL}/api/sales-enquiry/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            })

            if (res.ok) {
                toast.success(`Status updated to ${newStatus}`)
                fetchEnquiries()
            } else {
                toast.error("Failed to update status")
            }
        } catch (error) {
            console.error(error)
            toast.error("Error updating status")
        }
    }

    const handleContact = (enquiry: Enquiry) => {
        window.location.href = `mailto:${enquiry.email}?subject=Regarding your enquiry at Frontier LMS`
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'new': return 'bg-blue-100 text-blue-700'
            case 'contacted': return 'bg-yellow-100 text-yellow-700'
            case 'converted': return 'bg-green-100 text-green-700'
            case 'closed': return 'bg-gray-100 text-gray-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    if (loading) return (
        <DashboardLayout title="Sales Enquiries">
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        </DashboardLayout>
    )

    return (
        <DashboardLayout title="Sales Enquiries">
            <div className="space-y-6 max-w-6xl mx-auto p-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Sales Enquiries</h2>
                        <p className="text-muted-foreground mt-1">Manage incoming leads and requests</p>
                    </div>
                    <Badge variant="outline" className="px-3 py-1 text-sm bg-blue-50 text-blue-700 border-blue-200">
                        {enquiries.length} Total Leads
                    </Badge>
                </div>

                {enquiries.length === 0 ? (
                    <Card className="border-dashed py-12 flex flex-col items-center justify-center bg-gray-50/50">
                        <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <MessageSquare className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">No enquiries yet</h3>
                        <p className="text-gray-500 mt-1">New enquiries from the website will appear here.</p>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {enquiries.map((enquiry) => (
                            <Card key={enquiry._id} className="group hover:shadow-md transition-all duration-200 border-l-4 border-l-blue-500">
                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
                                        <div className="flex-1 space-y-4">
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-lg font-bold text-gray-900">{enquiry.fullName}</h3>
                                                    <Badge className={`${getStatusColor(enquiry.status)} capitalize shadow-none`}>
                                                        {enquiry.status}
                                                    </Badge>
                                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {formatDistanceToNow(new Date(enquiry.createdAt), { addSuffix: true })}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-blue-600 font-medium mt-1">
                                                    <Building2 className="h-4 w-4" />
                                                    {enquiry.institute}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-2 rounded-md">
                                                    <Mail className="h-4 w-4 text-gray-400" />
                                                    {enquiry.email}
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-2 rounded-md">
                                                    <Phone className="h-4 w-4 text-gray-400" />
                                                    {enquiry.phone}
                                                </div>
                                            </div>

                                            {enquiry.website && (
                                                <a href={enquiry.website.startsWith('http') ? enquiry.website : `https://${enquiry.website}`}
                                                    target="_blank" rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">
                                                    <ExternalLink className="h-3 w-3" /> Visit Website
                                                </a>
                                            )}

                                            {enquiry.message && (
                                                <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 text-gray-700 text-sm italic">
                                                    "{enquiry.message}"
                                                </div>
                                            )}

                                            {enquiry.solution && (
                                                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                                    Interested in: <span className="text-blue-600">{enquiry.solution}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col gap-2 min-w-[120px]">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="outline" size="sm" className="w-full">
                                                        Update Status
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleStatusUpdate(enquiry._id, 'new')}>New</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleStatusUpdate(enquiry._id, 'contacted')}>Contacted</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleStatusUpdate(enquiry._id, 'converted')}>Converted</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleStatusUpdate(enquiry._id, 'closed')}>Closed</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>

                                            <Button
                                                size="sm"
                                                className="w-full bg-blue-600 hover:bg-blue-700"
                                                onClick={() => handleContact(enquiry)}
                                            >
                                                Contact
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
