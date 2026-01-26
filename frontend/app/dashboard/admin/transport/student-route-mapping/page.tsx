"use client"

import { useState } from "react"
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
  SelectValue
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Link2 } from "lucide-react"
import { toast } from "sonner"

const sample = [
  { id: 1, student: "Ansh Sharma", classSection: "7-B", route: "North Loop", vehicle: "UP14 AB 1234" },
  { id: 2, student: "Vanya Patel", classSection: "6-A", route: "East Express", vehicle: "UP16 ZX 4432" },
]

export default function StudentRouteMapping() {
  const [rows, setRows] = useState(sample)
  const [form, setForm] = useState({ student: "", classSection: "", route: "", vehicle: "" })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.student || !form.route || !form.vehicle) {
      toast.error("Student, route, and vehicle are required")
      return
    }
    setRows([...rows, { id: Date.now(), ...form }])
    toast.success("Student mapped")
    setForm({ student: "", classSection: "", route: "", vehicle: "" })
  }

  return (
    <DashboardLayout title="Student–Route Mapping">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="bg-pink-50 border-b border-pink-100">
              <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                <Link2 className="h-5 w-5" />
                Map Student
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-red-500">Student *</Label>
                  <Input value={form.student} onChange={(e) => setForm({ ...form, student: e.target.value })} className="bg-white border-gray-200" />
                </div>
                <div className="space-y-2">
                  <Label>Class / Section</Label>
                  <Input value={form.classSection} onChange={(e) => setForm({ ...form, classSection: e.target.value })} className="bg-white border-gray-200" />
                </div>
                <div className="space-y-2">
                  <Label className="text-red-500">Route *</Label>
                  <Input value={form.route} onChange={(e) => setForm({ ...form, route: e.target.value })} className="bg-white border-gray-200" />
                </div>
                <div className="space-y-2">
                  <Label className="text-red-500">Vehicle *</Label>
                  <Input value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })} className="bg-white border-gray-200" />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" className="bg-blue-900 hover:bg-blue-800 px-6">Save</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="bg-pink-50 border-b border-pink-100">
              <CardTitle className="text-lg text-gray-800">Mappings</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-pink-50 hover:bg-pink-50">
                      <TableHead className="font-bold text-gray-700 uppercase">Student</TableHead>
                      <TableHead className="font-bold text-gray-700 uppercase">Class/Section</TableHead>
                      <TableHead className="font-bold text-gray-700 uppercase">Route</TableHead>
                      <TableHead className="font-bold text-gray-700 uppercase">Vehicle</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>{row.student}</TableCell>
                        <TableCell>{row.classSection || "-"}</TableCell>
                        <TableCell>{row.route}</TableCell>
                        <TableCell>{row.vehicle}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

