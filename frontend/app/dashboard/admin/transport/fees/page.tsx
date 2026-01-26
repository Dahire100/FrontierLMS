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
  SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Wallet } from "lucide-react"
import { toast } from "sonner"

const sample = [
  { id: 1, route: "North Loop", student: "Ansh Sharma", amount: 1200, status: "Pending" },
  { id: 2, route: "East Express", student: "Vanya Patel", amount: 1500, status: "Paid" },
]

export default function TransportFees() {
  const [rows, setRows] = useState(sample)
  const [form, setForm] = useState({ route: "", student: "", amount: "", status: "" })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.route || !form.student || !form.amount) {
      toast.error("Route, student and amount are required")
      return
    }
    setRows([...rows, { id: Date.now(), ...form, amount: Number(form.amount), status: form.status || "Pending" }])
    toast.success("Transport fee saved")
    setForm({ route: "", student: "", amount: "", status: "" })
  }

  return (
    <DashboardLayout title="Transport Fees">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="bg-pink-50 border-b border-pink-100">
              <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                <Wallet className="h-5 w-5" />
                Assign Fee
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-red-500">Route *</Label>
                  <Input value={form.route} onChange={(e) => setForm({ ...form, route: e.target.value })} className="bg-white border-gray-200" />
                </div>
                <div className="space-y-2">
                  <Label className="text-red-500">Student *</Label>
                  <Input value={form.student} onChange={(e) => setForm({ ...form, student: e.target.value })} className="bg-white border-gray-200" />
                </div>
                <div className="space-y-2">
                  <Label className="text-red-500">Amount *</Label>
                  <Input value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="bg-white border-gray-200" />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(val) => setForm({ ...form, status: val })}>
                    <SelectTrigger className="bg-white border-gray-200">
                      <SelectValue placeholder="Pending by default" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
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
              <CardTitle className="text-lg text-gray-800">Transport Fee List</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-pink-50 hover:bg-pink-50">
                      <TableHead className="font-bold text-gray-700 uppercase">Route</TableHead>
                      <TableHead className="font-bold text-gray-700 uppercase">Student</TableHead>
                      <TableHead className="font-bold text-gray-700 uppercase text-right">Amount</TableHead>
                      <TableHead className="font-bold text-gray-700 uppercase">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>{row.route}</TableCell>
                        <TableCell>{row.student}</TableCell>
                        <TableCell className="text-right">{row.amount.toFixed(2)}</TableCell>
                        <TableCell>{row.status}</TableCell>
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

