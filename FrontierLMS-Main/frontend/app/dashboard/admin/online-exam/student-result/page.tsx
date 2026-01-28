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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { GraduationCap, Search, Loader2, Download, Filter } from "lucide-react"
import { API_URL } from "@/lib/api-config"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"

export default function StudentResult() {
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [selectedQuiz, setSelectedQuiz] = useState<string>("")
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingQuizzes, setLoadingQuizzes] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchQuizzes()
  }, [])

  useEffect(() => {
    if (selectedQuiz) {
      fetchResults(selectedQuiz)
    } else {
      setResults([])
    }
  }, [selectedQuiz])

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
      toast({ title: "Error", description: "Failed to fetch exams", variant: "destructive" })
    } finally {
      setLoadingQuizzes(false)
    }
  }

  const fetchResults = async (quizId: string) => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/quiz/${quizId}/results`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setResults(data.results || [])
      } else {
        setResults([])
      }
    } catch (error) {
      console.error(error)
      toast({ title: "Error", description: "Failed to fetch results", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const filteredResults = results.filter(result =>
    result.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    result.rollNo?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <DashboardLayout title="Student Result">
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Student Result</h2>
            <p className="text-muted-foreground mt-1">View detailed exam results for students.</p>
          </div>
        </div>

        <Card className="border-gray-100 shadow-md bg-white/50 backdrop-blur-sm">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
            <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
              <Filter className="h-5 w-5 text-blue-600" />
              Select Exam
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              <div className="space-y-2 md:col-span-1">
                <Label className="text-gray-700 font-medium">Exam / Quiz</Label>
                <Select onValueChange={setSelectedQuiz} value={selectedQuiz}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="Select Exam to view results" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingQuizzes ? (
                      <div className="p-2 text-center text-sm text-gray-500">Loading exams...</div>
                    ) : quizzes.length === 0 ? (
                      <div className="p-2 text-center text-sm text-gray-500">No exams found</div>
                    ) : (
                      quizzes.map((quiz) => (
                        <SelectItem key={quiz._id} value={quiz._id}>{quiz.title}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className="text-gray-700 font-medium">Search Student</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search by student name or roll number..."
                    className="pl-9 bg-white border-gray-200"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    disabled={!selectedQuiz}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedQuiz && (
          <Card className="border-gray-100 shadow-md bg-white overflow-hidden animate-in slide-in-from-bottom-4">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 flex flex-row justify-between items-center">
              <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-purple-600" />
                Result List
              </CardTitle>
              <Button variant="outline" size="sm" className="hidden md:flex">
                <Download className="h-4 w-4 mr-2" /> Export
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="font-semibold text-gray-700">Student Name</TableHead>
                      <TableHead className="font-semibold text-gray-700">Roll No</TableHead>
                      <TableHead className="font-semibold text-gray-700 text-right">Score</TableHead>
                      <TableHead className="font-semibold text-gray-700 text-right">Percentage</TableHead>
                      <TableHead className="font-semibold text-gray-700 text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-12">
                          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-500" />
                          <p className="mt-2 text-sm text-gray-500">Fetching results...</p>
                        </TableCell>
                      </TableRow>
                    ) : results.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                          No results found for this exam.
                        </TableCell>
                      </TableRow>
                    ) : filteredResults.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                          No matching students found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredResults.map((row: any) => (
                        <TableRow key={row.studentId} className="hover:bg-gray-50/50 transition-colors">
                          <TableCell className="font-medium text-gray-900">{row.studentName}</TableCell>
                          <TableCell className="text-gray-600">{row.rollNo || 'N/A'}</TableCell>
                          <TableCell className="text-right font-medium">{row.score}</TableCell>
                          <TableCell className="text-right">{row.percentage ? `${row.percentage.toFixed(1)}%` : '-'}</TableCell>
                          <TableCell className="text-right">
                            <Badge className={
                              row.result === 'pass' ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                                'bg-red-100 text-red-700 hover:bg-red-200'
                            }>
                              {row.result ? row.result.toUpperCase() : 'N/A'}
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
        )}
      </div>
    </DashboardLayout>
  )
}

