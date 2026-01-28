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
import { PlayCircle, PauseCircle, StopCircle, Clock, Loader2 } from "lucide-react"
import { API_URL } from "@/lib/api-config"
import { Badge } from "@/components/ui/badge"

export default function ConductExam() {
    const [quizzes, setQuizzes] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

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
                setQuizzes(data.quizzes || [])
            }
        } catch (error) {
            console.error(error)
            setQuizzes([])
        } finally {
            setLoading(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-700 border-green-200'
            case 'scheduled': return 'bg-blue-100 text-blue-700 border-blue-200'
            case 'completed': return 'bg-gray-100 text-gray-700 border-gray-200'
            case 'draft': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
            default: return 'bg-gray-100'
        }
    }

    return (
        <DashboardLayout title="Conduct Exam">
            <div className="space-y-6 animate-in fade-in duration-500">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Conduct Exam</h2>
                    <p className="text-muted-foreground mt-1">Monitor and manage live examination sessions.</p>
                </div>

                <Card className="border-gray-100 shadow-md bg-white overflow-hidden">
                    <CardHeader className="bg-gray-50/50 border-b border-gray-100">
                        <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                            <Clock className="h-5 w-5 text-blue-600" />
                            Exam Sessions
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-gray-50">
                                    <TableRow>
                                        <TableHead className="font-semibold text-gray-700">Exam Title</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Class</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Scheduled Date</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Time</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Status</TableHead>
                                        <TableHead className="font-semibold text-gray-700 text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8"><Loader2 className="mx-auto animate-spin" /></TableCell>
                                        </TableRow>
                                    ) : quizzes.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No exams found.</TableCell>
                                        </TableRow>
                                    ) : (
                                        quizzes.map((quiz) => (
                                            <TableRow key={quiz._id} className="hover:bg-gray-50/50 transition-colors">
                                                <TableCell className="font-medium text-gray-900">{quiz.title}</TableCell>
                                                <TableCell>{quiz.classId?.name || 'N/A'}</TableCell>
                                                <TableCell>{new Date(quiz.scheduledDate).toLocaleDateString()}</TableCell>
                                                <TableCell className="text-gray-600">{quiz.startTime} - {quiz.endTime}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={`${getStatusColor(quiz.status)} font-normal`}>
                                                        {quiz.status || 'Scheduled'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:bg-green-50" title="Start Exam">
                                                            <PlayCircle className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-yellow-600 hover:bg-yellow-50" title="Pause">
                                                            <PauseCircle className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50" title="End Exam">
                                                            <StopCircle className="h-4 w-4" />
                                                        </Button>
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

