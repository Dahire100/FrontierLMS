"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ListChecks, Search, Loader2 } from "lucide-react"
import { API_URL } from "@/lib/api-config"
import { Badge } from "@/components/ui/badge"

export default function AttemptLog() {
    const [attempts, setAttempts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchAttempts()
    }, [])

    const fetchAttempts = async () => {
        try {
            const token = localStorage.getItem('token')
            // Ideally backend should have an endpoint for all attempts, but we can aggregate from quizzes for now
            const response = await fetch(`${API_URL}/api/quiz`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (response.ok) {
                const data = await response.json()
                const quizzes = data.quizzes || []
                const allAttempts: any[] = []

                quizzes.forEach((quiz: any) => {
                    if (quiz.attempts && quiz.attempts.length > 0) {
                        quiz.attempts.forEach((attempt: any) => {
                            allAttempts.push({
                                id: attempt._id || Math.random(),
                                student: attempt.studentId?.firstName ? `${attempt.studentId.firstName} ${attempt.studentId.lastName}` : 'Unknown Student',
                                exam: quiz.title,
                                start: attempt.startedAt ? new Date(attempt.startedAt).toLocaleTimeString() : '-',
                                end: attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleTimeString() : '-',
                                status: attempt.submittedAt ? 'Submitted' : 'In Progress',
                                result: attempt.result
                            })
                        })
                    }
                })
                setAttempts(allAttempts)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <DashboardLayout title="Attempt Log">
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Attempt Log</h2>
                        <p className="text-muted-foreground mt-1">View student exam attempts and submission status.</p>
                    </div>
                </div>

                <Card className="border-gray-100 shadow-md bg-white/50 backdrop-blur-sm">
                    <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
                        <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                            <ListChecks className="h-5 w-5 text-blue-600" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label className="text-gray-700 font-medium">Exam</Label>
                                <Input placeholder="All exams" className="bg-white border-gray-200" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-gray-700 font-medium">Student</Label>
                                <Input placeholder="Name / ID" className="bg-white border-gray-200" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-gray-700 font-medium">Status</Label>
                                <Input placeholder="All" className="bg-white border-gray-200" />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm px-8">
                                <Search className="h-4 w-4 mr-2" />
                                Search
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-gray-100 shadow-md bg-white overflow-hidden">
                    <CardHeader className="bg-gray-50/50 border-b border-gray-100">
                        <CardTitle className="text-lg text-gray-800">Attempts</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-gray-50">
                                    <TableRow>
                                        <TableHead className="font-semibold text-gray-700">Student</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Exam</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Start Time</TableHead>
                                        <TableHead className="font-semibold text-gray-700">End Time</TableHead>
                                        <TableHead className="font-semibold text-gray-700 text-right">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8"><Loader2 className="mx-auto animate-spin" /></TableCell>
                                        </TableRow>
                                    ) : attempts.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No attempts found.</TableCell>
                                        </TableRow>
                                    ) : (
                                        attempts.map((row) => (
                                            <TableRow key={row.id} className="hover:bg-gray-50/50 transition-colors">
                                                <TableCell className="font-medium text-gray-900">{row.student}</TableCell>
                                                <TableCell>{row.exam}</TableCell>
                                                <TableCell className="text-gray-600">{row.start}</TableCell>
                                                <TableCell className="text-gray-600">{row.end}</TableCell>
                                                <TableCell className="text-right">
                                                    <Badge variant={row.status === 'Submitted' ? 'default' : 'secondary'}
                                                        className={row.status === 'Submitted' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-yellow-100 text-yellow-700'}>
                                                        {row.status}
                                                    </Badge>
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

