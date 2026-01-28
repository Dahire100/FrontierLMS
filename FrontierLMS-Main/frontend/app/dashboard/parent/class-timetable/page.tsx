"use client"

import { API_URL } from "@/lib/api-config"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, MapPin, User, Users, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

export default function ParentClassTimetable() {
    const [selectedChild, setSelectedChild] = useState<string>("")
    const [children, setChildren] = useState<any[]>([])
    const [timetable, setTimetable] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

    // Fetch children on mount
    useEffect(() => {
        const fetchChildren = async () => {
            try {
                const token = localStorage.getItem('token')
                const res = await fetch(`${API_URL}/api/parent/dashboard`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                const data = await res.json()
                if (data.success && data.data.children.length > 0) {
                    setChildren(data.data.children)
                    setSelectedChild(data.data.children[0]._id)
                }
            } catch (error) {
                console.error("Failed to fetch children", error)
                toast.error("Failed to load children list")
            } finally {
                setLoading(false)
            }
        }
        fetchChildren()
    }, [])

    // Fetch timetable when selected child changes
    useEffect(() => {
        if (!selectedChild) return

        const fetchTimetable = async () => {
            try {
                const token = localStorage.getItem('token')
                const res = await fetch(`${API_URL}/api/parent/child/${selectedChild}/timetable`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                const data = await res.json()

                if (data.success) {
                    setTimetable(data.data) // Assuming data is array of Timetable objects
                }
            } catch (error) {
                console.error("Failed to fetch timetable", error)
                toast.error("Failed to load timetable")
            }
        }
        fetchTimetable()
    }, [selectedChild])


    const getSelectedChildName = () => {
        const child = children.find(c => c._id === selectedChild)
        return child ? `${child.firstName} ${child.lastName}` : "Loading..."
    }

    const getSelectedChildClass = () => {
        const child = children.find(c => c._id === selectedChild)
        return child && child.class ? `${child.class.name}-${child.class.section}` : "N/A"
    }

    const getTimetableForDay = (day: string) => {
        const dayData = timetable.find((t: any) => t.dayOfWeek === day)
        return dayData ? dayData.periods : []
    }

    return (
        <DashboardLayout title="Class Timetable">
            <div className="space-y-6 animate-in fade-in-50 duration-500">
                {/* Header with Child Selector */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Weekly Timetable
                        </h2>
                        <p className="text-muted-foreground mt-1">
                            Class schedule for {getSelectedChildName()}
                        </p>
                    </div>

                    {children.length > 0 && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="min-w-[180px] justify-between shadow-sm">
                                    <span className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-blue-600" />
                                        {getSelectedChildName()}
                                    </span>
                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[200px]">
                                {children.map(child => (
                                    <DropdownMenuItem key={child._id} onClick={() => setSelectedChild(child._id)}>
                                        {child.firstName} {child.lastName}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>

                <Card className="border-none shadow-md">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-blue-500" /> Class Schedule
                            </CardTitle>
                            <Badge variant="outline" className="text-blue-600 bg-blue-50">Class {getSelectedChildClass()}</Badge>
                        </div>
                        <CardDescription>View daily classes and breaks</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="Monday" className="w-full">
                            <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-4 h-auto">
                                {weekDays.map(day => (
                                    <TabsTrigger key={day} value={day} className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">{day}</TabsTrigger>
                                ))}
                            </TabsList>

                            {weekDays.map(day => {
                                const periods = getTimetableForDay(day)
                                return (
                                    <TabsContent key={day} value={day} className="space-y-4">
                                        <div className="rounded-xl border overflow-hidden bg-white">
                                            <div className="bg-gray-50/50 p-4 border-b grid grid-cols-12 gap-4 font-semibold text-sm text-gray-500">
                                                <div className="col-span-3 md:col-span-2">Time</div>
                                                <div className="col-span-9 md:col-span-10">Subject & Details</div>
                                            </div>

                                            <ScrollArea className="h-[500px]">
                                                {periods.length === 0 ? (
                                                    <div className="flex flex-col items-center justify-center h-full py-12 text-muted-foreground">
                                                        <Calendar className="h-10 w-10 mb-2 opacity-20" />
                                                        <p>No classes scheduled for this day</p>
                                                    </div>
                                                ) : (
                                                    <div className="divide-y">
                                                        {periods.map((period: any, index: number) => {
                                                            const isBreak = period.type === "Break" || period.type === "Lunch"
                                                            // Color logic placeholder or use predefined
                                                            const colors = ["bg-blue-100 border-blue-200 text-blue-700", "bg-purple-100 border-purple-200 text-purple-700", "bg-green-100 border-green-200 text-green-700", "bg-orange-100 border-orange-200 text-orange-700", "bg-pink-100 border-pink-200 text-pink-700"]
                                                            const colorClass = colors[index % colors.length]

                                                            return (
                                                                <div key={index} className={`grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50 transition-colors ${isBreak ? "bg-gray-50/50" : ""}`}>
                                                                    <div className="col-span-3 md:col-span-2 text-sm font-medium text-gray-600 flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
                                                                        <Clock className="h-4 w-4 text-blue-400 hidden md:block" />
                                                                        <span className="text-xs md:text-sm">{period.startTime} - {period.endTime}</span>
                                                                    </div>
                                                                    <div className="col-span-9 md:col-span-10">
                                                                        {isBreak ? (
                                                                            <div className="flex items-center justify-center p-2 bg-gray-100 rounded-md text-gray-500 font-medium uppercase text-xs tracking-wider border border-dashed border-gray-200">
                                                                                {period.subject}
                                                                            </div>
                                                                        ) : (
                                                                            <div className={`p-3 rounded-lg border border-l-4 ${colorClass}`}>
                                                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                                                                    <div>
                                                                                        <h4 className="font-bold text-base">{period.subject}</h4>
                                                                                        <div className="flex flex-wrap items-center gap-3 mt-1 text-sm opacity-90">
                                                                                            {period.teacherId ? (
                                                                                                <span className="flex items-center gap-1">
                                                                                                    <User className="h-3 w-3" />
                                                                                                    {period.teacherId.firstName || ""} {period.teacherId.lastName || ""}
                                                                                                </span>
                                                                                            ) : period.teacher ? (
                                                                                                <span className="flex items-center gap-1"><User className="h-3 w-3" /> {period.teacher}</span>
                                                                                            ) : null}
                                                                                            {period.room && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {period.room}</span>}
                                                                                        </div>
                                                                                    </div>
                                                                                    <Badge variant="secondary" className="w-fit self-start md:self-center bg-white/50">{period.type || "Class"}</Badge>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                )}
                                            </ScrollArea>
                                        </div>
                                    </TabsContent>
                                )
                            })}
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
