"use client"

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
import { Search, ArrowRightCircle, Database, Layers, RefreshCcw, AlertCircle, TrendingUp, Zap } from "lucide-react"
import { useState } from "react"

export default function FeesCarryForward() {
    const [selectedClass, setSelectedClass] = useState("")
    const [selectedSection, setSelectedSection] = useState("")

    return (
        <DashboardLayout title="Financial Protocol: Fees Carry Forward">
            <div className="max-w-7xl mx-auto space-y-10 pb-20">

                {/* Header Context */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-4">
                            <div className="h-14 w-14 bg-gradient-to-br from-blue-600 to-indigo-800 rounded-[1.5rem] flex items-center justify-center shadow-2xl text-white transform hover:scale-110 transition-transform">
                                <ArrowRightCircle size={32} />
                            </div>
                            Balance Migration Engine
                        </h1>
                        <p className="text-gray-500 mt-2 text-xl italic font-medium">Coordinate the automated transfer of outstanding liabilities across academic cycles</p>
                    </div>

                    <div className="flex gap-4">
                        <Button className="h-14 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white px-10 rounded-2xl shadow-xl shadow-emerald-100 font-black text-xs uppercase tracking-widest gap-3 transition-all hover:scale-105 active:scale-95">
                            <Zap size={20} /> Bulk Protocol Update
                        </Button>
                    </div>
                </div>

                {/* Criteria Card */}
                <Card className="border-none shadow-2xl ring-1 ring-black/5 overflow-hidden rounded-[3rem] bg-white">
                    <CardHeader className="bg-gradient-to-r from-blue-50/50 via-white to-transparent border-b border-gray-100/50 p-10">
                        <div className="flex items-center gap-5">
                            <div className="h-14 w-14 bg-blue-600 rounded-[1.25rem] flex items-center justify-center text-white shadow-xl shadow-blue-100">
                                <Search size={28} />
                            </div>
                            <div>
                                <CardTitle className="text-2xl font-black text-blue-900 uppercase tracking-tight">Scope Configuration</CardTitle>
                                <p className="text-sm text-blue-400 font-bold uppercase tracking-[0.2em] mt-1">Migration Segment Protocol</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-3">
                                <Label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Target Grade Hierarchy <span className="text-rose-500 font-black">*</span></Label>
                                <Select value={selectedClass} onValueChange={setSelectedClass}>
                                    <SelectTrigger className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-16 rounded-3xl focus:ring-blue-500 font-black text-blue-900 text-lg shadow-inner">
                                        <SelectValue placeholder="Identify Academy Level" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                                        {[...Array(12)].map((_, i) => (
                                            <SelectItem key={i} value={(i + 1).toString()} className="rounded-xl font-bold py-3">Grade {i + 1}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Division Assignment <span className="text-rose-500 font-black">*</span></Label>
                                <Select value={selectedSection} onValueChange={setSelectedSection}>
                                    <SelectTrigger className="bg-gray-50/50 border-none ring-1 ring-gray-100 h-16 rounded-3xl focus:ring-blue-500 font-black text-blue-900 text-lg shadow-inner">
                                        <SelectValue placeholder="Select Functional Division" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                                        <SelectItem value="A" className="rounded-xl font-bold py-3">Division A</SelectItem>
                                        <SelectItem value="B" className="rounded-xl font-bold py-3">Division B</SelectItem>
                                        <SelectItem value="C" className="rounded-xl font-bold py-3">Division C</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex flex-col lg:flex-row justify-between items-center mt-12 p-8 bg-blue-50/50 rounded-[2.5rem] border border-blue-100/50 gap-8">
                            <div className="flex items-center gap-6 text-blue-800">
                                <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                                    <AlertCircle size={24} className="text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-black text-lg uppercase tracking-tight">System Integrity Warning</p>
                                    <p className="text-blue-600/70 font-medium">Migration will replicate current balance states into the subsequent ledger cycle. Ensure audits are complete.</p>
                                </div>
                            </div>
                            <Button className="w-full lg:w-auto h-16 bg-blue-900 hover:bg-black text-white px-12 rounded-[1.5rem] shadow-2xl shadow-blue-200 font-black text-xs uppercase tracking-[0.2em] gap-3 transition-all hover:scale-105 active:scale-95">
                                <Database size={20} /> Execute Segment Scan
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Empty State / Initial View Content */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Card className="border-none shadow-xl bg-white p-8 rounded-[2rem] flex flex-col items-center text-center gap-4 hover:shadow-2xl transition-all">
                        <div className="h-16 w-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center">
                            <Layers size={28} />
                        </div>
                        <div>
                            <h4 className="font-black text-gray-900 uppercase tracking-tight">Cycle Isolation</h4>
                            <p className="text-xs text-gray-400 mt-2 font-medium italic">Isolate specific classes for targeted balance migration protocols.</p>
                        </div>
                    </Card>
                    <Card className="border-none shadow-xl bg-white p-8 rounded-[2rem] flex flex-col items-center text-center gap-4 hover:shadow-2xl transition-all">
                        <div className="h-16 w-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center">
                            <TrendingUp size={28} />
                        </div>
                        <div>
                            <h4 className="font-black text-gray-900 uppercase tracking-tight">Audit Preservation</h4>
                            <p className="text-xs text-gray-400 mt-2 font-medium italic">Original transaction timestamps are preserved during historical transition.</p>
                        </div>
                    </Card>
                    <Card className="border-none shadow-xl bg-white p-8 rounded-[2rem] flex flex-col items-center text-center gap-4 hover:shadow-2xl transition-all">
                        <div className="h-16 w-16 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center">
                            <RefreshCcw size={28} />
                        </div>
                        <div>
                            <h4 className="font-black text-gray-900 uppercase tracking-tight">Rollback Safety</h4>
                            <p className="text-xs text-gray-400 mt-2 font-medium italic">System snapshots are generated immediately prior to migration execution.</p>
                        </div>
                    </Card>
                </div>

                <div className="flex flex-col items-center justify-center py-24 bg-gray-50/50 rounded-[4rem] border-2 border-dashed border-gray-200 italic text-gray-400 mt-10">
                    <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center shadow-inner mb-6">
                        <Search size={32} className="text-gray-200" />
                    </div>
                    Configure scan parameters to isolate stakeholders for cycle transition
                </div>
            </div>
        </DashboardLayout>
    )
}
