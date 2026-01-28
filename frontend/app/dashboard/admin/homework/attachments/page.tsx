"use client"

import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Paperclip } from "lucide-react"

const rows = [
    { id: 1, title: "Chapter 5 worksheet", classSection: "7-B", file: "worksheet.pdf" },
    { id: 2, title: "Essay instructions", classSection: "6-A", file: "instructions.docx" },
]

export default function HomeworkAttachments() {
    return (
        <DashboardLayout title="Homework Attachments">
            <div className="space-y-6">
                <Card>
                    <CardHeader className="bg-pink-50 border-b border-pink-100">
                        <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                            <Paperclip className="h-5 w-5" />
                            Upload / Link Attachments
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Homework</Label>
                                <Input placeholder="Title or ID" className="bg-white border-gray-200" />
                            </div>
                            <div className="space-y-2">
                                <Label>File URL</Label>
                                <Input placeholder="https://..." className="bg-white border-gray-200" />
                            </div>
                            <div className="flex items-end">
                                <Button className="bg-blue-900 hover:bg-blue-800 w-full">Attach</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="bg-pink-50 border-b border-pink-100">
                        <CardTitle className="text-lg text-gray-800">Attachment List</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-pink-50 hover:bg-pink-50">
                                        <TableHead className="font-bold text-gray-700 uppercase">Homework</TableHead>
                                        <TableHead className="font-bold text-gray-700 uppercase">Class/Section</TableHead>
                                        <TableHead className="font-bold text-gray-700 uppercase">File</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rows.map((row) => (
                                        <TableRow key={row.id}>
                                            <TableCell>{row.title}</TableCell>
                                            <TableCell>{row.classSection}</TableCell>
                                            <TableCell>{row.file}</TableCell>
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

