"use client"

import { useState } from "react"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Plus, Search, Calendar, User } from "lucide-react"
import { API_URL } from "@/lib/api-config"
import { useToast } from "@/components/ui/use-toast"

export default function ExamSchedule() {
  const [showResult, setShowResult] = useState(false)
  const [loading, setLoading] = useState(false)
  const [scheduleData, setScheduleData] = useState<any[]>([])
  const [filters, setFilters] = useState({
    class: "",
    section: ""
  })
  const { toast } = useToast()

  const handleSearch = async () => {
    if (!filters.class) {
      toast({ title: "Error", description: "Please select a class", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/exams/schedule?class=${filters.class}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setScheduleData(data)
        setShowResult(true)
      } else {
        toast({ title: "Error", description: "Failed to fetch schedule", variant: "destructive" })
      }
    } catch (error) {
      console.error(error)
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout title="Exam Schedule">
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Exam Schedule</h2>
            <p className="text-muted-foreground mt-1">View and manage examination timetables.</p>
          </div>
          <div className="flex gap-2">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md">
              <Plus className="w-4 h-4 mr-2" /> Add Schedule
            </Button>
          </div>
        </div>

        <Card className="border-gray-100 shadow-md bg-white/50 backdrop-blur-sm">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
            <CardTitle className="text-lg font-medium flex items-center gap-2 text-gray-800">
              <Search className="h-5 w-5 text-blue-600" />
              Select Criteria
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Class <span className="text-red-500">*</span></Label>
                <Select onValueChange={(value) => setFilters({ ...filters, class: value })}>
                  <SelectTrigger className="bg-white border-gray-200 focus:ring-2 focus:ring-blue-100 transition-all">
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Class 1</SelectItem>
                    <SelectItem value="2">Class 2</SelectItem>
                    <SelectItem value="3">Class 3</SelectItem>
                    <SelectItem value="10">Class 10</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Section <span className="text-red-500">*</span></Label>
                <Select onValueChange={(value) => setFilters({ ...filters, section: value })}>
                  <SelectTrigger className="bg-white border-gray-200 focus:ring-2 focus:ring-blue-100 transition-all">
                    <SelectValue placeholder="Select Section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Section A</SelectItem>
                    <SelectItem value="B">Section B</SelectItem>
                    <SelectItem value="C">Section C</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={handleSearch} disabled={loading} className="bg-blue-600 hover:bg-blue-700 shadow-sm px-8">
                {loading ? <span className="animate-spin mr-2">⏳</span> : <Search className="h-4 w-4 mr-2" />}
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {showResult && (
          <Card className="border-gray-100 shadow-md bg-white overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-medium">Examination Schedule</CardTitle>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Class {filters.class} {filters.section && `- Section ${filters.section}`}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="font-semibold text-gray-700">Exam Name</TableHead>
                      <TableHead className="font-semibold text-gray-700">Subject</TableHead>
                      <TableHead className="font-semibold text-gray-700">Date</TableHead>
                      <TableHead className="font-semibold text-gray-700">Time</TableHead>
                      <TableHead className="font-semibold text-gray-700">Max Marks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scheduleData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No schedule found for this class.
                        </TableCell>
                      </TableRow>
                    ) : (
                      scheduleData.map((item, index) => (
                        <TableRow key={index} className="hover:bg-blue-50/30 transition-colors">
                          <TableCell className="font-medium text-gray-900">{item.examName}</TableCell>
                          <TableCell className="text-gray-900">{item.subject}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Calendar className="w-4 h-4 text-blue-500" />
                              {new Date(item.date).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-600">{item.startTime} - {item.endTime}</TableCell>
                          <TableCell className="font-medium text-gray-900">{item.totalMarks}</TableCell>
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
