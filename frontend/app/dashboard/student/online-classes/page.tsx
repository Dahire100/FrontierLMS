"use client"

import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Laptop } from "lucide-react"

const rows = [
  { id: 1, subject: "Maths", classSection: "10-A", platform: "Zoom", link: "https://zoom.us/abc" },
  { id: 2, subject: "Science", classSection: "9-B", platform: "Google Meet", link: "https://meet.google.com/xyz" },
]

export default function StudentOnlineClasses() {
  return (
    <DashboardLayout title="Online Classes">
      <div className="space-y-6">
        <Card>
          <CardHeader className="bg-pink-50 border-b border-pink-100">
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <Laptop className="h-5 w-5" />
              Live Class Links
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-pink-50 hover:bg-pink-50">
                    <TableHead className="font-bold text-gray-700 uppercase">Subject</TableHead>
                    <TableHead className="font-bold text-gray-700 uppercase">Class/Section</TableHead>
                    <TableHead className="font-bold text-gray-700 uppercase">Platform</TableHead>
                    <TableHead className="font-bold text-gray-700 uppercase">Link</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.subject}</TableCell>
                      <TableCell>{row.classSection}</TableCell>
                      <TableCell>{row.platform}</TableCell>
                      <TableCell className="truncate max-w-xs">{row.link}</TableCell>
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

