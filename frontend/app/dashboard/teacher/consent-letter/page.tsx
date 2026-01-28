"use client"

import { API_URL } from "@/lib/api-config"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { FileSignature, CheckSquare, Plus, Send, CheckCircle2, Clock } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

export default function ConsentLetterPage() {
    const { toast } = useToast()
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [requests, setRequests] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const fetchRequests = async () => {
        try {
            const token = localStorage.getItem('token')
            const headers = { 'Authorization': `Bearer ${token}` }
            const res = await fetch(`${API_URL}/api/teacher/consent`, { headers })
            const data = await res.json()
            if (data.success) {
                setRequests(data.data)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchRequests()
    }, [])

    const [formData, setFormData] = useState({
        title: '',
        targetClassString: '',
        eventDate: '',
        deadlineDate: '',
        costPerStudent: '',
        description: ''
    })

    const handleInputChange = (e: any) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleCreateRequest = async () => {
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`${API_URL}/api/teacher/consent`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(formData)
            })
            const data = await res.json()
            if (data.success) {
                toast({
                    title: "Request Created",
                    description: "Consent request has been sent to parents.",
                })
                setIsCreateOpen(false)
                fetchRequests()
                setFormData({ title: '', targetClassString: '', eventDate: '', deadlineDate: '', costPerStudent: '', description: '' })
            } else {
                toast({ title: "Error", description: "Failed to create request", variant: "destructive" })
            }
        } catch (err) {
            toast({ title: "Error", description: "Network error", variant: "destructive" })
        }
    }

    const handleViewResponses = (title: string) => {
        toast({
            title: "View Responses",
            description: `Opening responses for ${title}...`
        })
    }

    return (
        <DashboardLayout title="Consent Letter">
            <div className="space-y-6 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Consent Letters</h1>
                        <p className="text-gray-500 mt-1">Manage parental consent requests for trips and events.</p>
                    </div>

                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-indigo-600 hover:bg-indigo-700">
                                <Plus className="w-4 h-4 mr-2" />
                                New Consent Request
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-xl">
                            <DialogHeader>
                                <DialogTitle>Create Consent Request</DialogTitle>
                                <DialogDescription>Send a new permission request to parents.</DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-4 py-4">
                                <div className="col-span-2 space-y-2">
                                    <Label>Event Title</Label>
                                    <Input name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g. Science Museum Visit" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Target Class</Label>
                                    <Select onValueChange={(val) => handleSelectChange('targetClassString', val)}>
                                        <SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="10a">10-A</SelectItem>
                                            <SelectItem value="10b">10-B</SelectItem>
                                            <SelectItem value="all">All Classes</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Cost per Student</Label>
                                    <Input type="number" name="costPerStudent" value={formData.costPerStudent} onChange={handleInputChange} placeholder="0.00" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Event Date</Label>
                                    <Input type="date" name="eventDate" value={formData.eventDate} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Response Deadline</Label>
                                    <Input type="date" name="deadlineDate" value={formData.deadlineDate} onChange={handleInputChange} />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <Label>Description / Details</Label>
                                    <Textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Details about the event..." />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                                <Button onClick={handleCreateRequest}>Send Request</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {requests.map((req) => (
                        <Card key={req._id || req.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-lg font-bold text-gray-900">{req.title}</CardTitle>
                                <Badge className="bg-green-100 text-green-700 hover:bg-green-200">Active</Badge>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-500 mb-4 flex items-center gap-2">
                                    <Clock className="w-4 h-4" /> Due by {req.date}
                                </p>

                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-600">Response Rate</span>
                                            <span className="font-semibold">{Math.round(((req.approved + 0) / req.total) * 100)}%</span>
                                        </div>
                                        <Progress value={((req.approved) / req.total) * 100} className="h-2" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-green-50 p-3 rounded-lg flex items-center gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                                            <div>
                                                <p className="text-xl font-bold text-green-700">{req.approved}</p>
                                                <p className="text-xs text-green-600">Approved</p>
                                            </div>
                                        </div>
                                        <div className="bg-orange-50 p-3 rounded-lg flex items-center gap-3">
                                            <Clock className="w-5 h-5 text-orange-600" />
                                            <div>
                                                <p className="text-xl font-bold text-orange-700">{req.pending}</p>
                                                <p className="text-xs text-orange-600">Pending</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-2">
                                        <Button variant="outline" size="sm" className="text-indigo-600 border-indigo-200 hover:bg-indigo-50" onClick={() => handleViewResponses(req.title)}>View Responses</Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {/* Create New Placeholder Card */}
                    <Card className="border-dashed border-2 flex flex-col items-center justify-center p-6 cursor-pointer hover:bg-gray-50 transition-colors h-full min-h-[300px]" onClick={() => setIsCreateOpen(true)}>
                        <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                            <Send className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Send New Request</h3>
                        <p className="text-sm text-gray-500 text-center max-w-xs mt-1">Create a digital permission slip and send it to parents via the app.</p>
                        <Button variant="ghost" className="mt-4 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">Get Started</Button>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    )
}
