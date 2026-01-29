"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export default function RegistrationSuccess() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <div className="text-4xl font-bold text-primary mb-8">FRONTIERLMS</div>
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="space-y-2">
            <CardTitle className="text-3xl">Registration Submitted</CardTitle>
            <CardDescription>
              Thank you for registering your school with FRONTIERLMS
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                Your registration request has been submitted successfully. Our team will review your
                application and send the login credentials to the provided email address within 24-48
                hours.
              </p>
              <p className="text-muted-foreground">
                If you have any questions, please contact our support team.
              </p>
            </div>
            <Button onClick={() => router.push("/")} className="w-full">
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}