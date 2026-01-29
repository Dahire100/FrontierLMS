"use client"

import { API_URL } from "@/lib/api-config"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Users, Phone, FileText, Plus, Search, Calendar, MessageSquare, Mail } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function FrontOfficePage() {
    const { toast } = useToast()
    const [isVisitorDialogOpen, setIsVisitorDialogOpen] = useState(false)
    const [visitors, setVisitors] = useState<any[]>([])
    const [enquiries, setEnquiries] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Fetch Data
    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token')
            const headers = { 'Authorization': `Bearer ${token}` }

            const [visitorsRes, enquiriesRes] = await Promise.all([
                fetch(`${API_URL}/api/teacher/front-office/visitors`, { headers }),
                fetch(`${API_URL}/api/teacher/front-office/enquiries`, { headers })
            ])

            const visitorsData = await visitorsRes.json()
            const enquiriesData = await enquiriesRes.json()

            if (visitorsData.success) setVisitors(visitorsData.data)
            if (enquiriesData.success) setEnquiries(enquiriesData.data)
        } catch (error) {
            console.error("Failed to fetch front office data", error)
            toast({ title: "Error", description: "Failed to load data", variant: "destructive" })
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        purpose: '',
        date: '',
        inTime: '',
        outTime: '',
        note: ''
    })

    // Update form handlers to use state
    const handleInputChange = (e: any) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleReasonChange = (value: string) => {
        setFormData(prev => ({ ...prev, purpose: value }))
    }

    const handleAddVisitor = async () => {
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`${API_URL}/api/teacher/front-office/visitors`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            })
            const data = await res.json()

            if (data.success) {
                toast({
                    title: "Visitor Added",
                    description: "The visitor has been successfully logged.",
                })
                setIsVisitorDialogOpen(false)
                fetchData() // Refresh list
                setFormData({ name: '', phone: '', purpose: '', date: '', inTime: '', outTime: '', note: '' })
            } else {
                toast({ title: "Error", description: data.error || "Failed to add visitor", variant: "destructive" })
            }
        } catch (error) {
            toast({ title: "Error", description: "Network error", variant: "destructive" })
        }
    }

    const handleAction = (action: string) => {
        toast({
            title: action,
            description: "Action has been triggered successfully.",
        })
    }

    return (
        <DashboardLayout title="Front Office">
            <div className="space-y-6 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Front Office</h1>
                        <p className="text-gray-500 mt-1">Manage visitor logs, admission enquiries, and postal exchanges efficiently.</p>
                    </div>
                    <div className="flex gap-2">
                        <Dialog open={isVisitorDialogOpen} onOpenChange={setIsVisitorDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-indigo-600 hover:bg-indigo-700">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Visitor
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Add New Visitor</DialogTitle>
                                    <DialogDescription>Enter the details of the visitor.</DialogDescription>
                                </DialogHeader>
                                <div className="grid grid-cols-2 gap-6 py-4">
                                    <div className="space-y-2">
                                        <Label>Visitor Name</Label>
                                        <Input name="name" value={formData.name} onChange={handleInputChange} placeholder="Enter name" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Phone Number</Label>
                                        <Input name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Enter contact info" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Purpose</Label>
                                        <Select onValueChange={handleReasonChange}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Purpose" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="parent_meeting">Parent Meeting</SelectItem>
                                                <SelectItem value="vendor">Vendor</SelectItem>
                                                <SelectItem value="enquiry">Admission Enquiry</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Date</Label>
                                        <Input type="date" name="date" value={formData.date} onChange={handleInputChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>In Time</Label>
                                        <Input type="time" name="inTime" value={formData.inTime} onChange={handleInputChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Out Time</Label>
                                        <Input type="time" name="outTime" value={formData.outTime} onChange={handleInputChange} />
                                    </div>
                                    <div className="col-span-2 space-y-2">
                                        <Label>Note</Label>
                                        <Textarea name="note" value={formData.note} onChange={handleInputChange} placeholder="Additional details..." />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsVisitorDialogOpen(false)}>Cancel</Button>
                                    <Button onClick={handleAddVisitor}>Save Visitor</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-l-4 border-l-blue-500 shadow-sm">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Today's Visitors</p>
                                <h3 className="text-3xl font-bold text-gray-900 mt-1">{visitors.length}</h3>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                                <Users className="w-6 h-6" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-green-500 shadow-sm">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Open Enquiries</p>
                                <h3 className="text-3xl font-bold text-gray-900 mt-1">{enquiries.length}</h3>
                            </div>
                            <div className="p-3 bg-green-50 rounded-full text-green-600">
                                <Phone className="w-6 h-6" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-orange-500 shadow-sm">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Postal Dispatch</p>
                                <h3 className="text-3xl font-bold text-gray-900 mt-1">3</h3>
                            </div>
                            <div className="p-3 bg-orange-50 rounded-full text-orange-600">
                                <FileText className="w-6 h-6" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="visitors" className="w-full">
                    <TabsList className="w-full justify-start bg-transparent p-0 border-b rounded-none mb-6">
                        <TabsTrigger value="visitors" className="data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-6 py-3">Visitor Log</TabsTrigger>
                        <TabsTrigger value="enquiry" className="data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-6 py-3">Admission Enquiry</TabsTrigger>
                        <TabsTrigger value="postal" className="data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-6 py-3">Postal Record</TabsTrigger>
                    </TabsList>

                    <TabsContent value="visitors" className="space-y-4">
                        <div className="flex justify-between items-center bg-white p-4 rounded-lg border shadow-sm">
                            <div className="relative w-72">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <Input placeholder="Search visitors..." className="pl-9" />
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => handleAction("Filter applied")}><Calendar className="w-4 h-4 mr-2" /> Filter Date</Button>
                            </div>
                        </div>

                        <Card>
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50">
                                        <TableHead>Visitor Name</TableHead>
                                        <TableHead>Purpose</TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead>Date & Time</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {visitors.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center">No visitors found</TableCell></TableRow> : visitors.map((visitor: any) => (
                                        <TableRow key={visitor._id || visitor.id}>
                                            <TableCell className="font-medium">{visitor.name}</TableCell>
                                            <TableCell>{visitor.purpose}</TableCell>
                                            <TableCell>{visitor.contact}</TableCell>
                                            <TableCell>
                                                <div className="text-sm">{visitor.date ? new Date(visitor.date).toLocaleDateString() : '-'}</div>
                                                <div className="text-xs text-gray-500">{visitor.time || visitor.inTime}</div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={visitor.status === 'Checked In' ? 'default' : 'secondary'} className={visitor.status === 'Checked In' ? 'bg-green-600' : ''}>
                                                    {visitor.status || 'Visited'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button size="sm" variant="ghost" onClick={() => handleAction("Viewing details")}>Details</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    </TabsContent>

                    <TabsContent value="enquiry" className="space-y-4">
                        <Card>
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50">
                                        <TableHead>Name</TableHead>
                                        <TableHead>Class</TableHead>
                                        <TableHead>Source</TableHead>
                                        <TableHead>Enquiry Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {enquiries.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center">No enquiries found</TableCell></TableRow> : enquiries.map((enquiry: any) => (
                                        <TableRow key={enquiry._id || enquiry.id}>
                                            <TableCell className="font-medium">{enquiry.studentName || enquiry.name}</TableCell>
                                            <TableCell>{enquiry.classApplyingFor || enquiry.class}</TableCell>
                                            <TableCell>{enquiry.source || 'Direct'}</TableCell>
                                            <TableCell>{enquiry.enquiryDate ? new Date(enquiry.enquiryDate).toLocaleDateString() : '-'}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="border-orange-200 text-orange-700 bg-orange-50">{enquiry.status}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleAction("Calling...")}><Phone className="h-4 w-4" /></Button>
                                                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleAction("Opening chat...")}><MessageSquare className="h-4 w-4" /></Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    </TabsContent>

                    <TabsContent value="postal">
                        <div className="text-center py-12 bg-white rounded-lg border shadow-sm">
                            <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <h3 className="text-lg font-medium text-gray-900">No Postal Records Found</h3>
                            <p className="text-gray-500 max-w-sm mx-auto mt-1">There are no incoming or outgoing postal records for the selected period.</p>
                            <Button variant="outline" className="mt-4" onClick={() => handleAction("Checking archives...")}>Check Archives</Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    )
}
