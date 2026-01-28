"use client"

import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ListChecks } from "lucide-react"

const rows = [
  { id: 1, classSection: "10-A", attendance: "94%", avgMarks: "78%", pendingHW: 5 },
  { id: 2, classSection: "10-B", attendance: "92%", avgMarks: "74%", pendingHW: 6 },
]

export default function ClassReports() {
  return (
    <DashboardLayout title="Class Reports">
      <div className="space-y-6">
        <Card>
          <CardHeader className="bg-pink-50 border-b border-pink-100">
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <ListChecks className="h-5 w-5" />
              Generate Class Report
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-red-500">Class/Section *</Label>
                <Input placeholder="10-A" className="bg-white border-gray-200" />
              </div>
              <div className="space-y-2">
                <Label>Exam</Label>
                <Input placeholder="Mid Term" className="bg-white border-gray-200" />
              </div>
              <div className="flex items-end">
                <Button className="bg-blue-900 hover:bg-blue-800 w-full">Generate</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-pink-50 border-b border-pink-100">
            <CardTitle className="text-lg text-gray-800">Reports</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-pink-50 hover:bg-pink-50">
                    <TableHead className="font-bold text-gray-700 uppercase">Class/Section</TableHead>
                    <TableHead className="font-bold text-gray-700 uppercase">Attendance</TableHead>
                    <TableHead className="font-bold text-gray-700 uppercase">Avg Marks</TableHead>
                    <TableHead className="font-bold text-gray-700 uppercase text-right">Pending HW</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.classSection}</TableCell>
                      <TableCell>{row.attendance}</TableCell>
                      <TableCell>{row.avgMarks}</TableCell>
                      <TableCell className="text-right">{row.pendingHW}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

