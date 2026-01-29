"use client"

import DashboardLayout from "@/components/dashboard-layout"
import { StatCard } from "@/components/super-admin/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User, Mail, Phone, Award, Calendar, DollarSign, BookOpen, Users, TrendingUp } from "lucide-react"
import Image from "next/image"

export default function TeacherProfileEnhancedExample() {
  const teacherInfo = {
    name: "Mr. John Teacher",
    employeeId: "TCH-2024-001",
    email: "john.teacher@school.com",
    phone: "+1-555-0100",
    department: "Mathematics",
    qualification: "M.Sc Mathematics",
    experience: "8 years",
    joiningDate: "2016-08-15"
  }

  return (
    <DashboardLayout title="My Profile (Enhanced Example)">
      <div className="space-y-6">
        {/* Banner with Gradient Overlay - You can replace with actual image */}
        <div className="relative h-48 rounded-xl overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500">
          {/* If you have an image, uncomment this:
          <Image 
            src="/images/banners/teacher-banner.jpg"
            alt="Profile Banner"
            fill
            className="object-cover"
          />
          */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/80 to-pink-600/80 flex items-center px-8">
            <div className="flex items-center gap-6">
              {/* Large Profile Avatar */}
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-white shadow-2xl">
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-4xl font-bold">
                    {teacherInfo.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                {/* You can add actual photo here:
                <Image 
                  src="/images/profiles/teacher-john.jpg"
                  alt="Profile Photo"
                  width={128}
                  height={128}
                  className="rounded-full border-4 border-white shadow-2xl"
                />
                */}
              </div>
              <div className="text-white">
                <h1 className="text-4xl font-bold mb-2">{teacherInfo.name}</h1>
                <p className="text-xl opacity-90">{teacherInfo.department} Department</p>
                <p className="text-sm opacity-75">Employee ID: {teacherInfo.employeeId}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats with Visual Icons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-purple-100 rounded-xl">
                  <Award className="h-8 w-8 text-purple-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-purple-600">{teacherInfo.experience}</p>
                  <p className="text-sm text-gray-600">Experience</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-blue-100 rounded-xl">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-blue-600">113</p>
                  <p className="text-sm text-gray-600">Students</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-green-100 rounded-xl">
                  <BookOpen className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-green-600">3</p>
                  <p className="text-sm text-gray-600">Classes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Information with Icons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-purple-600" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-medium">{teacherInfo.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Phone className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="font-medium">{teacherInfo.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Award className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-xs text-gray-500">Qualification</p>
                  <p className="font-medium">{teacherInfo.qualification}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-xs text-gray-500">Joining Date</p>
                  <p className="font-medium">{new Date(teacherInfo.joiningDate).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Achievement Cards with Visual Elements */}
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Award className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="font-semibold">Best Teacher Award</p>
                  <p className="text-xs text-gray-600">2023</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold">100% Student Success Rate</p>
                  <p className="text-xs text-gray-600">2023-2024</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm">
                <div className="p-3 bg-green-100 rounded-full">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold">Published Research Papers</p>
                  <p className="text-xs text-gray-600">5 Publications</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Note about images */}
        <Card className="border-l-4 border-l-blue-500 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Award className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">📸 This is an Enhanced Example with Visuals!</h3>
                <p className="text-sm text-blue-800 mb-2">
                  This page demonstrates how to add visual elements. To add actual images:
                </p>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Create folder: <code className="bg-blue-100 px-2 py-1 rounded">frontend/public/images/</code></li>
                  <li>Add your images there</li>
                  <li>Uncomment the Image components in the code</li>
                  <li>Replace paths with your image files</li>
                </ol>
                <p className="text-sm text-blue-800 mt-2">
                  Check <code className="bg-blue-100 px-2 py-1 rounded">HOW_TO_ADD_IMAGES.md</code> for detailed instructions!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
