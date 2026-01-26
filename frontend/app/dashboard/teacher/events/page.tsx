"use client"

import { API_URL } from "@/lib/api-config"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, MapPin, Clock, Users, ChevronRight, Plus } from "lucide-react"
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

export default function EventsPage() {
    const { toast } = useToast()
    const [isProposeOpen, setIsProposeOpen] = useState(false)
    const [events, setEvents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const fetchEvents = async () => {
        try {
            const token = localStorage.getItem('token')
            const headers = { 'Authorization': `Bearer ${token}` }
            const res = await fetch(`${API_URL}/api/teacher/events`, { headers })
            const data = await res.json()
            if (data.success) {
                setEvents(data.data)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchEvents()
    }, [])

    const [formData, setFormData] = useState({
        title: '',
        type: '',
        date: '',
        startTime: '',
        endTime: '',
        venue: '',
        description: ''
    })

    const handleInputChange = (e: any) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleProposeEvent = async () => {
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`${API_URL}/api/teacher/events/propose`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(formData)
            })
            const data = await res.json()
            if (data.success) {
                toast({
                    title: "Proposal Submitted",
                    description: "Your event proposal has been sent to the admin for approval.",
                })
                setIsProposeOpen(false)
                fetchEvents()
                setFormData({ title: '', type: '', date: '', startTime: '', endTime: '', venue: '', description: '' })
            } else {
                toast({ title: "Error", description: "Failed to propose event", variant: "destructive" })
            }
        } catch (err) {
            toast({ title: "Error", description: "Network error", variant: "destructive" })
        }
    }

    const [activeFilter, setActiveFilter] = useState("all")

    const handleFilter = (type: string) => {
        setActiveFilter(type)
        toast({
            title: "Filtering Events",
            description: `Showing ${type === 'all' ? 'All' : type} events`
        })
    }

    const filteredEvents = events.filter(event => {
        if (activeFilter === 'all') return true;

        const type = (event.eventType || event.type || '').toLowerCase();
        const d = event.eventDate ? new Date(event.eventDate) : (event.date ? new Date(event.date) : new Date());
        const isSunday = d.getDay() === 0;

        if (activeFilter === 'Holiday') return type === 'holiday' || isSunday;
        if (activeFilter === 'Exam') return type === 'exam' || type.includes('exam');
        if (activeFilter === 'Activity') return !['holiday', 'exam'].includes(type) && !isSunday;

        return true;
    });

    return (
        <DashboardLayout title="Event Management">
            <div className="space-y-8 max-w-7xl mx-auto">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Event Management</h1>
                        <p className="text-gray-500 mt-1">Stay updated with upcoming school activities and schedules.</p>
                    </div>

                    <Dialog open={isProposeOpen} onOpenChange={setIsProposeOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-indigo-600 hover:bg-indigo-700">
                                <Plus className="w-4 h-4 mr-2" /> Propose Event
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-xl">
                            <DialogHeader>
                                <DialogTitle>Propose New Event</DialogTitle>
                                <DialogDescription>Submit a request for a class or school event.</DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-4 py-4">
                                <div className="col-span-2 space-y-2">
                                    <Label>Event Title</Label>
                                    <Input name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g. Class Picnic, Science Fair" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Event Type</Label>
                                    <Select onValueChange={(val) => handleSelectChange('type', val)}>
                                        <SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="academic">Academic</SelectItem>
                                            <SelectItem value="sports">Sports</SelectItem>
                                            <SelectItem value="cultural">Cultural</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Proposed Date</Label>
                                    <Input type="date" name="date" value={formData.date} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Start Time</Label>
                                    <Input type="time" name="startTime" value={formData.startTime} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label>End Time</Label>
                                    <Input type="time" name="endTime" value={formData.endTime} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Venue / Location</Label>
                                    <Input name="venue" value={formData.venue} onChange={handleInputChange} placeholder="e.g. Auditorium" />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <Label>Description / Purpose</Label>
                                    <Textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Describe the event and its purpose..." />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsProposeOpen(false)}>Cancel</Button>
                                <Button onClick={handleProposeEvent}>Submit Proposal</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Event List */}
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <div className="w-2 h-8 bg-indigo-600 rounded"></div>
                            {activeFilter === 'all' ? 'Upcoming Events' : `${activeFilter} Events`}
                            {activeFilter !== 'all' && (
                                <Button variant="link" onClick={() => handleFilter('all')} className="text-sm font-normal text-indigo-600 ml-auto">
                                    Viewer All
                                </Button>
                            )}
                        </h2>

                        {filteredEvents.length === 0 ? <p className="text-gray-500 italic">No events found matching this filter.</p> : filteredEvents.map((event: any) => {
                            const d = event.eventDate ? new Date(event.eventDate) : (event.date ? new Date(event.date) : new Date())
                            const month = d.toLocaleString('default', { month: 'short' }).toUpperCase()
                            const day = d.getDate()

                            return (
                                <Card key={event._id || event.id} className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-indigo-600 cursor-pointer" onClick={() => toast({ title: event.title, description: "Viewing event details..." })}>
                                    <CardContent className="p-0">
                                        <div className="flex flex-col sm:flex-row">
                                            <div className="p-6 bg-indigo-50 flex flex-col items-center justify-center min-w-[120px] border-r border-indigo-100">
                                                <span className="text-lg font-semibold text-indigo-600">{month}</span>
                                                <span className="text-4xl font-bold text-gray-900">{day}</span>
                                            </div>
                                            <div className="p-6 flex-1">
                                                <div className="flex justify-between items-start mb-2">
                                                    <Badge variant="secondary" className="mb-2">{event.eventType || event.type}</Badge>
                                                    {event.status === 'pending' && <Badge variant="outline" className="text-orange-500 border-orange-500 ml-2">Pending</Badge>}
                                                </div>
                                                <h3 className="text-2xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors mb-2">{event.title}</h3>
                                                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                                                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {event.startTime} - {event.endTime}</span>
                                                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {event.venue || event.location || 'TBD'}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <Users className="w-4 h-4" />
                                                    <span>{event.targetAudience?.join(', ') || 'General'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Filter Events</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button variant="ghost" className="w-full justify-start font-normal hover:bg-indigo-50 hover:text-indigo-600" onClick={() => handleFilter("Holiday")}>
                                    <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div> Holidays
                                </Button>
                                <Button variant="ghost" className="w-full justify-start font-normal hover:bg-indigo-50 hover:text-indigo-600" onClick={() => handleFilter("Exam")}>
                                    <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div> Exams
                                </Button>
                                <Button variant="ghost" className="w-full justify-start font-normal hover:bg-indigo-50 hover:text-indigo-600" onClick={() => handleFilter("Activity")}>
                                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div> Activities
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-purple-900 to-indigo-900 text-white border-none">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-bold mb-2">Need to organize an event?</h3>
                                <p className="text-indigo-200 text-sm mb-4">Teachers can propose class-level activities for approval.</p>
                                <Button className="w-full bg-white text-indigo-900 hover:bg-indigo-50" onClick={() => setIsProposeOpen(true)}>Propose Event</Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
