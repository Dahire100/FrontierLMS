"use client"

import { useState } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
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
import { Search, Save, MessageSquare, Filter } from "lucide-react"

export default function TeacherRemark() {
  const [showResult, setShowResult] = useState(false)

  const handleSearch = () => {
    setShowResult(true)
  }

  // Mock student remarks
  const studentRemarks = [
    { roll: "101", name: "Alex Johnson", remark: "Shows great improvement in mathematics." },
    { roll: "102", name: "Samantha Smith", remark: "Consistently performs well in all subjects." },
    { roll: "103", name: "Michael Brown", remark: "Needs to focus more on science concepts." },
    { roll: "104", name: "Emily Davis", remark: "Excellent participation in class activities." },
  ]

  return (
    <DashboardLayout title="Teacher Comment">
      <div className="space-y-6 animate-in fade-in duration-500">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Teacher Remarks</h2>
          <p className="text-muted-foreground mt-1">Add performance comments and behavioral observations for report cards.</p>
        </div>

        <Card className="border-gray-100 shadow-md bg-white/50 backdrop-blur-sm">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
            <CardTitle className="text-lg font-medium flex items-center gap-2 text-gray-800">
              <Filter className="h-5 w-5 text-blue-600" />
              Select Criteria
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Exam <span className="text-red-500">*</span></Label>
                <Select>
                  <SelectTrigger className="bg-white border-gray-200 focus:ring-2 focus:ring-blue-100">
                    <SelectValue placeholder="Select Exam" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mid">Mid Term</SelectItem>
                    <SelectItem value="final">Final Exam</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Class <span className="text-red-500">*</span></Label>
                <Select>
                  <SelectTrigger className="bg-white border-gray-200 focus:ring-2 focus:ring-blue-100">
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Class 1</SelectItem>
                    <SelectItem value="2">Class 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Section <span className="text-red-500">*</span></Label>
                <Select>
                  <SelectTrigger className="bg-white border-gray-200 focus:ring-2 focus:ring-blue-100">
                    <SelectValue placeholder="Select Section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Section A</SelectItem>
                    <SelectItem value="B">Section B</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700 shadow-sm px-8">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {showResult && (
          <Card className="border-gray-100 shadow-md bg-white overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                Student Remarks
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="w-[100px] font-semibold">Roll No.</TableHead>
                      <TableHead className="w-[200px] font-semibold">Student Name</TableHead>
                      <TableHead className="font-semibold">Teacher's Remark</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentRemarks.map((student, index) => (
                      <TableRow key={index} className="hover:bg-gray-50/50">
                        <TableCell className="font-medium text-gray-600">{student.roll}</TableCell>
                        <TableCell className="font-medium text-gray-900">{student.name}</TableCell>
                        <TableCell>
                          <Input
                            defaultValue={student.remark}
                            className="w-full border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Enter remarks..."
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="p-4 border-t border-gray-100 bg-gray-50/30 flex justify-end">
                <Button className="bg-emerald-600 hover:bg-emerald-700 shadow-sm px-8">
                  <Save className="w-4 h-4 mr-2" />
                  Save Remarks
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
