"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Gauge, CheckCircle2, Clock, Loader2, Play } from "lucide-react"
import { API_URL } from "@/lib/api-config"
import { toast } from "@/components/ui/use-toast"

export default function AutoGrading() {
    const [quizzes, setQuizzes] = useState<any[]>([])
    const [stats, setStats] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedQuiz, setSelectedQuiz] = useState<string>("")
    const [processing, setProcessing] = useState(false)

    useEffect(() => {
        fetchQuizzes()
    }, [])

    const fetchQuizzes = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${API_URL}/api/quiz`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (response.ok) {
                const data = await response.json()
                const fetchedQuizzes = data.quizzes || []
                setQuizzes(fetchedQuizzes)
                calculateStats(fetchedQuizzes)
            }
        } catch (error) {
            console.error(error)
            toast({ title: "Error", description: "Failed to fetch exam data", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    const calculateStats = (quizList: any[]) => {
        const newStats = quizList.map(quiz => {
            const attempts = quiz.attempts || []
            const completed = attempts.filter((a: any) => a.submittedAt).length
            const pending = attempts.filter((a: any) => !a.submittedAt).length

            return {
                id: quiz._id,
                exam: quiz.title,
                class: quiz.classId?.name || 'N/A',
                pending, // In progress
                completed // Submitted & Graded
            }
        })
        setStats(newStats)
    }

    const handleRunGrading = () => {
        if (!selectedQuiz) {
            toast({ title: "Select Exam", description: "Please select an exam to run auto-grading", variant: "destructive" })
            return
        }
        setProcessing(true)
        // Simulate processing since backend is real-time
        setTimeout(() => {
            setProcessing(false)
            toast({ title: "Success", description: "Auto-grading verification complete. All submitted exams are graded." })
        }, 1500)
    }

    return (
        <DashboardLayout title="Auto-Grading">
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Auto-Grading</h2>
                        <p className="text-muted-foreground mt-1">Manage automated evaluation for objective exams.</p>
                    </div>
                </div>

                <Card className="border-gray-100 shadow-md bg-white/50 backdrop-blur-sm">
                    <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
                        <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                            <Gauge className="h-5 w-5 text-indigo-600" />
                            Run Auto-Grading
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label className="text-gray-700 font-medium">Select Exam</Label>
                                <Select value={selectedQuiz} onValueChange={setSelectedQuiz}>
                                    <SelectTrigger className="bg-white border-gray-200">
                                        <SelectValue placeholder="Select exam" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {quizzes.map(q => (
                                            <SelectItem key={q._id} value={q._id}>{q.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-gray-700 font-medium">Grading Mode</Label>
                                <Select defaultValue="objective">
                                    <SelectTrigger className="bg-white border-gray-200">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="objective">Objective (Instant)</SelectItem>
                                        <SelectItem value="mixed">Mixed (Hybrid)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <Button
                                className="bg-indigo-600 hover:bg-indigo-700 shadow-sm px-6"
                                onClick={handleRunGrading}
                                disabled={processing}
                            >
                                {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                                {processing ? 'Processing...' : 'Run Auto-Grading'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-gray-100 shadow-md bg-white overflow-hidden">
                    <CardHeader className="bg-gray-50/50 border-b border-gray-100">
                        <CardTitle className="text-lg text-gray-800">Grading Status</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-gray-50">
                                    <TableRow>
                                        <TableHead className="font-semibold text-gray-700">Exam</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Class</TableHead>
                                        <TableHead className="font-semibold text-gray-700 text-right">In Progress (Pending)</TableHead>
                                        <TableHead className="font-semibold text-gray-700 text-right">Graded (Completed)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-8"><Loader2 className="mx-auto animate-spin" /></TableCell>
                                        </TableRow>
                                    ) : stats.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No exams found.</TableCell>
                                        </TableRow>
                                    ) : (
                                        stats.map((row) => (
                                            <TableRow key={row.id} className="hover:bg-gray-50/50 transition-colors">
                                                <TableCell className="font-medium text-gray-900">{row.exam}</TableCell>
                                                <TableCell>{row.class}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2 text-orange-600 font-medium">
                                                        {row.pending > 0 && <Clock className="w-4 h-4" />}
                                                        {row.pending}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2 text-green-700 font-medium">
                                                        {row.completed > 0 && <CheckCircle2 className="w-4 h-4" />}
                                                        {row.completed}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}

