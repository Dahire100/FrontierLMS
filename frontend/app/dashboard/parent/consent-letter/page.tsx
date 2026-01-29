"use client"

import { useState } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { StatCard } from "@/components/super-admin/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, CheckCircle, Clock, XCircle, Download, Users, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

export default function ParentConsentLetter() {
  const [selectedChild, setSelectedChild] = useState<"child1" | "child2">("child1")

  const children = {
    child1: { name: "Alice Student", class: "10-A" },
    child2: { name: "Bob Student", class: "8-B" }
  }

  const [requests, setRequests] = useState([
    { id: 1, child: "child1", type: "Field Trip", title: "Science Museum Visit", date: "2025-01-15", status: "Pending", dueDate: "2025-01-20", description: "Permission for educational field trip to Science Museum" },
    { id: 2, child: "child1", type: "Medical", title: "Medical Examination", date: "2025-01-10", status: "Approved", dueDate: "2025-01-15", description: "Annual health checkup consent" },
    { id: 3, child: "child2", type: "Event", title: "Sports Day Participation", date: "2025-01-08", status: "Approved", dueDate: "2025-01-12", description: "Consent for sports day activities" },
    { id: 4, child: "child2", type: "Excursion", title: "Historical Site Tour", date: "2025-01-12", status: "Pending", dueDate: "2025-01-18", description: "Educational excursion to historical monuments" },
  ])

  const filteredRequests = requests.filter(r => r.child === selectedChild)

  const handleAction = (id: number, action: "Approved" | "Rejected") => {
    setRequests(requests.map(r => r.id === id ? { ...r, status: action } : r))
    if (action === "Approved") {
      toast.success("Consent Granted", { description: "You have approved this request." })
    } else {
      toast.info("Consent Denied", { description: "You have rejected this request." })
    }
  }

  const handleDownload = () => {
    toast.success("Download Started", { description: "Downloading consent letter copy..." })
  }

  return (
    <DashboardLayout title="Consent Letter">
      <div className="space-y-6 animate-in fade-in-50 duration-500">
        {/* Header with Child Selector */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Consent Letters
            </h2>
            <p className="text-muted-foreground mt-1">
              Manage consent requests for {children[selectedChild].name}
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="min-w-[180px] justify-between shadow-sm">
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  {children[selectedChild].name}
                </span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuItem onClick={() => setSelectedChild("child1")}>
                Alice Student (10-A)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedChild("child2")}>
                Bob Student (8-B)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Requests"
            value={filteredRequests.length.toString()}
            icon={FileText}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
          />
          <StatCard
            title="Pending"
            value={filteredRequests.filter(r => r.status === "Pending").length.toString()}
            icon={Clock}
            iconColor="text-orange-600"
            iconBgColor="bg-orange-100"
          />
          <StatCard
            title="Approved"
            value={filteredRequests.filter(r => r.status === "Approved").length.toString()}
            icon={CheckCircle}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
          />
          <StatCard
            title="Rejected"
            value={filteredRequests.filter(r => r.status === "Rejected").length.toString()}
            icon={XCircle}
            iconColor="text-red-600"
            iconBgColor="bg-red-100"
          />
        </div>

        {/* Consent Requests */}
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Consent Requests
            </CardTitle>
            <CardDescription>Review and respond to pending requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredRequests.length > 0 ? filteredRequests.map((request) => (
                <div key={request.id} className="p-4 border rounded-xl hover:shadow-md transition-all bg-white">
                  <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`p-3 rounded-full shrink-0 ${request.status === "Approved" ? "bg-green-100" :
                          request.status === "Pending" ? "bg-orange-100" : "bg-red-100"
                        }`}>
                        {request.status === "Approved" ? (
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        ) : request.status === "Pending" ? (
                          <Clock className="h-6 w-6 text-orange-600" />
                        ) : (
                          <XCircle className="h-6 w-6 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <p className="font-bold text-lg text-gray-900">{request.title}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${request.status === "Approved" ? "bg-green-100 text-green-700" :
                              request.status === "Pending" ? "bg-orange-100 text-orange-700" :
                                "bg-red-100 text-red-700"
                            }`}>
                            {request.status}
                          </span>
                          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium">
                            {request.type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{request.description}</p>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 font-medium">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Submitted: {new Date(request.date).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1 text-red-500"><Clock className="h-3 w-3" /> Due: {new Date(request.dueDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 w-full md:w-auto">
                      {request.status === "Pending" && (
                        <>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 flex-1 md:flex-none" onClick={() => handleAction(request.id, "Approved")}>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approve
                          </Button>
                          <Button size="sm" variant="destructive" className="flex-1 md:flex-none" onClick={() => handleAction(request.id, "Rejected")}>
                            <XCircle className="h-3 w-3 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      {request.status === "Approved" && (
                        <Button size="sm" variant="outline" className="flex-1 md:flex-none" onClick={handleDownload}>
                          <Download className="h-3 w-3 mr-1" />
                          Download Copy
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-muted-foreground">No consent requests found for this child.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
