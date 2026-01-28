"use client"

import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Search, Plus, Menu } from "lucide-react"

const sampleData = [
    {
        id: 1,
        class: "6th",
        section: "A",
        subject: "Maths",
        hwDate: "08-12-2025",
        subDate: "08-12-2025",
        evalDate: "",
        description: "Revise 1-100 number names",
        createdBy: "Demo",
    },
    {
        id: 2,
        class: "5th",
        section: "A",
        subject: "English",
        hwDate: "14-11-2025",
        subDate: "14-11-2025",
        evalDate: "",
        description: "",
        createdBy: "Demo",
    },
    {
        id: 3,
        class: "KG 1st",
        section: "Section A1 - 2",
        subject: "biology",
        hwDate: "23-10-2025",
        subDate: "24-10-2025",
        evalDate: "",
        description: "English & Biology Homework (23-10-2025 to 24-10-2025)",
        createdBy: "Super",
    },
]

export default function AddHomeworkPage() {
    return (
        <DashboardLayout title="Add Homework">
            <div className="space-y-6">
                <div className="flex items-center gap-2 text-xl font-bold text-[#1a237e]">
                    {/* Icon can be added here if needed */}
                </div>

                {/* Select Criteria */}
                <Card className="shadow-sm border-t-4 border-t-[#1a237e]">
                    <CardHeader className="bg-pink-50/50 pb-4 border-b">
                        <CardTitle className="text-base font-bold flex items-center gap-2 text-[#1a237e]">
                            <Search className="h-4 w-4" /> Select Criteria
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Class <span className="text-red-500">*</span>
                                </Label>
                                <Select>
                                    <SelectTrigger className="bg-muted/10">
                                        <SelectValue placeholder="Select Class" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="6th">6th</SelectItem>
                                        <SelectItem value="5th">5th</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Section <span className="text-red-500">*</span>
                                </Label>
                                <Select>
                                    <SelectTrigger className="bg-muted/10">
                                        <SelectValue placeholder="Select Section" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="A">Section A</SelectItem>
                                        <SelectItem value="B">Section B</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Subject <span className="text-red-500">*</span>
                                </Label>
                                <Select>
                                    <SelectTrigger className="bg-muted/10">
                                        <SelectValue placeholder="Select Subject" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="maths">Maths</SelectItem>
                                        <SelectItem value="english">English</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button className="bg-[#1a237e] hover:bg-[#1a237e]/90 text-white gap-2 px-6 rounded-full">
                                <Search className="h-4 w-4" /> Search
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Homework List */}
                <Card className="shadow-sm border-t-4 border-t-[#1a237e]">
                    <CardHeader className="bg-pink-50/50 border-b pb-4">
                        <CardTitle className="text-base font-bold flex items-center justify-between text-[#1a237e]">
                            <div className="flex items-center gap-2">
                                <Menu className="h-4 w-4" /> Homework List
                            </div>
                            <Button size="sm" className="bg-[#1a237e] hover:bg-[#1a237e]/90 text-white gap-2">
                                <Plus className="h-4 w-4" /> Add
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between gap-4">
                            <div className="flex gap-1">
                                <Button variant="outline" size="sm" className="h-8 bg-[#1a237e] text-white hover:bg-[#1a237e]/90 border-0">
                                    <span className="mr-2">📄</span>
                                </Button>
                                <Button variant="outline" size="sm" className="h-8 bg-[#1a237e] text-white hover:bg-[#1a237e]/90 border-0">
                                    <span className="mr-2">📋</span>
                                </Button>
                                <Button variant="outline" size="sm" className="h-8 bg-[#1a237e] text-white hover:bg-[#1a237e]/90 border-0">
                                    <span className="mr-2">📊</span>
                                </Button>
                                <Button variant="outline" size="sm" className="h-8">Column visibility</Button>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Search:</span>
                                <Input className="h-8 w-[200px]" />
                            </div>
                        </div>

                        <div className="rounded-md border">
                            <Table>
                                <TableHeader className="bg-pink-50/50">
                                    <TableRow>
                                        <TableHead className="font-bold text-[#1a237e]">CLASS</TableHead>
                                        <TableHead className="font-bold text-[#1a237e]">SECTION</TableHead>
                                        <TableHead className="font-bold text-[#1a237e]">SUBJECT</TableHead>
                                        <TableHead className="font-bold text-[#1a237e]">HOMEWORK DATE</TableHead>
                                        <TableHead className="font-bold text-[#1a237e]">SUBMISSION DATE</TableHead>
                                        <TableHead className="font-bold text-[#1a237e]">EVALUATION DATE</TableHead>
                                        <TableHead className="font-bold text-[#1a237e]">DESCRIPTION</TableHead>
                                        <TableHead className="font-bold text-[#1a237e]">CREATED BY</TableHead>
                                        <TableHead className="text-right font-bold text-[#1a237e]">ACTION</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sampleData.map((item) => (
                                        <TableRow key={item.id} className="hover:bg-muted/50">
                                            <TableCell className="font-medium align-top whitespace-nowrap">{item.class}</TableCell>
                                            <TableCell className="align-top whitespace-nowrap">{item.section}</TableCell>
                                            <TableCell className="align-top min-w-[100px]">{item.subject}</TableCell>
                                            <TableCell className="align-top whitespace-nowrap">{item.hwDate}</TableCell>
                                            <TableCell className="align-top whitespace-nowrap">{item.subDate}</TableCell>
                                            <TableCell className="align-top whitespace-nowrap">{item.evalDate}</TableCell>
                                            <TableCell className="align-top min-w-[200px] max-w-[300px] whitespace-normal break-words pr-4">{item.description}</TableCell>
                                            <TableCell className="align-top whitespace-nowrap">{item.createdBy}</TableCell>
                                            <TableCell className="text-right align-top whitespace-nowrap">
                                                <Button size="sm" className="bg-[#1a237e] hover:bg-[#1a237e]/90 h-8">
                                                    Action
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        <div className="flex items-center justify-between space-x-2 py-4">
                            <div className="text-sm text-muted-foreground">
                                Showing 1 to {sampleData.length} of {sampleData.length} entries
                            </div>
                            <div className="space-x-2">
                                <Button variant="outline" size="sm" disabled>Previous</Button>
                                <Button size="sm" className="bg-[#1a237e] text-white">1</Button>
                                <Button variant="outline" size="sm" disabled>Next</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
