"use client"

import { API_URL } from "@/lib/api-config"
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
import { CalendarDays, Search, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"

export default function OnlineClassTeacherTimetable() {
  const [teachers, setTeachers] = useState<any[]>([])
  const [selectedTeacher, setSelectedTeacher] = useState<string>("")
  const [schedules, setSchedules] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchTeachers()
  }, [])

  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_URL}/api/staff?role=teacher`, { // Assuming this endpoint exists, or we filter staff
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        // If API returns all staff, filter client side if needed, or if backend supports filtering
        setTeachers(Array.isArray(data) ? data : (data.data || []))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleSearch = async () => {
    if (!selectedTeacher) {
      toast({ title: "Select Teacher", description: "Please select a teacher first", variant: "destructive" })
      return
    }
    setLoading(true)
    try {
      // Note: The backend getTeacherOnlineClasses uses req.user.userId. 
      // Since we are ADMIN seeing another teacher's timetable, we need a different endpoint 
      // OR filter the getAllOnlineClasses by teacherId. 
      // Looking at onlineClassController.getAllOnlineClasses, it doesn't explicitly support teacherId filter in query...
      // Wait, actually I can just fetch ALL and filter client side for now as a fallback if I can't modify backend, 
      // OR easier: Fetch all online classes and filter by teacherId in the map if the API returns enough data.
      // Let's rely on getAllOnlineClasses and filter where teacherId._id === selectedTeacher

      const token = localStorage.getItem("token")
      const res = await fetch(`${API_URL}/api/online-classes`, {
        headers: { "Authorization": `Bearer ${token}` }
      })

      if (res.ok) {
        const data = await res.json()
        const all = data.data || []
        const filtered = all.filter((c: any) => c.teacherId && (c.teacherId._id === selectedTeacher || c.teacherId === selectedTeacher))
        setSchedules(filtered)
        if (filtered.length === 0) {
          toast({ title: "No Classes", description: "No classes found for this teacher." })
        }
      }
    } catch (err) {
      console.error(err)
      toast({ title: "Error", description: "Failed to load schedule", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout title="Teacher Timetable">
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Teacher Timetable</h2>
            <p className="text-muted-foreground mt-1">View online class schedules for specific teachers.</p>
          </div>
        </div>

        <Card className="border-gray-100 shadow-md bg-white/50 backdrop-blur-sm">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
            <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
              <Search className="h-5 w-5 text-blue-600" />
              Select Criteria
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Teacher *</Label>
                <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="Select Teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map(t => (
                      <SelectItem key={t._id} value={t._id}>{t.firstName} {t.lastName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 shadow-sm" onClick={handleSearch} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                  Search
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {schedules.length > 0 && (
          <Card className="border-gray-100 shadow-md bg-white overflow-hidden animate-in slide-in-from-bottom-4">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100">
              <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-indigo-500" />
                Schedule Results
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="font-semibold text-gray-700">Subject</TableHead>
                      <TableHead className="font-semibold text-gray-700">Class</TableHead>
                      <TableHead className="font-semibold text-gray-700">Date</TableHead>
                      <TableHead className="font-semibold text-gray-700">Time</TableHead>
                      <TableHead className="font-semibold text-gray-700">Platform</TableHead>
                      <TableHead className="font-semibold text-gray-700 text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schedules.map((row) => (
                      <TableRow key={row._id} className="hover:bg-gray-50/50 transition-colors">
                        <TableCell className="font-medium text-gray-900">{row.subject}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-white">
                            {row.classId ? `${row.classId.name}-${row.classId.section}` : "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(row.scheduledDate).toLocaleDateString()}</TableCell>
                        <TableCell>{row.startTime} - {row.endTime}</TableCell>
                        <TableCell className="capitalize">{row.platform}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="secondary" className="capitalize">
                            {row.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
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
