"use client"

import { API_URL } from "@/lib/api-config"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, ClipboardCheck, FileQuestion, BarChart3, Clock } from "lucide-react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"

export default function EvaluationPage() {
    const { toast } = useToast()
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [assessments, setAssessments] = useState<any[]>([])
    const [classes, setClasses] = useState<any[]>([])

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token')
            const headers = { 'Authorization': `Bearer ${token}` }

            const [assessmentsRes, classesRes] = await Promise.all([
                fetch(`${API_URL}/api/teacher/evaluation/assessments`, { headers }),
                fetch(`${API_URL}/api/teacher/classes`, { headers })
            ])

            const assessmentsData = await assessmentsRes.json()
            const classesData = await classesRes.json()

            if (assessmentsData.success) setAssessments(assessmentsData.data)
            if (classesData.success) setClasses(classesData.data)
        } catch (err) {
            console.error(err)
            toast({ title: "Error", description: "Failed to load data", variant: "destructive" })
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const [formData, setFormData] = useState({
        title: '',
        subject: '',
        class: '',
        duration: '',
        startDate: '',
        totalMarks: '',
        instructions: ''
    })

    const handleInputChange = (e: any) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleCreateAssessment = async () => {
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`${API_URL}/api/teacher/evaluation/assessments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(formData)
            })
            const data = await res.json()
            if (data.success) {
                toast({
                    title: "Assessment Created",
                    description: "The new assessment has been scheduled."
                })
                setIsDialogOpen(false)
                fetchData()
                setFormData({ title: '', subject: '', class: '', duration: '', startDate: '', totalMarks: '', instructions: '' })
            } else {
                toast({ title: "Error", description: "Failed to create assessment", variant: "destructive" })
            }
        } catch (err) {
            toast({ title: "Error", description: "Network error", variant: "destructive" })
        }
    }

    const handleViewSubmissions = (title: string) => {
        toast({
            title: "Opening Submissions",
            description: `Loading submissions for ${title}...`
        })
    }

    const handleCreateSchedule = () => {
        toast({
            title: "Schedule Wizard",
            description: "Opening assessment scheduler..."
        })
    }

    return (
        <DashboardLayout title="Primary Evaluation">
            <div className="space-y-6 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Primary Evaluation</h1>
                        <p className="text-gray-500 mt-1">Create assessments, generate question papers, and track performance.</p>
                    </div>

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-indigo-600 hover:bg-indigo-700">
                                <Plus className="w-4 h-4 mr-2" />
                                Create New Assessment
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-5xl border-none shadow-2xl">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black">Create Assessment</DialogTitle>
                                <DialogDescription className="font-medium text-gray-500">Define the parameters for the new evaluation.</DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-12 gap-6 py-4">
                                <div className="col-span-12 md:col-span-4 space-y-2">
                                    <Label className="font-bold text-gray-700">Target Class</Label>
                                    <Select onValueChange={(val) => handleSelectChange('class', val)}>
                                        <SelectTrigger className="h-12"><SelectValue placeholder="Select Class" /></SelectTrigger>
                                        <SelectContent>
                                            {classes.map((cls) => (
                                                <SelectItem key={cls._id} value={`${cls.name}-${cls.section}`}>
                                                    Class {cls.name}-{cls.section}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="col-span-12 md:col-span-4 space-y-2">
                                    <Label className="font-bold text-gray-700">Subject Area</Label>
                                    <Select onValueChange={(val) => handleSelectChange('subject', val)}>
                                        <SelectTrigger className="h-12"><SelectValue placeholder="Select Subject" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="math">Mathematics</SelectItem>
                                            <SelectItem value="sci">Science</SelectItem>
                                            <SelectItem value="eng">English</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="col-span-12 md:col-span-4 space-y-2">
                                    <Label className="font-bold text-gray-700">Total Marks</Label>
                                    <Input
                                        type="number"
                                        name="totalMarks"
                                        value={formData.totalMarks}
                                        onChange={handleInputChange}
                                        placeholder="100"
                                        className="h-12"
                                    />
                                </div>

                                <div className="col-span-12 space-y-2">
                                    <Label className="font-bold text-gray-700">Assessment Title</Label>
                                    <Input
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Mid-Term Math Quiz"
                                        className="h-12 font-bold"
                                    />
                                </div>

                                <div className="col-span-12 md:col-span-6 space-y-2">
                                    <Label className="font-bold text-gray-700">Start Date</Label>
                                    <Input
                                        type="datetime-local"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleInputChange}
                                        className="h-12"
                                    />
                                </div>
                                <div className="col-span-12 md:col-span-6 space-y-2">
                                    <Label className="font-bold text-gray-700">Duration (Minutes)</Label>
                                    <Input
                                        type="number"
                                        name="duration"
                                        value={formData.duration}
                                        onChange={handleInputChange}
                                        placeholder="60"
                                        className="h-12"
                                    />
                                </div>

                                <div className="col-span-12 space-y-2">
                                    <Label className="font-bold text-gray-700">Instructions & Guidelines</Label>
                                    <Textarea
                                        name="instructions"
                                        value={formData.instructions}
                                        onChange={handleInputChange}
                                        placeholder="Instructions for students..."
                                        className="min-h-[120px] resize-none"
                                    />
                                </div>
                            </div>
                            <DialogFooter className="border-t pt-6">
                                <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="font-bold text-gray-500">Discard</Button>
                                <Button onClick={handleCreateAssessment} className="bg-indigo-600 hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-100">Create Assessment</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-purple-50 border-purple-100">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
                                <ClipboardCheck className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">3</h3>
                                <p className="text-purple-700 font-medium text-sm">Active Assessments</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-blue-50 border-blue-100">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                                <FileQuestion className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">156</h3>
                                <p className="text-blue-700 font-medium text-sm">Questions in Bank</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-green-50 border-green-100">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-3 bg-green-100 rounded-lg text-green-600">
                                <BarChart3 className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">85%</h3>
                                <p className="text-green-700 font-medium text-sm">Avg. Class Performance</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="ongoing" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                        <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
                        <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                        <TabsTrigger value="completed">Completed</TabsTrigger>
                    </TabsList>

                    <TabsContent value="ongoing" className="space-y-4 pt-4">
                        <div className="space-y-4">
                            {assessments.length === 0 ? <p className="text-center text-gray-500 py-8">No active assessments found.</p> : assessments.map((item: any) => (
                                <Card key={item._id || item.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                            <div className="flex items-center gap-3">
                                                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-bold">
                                                    QA
                                                </span>
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                                                    <p className="text-sm text-gray-500">{item.class} • {item.subject}</p>
                                                </div>
                                            </div>
                                            <Badge className="bg-green-100 text-green-700 hover:bg-green-200">Active Now</Badge>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Submissions</p>
                                                <div className="flex items-end gap-2">
                                                    <span className="text-xl font-bold">0</span>
                                                    <span className="text-sm text-gray-400 mb-1">/ 45</span>
                                                </div>
                                                <Progress value={0} className="h-1.5 mt-2" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Duration</p>
                                                <p className="font-medium flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-gray-400" />
                                                    {item.duration} Mins
                                                </p>
                                            </div>
                                            <div className="flex items-end justify-end">
                                                <Button size="sm" variant="outline" onClick={() => handleViewSubmissions(item.title)}>View Submissions</Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="upcoming">
                        <Card>
                            <CardContent className="p-12 text-center text-gray-500">
                                <p>No upcoming assessments scheduled.</p>
                                <Button variant="link" className="text-indigo-600" onClick={handleCreateSchedule}>Schedule one now</Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="completed">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between border-b pb-4 mb-4">
                                    <div>
                                        <h3 className="font-semibold">English Pop Quiz</h3>
                                        <p className="text-sm text-gray-500">Completed on Dec 10, 2023</p>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => toast({ title: "View Report", description: "Opening report..." })}>View Report</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    )
}
