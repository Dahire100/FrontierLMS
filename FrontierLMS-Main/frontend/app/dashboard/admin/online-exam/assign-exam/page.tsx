"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Users2, Calendar, Clock, Loader2, Edit, Search } from "lucide-react"
import { API_URL } from "@/lib/api-config"
import { Input } from "@/components/ui/input"

export default function AssignExam() {
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

    return (
        <DashboardLayout title="Assign Exam">
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Assign Exam</h2>
                        <p className="text-muted-foreground mt-1">View and manage exam assignments to classes.</p>
                    </div>
                </div>

                <Card className="border-gray-100 shadow-md bg-white overflow-hidden">
                    <CardHeader className="bg-gray-50/50 border-b border-gray-100 flex flex-row items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                            <Users2 className="h-5 w-5 text-blue-600" />
                            Assignments
                        </CardTitle>
                        <div className="relative w-64 hidden md:block">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <Input placeholder="Search exam..." className="pl-9 bg-white" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-gray-50">
                                    <TableRow>
                                        <TableHead className="font-semibold text-gray-700">Exam Title</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Class Assigned</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Scheduled Date</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Time Window</TableHead>
                                        <TableHead className="font-semibold text-gray-700 text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8"><Loader2 className="mx-auto animate-spin" /></TableCell>
                                        </TableRow>
                                    ) : quizzes.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No assigned exams.</TableCell>
                                        </TableRow>
                                    ) : (
                                        quizzes.map((quiz) => (
                                            <TableRow key={quiz._id} className="hover:bg-gray-50/50 transition-colors">
                                                <TableCell className="font-medium text-gray-900">{quiz.title}</TableCell>
                                                <TableCell>
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {quiz.classId?.name || 'Unassigned'}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <Calendar className="w-4 h-4" />
                                                        {new Date(quiz.scheduledDate).toLocaleDateString()}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <Clock className="w-4 h-4" />
                                                        {quiz.startTime} - {quiz.endTime}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800 hover:bg-blue-50">
                                                        <Edit className="w-4 h-4 mr-2" />
                                                        Edit
                                                    </Button>
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

