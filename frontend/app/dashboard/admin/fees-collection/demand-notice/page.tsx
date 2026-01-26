"use client"

import { useState } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Search, Bell, AlertCircle, FileText, Send, Printer, Database } from "lucide-react"

export default function DemandNotice() {
    const [selectedClass, setSelectedClass] = useState("")
    const [selectedSection, setSelectedSection] = useState("")
    const [noticeType, setNoticeType] = useState("")

    return (
        <DashboardLayout title="Institutional Demand Protocol">
            <div className="max-w-7xl mx-auto space-y-8 pb-10">

                {/* Header Context */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2 uppercase">
                            <div className="h-10 w-10 bg-gradient-to-br from-amber-500 to-orange-700 rounded-xl flex items-center justify-center shadow-lg text-white">
                                <Bell size={22} />
                            </div>
                            Demand Notice Architect
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Generate and distribute formal financial demand notices to academic units</p>
                    </div>
                </div>

                <Card className="border-none shadow-2xl ring-1 ring-black/5 overflow-hidden bg-white">
                    <CardHeader className="bg-gradient-to-r from-amber-50 to-white border-b border-amber-100">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-amber-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-200">
                                <Search size={20} />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-black text-amber-900 italic tracking-tight">Criteria Configuration</CardTitle>
                                <p className="text-[10px] text-amber-500 uppercase font-black">Segment selection protocol</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-10">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Target Hierarchy <span className="text-rose-500">*</span></Label>
                                <Select value={selectedClass} onValueChange={setSelectedClass}>
                                    <SelectTrigger className="bg-gray-50/50 border-gray-200 h-12 focus:ring-amber-500 rounded-xl font-bold">
                                        <SelectValue placeholder="Unified Academy" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[...Array(12)].map((_, i) => (
                                            <SelectItem key={i} value={(i + 1).toString()}>Class {i + 1}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Section Protocol <span className="text-rose-500">*</span></Label>
                                <Select value={selectedSection} onValueChange={setSelectedSection}>
                                    <SelectTrigger className="bg-gray-50/50 border-gray-200 h-12 focus:ring-amber-500 rounded-xl font-bold">
                                        <SelectValue placeholder="All Divisions" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="A">Division A</SelectItem>
                                        <SelectItem value="B">Division B</SelectItem>
                                        <SelectItem value="C">Division C</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Notice Classification <span className="text-rose-500">*</span></Label>
                                <Select value={noticeType} onValueChange={setNoticeType}>
                                    <SelectTrigger className="bg-gray-50/50 border-gray-200 h-12 focus:ring-amber-500 rounded-xl font-bold">
                                        <SelectValue placeholder="Select Strategy" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="overdue">Overdue Exposure Notice</SelectItem>
                                        <SelectItem value="warning">Final Warning Mandate</SelectItem>
                                        <SelectItem value="reminder">Standard Cycle Reminder</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row justify-between items-center mt-10 p-6 bg-amber-50/50 rounded-2xl border border-amber-100 gap-6">
                            <div className="flex items-center gap-4 text-amber-700">
                                <AlertCircle size={24} />
                                <div className="text-sm">
                                    <p className="font-bold">Protocol Validation</p>
                                    <p className="opacity-80">Generating notices will trigger system alerts for selected units.</p>
                                </div>
                            </div>
                            <div className="flex gap-3 w-full md:w-auto">
                                <Button className="bg-amber-600 hover:bg-amber-700 text-white h-12 px-8 shadow-xl shadow-amber-100 font-black text-xs uppercase tracking-widest flex items-center gap-2 rounded-xl transition-all hover:scale-[1.02]">
                                    <Search size={16} /> Execute Scan
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Empty State / Initial View */}
                <div className="flex flex-col items-center justify-center py-20 bg-gray-50/40 rounded-3xl border-2 border-dashed border-gray-100 italic text-gray-400">
                    <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                        <FileText size={24} className="text-gray-200" />
                    </div>
                    Configure scan parameters to isolate notice candidates
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">
                    <Card className="border-none shadow-lg bg-white ring-1 ring-black/5 p-6 rounded-2xl flex items-center gap-4">
                        <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                            <Send size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900">Batch Dispatch</h4>
                            <p className="text-[10px] text-gray-400 uppercase font-black">Email & SMS Protocol</p>
                        </div>
                    </Card>
                    <Card className="border-none shadow-lg bg-white ring-1 ring-black/5 p-6 rounded-2xl flex items-center gap-4">
                        <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                            <Printer size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900">Physical Archiving</h4>
                            <p className="text-[10px] text-gray-400 uppercase font-black">Print Ready Formats</p>
                        </div>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    )
}
