"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ClipboardList, Plus, Trash2, Save, Loader2, CheckCircle, GripVertical } from "lucide-react"
import { API_URL } from "@/lib/api-config"
import { useToast } from "@/components/ui/use-toast"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function CreateExam() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [classes, setClasses] = useState<any[]>([])
    const { toast } = useToast()

    const [form, setForm] = useState({
        title: "",
        subject: "",
        classId: "",
        duration: "60",
        totalMarks: "100",
        passingMarks: "40",
        scheduledDate: "",
        startTime: "",
        endTime: "",
        description: ""
    })

    const [questions, setQuestions] = useState<any[]>([
        { question: "", options: ["", "", "", ""], correctAnswer: "", marks: 1 }
    ])

    useEffect(() => {
        // Fetch classes for dropdown
        const fetchClasses = async () => {
            try {
                const token = localStorage.getItem('token')
                const response = await fetch(`${API_URL}/api/classes`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (response.ok) {
                    const data = await response.json()
                    setClasses(data)
                }
            } catch (error) {
                console.error(error)
            }
        }
        fetchClasses()
    }, [])

    const handleQuestionChange = (index: number, field: string, value: any) => {
        const newQuestions = [...questions]
        newQuestions[index][field] = value
        setQuestions(newQuestions)
    }

    const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
        const newQuestions = [...questions]
        newQuestions[qIndex].options[oIndex] = value
        setQuestions(newQuestions)
    }

    const addQuestion = () => {
        setQuestions([...questions, { question: "", options: ["", "", "", ""], correctAnswer: "", marks: 1 }])
    }

    const removeQuestion = (index: number) => {
        if (questions.length === 1) return
        setQuestions(questions.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.title || !form.classId || !form.scheduledDate) {
            toast({ title: "Error", description: "Please fill required fields", variant: "destructive" })
            return
        }

        setIsSubmitting(true)

        try {
            const token = localStorage.getItem('token')

            // Format questions for backend
            // Backend expects: question, options[], correctAnswer, marks.
            // My state matches this structure mostly.

            const payload = {
                ...form,
                questions: questions.map(q => ({
                    question: q.question,
                    options: q.options,
                    correctAnswer: q.correctAnswer, // Should match one of the options or index? Schema says String.
                    marks: Number(q.marks)
                })),
                duration: Number(form.duration),
                totalMarks: Number(form.totalMarks),
                passingMarks: Number(form.passingMarks)
            }

            const response = await fetch(`${API_URL}/api/quiz`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            })

            if (response.ok) {
                toast({ title: "Success", description: "Online Exam Created Successfully" })
                setForm({
                    title: "", subject: "", classId: "", duration: "60",
                    totalMarks: "100", passingMarks: "40", scheduledDate: "",
                    startTime: "", endTime: "", description: ""
                })
                setQuestions([{ question: "", options: ["", "", "", ""], correctAnswer: "", marks: 1 }])
            } else {
                const err = await response.json()
                toast({ title: "Error", description: err.error || "Failed to create exam", variant: "destructive" })
            }
        } catch (error) {
            console.error(error)
            toast({ title: "Error", description: "Something went wrong", variant: "destructive" })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <DashboardLayout title="Create Exam">
            <div className="space-y-6 animate-in fade-in duration-500">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Create Online Exam</h2>
                    <p className="text-muted-foreground mt-1">Design online quizzes and examinations for students.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Exam Details Section */}
                    <Card className="border-gray-100 shadow-md bg-white/50 backdrop-blur-sm">
                        <CardHeader className="bg-gray-50/50 border-b border-gray-100">
                            <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                                <ClipboardList className="h-5 w-5 text-blue-600" />
                                Exam Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2 space-y-2">
                                <Label className="text-gray-700 font-medium">Exam Title <span className="text-red-500">*</span></Label>
                                <Input
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    placeholder="e.g. Science Chapter 1 Quiz"
                                    className="bg-white"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-gray-700 font-medium">Subject <span className="text-red-500">*</span></Label>
                                <Input
                                    value={form.subject}
                                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                                    placeholder="e.g. Science"
                                    className="bg-white"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-gray-700 font-medium">Class <span className="text-red-500">*</span></Label>
                                <Select onValueChange={(val) => setForm({ ...form, classId: val })}>
                                    <SelectTrigger className="bg-white">
                                        <SelectValue placeholder="Select Class" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classes.map((cls: any) => (
                                            <SelectItem key={cls._id} value={cls._id}>{cls.name} {cls.section ? `- ${cls.section}` : ''}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-gray-700 font-medium">Date <span className="text-red-500">*</span></Label>
                                <Input
                                    type="date"
                                    value={form.scheduledDate}
                                    onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
                                    className="bg-white"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-gray-700 font-medium">Time <span className="text-red-500">*</span></Label>
                                <div className="flex gap-2">
                                    <Input
                                        type="time"
                                        value={form.startTime}
                                        onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                                        className="bg-white"
                                        required
                                    />
                                    <span className="self-center text-gray-500">to</span>
                                    <Input
                                        type="time"
                                        value={form.endTime}
                                        onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                                        className="bg-white"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-gray-700 font-medium">Duration (mins)</Label>
                                <Input
                                    type="number"
                                    value={form.duration}
                                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                                    className="bg-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-gray-700 font-medium">Total Marks</Label>
                                <Input
                                    type="number"
                                    value={form.totalMarks}
                                    onChange={(e) => setForm({ ...form, totalMarks: e.target.value })}
                                    className="bg-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-gray-700 font-medium">Passing Marks</Label>
                                <Input
                                    type="number"
                                    value={form.passingMarks}
                                    onChange={(e) => setForm({ ...form, passingMarks: e.target.value })}
                                    className="bg-white"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Questions Section */}
                    <Card className="border-gray-100 shadow-md bg-white">
                        <CardHeader className="bg-gray-50/50 border-b border-gray-100 flex flex-row justify-between items-center">
                            <CardTitle className="text-lg text-gray-800">Questions</CardTitle>
                            <Button type="button" onClick={addQuestion} variant="outline" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                <Plus className="w-4 h-4 mr-2" /> Add Question
                            </Button>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            {questions.map((q, qIndex) => (
                                <div key={qIndex} className="p-6 bg-slate-50 rounded-lg border border-slate-200 relative group transition-all hover:shadow-md">
                                    <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button type="button" variant="ghost" size="icon" className="text-red-500 hover:bg-red-50" onClick={() => removeQuestion(qIndex)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                        <div className="md:col-span-1 flex justify-center pt-2">
                                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-600">
                                                {qIndex + 1}
                                            </span>
                                        </div>
                                        <div className="md:col-span-11 space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                <div className="md:col-span-3">
                                                    <Label className="mb-2 block text-xs font-semibold text-slate-500 uppercase tracking-wider">Question Text</Label>
                                                    <Textarea
                                                        value={q.question}
                                                        onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
                                                        placeholder="Type question here..."
                                                        className="bg-white min-h-[80px]"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="mb-2 block text-xs font-semibold text-slate-500 uppercase tracking-wider">Marks</Label>
                                                    <Input
                                                        type="number"
                                                        value={q.marks}
                                                        onChange={(e) => handleQuestionChange(qIndex, 'marks', e.target.value)}
                                                        className="bg-white"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <Label className="mb-2 block text-xs font-semibold text-slate-500 uppercase tracking-wider">Options</Label>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {q.options.map((opt: string, oIndex: number) => (
                                                        <div key={oIndex} className="flex items-center gap-2">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border ${q.correctAnswer === opt && opt !== "" ? 'bg-green-100 text-green-700 border-green-300' : 'bg-white text-gray-500 border-gray-200'}`}>
                                                                {String.fromCharCode(65 + oIndex)}
                                                            </div>
                                                            <Input
                                                                value={opt}
                                                                onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                                                placeholder={`Option ${oIndex + 1}`}
                                                                className={`bg-white ${q.correctAnswer === opt && opt !== "" ? 'border-green-300 ring-1 ring-green-100' : ''}`}
                                                            />
                                                            <div
                                                                className="cursor-pointer text-gray-300 hover:text-green-600 transition-colors"
                                                                onClick={() => handleQuestionChange(qIndex, 'correctAnswer', opt)}
                                                                title="Mark as correct answer"
                                                            >
                                                                <CheckCircle className={`w-5 h-5 ${q.correctAnswer === opt && opt !== "" ? 'text-green-600 fill-green-100' : ''}`} />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <div className="flex justify-end pt-4 pb-12">
                        <Button type="submit" size="lg" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 shadow-lg px-8 text-lg">
                            {isSubmitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                            Save Exam
                        </Button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    )
}

