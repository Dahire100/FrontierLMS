"use client"

import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Mail } from "lucide-react"

export default function SendEmailSMSPage() {
    return (
        <DashboardLayout title="Send Email / SMS">
            <div className="space-y-6">
                <Card className="shadow-sm border-t-4 border-t-pink-500">
                    <CardContent className="pt-6">
                        {/* Tabs Header - simplified for visual match */}
                        <div className="flex flex-wrap gap-4 border-b pb-2 mb-6 text-sm font-bold text-[#1a237e]">
                            <span className="p-2 border-b-2 border-pink-500 cursor-pointer">Group</span>
                            <span className="p-2 cursor-pointer hover:bg-gray-50">Individual</span>
                            <span className="p-2 cursor-pointer hover:bg-gray-50">Class</span>
                            <span className="p-2 cursor-pointer hover:bg-gray-50">Transport Student</span>
                            <span className="p-2 cursor-pointer hover:bg-gray-50">Class Section</span>
                            <span className="p-2 cursor-pointer hover:bg-gray-50">House / Category</span>
                            <span className="p-2 cursor-pointer hover:bg-gray-50">Individual Mobile Number</span>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Left Column - Form Inputs */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-gray-700">Title <span className="text-red-500">*</span></Label>
                                    <Input className="bg-white border-gray-200" />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-gray-700">Send Through <span className="text-red-500">*</span></Label>
                                    <div className="flex flex-wrap gap-4 pt-2">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="email" />
                                            <Label htmlFor="email" className="font-normal">Email</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="whatsapp" />
                                            <Label htmlFor="whatsapp" className="font-normal">WhatsApp</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="sms" />
                                            <Label htmlFor="sms" className="font-normal">SMS + WhatsApp + IVR + Email</Label>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-700">Message</Label>
                                    <Textarea className="bg-white border-gray-200 min-h-[150px]" placeholder="Type your message here..." />
                                </div>
                            </div>

                            {/* Right Column - Message To */}
                            <div className="space-y-4">
                                <Label className="text-gray-700">Message To <span className="text-red-500">*</span></Label>
                                <div className="space-y-3 pl-1">
                                    {[
                                        "Student", "Student (RTE)", "Guardians", "Guardians (GROUP)", "Father & Mother", "Admin", "Teacher",
                                        "Librarian", "Receptionist", "Super Admin", "Driver", "Principal", "search", "driverings",
                                        "Accountant", "students", "test", "Account Head", "abc", "coordinater", "admission manager",
                                        "HR Cordinator", "Test Role", "Ass. Principal", "Clark", "Kamlesh", "House Master",
                                        "Assitant Teacher", "EXAM CORDINATOR", "Student - Payroll", "principal", "teacher testing1",
                                        "Super Admin 1", "Marketing Mgr", "Sweet", "teacher head", "parent"
                                    ].map((role, idx) => (
                                        <div key={idx} className="flex items-center space-x-2">
                                            <Checkbox id={`role-${idx}`} className="rounded-full data-[state=checked]:bg-blue-600 border-gray-300" />
                                            <Label htmlFor={`role-${idx}`} className="font-normal text-gray-600 text-sm">{role}</Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-6 mt-6 border-t">
                            <Button className="bg-[#1a237e] hover:bg-[#1a237e]/90 text-white gap-2 px-8">
                                <Mail className="h-4 w-4" /> Send
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
