"use client"

import { API_URL } from "@/lib/api-config"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { Calendar as CalendarIcon, ClipboardList, Send, History, CheckCircle, XCircle, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function StudentLeaveApply() {
  const [fromDate, setFromDate] = useState<Date>()
  const [toDate, setToDate] = useState<Date>()
  const [type, setType] = useState("")
  const [reason, setReason] = useState("")

  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/api/leaves/my-requests`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        setHistory(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch leave history", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!fromDate || !toDate || !type || !reason) {
      toast.error("Incomplete Application", { description: "Please fill all fields including dates and reason." })
      return
    }

    if (toDate < fromDate) {
      toast.error("Invalid Dates", { description: "To Date cannot be before From Date." })
      return
    }

    setSubmitting(true)
    try {
      const token = localStorage.getItem('token')

      // Map frontend type to backend enum
      const typeMap: Record<string, string> = {
        "Sick Leave": "sick",
        "Casual Leave": "casual",
        "Emergency Leave": "emergency",
        "Other": "other"
      }

      const res = await fetch(`${API_URL}/api/leaves`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          leaveType: typeMap[type] || "other",
          startDate: fromDate,
          endDate: toDate,
          reason
        })
      })

      const data = await res.json()

      if (data.success || res.ok) {
        toast.success("Leave Application Submitted", { description: "Waiting for approval." })
        // Reset form
        setFromDate(undefined)
        setToDate(undefined)
        setType("")
        setReason("")
        fetchHistory()
      } else {
        toast.error("Submission Failed", { description: data.error || data.message })
      }
    } catch (error) {
      console.error("Leave submit error", error)
      toast.error("An error occurred")
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return <span className="flex items-center text-green-600 bg-green-100 px-2 py-1 rounded text-xs gap-1"><CheckCircle className="h-3 w-3" /> Approved</span>
      case 'rejected': return <span className="flex items-center text-red-600 bg-red-100 px-2 py-1 rounded text-xs gap-1"><XCircle className="h-3 w-3" /> Rejected</span>
      default: return <span className="flex items-center text-yellow-600 bg-yellow-100 px-2 py-1 rounded text-xs gap-1"><Clock className="h-3 w-3" /> Pending</span>
    }
  }

  return (
    <DashboardLayout title="Leave Apply">
      <div className="max-w-4xl mx-auto space-y-6 p-1">
        <Tabs defaultValue="apply">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="apply">Apply Leave</TabsTrigger>
            <TabsTrigger value="history">Leave History</TabsTrigger>
          </TabsList>

          <TabsContent value="apply">
            <Card className="shadow-lg border-t-4 border-t-pink-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <ClipboardList className="h-6 w-6 text-pink-500" />
                  Apply for Leave
                </CardTitle>
                <CardDescription>
                  Submit your leave application for approval
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">

                <div className="space-y-2">
                  <Label>Leave Type</Label>
                  <Select onValueChange={setType} value={type}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                      <SelectItem value="Casual Leave">Casual Leave</SelectItem>
                      <SelectItem value="Emergency Leave">Emergency Leave</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 flex flex-col">
                    <Label>From Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !fromDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {fromDate ? format(fromDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={fromDate}
                          onSelect={setFromDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2 flex flex-col">
                    <Label>To Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !toDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {toDate ? format(toDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={toDate}
                          onSelect={setToDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Reason for Leave</Label>
                  <Textarea
                    rows={4}
                    placeholder="Please describe why you need this leave..."
                    className="resize-none"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-semibold py-6"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  <Send className="w-4 h-4 mr-2" /> {submitting ? "Submitting..." : "Submit Application"}
                </Button>

              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" /> Past Applications
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-center py-4">Loading history...</p>
                ) : history.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <p>No leave applications found.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {history.map((req: any) => (
                      <div key={req._id} className="flex flex-col md:flex-row justify-between p-4 border rounded-lg bg-card hover:bg-slate-50 transition-colors gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-bold text-lg">{req.leaveType}</p>
                            {getStatusBadge(req.status)}
                          </div>
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <CalendarIcon className="h-3 w-3" />
                            {format(new Date(req.startDate), "PPP")} - {format(new Date(req.endDate), "PPP")}
                          </p>
                          <p className="text-sm mt-2"><span className="font-semibold">Reason:</span> {req.reason}</p>
                        </div>
                        <div className="text-right text-xs text-muted-foreground flex flex-col justify-end">
                          {req.approvedBy && <p>Reviewed by: {req.approvedBy.firstName} {req.approvedBy.lastName}</p>}
                          <p>Applied on: {format(new Date(req.createdAt), "PP p")}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

