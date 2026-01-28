"use client"

import { useState } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Search, FileBarChart, Download } from "lucide-react"

export default function LessonPlannerReportPage() {
    const [classValue, setClassValue] = useState("")
    const [section, setSection] = useState("")
    const [subject, setSubject] = useState("")

    const classes = ["Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10"]
    const sections = ["A", "B", "C", "D"]
    const subjects = ["Mathematics", "Science", "English", "Social Studies", "Computer Science"]

    const handleSearch = () => {
        // Handle search logic here
        console.log({ class: classValue, section, subject })
    }

    return (
        <DashboardLayout title="Lesson Planner / Lesson Planner Report">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xl font-bold text-[#1a237e]">
                        <FileBarChart className="h-6 w-6" />
                        <h1>Lesson Planner Report</h1>
                    </div>
                    <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export to Excel
                    </Button>
                </div>

                {/* Select Criteria */}
                <Card className="shadow-sm">
                    <CardHeader className="bg-pink-50/50 pb-4 border-b">
                        <CardTitle className="text-base font-bold flex items-center gap-2 text-[#1a237e]">
                            <Search className="h-4 w-4" /> Select Criteria
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Class
                                </Label>
                                <Select onValueChange={setClassValue}>
                                    <SelectTrigger className="bg-muted/10">
                                        <SelectValue placeholder="Select Class" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classes.map((cls, index) => (
                                            <SelectItem key={index} value={cls}>
                                                {cls}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Section
                                </Label>
                                <Select onValueChange={setSection}>
                                    <SelectTrigger className="bg-muted/10">
                                        <SelectValue placeholder="Select Section" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sections.map((sec, index) => (
                                            <SelectItem key={index} value={sec}>
                                                {sec}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Subject
                                </Label>
                                <Select onValueChange={setSubject}>
                                    <SelectTrigger className="bg-muted/10">
                                        <SelectValue placeholder="Select Subject" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subjects.map((sub, index) => (
                                            <SelectItem key={index} value={sub}>
                                                {sub}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button 
                                onClick={handleSearch}
                                className="bg-[#1a237e] hover:bg-[#1a237e]/90 text-white gap-2 px-6"
                            >
                                <Search className="h-4 w-4" />
                                Search
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Results Section */}
                <Card className="shadow-sm">
                    <CardHeader className="bg-pink-50/50 pb-4 border-b">
                        <CardTitle className="text-base font-bold flex items-center gap-2 text-[#1a237e]">
                            Report Results
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="text-center text-muted-foreground py-12">
                            <p>No records found. Please select search criteria and click Search.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
