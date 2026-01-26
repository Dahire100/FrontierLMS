"use client"

import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Menu } from "lucide-react"

const sampleDiaryEntries = [
    { id: 1, title: "Cambridge" },
    { id: 2, title: "Admin" },
    { id: 3, title: "Hello" },
    { id: 4, title: "Test" },
    { id: 5, title: "Home School" },
]

export default function SchoolDiaryPage() {
    return (
        <DashboardLayout title="School Diary">
            <div className="space-y-6">
                <div className="flex items-center gap-2 text-xl font-bold text-[#1a237e]">
                    {/* Icon if needed */}
                </div>

                <Card className="shadow-sm border-t-4 border-t-[#1a237e]">
                    <CardHeader className="bg-pink-50/50 border-b pb-4 flex flex-row items-center justify-between">
                        <CardTitle className="text-base font-bold flex items-center gap-2 text-[#1a237e]">
                            <Menu className="h-4 w-4" /> School Diary List
                        </CardTitle>
                        <Button className="bg-[#1a237e] hover:bg-[#1a237e]/90 text-white gap-2 h-9">
                            <Plus className="h-4 w-4" /> Post New Message
                        </Button>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        {sampleDiaryEntries.map((entry) => (
                            <div key={entry.id} className="flex items-center justify-between p-4 bg-[#eff0f6] rounded-lg">
                                <span className="text-[#1a237e] font-medium">{entry.title}</span>
                                <Button size="sm" className="bg-[#1a237e] hover:bg-[#1a237e]/90 h-8">
                                    Action ▼
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
