"use client"

import { useState } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, FileText, Sheet, Filter, Printer } from "lucide-react"

export default function ReportCard() {
  const [mode, setMode] = useState<"term" | "exam">("term")

  return (
    <DashboardLayout title="Report Card">
      <div className="space-y-8 animate-in fade-in duration-500">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Report Card</h2>
          <p className="text-muted-foreground mt-1">Generate and print comprehensive report cards.</p>
        </div>

        {/* Mode Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            type="button"
            onClick={() => setMode("term")}
            className={`group relative text-left h-full transition-all duration-300 focus:outline-none ${mode === "term" ? "scale-[1.02]" : "hover:scale-[1.01]"}`}
          >
            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 transition-opacity duration-300 ${mode === "term" ? "opacity-10" : ""}`} />
            <Card className={`h-full border-2 transition-all duration-300 ${mode === "term" ? "border-blue-600 shadow-lg" : "border-gray-100 hover:border-blue-200 hover:shadow-md"}`}>
              <CardContent className="p-6 flex items-center gap-5">
                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-colors duration-300 ${mode === "term" ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-600 group-hover:bg-blue-100"}`}>
                  <FileText className="h-7 w-7" />
                </div>
                <div>
                  <h3 className={`font-bold text-lg mb-1 transition-colors duration-300 ${mode === "term" ? "text-blue-700" : "text-gray-900"}`}>
                    Term Wise Report
                  </h3>
                  <p className="text-sm text-gray-500">Generate report cards based on academic terms and aggregated scores.</p>
                </div>
              </CardContent>
            </Card>
          </button>

          <button
            type="button"
            onClick={() => setMode("exam")}
            className={`group relative text-left h-full transition-all duration-300 focus:outline-none ${mode === "exam" ? "scale-[1.02]" : "hover:scale-[1.01]"}`}
          >
            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 opacity-0 transition-opacity duration-300 ${mode === "exam" ? "opacity-10" : ""}`} />
            <Card className={`h-full border-2 transition-all duration-300 ${mode === "exam" ? "border-emerald-600 shadow-lg" : "border-gray-100 hover:border-emerald-200 hover:shadow-md"}`}>
              <CardContent className="p-6 flex items-center gap-5">
                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-colors duration-300 ${mode === "exam" ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100"}`}>
                  <Sheet className="h-7 w-7" />
                </div>
                <div>
                  <h3 className={`font-bold text-lg mb-1 transition-colors duration-300 ${mode === "exam" ? "text-emerald-700" : "text-gray-900"}`}>
                    Exam Wise Report
                  </h3>
                  <p className="text-sm text-gray-500">Generate detailed report cards for specific examinations.</p>
                </div>
              </CardContent>
            </Card>
          </button>
        </div>

        {/* Criteria Form */}
        <Card className="border-gray-100 shadow-md bg-white/50 backdrop-blur-sm">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
            <CardTitle className="text-lg font-medium flex items-center gap-2 text-gray-800">
              <Filter className="h-5 w-5 text-blue-600" />
              Configuration Parameters
            </CardTitle>
            <CardDescription>Select the criteria to generate the students report card.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className={`grid grid-cols-1 md:grid-cols-${mode === "term" ? "3" : "4"} gap-6`}>
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Term <span className="text-red-500">*</span></Label>
                <Select>
                  <SelectTrigger className="bg-white border-gray-200 focus:ring-2 focus:ring-blue-100">
                    <SelectValue placeholder="Select Term" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="term-1">First Term</SelectItem>
                    <SelectItem value="term-2">Second Term</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {mode === "exam" && (
                <div className="space-y-2 animate-in fade-in slide-in-from-left-2 duration-300">
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
              )}

              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Class <span className="text-red-500">*</span></Label>
                <Select>
                  <SelectTrigger className="bg-white border-gray-200 focus:ring-2 focus:ring-blue-100">
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Class 1</SelectItem>
                    <SelectItem value="10">Class 10</SelectItem>
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
              <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm px-8">
                <Search className="h-4 w-4 mr-2" />
                Search & Generate
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
