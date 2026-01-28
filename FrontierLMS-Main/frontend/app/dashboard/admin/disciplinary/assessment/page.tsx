"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FilePen, Search, Loader2, Save, UserCheck, Star } from "lucide-react"
import { API_URL } from "@/lib/api-config"
import { toast } from "sonner"

export default function AssessmentPage() {
    const [parameters, setParameters] = useState<any[]>([])
    const [students, setStudents] = useState<any[]>([])
    const [assessments, setAssessments] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().split('T')[0].substring(0, 7))
    const [classId, setClassId] = useState("all")

    useEffect(() => {
        fetchInitialData()
    }, [])

    const fetchInitialData = async () => {
        try {
            const token = localStorage.getItem('token')
            const paramRes = await fetch(`${API_URL}/api/disciplinary/parameters`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (paramRes.ok) setParameters(await paramRes.ok ? await paramRes.json() : [])
        } catch (error) {
            console.error("Failed to load parameters")
        }
    }

    const handleSearch = async () => {
        setLoading(true)
        try {
            const token = localStorage.getItem('token')
            const [stuRes, assRes] = await Promise.all([
                fetch(`${API_URL}/api/students`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_URL}/api/disciplinary/assessments?month=${selectedMonth}`, { headers: { 'Authorization': `Bearer ${token}` } })
            ])

            if (stuRes.ok && assRes.ok) {
                const stuData = await stuRes.json()
                const assData = await assRes.json()

                const studentList = stuData.students || stuData
                setAssessments(studentList.map((s: any) => {
                    const existing = assData.find((a: any) => a.studentId._id === s._id)
                    return {
                        student: s,
                        scores: parameters.map(p => {
                            const scoreObj = existing?.scores.find((score: any) => score.parameterId._id === p._id)
                            return {
                                parameterId: p._id,
                                score: scoreObj?.score || 0
                            }
                        })
                    }
                }))
            }
        } catch (error) {
            toast.error("Failed to load assessments")
        } finally {
            setLoading(false)
        }
    }

    const handleScoreChange = (studentId: string, parameterId: string, score: number) => {
        setAssessments(prev => prev.map(a => {
            if (a.student._id === studentId) {
                return {
                    ...a,
                    scores: a.scores.map((s: any) => s.parameterId === parameterId ? { ...s, score } : s)
                }
            }
            return a
        }))
    }

    const handleSave = async (data: any) => {
        setSaving(true)
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${API_URL}/api/disciplinary/assessments`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    studentId: data.student._id,
                    month: selectedMonth,
                    academicYear: "2023-24", // Dynamic later
                    scores: data.scores
                })
            })

            if (response.ok) {
                toast.success(`Assessment saved for ${data.student.firstName}`)
            }
        } catch (error) {
            toast.error("Failed to save")
        } finally {
            setSaving(false)
        }
    }

    const columns = [
        {
            key: "student",
            label: "STUDENT",
            render: (v: any) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-800 text-xs">{v.firstName} {v.lastName}</span>
                    <span className="text-[10px] text-gray-400">ID: {v.studentId}</span>
                </div>
            )
        },
        ...parameters.map(p => ({
            key: `param_${p._id}`,
            label: p.name.toUpperCase(),
            render: (_: any, row: any) => {
                const scoreObj = row.scores.find((s: any) => s.parameterId === p._id)
                return (
                    <div className="flex items-center gap-1">
                        <Input
                            type="number"
                            min="0"
                            max="10"
                            value={scoreObj?.score || 0}
                            onChange={e => handleScoreChange(row.student._id, p._id, parseInt(e.target.value))}
                            className="h-8 w-14 text-xs font-bold text-center"
                        />
                        <span className="text-[9px] text-gray-400 font-bold">/10</span>
                    </div>
                )
            }
        })),
        {
            key: "actions",
            label: "ACTION",
            render: (_: any, row: any) => (
                <Button size="sm" onClick={() => handleSave(row)} className="bg-emerald-600 hover:bg-emerald-700 h-8 text-[10px] font-bold uppercase tracking-widest">
                    <Save className="h-3 w-3 mr-1" /> Commit
                </Button>
            )
        }
    ]

    return (
        <DashboardLayout title="Performance Assessment">
            <div className="space-y-6 max-w-full pb-10">
                <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border-l-4 border-l-amber-500">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800 tracking-tight">Behaviour Assessment</h1>
                        <p className="text-xs text-gray-500 font-medium">Evaluate student performance based on institutional disciplinary parameters.</p>
                    </div>
                </div>

                <Card className="border-t-4 border-t-[#1a237e] shadow-sm">
                    <CardHeader className="py-3 bg-gray-50/50 border-b">
                        <CardTitle className="text-xs font-bold text-gray-600 uppercase tracking-widest flex items-center gap-2">
                            <Search className="h-4 w-4" /> Filter Criteria
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid md:grid-cols-4 gap-6">
                            <div className="space-y-2">
                                <Label className="font-bold text-xs text-gray-500 uppercase">Class</Label>
                                <Select value={classId} onValueChange={setClassId}>
                                    <SelectTrigger className="h-10 text-xs"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Classes</SelectItem>
                                        <SelectItem value="1">Class 1</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold text-xs text-gray-500 uppercase">Assessment Month</Label>
                                <Input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="h-10 text-xs" />
                            </div>
                            <div className="flex items-end">
                                <Button onClick={handleSearch} className="w-full bg-[#1a237e] hover:bg-[#283593] h-10 shadow-lg shadow-blue-50" disabled={loading}>
                                    {loading ? <Loader2 className="animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                                    Load Students
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {assessments.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b bg-gray-50/50 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest flex items-center gap-2">
                                <Star className="h-4 w-4 text-amber-500" /> Scoring Register
                            </h3>
                            <div className="flex items-center gap-4">
                                <div className="text-[10px] font-bold text-gray-400 bg-white px-2 py-1 rounded border">
                                    SCALE: 0-10 (BEST: 10)
                                </div>
                            </div>
                        </div>
                        <AdvancedTable
                            columns={columns}
                            data={assessments}
                            loading={loading}
                            pagination={false}
                            searchable={false}
                            headerClassName="bg-gray-100 text-gray-600 font-bold uppercase text-[9px] tracking-widest h-12"
                        />
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
