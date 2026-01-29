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
import { Search, Save, Star, Filter } from "lucide-react"

export default function CoCurricularGrade() {
  const [showResult, setShowResult] = useState(false)

  const handleSearch = () => {
    setShowResult(true)
  }

  // Mock student data for co-curricular grades
  const studentGrades = [
    { roll: "101", name: "Alex Johnson", activity: "Sports", grade: "A" },
    { roll: "102", name: "Samantha Smith", activity: "Music", grade: "A+" },
    { roll: "103", name: "Michael Brown", activity: "Arts", grade: "B" },
    { roll: "104", name: "Emily Davis", activity: "Drama", grade: "A" },
  ]

  return (
    <DashboardLayout title="Co-Curricular Grades">
      <div className="space-y-6 animate-in fade-in duration-500">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Co-Curricular Grades</h2>
          <p className="text-muted-foreground mt-1">Assign grades for co-curricular activities and skills.</p>
        </div>

        <Card className="border-gray-100 shadow-md bg-white/50 backdrop-blur-sm">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
            <CardTitle className="text-lg font-medium flex items-center gap-2 text-gray-800">
              <Filter className="h-5 w-5 text-blue-600" />
              Select Criteria
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Session <span className="text-red-500">*</span></Label>
                <Select>
                  <SelectTrigger className="bg-white border-gray-200 focus:ring-2 focus:ring-blue-100">
                    <SelectValue placeholder="Select Session" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2023-24">2023-24</SelectItem>
                    <SelectItem value="2024-25">2024-25</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Activity <span className="text-red-500">*</span></Label>
                <Select>
                  <SelectTrigger className="bg-white border-gray-200 focus:ring-2 focus:ring-blue-100">
                    <SelectValue placeholder="Select Activity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="music">Music</SelectItem>
                    <SelectItem value="arts">Arts & Crafts</SelectItem>
                    <SelectItem value="drama">Drama</SelectItem>
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
                <Star className="w-5 h-5 text-blue-600" />
                Student Grades
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="w-[100px] font-semibold">Roll No.</TableHead>
                      <TableHead className="font-semibold">Student Name</TableHead>
                      <TableHead className="font-semibold">Activity</TableHead>
                      <TableHead className="w-[150px] font-semibold">Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentGrades.map((student, index) => (
                      <TableRow key={index} className="hover:bg-gray-50/50">
                        <TableCell className="font-medium text-gray-600">{student.roll}</TableCell>
                        <TableCell className="font-medium text-gray-900">{student.name}</TableCell>
                        <TableCell className="text-gray-600">{student.activity}</TableCell>
                        <TableCell>
                          <Select defaultValue={student.grade}>
                            <SelectTrigger className="w-24 border-gray-200 h-9">
                              <SelectValue placeholder="Grade" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="A+">A+</SelectItem>
                              <SelectItem value="A">A</SelectItem>
                              <SelectItem value="B">B</SelectItem>
                              <SelectItem value="C">C</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="p-4 border-t border-gray-100 bg-gray-50/30 flex justify-end">
                <Button className="bg-emerald-600 hover:bg-emerald-700 shadow-sm px-8">
                  <Save className="w-4 h-4 mr-2" />
                  Save Grades
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
