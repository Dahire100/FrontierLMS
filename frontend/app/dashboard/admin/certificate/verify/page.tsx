"use client"

import { useState } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ShieldCheck, Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import { API_URL } from "@/lib/api-config"
import { toast } from "sonner"

interface VerificationResult {
  success: boolean
  message: string
  data?: {
    certificateNumber: string
    studentId: {
      firstName: string
      lastName: string
      rollNumber: string
      classId?: string
    }
    certificateType: string
    title: string
    issuedDate: string
    issuedBy: string
    status: string
    schoolId?: {
      name: string
      address: string
    }
  }
}

export default function VerifyCertificate() {
  const [certificateNumber, setCertificateNumber] = useState("")
  const [verifying, setVerifying] = useState(false)
  const [result, setResult] = useState<VerificationResult | null>(null)

  const handleVerify = async () => {
    if (!certificateNumber.trim()) {
      toast.error("Please enter a certificate number")
      return
    }

    try {
      setVerifying(true)
      setResult(null)

      const response = await fetch(`${API_URL}/api/certificates/verify/${certificateNumber}`)
      const data = await response.json()

      setResult(data)

      if (data.success) {
        toast.success("Certificate verified successfully!")
      } else {
        toast.error(data.error || data.message || "Certificate verification failed")
      }
    } catch (error) {
      console.error("Error verifying certificate:", error)
      toast.error("Failed to verify certificate")
      setResult({
        success: false,
        message: "Connection error. Please try again."
      })
    } finally {
      setVerifying(false)
    }
  }

  const handleReset = () => {
    setCertificateNumber("")
    setResult(null)
  }

  return (
    <DashboardLayout title="Certificate Verification">
      <div className="space-y-6 max-w-4xl mx-auto">
        <Card>
          <CardHeader className="bg-pink-50 border-b border-pink-100">
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <ShieldCheck className="h-5 w-5" />
              Verify Certificate
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-red-500">Certificate Number *</Label>
              <Input
                placeholder="Enter certificate number (e.g., CERT-2024-0001)"
                className="bg-white border-gray-200"
                value={certificateNumber}
                onChange={(e) => setCertificateNumber(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
              />
            </div>

            <div className="flex gap-2 justify-end">
              {result && (
                <Button
                  variant="outline"
                  onClick={handleReset}
                >
                  Reset
                </Button>
              )}
              <Button
                onClick={handleVerify}
                className="bg-blue-900 hover:bg-blue-800"
                disabled={verifying}
              >
                {verifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Verify
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Verification Result */}
        {result && (
          <Card className={`border-2 ${result.success
              ? result.data?.status === "active"
                ? "border-green-500 bg-green-50"
                : "border-orange-500 bg-orange-50"
              : "border-red-500 bg-red-50"
            }`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.success ? (
                  result.data?.status === "active" ? (
                    <>
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                      <span className="text-green-800">Certificate Verified</span>
                    </>
                  ) : result.data?.status === "expired" ? (
                    <>
                      <AlertCircle className="h-6 w-6 text-orange-600" />
                      <span className="text-orange-800">Certificate Expired</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-6 w-6 text-red-600" />
                      <span className="text-red-800">Certificate Revoked</span>
                    </>
                  )
                ) : (
                  <>
                    <XCircle className="h-6 w-6 text-red-600" />
                    <span className="text-red-800">Verification Failed</span>
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {result.success && result.data ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-gray-600">Certificate Number</Label>
                      <p className="font-mono font-bold text-lg">{result.data.certificateNumber}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Certificate Type</Label>
                      <p className="font-semibold capitalize">{result.data.certificateType}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-gray-600">Student Name</Label>
                      <p className="font-semibold">
                        {result.data.studentId.firstName} {result.data.studentId.lastName}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Roll Number</Label>
                      <p className="font-semibold">{result.data.studentId.rollNumber}</p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm text-gray-600">Certificate Title</Label>
                    <p className="font-semibold">{result.data.title}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-gray-600">Issued Date</Label>
                      <p className="font-semibold">
                        {new Date(result.data.issuedDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Issued By</Label>
                      <p className="font-semibold">{result.data.issuedBy}</p>
                    </div>
                  </div>

                  {result.data.schoolId && (
                    <div className="pt-4 border-t">
                      <Label className="text-sm text-gray-600">Issued By Institution</Label>
                      <p className="font-semibold">{result.data.schoolId.name}</p>
                      {result.data.schoolId.address && (
                        <p className="text-sm text-gray-600">{result.data.schoolId.address}</p>
                      )}
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <Label className="text-sm text-gray-600">Status</Label>
                    <div className="mt-1">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${result.data.status === "active"
                          ? "bg-green-100 text-green-800"
                          : result.data.status === "expired"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                        {result.data.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-red-800 font-semibold">{result.message}</p>
                  <p className="text-sm text-gray-600 mt-2">
                    The certificate number you entered could not be verified. Please check the number and try again.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
