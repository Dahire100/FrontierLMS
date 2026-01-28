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
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  CalendarDays,
  ChevronDown,
  ClipboardList,
  Copy,
  Download,
  Pencil,
  Printer,
  Trash2,
  Search,
  AlertCircle,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"

interface Activity {
  _id: string
  className: string
  section: string
  subject: string
  activityName: string
  type: "Scholastic" | "Non-Scholastic"
  description?: string
}

export default function PrimaryEvaluationActivity() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    className: "",
    section: "",
    subject: "",
    activityName: "",
    type: "Scholastic" as "Scholastic" | "Non-Scholastic",
    description: ""
  })
  const [editingId, setEditingId] = useState<string | null>(null)

  // Fetch activities
  useEffect(() => {
    fetchActivities()
  }, [])

  const fetchActivities = async () => {
    setLoading(true)
    try {
      const response = await api.get<{ activities: Activity[] }>("/api/activities")
      setActivities(response.activities || [])
    } catch (error) {
      console.error("Failed to fetch activities:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load activities",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.className || !formData.section || !formData.subject || !formData.activityName) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      if (editingId) {
        await api.put(`/api/activities/${editingId}`, formData)
        toast({
          title: "Success",
          description: "Activity updated successfully"
        })
      } else {
        await api.post("/api/activities", formData)
        toast({
          title: "Success",
          description: "Activity created successfully"
        })
      }
      resetForm()
      fetchActivities()
    } catch (error) {
      console.error("Failed to save activity:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save activity",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (activity: Activity) => {
    setFormData({
      className: activity.className,
      section: activity.section,
      subject: activity.subject,
      activityName: activity.activityName,
      type: activity.type,
      description: activity.description || ""
    })
    setEditingId(activity._id)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this activity?")) return

    setLoading(true)
    try {
      await api.delete(`/api/activities/${id}`)
      toast({
        title: "Success",
        description: "Activity deleted successfully"
      })
      fetchActivities()
    } catch (error) {
      console.error("Failed to delete activity:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete activity",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select activities to delete",
        variant: "destructive"
      })
      return
    }

    if (!confirm(`Are you sure you want to delete ${selectedIds.length} activities?`)) return

    setLoading(true)
    try {
      await api.post("/api/activities/bulk-delete", { ids: selectedIds })
      toast({
        title: "Success",
        description: `${selectedIds.length} activities deleted successfully`
      })
      setSelectedIds([])
      fetchActivities()
    } catch (error) {
      console.error("Failed to bulk delete:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete activities",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      className: "",
      section: "",
      subject: "",
      activityName: "",
      type: "Scholastic",
      description: ""
    })
    setEditingId(null)
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredActivities.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredActivities.map(a => a._id))
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const filteredActivities = activities.filter(activity =>
    Object.values(activity).some(val =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  const exportToCSV = () => {
    const headers = ["Class", "Section", "Subject", "Activity", "Type"]
    const rows = filteredActivities.map(a => [
      a.className, a.section, a.subject, a.activityName, a.type
    ])
    const csv = [headers, ...rows].map(row => row.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "activities.csv"
    a.click()
  }

  return (
    <DashboardLayout title="Activity">
      <div className="space-y-6">
        {/* Breadcrumb with gradient */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Activity Management
            </h1>
            <p className="text-gray-500 mt-1">Manage scholastic and non-scholastic activities</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-lg shadow-sm border">
            <CalendarDays className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-blue-600">Primary Evaluation</span>
            <span>/</span>
            <span className="text-gray-700">Activity</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 border-0">
                <CardTitle className="text-lg flex items-center gap-2 text-white">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Pencil className="h-5 w-5" />
                  </div>
                  {editingId ? "Edit Activity" : "Add New Activity"}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 bg-gradient-to-br from-white to-gray-50">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                      Class <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.className}
                      onValueChange={(value) => setFormData({ ...formData, className: value })}
                    >
                      <SelectTrigger className="bg-white border-gray-300 hover:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all">
                        <SelectValue placeholder="Select Class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1st">1st</SelectItem>
                        <SelectItem value="2nd">2nd</SelectItem>
                        <SelectItem value="3rd">3rd</SelectItem>
                        <SelectItem value="4th">4th</SelectItem>
                        <SelectItem value="5th">5th</SelectItem>
                        <SelectItem value="KSV 6th">KSV 6th</SelectItem>
                        <SelectItem value="7th">7th</SelectItem>
                        <SelectItem value="8th">8th</SelectItem>
                        <SelectItem value="9th">9th</SelectItem>
                        <SelectItem value="10th">10th</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                      Section <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.section}
                      onValueChange={(value) => setFormData({ ...formData, section: value })}
                    >
                      <SelectTrigger className="bg-white border-gray-300 hover:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all">
                        <SelectValue placeholder="Select Section" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="B">B</SelectItem>
                        <SelectItem value="C">C</SelectItem>
                        <SelectItem value="D">D</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                      Subject <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.subject}
                      onValueChange={(value) => setFormData({ ...formData, subject: value })}
                    >
                      <SelectTrigger className="bg-white border-gray-300 hover:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all">
                        <SelectValue placeholder="Select Subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Hindi">Hindi</SelectItem>
                        <SelectItem value="Mathematics">Mathematics</SelectItem>
                        <SelectItem value="Science">Science</SelectItem>
                        <SelectItem value="Social Studies">Social Studies</SelectItem>
                        <SelectItem value="EVS">EVS</SelectItem>
                        <SelectItem value="Accounts">Accounts</SelectItem>
                        <SelectItem value="Biology">Biology</SelectItem>
                        <SelectItem value="Business Studies">Business Studies</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                      Activity Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      className="bg-white border-gray-300 hover:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      placeholder="e.g., Drawing Competition, Science Quiz"
                      value={formData.activityName}
                      onChange={(e) => setFormData({ ...formData, activityName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value as "Scholastic" | "Non-Scholastic" })}
                    >
                      <SelectTrigger className="bg-white border-gray-300 hover:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all">
                        <SelectValue placeholder="Select Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Scholastic">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            Scholastic
                          </div>
                        </SelectItem>
                        <SelectItem value="Non-Scholastic">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                            Non-Scholastic
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">💡 For template 4 report format</div>
                  </div>

                  <div className="flex gap-3 justify-end pt-4 border-t mt-6">
                    {editingId && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={resetForm}
                        disabled={loading}
                        className="border-gray-300 hover:bg-gray-50 transition-all"
                      >
                        Cancel
                      </Button>
                    )}
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 shadow-lg hover:shadow-xl transition-all"
                      disabled={loading}
                    >
                      {loading ? (
                        <><span className="animate-spin mr-2">⏳</span> Saving...</>
                      ) : editingId ? (
                        <>✓ Update Activity</>
                      ) : (
                        <>+ Add Activity</>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 border-0">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-lg flex items-center gap-2 text-white">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <ClipboardList className="h-5 w-5" />
                    </div>
                    <div>
                      <div>Activity List</div>
                      <div className="text-sm font-normal text-white/80">{filteredActivities.length} total activities</div>
                    </div>
                  </CardTitle>
                  <Button
                    onClick={handleBulkDelete}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border-0 shadow-lg"
                    disabled={selectedIds.length === 0 || loading}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete ({selectedIds.length})
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4 bg-gradient-to-br from-white to-gray-50">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between bg-white p-4 rounded-lg border shadow-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all"
                      onClick={exportToCSV}
                      title="Export to CSV"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 transition-all"
                      onClick={() => window.print()}
                      title="Print"
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      Print
                    </Button>
                  </div>

                  <div className="w-full sm:w-80">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        className="bg-white border-gray-300 pl-10 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                        placeholder="Search by class, subject, activity..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {loading && (
                  <div className="text-center py-12 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-dashed border-blue-200">
                    <div className="flex flex-col items-center gap-3">
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                        <AlertCircle className="h-6 w-6 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                      </div>
                      <p className="text-lg font-semibold text-gray-700">Loading activities...</p>
                      <p className="text-sm text-gray-500">Please wait while we fetch the data</p>
                    </div>
                  </div>
                )}

                {!loading && filteredActivities.length === 0 && (
                  <div className="text-center py-16 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-dashed border-purple-200">
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full">
                        <ClipboardList className="h-12 w-12 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xl font-bold text-gray-800 mb-2">No Activities Found</p>
                        <p className="text-gray-600">Start by adding your first activity using the form</p>
                      </div>
                      <Button
                        className="mt-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
                        onClick={() => document.querySelector('input')?.focus()}
                      >
                        + Create First Activity
                      </Button>
                    </div>
                  </div>
                )}

                {!loading && filteredActivities.length > 0 && (
                  <div className="overflow-x-auto rounded-xl border-2 border-gray-200 shadow-lg">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-500 hover:to-pink-600">
                          <TableHead className="w-10">
                            <Checkbox
                              checked={selectedIds.length === filteredActivities.length}
                              onCheckedChange={toggleSelectAll}
                              className="border-white data-[state=checked]:bg-white data-[state=checked]:text-purple-600"
                            />
                          </TableHead>
                          <TableHead className="font-bold text-white uppercase text-xs">Class</TableHead>
                          <TableHead className="font-bold text-white uppercase text-xs">Section</TableHead>
                          <TableHead className="font-bold text-white uppercase text-xs">Subject</TableHead>
                          <TableHead className="font-bold text-white uppercase text-xs">Activity</TableHead>
                          <TableHead className="font-bold text-white uppercase text-xs">Type</TableHead>
                          <TableHead className="font-bold text-white uppercase text-xs text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredActivities.map((activity, idx) => (
                          <TableRow 
                            key={activity._id} 
                            className={`transition-all hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 border-b ${
                              idx % 2 === 1 ? "bg-gray-50/50" : "bg-white"
                            }`}
                          >
                            <TableCell>
                              <Checkbox
                                checked={selectedIds.includes(activity._id)}
                                onCheckedChange={() => toggleSelect(activity._id)}
                                className="data-[state=checked]:bg-purple-600"
                              />
                            </TableCell>
                            <TableCell className="font-semibold text-gray-900">{activity.className}</TableCell>
                            <TableCell>
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm">
                                {activity.section}
                              </span>
                            </TableCell>
                            <TableCell className="font-medium text-gray-700">{activity.subject}</TableCell>
                            <TableCell className="max-w-[240px] font-medium text-gray-900">{activity.activityName}</TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${
                                activity.type === 'Scholastic' 
                                  ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white' 
                                  : 'bg-gradient-to-r from-purple-400 to-pink-500 text-white'
                              }`}>
                                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                                {activity.type}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all">
                                    Action
                                    <ChevronDown className="h-4 w-4 ml-2" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40">
                                  <DropdownMenuItem onClick={() => handleEdit(activity)} className="cursor-pointer">
                                    <Pencil className="h-4 w-4 mr-2 text-blue-600" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDelete(activity._id)}
                                    className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
