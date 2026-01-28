"use client"

import { API_URL } from "@/lib/api-config"
import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
    Search,
    FileText,
    Loader2,
    Plus,
    Eye,
    Edit,
    Calendar,
    BookOpen,
    Filter,
    ChevronLeft,
    ChevronRight,
    Sparkles
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function TopicPage() {
    const { toast } = useToast()
    const [classes, setClasses] = useState<any[]>([])
    const [teachers, setTeachers] = useState<any[]>([])
    const [topics, setTopics] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searching, setSearching] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [viewDialogOpen, setViewDialogOpen] = useState(false)
    const [selectedTopic, setSelectedTopic] = useState<any>(null)
    const [filters, setFilters] = useState({
        classId: "",
        subject: ""
    })
    const [newTopic, setNewTopic] = useState({
        topic: "",
        description: "",
        classId: "",
        subject: "",
        teacherId: ""
    })
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [editTopic, setEditTopic] = useState({
        _id: "",
        topic: "",
        subject: "",
        classId: "",
        notes: "",
        status: "planned",
        duration: 45
    })

    useEffect(() => {
        fetchClasses()
        fetchTeachers()
        fetchAllTopics()
    }, [])

    const fetchClasses = async () => {
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/classes`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const result = await res.json()
            if (result.success && Array.isArray(result.data)) {
                setClasses(result.data)
            }
        } catch (err) {
            toast({ title: "Error", description: "Failed to load classes", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    const fetchTeachers = async () => {
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/teachers`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const data = await res.json()
            if (Array.isArray(data)) {
                setTeachers(data)
            }
        } catch (err) {
            console.error("Error loading teachers:", err)
        }
    }

    const fetchAllTopics = async () => {
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/lesson-planner/topics/list`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const result = await res.json()
            if (result.success && Array.isArray(result.data)) {
                setTopics(result.data)
            }
        } catch (err) {
            console.error("Error loading topics:", err)
        }
    }

    const handleSearch = async () => {
        setSearching(true)
        try {
            const token = localStorage.getItem("token")
            const params = new URLSearchParams()
            if (filters.classId) params.append("classId", filters.classId)
            if (filters.subject) params.append("subject", filters.subject)

            const res = await fetch(`${API_URL}/api/lesson-planner/topics/list?${params.toString()}`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const result = await res.json()
            console.log("Topics result:", result)
            if (result.success && Array.isArray(result.data)) {
                setTopics(result.data)
                toast({ title: "Success", description: `Found ${result.data.length} topics` })
            } else {
                setTopics([])
                toast({ title: "Info", description: "No topics found" })
            }
        } catch (err) {
            console.error("Error loading topics:", err)
            toast({ title: "Error", description: "Failed to load topics", variant: "destructive" })
        } finally {
            setSearching(false)
        }
    }

    const handleAddTopic = async () => {
        if (!newTopic.topic || !newTopic.classId || !newTopic.subject) {
            toast({ title: "Required", description: "Please fill all required fields", variant: "destructive" })
            return
        }

        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/lesson-planner`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    topic: newTopic.topic,
                    notes: newTopic.description,
                    classId: newTopic.classId,
                    subject: newTopic.subject,
                    lessonDate: new Date().toISOString(),
                    status: 'planned'
                })
            })

            const result = await res.json()
            if (res.ok) {
                toast({ title: "Success", description: "Topic added successfully" })
                setDialogOpen(false)
                setNewTopic({ topic: "", description: "", classId: "", subject: "", teacherId: "" })
                fetchAllTopics()
            } else {
                console.error("Add topic error:", result)
                toast({ title: "Error", description: result.error || "Failed to add topic", variant: "destructive" })
            }
        } catch (err) {
            console.error("Network error:", err)
            toast({ title: "Error", description: "Network error", variant: "destructive" })
        }
    }

    const openEditDialog = (topic: any) => {
        setEditTopic({
            _id: topic._id,
            topic: topic.topic || "",
            subject: topic.subject || "",
            classId: topic.classId?._id || "",
            notes: topic.notes || "",
            status: topic.status || "planned",
            duration: topic.duration || 45
        })
        setViewDialogOpen(false)
        setEditDialogOpen(true)
    }

    const handleUpdateTopic = async () => {
        if (!editTopic.topic || !editTopic.subject) {
            toast({ title: "Required", description: "Please fill topic and subject", variant: "destructive" })
            return
        }

        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/api/lesson-planner/${editTopic._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    topic: editTopic.topic,
                    subject: editTopic.subject,
                    notes: editTopic.notes,
                    status: editTopic.status,
                    duration: editTopic.duration
                })
            })

            if (res.ok) {
                toast({ title: "Success", description: "Topic updated successfully" })
                setEditDialogOpen(false)
                fetchAllTopics()
            } else {
                const result = await res.json()
                toast({ title: "Error", description: result.error || "Failed to update topic", variant: "destructive" })
            }
        } catch (err) {
            console.error("Update error:", err)
            toast({ title: "Error", description: "Network error", variant: "destructive" })
        }
    }

    return (
        <DashboardLayout title="Topics">
            <div className="space-y-8 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg">
                                <FileText className="h-6 w-6 text-white" />
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Topics</h1>
                        </div>
                        <p className="text-gray-500 ml-14">Browse and organize topics for each subject</p>
                    </div>

                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all rounded-xl h-12 px-6">
                                <Plus className="h-5 w-5 mr-2" />
                                Add New Topic
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg rounded-3xl">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-3 text-xl">
                                    <div className="p-2 bg-emerald-100 rounded-xl">
                                        <Sparkles className="h-5 w-5 text-emerald-600" />
                                    </div>
                                    Add New Topic
                                </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-5 pt-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">Topic Name *</Label>
                                    <Input
                                        value={newTopic.topic}
                                        onChange={(e) => setNewTopic({ ...newTopic, topic: e.target.value })}
                                        placeholder="Enter topic name"
                                        className="h-12 rounded-xl"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold">Class *</Label>
                                        <Select value={newTopic.classId} onValueChange={(val) => setNewTopic({ ...newTopic, classId: val })}>
                                            <SelectTrigger className="h-12 rounded-xl">
                                                <SelectValue placeholder="Select" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {classes.map((cls) => (
                                                    <SelectItem key={cls._id} value={cls._id}>
                                                        {cls.name}-{cls.section}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold">Subject *</Label>
                                        <Input
                                            value={newTopic.subject}
                                            onChange={(e) => setNewTopic({ ...newTopic, subject: e.target.value })}
                                            placeholder="Subject"
                                            className="h-12 rounded-xl"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">Description</Label>
                                    <Textarea
                                        value={newTopic.description}
                                        onChange={(e) => setNewTopic({ ...newTopic, description: e.target.value })}
                                        placeholder="Enter topic description..."
                                        rows={3}
                                        className="rounded-xl resize-none"
                                    />
                                </div>
                                <Button onClick={handleAddTopic} className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl">
                                    <Plus className="h-5 w-5 mr-2" />
                                    Add Topic
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Search Filters */}
                <Card className="border-0 shadow-xl rounded-3xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200/50 py-5">
                        <CardTitle className="text-base font-bold flex items-center gap-2 text-gray-800">
                            <Filter className="h-5 w-5 text-emerald-500" />
                            Search Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Class <span className="text-red-500">*</span>
                                </Label>
                                <Select value={filters.classId} onValueChange={(val) => setFilters({ ...filters, classId: val })}>
                                    <SelectTrigger className="h-12 bg-gray-50 border-gray-200 rounded-xl hover:bg-white transition-colors">
                                        <SelectValue placeholder="Select Class" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classes.map((cls) => (
                                            <SelectItem key={cls._id} value={cls._id}>
                                                Class {cls.name}-{cls.section}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Subject <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    value={filters.subject}
                                    onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                                    placeholder="Enter subject name"
                                    className="h-12 bg-gray-50 border-gray-200 rounded-xl hover:bg-white transition-colors"
                                />
                            </div>

                            <div className="flex items-end">
                                <Button
                                    onClick={handleSearch}
                                    disabled={searching}
                                    className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold"
                                >
                                    {searching ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Search className="h-5 w-5 mr-2" />}
                                    {searching ? "Searching..." : "Search Topics"}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Results */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900">
                            {topics.length > 0 ? `${topics.length} Topics Found` : 'Topic List'}
                        </h2>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
                        </div>
                    ) : topics.length === 0 ? (
                        <Card className="border-0 shadow-lg rounded-3xl">
                            <CardContent className="py-16 text-center">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <FileText className="h-10 w-10 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Topics Found</h3>
                                <p className="text-gray-500 max-w-md mx-auto mb-6">
                                    Select a class and subject to view topics, or add a new topic to get started.
                                </p>
                                <Button onClick={() => setDialogOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 rounded-xl">
                                    <Plus className="h-5 w-5 mr-2" />
                                    Add First Topic
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {topics.map((topic, index) => (
                                <Card key={topic._id || index} className="group border-0 shadow-lg hover:shadow-2xl rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1">
                                    <div className="h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
                                    <CardContent className="p-6 space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-gray-900 text-lg truncate">{topic.topic}</h3>
                                                <p className="text-sm text-gray-500">{topic.subject}</p>
                                            </div>
                                            <Button variant="ghost" size="sm" className="rounded-xl hover:bg-emerald-50">
                                                <Edit className="h-4 w-4 text-gray-400" />
                                            </Button>
                                        </div>

                                        <div className="flex items-center gap-4 flex-wrap">
                                            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
                                                <BookOpen className="h-4 w-4 text-emerald-500" />
                                                <span>{topic.classId?.name || 'N/A'}-{topic.classId?.section || ''}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
                                                <Calendar className="h-4 w-4 text-teal-500" />
                                                <span>{topic.lessonDate ? new Date(topic.lessonDate).toLocaleDateString() : 'Not set'}</span>
                                            </div>
                                        </div>

                                        <Button
                                            variant="outline"
                                            className="w-full h-11 rounded-xl border-gray-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors"
                                            onClick={() => {
                                                setSelectedTopic(topic)
                                                setViewDialogOpen(true)
                                            }}
                                        >
                                            <Eye className="h-4 w-4 mr-2" />
                                            View Topic Details
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {topics.length > 0 && (
                        <div className="flex items-center justify-center gap-2 pt-6">
                            <Button variant="outline" size="sm" disabled className="rounded-xl">
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 rounded-xl min-w-[40px]">1</Button>
                            <Button variant="outline" size="sm" disabled className="rounded-xl">
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* View Topic Details Dialog */}
            <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                <DialogContent className="sm:max-w-lg rounded-3xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 text-xl">
                            <div className="p-2 bg-emerald-100 rounded-xl">
                                <FileText className="h-5 w-5 text-emerald-600" />
                            </div>
                            Topic Details
                        </DialogTitle>
                    </DialogHeader>
                    {selectedTopic && (
                        <div className="space-y-5 pt-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-gray-500 uppercase">Topic Name</Label>
                                <p className="text-lg font-semibold text-gray-900">{selectedTopic.topic}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-gray-500 uppercase">Class</Label>
                                    <p className="font-medium text-gray-700">
                                        {selectedTopic.classId?.name || 'N/A'}-{selectedTopic.classId?.section || ''}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-gray-500 uppercase">Subject</Label>
                                    <p className="font-medium text-gray-700">{selectedTopic.subject}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-gray-500 uppercase">Date</Label>
                                    <p className="font-medium text-gray-700">
                                        {selectedTopic.lessonDate ? new Date(selectedTopic.lessonDate).toLocaleDateString() : 'Not set'}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-gray-500 uppercase">Duration</Label>
                                    <p className="font-medium text-gray-700">{selectedTopic.duration || 45} mins</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-gray-500 uppercase">Status</Label>
                                <span className={`inline-block px-3 py-1.5 rounded-full text-xs uppercase font-bold ${selectedTopic.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                    selectedTopic.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                                        'bg-amber-100 text-amber-700'
                                    }`}>
                                    {selectedTopic.status || 'planned'}
                                </span>
                            </div>

                            {selectedTopic.objectives?.length > 0 && (
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-gray-500 uppercase">Objectives</Label>
                                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                                        {selectedTopic.objectives.map((obj: string, i: number) => (
                                            <li key={i}>{obj}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {selectedTopic.notes && (
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-gray-500 uppercase">Notes</Label>
                                    <p className="text-gray-700">{selectedTopic.notes}</p>
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <Button
                                    variant="outline"
                                    className="flex-1 rounded-xl"
                                    onClick={() => setViewDialogOpen(false)}
                                >
                                    Close
                                </Button>
                                <Button
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                                    onClick={() => openEditDialog(selectedTopic)}
                                >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Topic
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Edit Topic Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="sm:max-w-lg rounded-3xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 text-xl">
                            <div className="p-2 bg-blue-100 rounded-xl">
                                <Edit className="h-5 w-5 text-blue-600" />
                            </div>
                            Edit Topic
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-5 pt-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold">Topic Name *</Label>
                            <Input
                                value={editTopic.topic}
                                onChange={(e) => setEditTopic({ ...editTopic, topic: e.target.value })}
                                placeholder="Enter topic name"
                                className="h-12 rounded-xl"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-semibold">Subject *</Label>
                            <Input
                                value={editTopic.subject}
                                onChange={(e) => setEditTopic({ ...editTopic, subject: e.target.value })}
                                placeholder="Subject name"
                                className="h-12 rounded-xl"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Status</Label>
                                <Select value={editTopic.status} onValueChange={(val) => setEditTopic({ ...editTopic, status: val })}>
                                    <SelectTrigger className="h-12 rounded-xl">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="planned">Planned</SelectItem>
                                        <SelectItem value="in-progress">In Progress</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Duration (mins)</Label>
                                <Input
                                    type="number"
                                    value={editTopic.duration}
                                    onChange={(e) => setEditTopic({ ...editTopic, duration: parseInt(e.target.value) || 45 })}
                                    className="h-12 rounded-xl"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-semibold">Notes</Label>
                            <Textarea
                                value={editTopic.notes}
                                onChange={(e) => setEditTopic({ ...editTopic, notes: e.target.value })}
                                placeholder="Add notes..."
                                rows={3}
                                className="rounded-xl resize-none"
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button
                                variant="outline"
                                className="flex-1 rounded-xl"
                                onClick={() => setEditDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-xl"
                                onClick={handleUpdateTopic}
                            >
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    )
}
