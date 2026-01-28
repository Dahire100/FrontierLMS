"use client"

import { API_URL } from "@/lib/api-config"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { StatCard } from "@/components/super-admin/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BookOpen, CheckCircle, Clock, TrendingUp, Filter, Upload, FileText } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"

import { toast } from "sonner"

export default function StudentHomework() {
  const [assignments, setAssignments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterSubject, setFilterSubject] = useState("all")
  const [submissionOpen, setSubmissionOpen] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null)

  useEffect(() => {
    const fetchHomework = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`${API_URL}/api/student/homework`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await res.json()
        if (data.success) {
          // Map API data to UI format
          const mappedAssignments = data.data.map((hw: any) => ({
            id: hw._id,
            title: hw.title,
            subject: hw.subject?.name || hw.subject || "General", // Handle populated subject or string
            dueDate: hw.dueDate,
            status: hw.submission ? capitalize(hw.submission.status) : (new Date(hw.dueDate) < new Date() ? "Overdue" : "Pending"),
            priority: "Medium", // Default, or add priority to backend model
            description: hw.description,
            score: hw.submission?.marks || null
          }))
          setAssignments(mappedAssignments)
        }
      } catch (error) {
        console.error("Failed to fetch homework", error)
        toast.error("Failed to load homework")
      } finally {
        setLoading(false)
      }
    }
    fetchHomework()
  }, [])

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

  const subjects = Array.from(new Set(assignments.map(a => a.subject)))

  const filteredAssignments = assignments.filter(a => filterSubject === "all" || a.subject === filterSubject)

  const pendingCount = assignments.filter(a => a.status === "Pending" || a.status === "Overdue").length
  const submittedCount = assignments.filter(a => a.status === "Submitted" || a.status === "Graded" || a.status === "Late").length
  const gradedAssignments = assignments.filter(a => a.status === "Graded" && a.score)
  const averageScore = gradedAssignments.length > 0
    ? gradedAssignments.reduce((sum, a) => sum + (a.score || 0), 0) / gradedAssignments.length
    : 0

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "bg-red-100 text-red-700 hover:bg-red-100 border-red-200"
      case "Medium": return "bg-orange-100 text-orange-700 hover:bg-orange-100 border-orange-200"
      case "Low": return "bg-green-100 text-green-700 hover:bg-green-100 border-green-200"
      default: return "bg-gray-100 text-gray-700"
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      // Mock submission for now as file upload requires more setup
      // Mock submission for now as file upload requires more setup
      const res = await fetch(`${API_URL}/api/student/homework/${selectedAssignment.id}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: "Submitted via portal", // Placeholder
          fileUrl: "" // Placeholder
        })
      })
      const data = await res.json()

      if (data.success) {
        setSubmissionOpen(false)
        toast.success("Assignment Submitted", { description: `Successfully submitted ${selectedAssignment?.title}` })
        // Refresh list
        const updatedAssignments = assignments.map(a =>
          a.id === selectedAssignment.id ? { ...a, status: "Submitted" } : a
        )
        setAssignments(updatedAssignments)
      } else {
        toast.error(data.error || "Submission failed")
      }
    } catch (error) {
      toast.error("Submission failed")
    }
  }

  const renderAssignmentList = (statusFilter: string) => {
    const list = filteredAssignments.filter(a => statusFilter === "All" || a.status === statusFilter)

    if (list.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <BookOpen className="h-12 w-12 mb-4 opacity-20" />
          <p>No assignments found</p>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {list.map((assignment) => (
          <Card key={assignment.id} className="flex flex-col hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <Badge variant="outline" className="mb-2">{assignment.subject}</Badge>
                  <CardTitle className="text-lg">{assignment.title}</CardTitle>
                </div>
                <Badge className={getPriorityColor(assignment.priority)} variant="outline">{assignment.priority}</Badge>
              </div>
              <CardDescription className="line-clamp-2 mt-1">{assignment.description}</CardDescription>
            </CardHeader>
            <CardContent className="pb-3 flex-1">
              <div className="flex justify-between items-center text-sm mb-4">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Clock className="h-4 w-4" /> Due: {new Date(assignment.dueDate).toLocaleDateString()}
                </span>
                {assignment.score && (
                  <span className="font-bold text-green-600 border px-2 py-1 rounded-md bg-green-50">Score: {assignment.score}%</span>
                )}
              </div>

              {/* Progress bar for graded items simply to visualize score */}
              {assignment.score && <Progress value={assignment.score} className="h-1.5" />}
            </CardContent>
            <CardFooter className="pt-0">
              {assignment.status === "Pending" ? (
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => { setSelectedAssignment(assignment); setSubmissionOpen(true); }}
                >
                  <Upload className="h-4 w-4 mr-2" /> Submit Assignment
                </Button>
              ) : (
                <Button variant="outline" className="w-full">
                  <FileText className="h-4 w-4 mr-2" /> View Details
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <DashboardLayout title="H.W. / C.W.">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Homework & Classwork
            </h2>
            <p className="text-muted-foreground mt-1">
              Track assignments and monitor progress
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterSubject} onValueChange={setFilterSubject}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Assignments"
            value={assignments.length.toString()}
            icon={BookOpen}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
          />
          <StatCard
            title="Pending"
            value={pendingCount.toString()}
            icon={Clock}
            iconColor="text-orange-600"
            iconBgColor="bg-orange-100"
          />
          <StatCard
            title="Submitted"
            value={submittedCount.toString()}
            icon={CheckCircle}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
          />
          <StatCard
            title="Average Score"
            value={`${Math.round(averageScore)}%`}
            icon={TrendingUp}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-100"
          />
        </div>

        {/* Tabs for Filtering */}
        <Tabs defaultValue="All" className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="All" className="flex-1 max-w-[150px]">All Assignments</TabsTrigger>
            <TabsTrigger value="Pending" className="flex-1 max-w-[150px]">Pending</TabsTrigger>
            <TabsTrigger value="Submitted" className="flex-1 max-w-[150px]">Submitted</TabsTrigger>
            <TabsTrigger value="Graded" className="flex-1 max-w-[150px]">Graded</TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="All">{renderAssignmentList("All")}</TabsContent>
            <TabsContent value="Pending">{renderAssignmentList("Pending")}</TabsContent>
            <TabsContent value="Submitted">{renderAssignmentList("Submitted")}</TabsContent>
            <TabsContent value="Graded">{renderAssignmentList("Graded")}</TabsContent>
          </div>
        </Tabs>

        {/* Submission Dialog */}
        <Dialog open={submissionOpen} onOpenChange={setSubmissionOpen}>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Submit Assignment: {selectedAssignment?.title}</DialogTitle>
                <DialogDescription>Upload your files or type your response below.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>File Upload</Label>
                  <Input type="file" />
                </div>
                <div className="space-y-2">
                  <Label>Comments / Answer</Label>
                  <Textarea placeholder="Type your answer here..." />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Submit</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
